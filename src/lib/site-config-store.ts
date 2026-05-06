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

/**
 * Tile editable del bento "El precio manda" en la landing.
 * Pueden ser N elementos; el primer item se renderiza grande, los siguientes
 * en el grid. Aunque el componente actualmente espera 3 entradas para el
 * layout 1+2, soporta cualquier cantidad si se ajusta la presentación.
 */
export type FeaturedOffer = {
  id: string;
  badge: string;
  /** primary = rojo Prophone, dark = negro, subtle = gris claro */
  badgeStyle: "primary" | "dark" | "subtle";
  title: string;
  subtitle: string;
  image: string;
  price: number;
  /** URL de destino al hacer click. */
  href: string;
};

/**
 * Override de la imagen de portada por categoría en CategoryShowcase.
 * Si el valor está vacío, se usa la imagen del producto destacado o
 * el primero de la categoría (comportamiento default).
 */
export type CategoryShowcaseOverrides = {
  iphone: string;
  macbook: string;
  ipad: string;
  watch: string;
  accesorios: string;
};

/**
 * Textos editables del landing. Cada bloque permite definir un título base
 * (negro, sans bold) y un "accent" — generalmente la última frase, que se
 * renderiza en color o italic serif para darle ritmo editorial.
 *
 * Si un campo se deja vacío, se usa el default (lo que está actualmente
 * hardcoded en el landing). Esto permite migrar progresivamente sin romper.
 */
export type LandingTexts = {
  // Hero principal
  heroLine1: string;
  heroLine2: string;
  heroLine3Accent: string;
  heroDescription: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;

  // CategoryShowcase ("El ecosistema Apple, a precio reseller.")
  ecosystemTitle: string;
  ecosystemAccent: string;

  // "El precio manda."
  priceCommandTitle: string;
  priceCommandAccent: string;
  priceCommandSubtitle: string;

  // "Los que se llevan todos."
  featuredTitle: string;
  featuredAccent: string;
  featuredSubtitle: string;

  // "Lo que nos hace Prophone."
  whyProphoneTitle: string;
  whyProphoneAccent: string;

  // "Tres regalos. Cero costo extra."
  giftsTitle: string;
  giftsAccent: string;
  giftsSubtitle: string;

  // "Lo que dicen quienes ya compraron."
  reviewsTitle: string;

  // CTA final ("Tu nuevo iPhone te espera.")
  finalCtaTitle: string;
  finalCtaAccent: string;
  finalCtaDescription: string;
};

export type SiteConfig = {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  bannerEnabled: boolean;
  bannerItems: string[];
  hoursWeek: string;
  hoursWeekend: string;
  /** Carrusel desktop del home */
  heroImagesDesktop: string[];
  /** Carrusel mobile del home */
  heroImagesMobile: string[];
  /** Texto opcional del hero (se muestra encima del CTA principal) */
  heroTitle: string;
  heroSubtitle: string;
  /** SEO global */
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  /** Pixels para campañas */
  metaPixelId: string;
  gaMeasurementId: string;
  /** Texto libre del footer */
  footerTagline: string;
  /** Stock crítico — alerta si quantity ≤ N */
  stockLowThreshold: number;
  sedes: Sede[];
  /** Promoción activa — controla el link en el navbar y la página /promociones. */
  promoEnabled: boolean;
  /** Etiqueta del link en el navbar y título principal de la página. Ej: "Día de las Madres". */
  promoLabel: string;
  /** Subtítulo en el hero de la página de promo. */
  promoSubtitle: string;
  /** CTA del hero de la landing (vacío = no se muestra el botón). */
  promoHeroCta: string;
  /** Imágenes del hero de la página de promo. Vacío = solo texto, sin imágenes. */
  promoImages: string[];
  /** Tiles editables del bento "El precio manda" en la landing. */
  featuredOffers: FeaturedOffer[];
  /** Override de imagen por categoría en CategoryShowcase. Vacío = usa producto destacado. */
  categoryShowcaseOverrides: CategoryShowcaseOverrides;
  /** Textos editables de cada bloque del landing (título, accent, subtítulo). */
  landingTexts: LandingTexts;
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  whatsappNumber: "573148941200",
  whatsappDefaultMessage:
    "Hola, me interesa un producto de Prophone Medellín",
  instagramUrl: "https://www.instagram.com/prophone_medellin/",
  tiktokUrl: "",
  facebookUrl: "",
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
  heroImagesDesktop: [
    "/SaveClip.App_669968396_17969893659022618_2634456334907307944_n.jpg",
    "/SaveClip.App_670261212_17969893632022618_2971371486548960346_n.jpg",
    "/SaveClip.App_670356744_17969893647022618_671068078662591014_n.jpg",
    "/SaveClip.App_670660195_17969893653022618_1022367743358883716_n.jpg",
    "/SaveClip.App_670841629_17969893671022618_2948609800837551989_n.jpg",
    "/SaveClip.App_670898237_17969893623022618_6482046461573185776_n.jpg",
    "/SaveClip.App_673772651_17971073052022618_8062033588449160424_n.jpg",
    "/SaveClip.App_681366003_17971073055022618_4293193256490824427_n.jpg",
  ],
  heroImagesMobile: [
    "/IPHONE 17 PRO MAX HORIZONTAL.jpg",
    "/IPHONE17PROHORIZONTAL.jpg",
    "/IPAD A16 HORIZONTAL.jpg",
    "/IPADAIRHORIZONTAL.jpg",
  ],
  heroTitle: "",
  heroSubtitle: "",
  seoTitle: "Prophone Medellín · Reseller Apple",
  seoDescription:
    "iPhone, iPad, Mac y accesorios Apple originales con garantía oficial en Medellín.",
  ogImageUrl: "",
  metaPixelId: "",
  gaMeasurementId: "",
  footerTagline: "Reseller Apple en Medellín, Colombia.",
  stockLowThreshold: 2,
  sedes: [
    { id: "monterrey-206", name: "C.C. Monterrey", area: "El Poblado, Medellín", detail: "Local 206" },
    { id: "monterrey-098-099", name: "C.C. Monterrey", area: "El Poblado, Medellín", detail: "Locales 098 / 099" },
    { id: "pasaje-roberesco", name: "Pasaje Comercial Roberesco", area: "Centro, Medellín", detail: "Local 105" },
  ],
  promoEnabled: false,
  promoLabel: "Promociones",
  promoSubtitle: "Descuentos especiales por tiempo limitado.",
  promoHeroCta: "Ver promociones",
  promoImages: [],
  featuredOffers: [
    {
      id: "iphone-16",
      badge: "Nuevo · Sellado",
      badgeStyle: "primary",
      title: "iPhone 16. Recién llegado.",
      subtitle:
        "128 GB · 1 año de garantía oficial Apple. El nuevo iPhone, al precio Prophone.",
      image: "/IPHONE16.jpeg",
      price: 2950000,
      href: "/catalogo",
    },
    {
      id: "ipad-a16",
      badge: "El más accesible",
      badgeStyle: "dark",
      title: "iPad A16",
      subtitle: 'Chip A16 · 10.9"',
      image: "/IPADA16.png",
      price: 1420000,
      href: "/catalogo",
    },
    {
      id: "iphone-14",
      badge: "Mega descuento",
      badgeStyle: "primary",
      title: "iPhone 14",
      subtitle: "Exhibición · 128 GB",
      image: "/IPHONE14.jpeg",
      price: 1400000,
      href: "/catalogo",
    },
  ],
  categoryShowcaseOverrides: {
    iphone: "",
    macbook: "",
    ipad: "",
    watch: "",
    accesorios: "",
  },
  landingTexts: {
    heroLine1: "Los precios",
    heroLine2: "más bajos",
    heroLine3Accent: "en iPhone.",
    heroDescription:
      "Sin intermediarios. Garantía oficial Apple. Crédito con Banco de Bogotá. El reseller número 1 de Medellín.",
    heroCtaPrimary: "Comprar ahora",
    heroCtaSecondary: "Hablar con asesor",
    ecosystemTitle: "El ecosistema Apple,",
    ecosystemAccent: "a precio reseller.",
    priceCommandTitle: "El precio",
    priceCommandAccent: "manda",
    priceCommandSubtitle: "Sin intermediarios. Sin maquillaje.",
    featuredTitle: "Los que se llevan",
    featuredAccent: "todos",
    featuredSubtitle: "Equipos con garantía oficial Apple",
    whyProphoneTitle: "Lo que nos hace",
    whyProphoneAccent: "Prophone",
    giftsTitle: "Tres regalos.",
    giftsAccent: "Cero costo extra.",
    giftsSubtitle: "Solo en compras de contado",
    reviewsTitle: "Lo que dicen quienes ya compraron.",
    finalCtaTitle: "Tu nuevo iPhone",
    finalCtaAccent: "te espera",
    finalCtaDescription:
      "Más de 200K seguidores ya escogieron Prophone. ¿Listo para sumarte?",
  },
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
  tiktokUrl: "tiktok_url",
  facebookUrl: "facebook_url",
  bannerEnabled: "banner_enabled",
  bannerItems: "banner_items",
  hoursWeek: "hours_week",
  hoursWeekend: "hours_weekend",
  heroImagesDesktop: "hero_images_desktop",
  heroImagesMobile: "hero_images_mobile",
  heroTitle: "hero_title",
  heroSubtitle: "hero_subtitle",
  seoTitle: "seo_title",
  seoDescription: "seo_description",
  ogImageUrl: "og_image_url",
  metaPixelId: "meta_pixel_id",
  gaMeasurementId: "ga_measurement_id",
  footerTagline: "footer_tagline",
  stockLowThreshold: "stock_low_threshold",
  promoEnabled: "promo_enabled",
  promoLabel: "promo_label",
  promoSubtitle: "promo_subtitle",
  promoHeroCta: "promo_hero_cta",
  promoImages: "promo_images",
  featuredOffers: "featured_offers",
  categoryShowcaseOverrides: "category_showcase_overrides",
  landingTexts: "landing_texts",
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
