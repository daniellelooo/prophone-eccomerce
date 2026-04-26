"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Configuración del sitio editable desde el panel admin.
 * Persiste en localStorage. Hidratación diferida vía SiteConfigHydrator.
 */

export type Sede = {
  id: string;
  name: string;
  area: string;
  detail: string;
};

export type SiteConfig = {
  whatsappNumber: string; // sin + ni espacios — ej: 573148941200
  whatsappDefaultMessage: string;
  instagramUrl: string;
  bannerEnabled: boolean;
  bannerItems: string[]; // textos del ticker rojo del top
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
    {
      id: "monterrey-206",
      name: "C.C. Monterrey",
      area: "El Poblado, Medellín",
      detail: "Local 206",
    },
    {
      id: "monterrey-098-099",
      name: "C.C. Monterrey",
      area: "El Poblado, Medellín",
      detail: "Locales 098 / 099",
    },
    {
      id: "supercentro-itagui",
      name: "Super Centro de la Moda",
      area: "Itagüí",
      detail: "Local 118",
    },
    {
      id: "pasaje-roberesco",
      name: "Pasaje Roberesco",
      area: "Centro, Medellín",
      detail: "Local 105",
    },
  ],
};

type ConfigState = SiteConfig & {
  update: (patch: Partial<SiteConfig>) => void;
  upsertSede: (sede: Sede) => void;
  removeSede: (id: string) => void;
  setBannerItems: (items: string[]) => void;
  reset: () => void;
};

export const useSiteConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ...DEFAULT_SITE_CONFIG,
      update: (patch) => set((s) => ({ ...s, ...patch })),
      upsertSede: (sede) =>
        set((s) => ({
          sedes: s.sedes.some((x) => x.id === sede.id)
            ? s.sedes.map((x) => (x.id === sede.id ? sede : x))
            : [...s.sedes, sede],
        })),
      removeSede: (id) =>
        set((s) => ({ sedes: s.sedes.filter((x) => x.id !== id) })),
      setBannerItems: (bannerItems) => set({ bannerItems }),
      reset: () => set({ ...DEFAULT_SITE_CONFIG }),
    }),
    {
      name: "prophone-site-config-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

export function getWhatsappUrl(
  number: string,
  message: string = ""
): string {
  const sanitized = number.replace(/\D/g, "");
  return `https://wa.me/${sanitized}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;
}
