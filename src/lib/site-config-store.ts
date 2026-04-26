"use client";

import { create } from "zustand";
import { getSupabaseBrowserClient } from "./supabase/client";
import { configRowsToSiteConfig, rowToSede } from "./supabase/mappers";

export type Sede = {
  id: string;
  name: string;
  area: string;
  detail: string;
};

export type SiteConfig = {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  instagramUrl: string;
  bannerEnabled: boolean;
  bannerItems: string[];
  hoursWeek: string;
  hoursWeekend: string;
  sedes: Sede[];
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  whatsappNumber: "573148941200",
  whatsappDefaultMessage:
    "Hola, me interesa un producto de Prophone Medellín",
  instagramUrl: "https://www.instagram.com/prophone_medellin/",
  bannerEnabled: true,
  bannerItems: [
    "Reseller Apple · Medellín, Colombia",
    "iPhone 14 128GB — $2.200.000",
    "iPad A16 128GB — $1.420.000",
    "iPhone 16 — $4.200.000",
    "iPhone 16 Pro — $5.290.000",
    "Garantía oficial Apple 1 año",
    "Envío gratis a toda Colombia",
    "Crédito con Banco de Bogotá",
  ],
  hoursWeek: "Lunes–Sábado 10am–7:30pm",
  hoursWeekend: "Domingos y festivos 11am–5pm",
  sedes: [
    { id: "monterrey-206", name: "C.C. Monterrey", area: "El Poblado, Medellín", detail: "Local 206" },
    { id: "monterrey-098-099", name: "C.C. Monterrey", area: "El Poblado, Medellín", detail: "Locales 098 / 099" },
    { id: "supercentro-itagui", name: "Super Centro de la Moda", area: "Itagüí", detail: "Local 118" },
    { id: "pasaje-roberesco", name: "Pasaje Roberesco", area: "Centro, Medellín", detail: "Local 105" },
  ],
};

type ConfigState = SiteConfig & {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  update: (patch: Partial<SiteConfig>) => Promise<void>;
  upsertSede: (sede: Sede) => Promise<void>;
  removeSede: (id: string) => Promise<void>;
  setBannerItems: (items: string[]) => Promise<void>;
  reset: () => Promise<void>;
};

// Mapeo de keys del store a keys de la DB
const CONFIG_KEYS = {
  whatsappNumber: "whatsapp_number",
  whatsappDefaultMessage: "whatsapp_default_message",
  instagramUrl: "instagram_url",
  bannerEnabled: "banner_enabled",
  bannerItems: "banner_items",
  hoursWeek: "hours_week",
  hoursWeekend: "hours_weekend",
} as const;

type ConfigKey = keyof typeof CONFIG_KEYS;

export const useSiteConfigStore = create<ConfigState>()((set, get) => ({
  ...DEFAULT_SITE_CONFIG,
  loaded: false,
  loading: false,
  error: null,

  hydrate: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true, error: null });
    try {
      const cfg = await fetchSiteConfig();
      set({ ...cfg, loaded: true, loading: false });
    } catch (err) {
      console.error("[site-config-store] hydrate failed", err);
      set({ loading: false, error: (err as Error).message });
    }
  },

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const cfg = await fetchSiteConfig();
      set({ ...cfg, loaded: true, loading: false });
    } catch (err) {
      console.error("[site-config-store] refresh failed", err);
      set({ loading: false, error: (err as Error).message });
    }
  },

  update: async (patch) => {
    const supabase = getSupabaseBrowserClient();
    const rows = (Object.keys(patch) as ConfigKey[])
      .filter((k) => k in CONFIG_KEYS)
      .map((k) => ({
        key: CONFIG_KEYS[k],
        value: patch[k] as never,
      }));
    if (rows.length > 0) {
      const { error } = await supabase.from("site_config").upsert(rows);
      if (error) throw error;
    }
    if (patch.sedes) {
      // Sedes se manejan vía upsertSede/removeSede; ignorar aquí.
    }
    set((s) => ({ ...s, ...patch }));
  },

  upsertSede: async (sede) => {
    const supabase = getSupabaseBrowserClient();
    const next = [...get().sedes];
    const idx = next.findIndex((x) => x.id === sede.id);
    if (idx === -1) next.push(sede);
    else next[idx] = sede;

    const sortedRows = next.map((s, i) => ({
      id: s.id,
      name: s.name,
      area: s.area,
      detail: s.detail,
      sort_order: i,
    }));
    const { error } = await supabase.from("sedes").upsert(sortedRows);
    if (error) throw error;
    set({ sedes: next });
  },

  removeSede: async (id) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("sedes").delete().eq("id", id);
    if (error) throw error;
    set((s) => ({ sedes: s.sedes.filter((x) => x.id !== id) }));
  },

  setBannerItems: async (bannerItems) => {
    await get().update({ bannerItems });
  },

  reset: async () => {
    const supabase = getSupabaseBrowserClient();
    // Restaura site_config + sedes a defaults
    const configRows = (Object.keys(CONFIG_KEYS) as ConfigKey[]).map((k) => ({
      key: CONFIG_KEYS[k],
      value: DEFAULT_SITE_CONFIG[k] as never,
    }));
    const { error: cErr } = await supabase.from("site_config").upsert(configRows);
    if (cErr) throw cErr;

    const { error: dErr } = await supabase
      .from("sedes")
      .delete()
      .neq("id", "__never__");
    if (dErr) throw dErr;

    const sedeRows = DEFAULT_SITE_CONFIG.sedes.map((s, i) => ({
      ...s,
      sort_order: i,
    }));
    const { error: iErr } = await supabase.from("sedes").insert(sedeRows);
    if (iErr) throw iErr;

    set({ ...DEFAULT_SITE_CONFIG });
  },
}));

async function fetchSiteConfig(): Promise<SiteConfig> {
  const supabase = getSupabaseBrowserClient();
  const [cRes, sRes] = await Promise.all([
    supabase.from("site_config").select("*"),
    supabase.from("sedes").select("*").order("sort_order"),
  ]);
  if (cRes.error) throw cRes.error;
  if (sRes.error) throw sRes.error;

  const sedes = (sRes.data ?? []).map(rowToSede);
  return configRowsToSiteConfig(cRes.data ?? [], sedes);
}

export function getWhatsappUrl(
  number: string,
  message: string = ""
): string {
  const sanitized = number.replace(/\D/g, "");
  return `https://wa.me/${sanitized}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
}
