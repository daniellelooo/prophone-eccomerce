// Catálogo Prophone — modelo con variantes (precio por almacenamiento + condición).
// Las imágenes son placeholders (se reemplazan en la fase A2 con fotos reales de Apple/Mac Center).
// Cuando un dato (color, feature, descripción) no está confirmado, se deja vacío en vez de inventarlo.

export type ProductCategory =
  | "iphone"
  | "ipad"
  | "watch"
  | "macbook"
  | "accesorios";

export type ProductCondition =
  | "nuevo"
  | "exhibicion"
  | "as-is"
  | "open-box"
  | "preventa";

export const conditionLabels: Record<ProductCondition, string> = {
  nuevo: "Nuevo",
  exhibicion: "Exhibición",
  "as-is": "AS-IS",
  "open-box": "Open box",
  preventa: "Preventa",
};

export const conditionWarranty: Record<ProductCondition, string> = {
  nuevo: "1 año garantía Apple",
  exhibicion: "3.5 meses de garantía",
  "as-is": "Sin garantía oficial",
  "open-box": "Garantía Apple restante",
  preventa: "1 año garantía Apple",
};

export type Variant = {
  sku: string;
  storage?: string; // "128 GB", "256 GB", "1 TB"
  ram?: string; // MacBook: "8 GB", "16 GB", "24 GB"
  size?: string; // MacBook: "13\"", "14\"", "15\""
  color?: string;
  condition: ProductCondition;
  price: number;
  notes?: string; // "Naranja", "Batería 100%", "Sim física", etc.
  inStock: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  family?: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  colors: { name: string; hex: string }[];
  features: string[];
  variants: Variant[];
  isNew?: boolean;
  isFeatured?: boolean;
  badge?: string;
};

// ────────────────────────────────────────────────────────────────────────────
// Imágenes placeholder (se reemplazan en A2)
// ────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER = {
  iphone:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD9g9pZG9mhpEKLP5AZyOP9WlwKdQ2k-VVn1kN-sqAo1TsbnsGjV_Sby7pexA8SBrhl_CPz0aDbuPPSJYy3UUUoKf7AWiECBAet6C-CgJjso76WYXMCgldFx_4dwWJ_uycuJ_iUCw46_kwO34XUM-6tl39QUb94vderlZ-gKeY_u3ph67syax9sp_CBbW_S8J0koexKLIUQ4O5kZWtw5ENcqi_7X64wVr0-Y95zLEjNXVgXoNOkgUeGaCS3muXRnlwkEcei9uFRjn0",
  iphonePro:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBgc3-nl3Vn7l48ZC8Nms17dFZcVZFGDsqv1rt3Pa9KOvhOrvW88Vkakicz4VL7J4hs9f7kvhK-0xO34BwsW2oHiTOCya_vX4FRlYE6byFYALH422czxJOyPSOnNho72DmrUlichAOCrEAS-KGBlMWS0UClwjwvR_DAclyHF2nRLxUMeN8iiXTJcHb1nuHUJxs3PymxyhO8TzqZsd8X8ctCpLStuwUrZ7sk6c7N8nZ9nz5NWWlrSzj1rLkV8Eq0EXHVkRR17VJuoT4",
  ipad:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuChQmBTGDPK2majj1XYr2eQJDvtLS6WF7nrgUQhD1wjHRPKtjflzdoK24G2E7yd1PV9d0D2svmvM5g5p5pvmk844ICda2yB37-_d24y60yGht04BvOLHOm-cTppqmst7YqxY7jzqH1q5PgorbE6Xs3M9TgIqOqTfWUrMB-or6U3CDXxyrhdJujyJCa2PT8uVNfTyqchnvMOG74eGHRG0kQZodUXAzJZuMnt0oeqhYIcSu2InlLmPhVGZg3uPwFYTJIw4dWgQVtohLM",
  ipadA16:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC7hcyOUaTXeSbVGw0BsOns7PXEa5In9n2uDeSg05GPvRDkqGl9dtwSE2uUqMQpPs5Ddglf619pcEanVs3Rn_U4Zz_4EmYgbE5JVtmnyyRl35qOHKO-3RLwD_NkDarrBNNZqSJOyAJK_OVGWyBmKeCovjSPNzx5wFWG_ZVf7HExGOMXSYcrZk0k1imHB9WOVVUz_9FlnzyfbA0jQ19vGeWBUlhlP-hyM9tnUw9jRyFww9ado_RRNPyywTns66pkOjKB_9O4hMnIG0U",
  watchUltra:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCF3Zwi1jHIr2w31iOmURSErcQ8T-BaEGdy-UsV_0eDo3YzYcpU_sn5JbAe1n29P-bjb8YldJdF1APEJOlsNrKlrBAn4Bef6gLu70plqvEcN8YBH4R6UXiVAbxp8uI-S-IlKtLK89h64zzVS2V7lqe06WjDJz-p-7xQ1Lyvdw_m8tUs7cl5YVBQVbMted1NddNdOFeHOU5rgpAwMPXvejVfkHFqmySRJ_gZo267UwmaUYRt_a-DXo_uQ29VWTQe1V6DYK1yLNBbYAyk",
  watchSeries:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBw3zo8Jla8vhu74BR0HBBXexXP4UTWfM_m25P6WvJZmIxfQnIffyVwdg7s5VsKq4Se7NHC3O_gY9Eh4M4APmJGBCRC9yE3bcUUHqIsstdj6ooUxLwbaRCiwcR73-aG7LS5w8auQ_wXhmLUbLaZItEBMFbLP1g-DI_Um0b_6kPZmtkQFscDUev9wFWCvygT_34rKOMsCZW51J3OOf6VELi3xAeJq4RwUaCxMfGATcIq-g0IqNAqeiC_6ZRPJCpGzz5bQYjJ2URYEZw",
  airpods:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCdBBl3KFwzPGhRlxcOiyRaGcIXs2aBdKK1UfSJJzXqKklpXFuSakGp8D1GD5tNYCn3xSdmkf93nPMhEVAXLBXi6DAlAXCCzlQxPtD7l6RU-vj1kXEQTlJb97uagRBFlf8jJL6rG_mT5m3-8LVxhQMnbHJlBl_cDqiDjEqBYz-H3LGflU5FQE9P1RUv7TfcEH9OFp-9BF2Uh5Phu3VbmMlqxJnBHUCvlS2n7FBp3HIMmGJhzFZBOzSc0CdBT5FXpFf2xmJVfSug",
  accesorio:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDvuS5CqHhkf8Dh3_Oc-vBjMV43XKE3mHqNrVeVs_56EwUTVt1pjFH4xvJSzU-kizEKIzD06pEi0v0Cj2W_GW2m6I2oQcR3sczp0cxTOt7kHBhsS5R0Zxii3bsumSqhbQHMOT_8AEPzGODSfmpMMDL3KLB0oNZlOE7B-EAJmMXAQbpFZ2Nt1a63bTwRy9NBZJW8DFB9WlGwkwqsVKSG7m0XKXSoiEkD0vVkCiqDfVEJeIJ2YgBXAkN0EAKGG9KT-EXWQHKbTbQ",
  // MacBooks: usar imagen genérica de iPad por ahora hasta A2.
  macbook:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuChQmBTGDPK2majj1XYr2eQJDvtLS6WF7nrgUQhD1wjHRPKtjflzdoK24G2E7yd1PV9d0D2svmvM5g5p5pvmk844ICda2yB37-_d24y60yGht04BvOLHOm-cTppqmst7YqxY7jzqH1q5PgorbE6Xs3M9TgIqOqTfWUrMB-or6U3CDXxyrhdJujyJCa2PT8uVNfTyqchnvMOG74eGHRG0kQZodUXAzJZuMnt0oeqhYIcSu2InlLmPhVGZg3uPwFYTJIw4dWgQVtohLM",
};

// ────────────────────────────────────────────────────────────────────────────
// Productos
// ────────────────────────────────────────────────────────────────────────────

export const products: Product[] = [
  // ── iPhone 17 Pro Max ────────────────────────────────────────────────────
  {
    id: "iphone-17-pro-max",
    slug: "iphone-17-pro-max",
    name: "iPhone 17 Pro Max",
    category: "iphone",
    family: "iPhone 17",
    description:
      "El iPhone más avanzado del lineup 2025. Disponible nuevo con garantía Apple y en exhibición a precio especial.",
    shortDescription: "Nuevo y exhibición · Hasta 1 TB",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [],
    features: [],
    isNew: true,
    isFeatured: true,
    variants: [
      { sku: "ip17pm-256-asis", storage: "256 GB", condition: "nuevo", price: 5100000, notes: "AS-IS sim física", inStock: true },
      { sku: "ip17pm-1tb-naranja-nuevo", storage: "1 TB", condition: "nuevo", price: 6800000, notes: "Naranja", inStock: true },
      { sku: "ip17pm-512-naranja-nuevo", storage: "512 GB", condition: "nuevo", price: 6200000, notes: "Naranja", inStock: true },
      { sku: "ip17pm-256-anker-nuevo", storage: "256 GB", condition: "nuevo", price: 5400000, notes: "Todos los colores + parlante Anker", inStock: true },
      { sku: "ip17pm-256-exh", storage: "256 GB", condition: "exhibicion", price: 4750000, inStock: true },
    ],
  },

  // ── iPhone 17 Pro ────────────────────────────────────────────────────────
  {
    id: "iphone-17-pro",
    slug: "iphone-17-pro",
    name: "iPhone 17 Pro",
    category: "iphone",
    family: "iPhone 17",
    description: "iPhone 17 Pro en exhibición con 3.5 meses de garantía Prophone.",
    shortDescription: "Exhibición · 256 GB y 512 GB",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [],
    features: [],
    isNew: true,
    isFeatured: true,
    variants: [
      { sku: "ip17p-512-exh", storage: "512 GB", condition: "exhibicion", price: 4600000, inStock: true },
      { sku: "ip17p-256-exh", storage: "256 GB", condition: "exhibicion", price: 4400000, inStock: true },
    ],
  },

  // ── iPhone 17 ────────────────────────────────────────────────────────────
  {
    id: "iphone-17",
    slug: "iphone-17",
    name: "iPhone 17",
    category: "iphone",
    family: "iPhone 17",
    description: "iPhone 17 en exhibición.",
    shortDescription: "Exhibición · 256 GB",
    image: PLACEHOLDER.iphone,
    images: [PLACEHOLDER.iphone],
    colors: [],
    features: [],
    isNew: true,
    variants: [
      { sku: "ip17-256-exh", storage: "256 GB", condition: "exhibicion", price: 3050000, inStock: true },
    ],
  },

  // ── iPhone Air ───────────────────────────────────────────────────────────
  {
    id: "iphone-air",
    slug: "iphone-air",
    name: "iPhone Air",
    category: "iphone",
    family: "iPhone Air",
    description: "iPhone Air en exhibición.",
    shortDescription: "Exhibición · 256 GB y 512 GB",
    image: PLACEHOLDER.iphone,
    images: [PLACEHOLDER.iphone],
    colors: [],
    features: [],
    isNew: true,
    variants: [
      { sku: "ipair-512-exh", storage: "512 GB", condition: "exhibicion", price: 3760000, inStock: true },
      { sku: "ipair-256-exh", storage: "256 GB", condition: "exhibicion", price: 3280000, inStock: true },
    ],
  },

  // ── iPhone 16 Pro Max ────────────────────────────────────────────────────
  {
    id: "iphone-16-pro-max",
    slug: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    category: "iphone",
    family: "iPhone 16",
    description: "iPhone 16 Pro Max en exhibición con la mejor relación precio/calidad.",
    shortDescription: "Exhibición · 256 GB y 512 GB",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [],
    features: [],
    isFeatured: true,
    variants: [
      { sku: "ip16pm-512-exh", storage: "512 GB", condition: "exhibicion", price: 3500000, inStock: true },
      { sku: "ip16pm-256-exh", storage: "256 GB", condition: "exhibicion", price: 3350000, inStock: true },
    ],
  },

  // ── iPhone 16 Pro ────────────────────────────────────────────────────────
  {
    id: "iphone-16-pro",
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "iphone",
    family: "iPhone 16",
    description:
      "El iPhone Pro de 2024. Chip A18 Pro, sistema de cámaras Pro de 48 MP y diseño en titanio. Disponible en exhibición.",
    shortDescription: "Chip A18 Pro · Cámara 48 MP · Titanio",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [
      { name: "Titanio Natural", hex: "#b5a898" },
      { name: "Titanio Negro", hex: "#3d3d3d" },
      { name: "Titanio Blanco", hex: "#f0ede8" },
      { name: "Titanio Desierto", hex: "#c5b59a" },
    ],
    features: [
      "Chip A18 Pro",
      "Sistema de cámara Pro con sensor de 48 MP",
      "Pantalla Super Retina XDR ProMotion",
      "Dynamic Island",
      "Botón de Acción",
      "Diseño en titanio",
    ],
    isFeatured: true,
    variants: [
      { sku: "ip16p-256-exh", storage: "256 GB", condition: "exhibicion", price: 2950000, inStock: true },
      { sku: "ip16p-128-exh", storage: "128 GB", condition: "exhibicion", price: 2850000, inStock: true },
    ],
  },

  // ── iPhone 16 Plus ───────────────────────────────────────────────────────
  {
    id: "iphone-16-plus",
    slug: "iphone-16-plus",
    name: "iPhone 16 Plus",
    category: "iphone",
    family: "iPhone 16",
    description: "iPhone 16 Plus en exhibición a precio bomba.",
    shortDescription: "Exhibición · 128 GB",
    image: PLACEHOLDER.iphone,
    images: [PLACEHOLDER.iphone],
    colors: [],
    features: [],
    badge: "Precio bomba",
    variants: [
      { sku: "ip16plus-128-exh", storage: "128 GB", condition: "exhibicion", price: 2450000, inStock: true },
    ],
  },

  // ── iPhone 16 ────────────────────────────────────────────────────────────
  {
    id: "iphone-16",
    slug: "iphone-16",
    name: "iPhone 16",
    category: "iphone",
    family: "iPhone 16",
    description:
      "iPhone 16 con chip A18, sistema de cámara Fusion de 48 MP y Dynamic Island. Disponible nuevo y en exhibición.",
    shortDescription: "Chip A18 · Cámara 48 MP · Dynamic Island",
    image: PLACEHOLDER.iphone,
    images: [PLACEHOLDER.iphone],
    colors: [
      { name: "Negro", hex: "#1c1c1c" },
      { name: "Blanco", hex: "#f5f5f0" },
      { name: "Rosa", hex: "#f4c2c2" },
      { name: "Verde Azulado", hex: "#4a7c7e" },
      { name: "Ultramarino", hex: "#3f4e8c" },
    ],
    features: [
      "Chip A18",
      "Cámara Fusion de 48 MP con zoom óptico 2x",
      "Pantalla Super Retina XDR de 6.1\"",
      "Dynamic Island",
      "Botón de Acción y Botón de Cámara",
    ],
    isFeatured: true,
    variants: [
      { sku: "ip16-128-nuevo", storage: "128 GB", condition: "nuevo", price: 2950000, inStock: true },
      { sku: "ip16-128-exh", storage: "128 GB", condition: "exhibicion", price: 2200000, inStock: true },
    ],
  },

  // ── iPhone 15 Pro Max ────────────────────────────────────────────────────
  {
    id: "iphone-15-pro-max",
    slug: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    category: "iphone",
    family: "iPhone 15",
    description: "iPhone 15 Pro Max en exhibición.",
    shortDescription: "Exhibición · 256 GB y 1 TB",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [],
    features: [],
    variants: [
      { sku: "ip15pm-1tb-exh", storage: "1 TB", condition: "exhibicion", price: 3050000, inStock: true },
      { sku: "ip15pm-256-exh", storage: "256 GB", condition: "exhibicion", price: 2700000, inStock: true },
    ],
  },

  // ── iPhone 15 Pro ────────────────────────────────────────────────────────
  {
    id: "iphone-15-pro",
    slug: "iphone-15-pro",
    name: "iPhone 15 Pro",
    category: "iphone",
    family: "iPhone 15",
    description:
      "iPhone 15 Pro de titanio con chip A17 Pro. Disponible en exhibición; la variante de 128 GB conserva batería al 100%.",
    shortDescription: "Chip A17 Pro · Titanio · USB-C",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [
      { name: "Titanio Natural", hex: "#b5a898" },
      { name: "Titanio Negro", hex: "#3d3d3d" },
      { name: "Titanio Azul", hex: "#4a6fa5" },
      { name: "Titanio Blanco", hex: "#f0ede8" },
    ],
    features: [
      "Chip A17 Pro",
      "Pantalla Super Retina XDR ProMotion",
      "Botón de Acción",
      "USB-C",
      "Diseño en titanio",
    ],
    isFeatured: true,
    variants: [
      { sku: "ip15p-512-exh", storage: "512 GB", condition: "exhibicion", price: 2400000, inStock: true },
      { sku: "ip15p-256-exh", storage: "256 GB", condition: "exhibicion", price: 2250000, inStock: true },
      { sku: "ip15p-128-exh", storage: "128 GB", condition: "exhibicion", price: 2150000, notes: "Batería al 100%", inStock: true },
    ],
  },

  // ── iPhone 15 Plus ───────────────────────────────────────────────────────
  {
    id: "iphone-15-plus",
    slug: "iphone-15-plus",
    name: "iPhone 15 Plus",
    category: "iphone",
    family: "iPhone 15",
    description: "iPhone 15 Plus en exhibición.",
    shortDescription: "Exhibición · 128 GB",
    image: PLACEHOLDER.iphone,
    images: [PLACEHOLDER.iphone],
    colors: [],
    features: [],
    variants: [
      { sku: "ip15plus-128-exh", storage: "128 GB", condition: "exhibicion", price: 1800000, inStock: true },
    ],
  },

  // ── iPhone 15 ────────────────────────────────────────────────────────────
  {
    id: "iphone-15",
    slug: "iphone-15",
    name: "iPhone 15",
    category: "iphone",
    family: "iPhone 15",
    description:
      "iPhone 15 con Dynamic Island, chip A16 Bionic y conector USB-C. Disponible nuevo y en exhibición.",
    shortDescription: "Chip A16 · Dynamic Island · USB-C",
    image: PLACEHOLDER.iphone,
    images: [PLACEHOLDER.iphone],
    colors: [
      { name: "Negro", hex: "#1c1c1c" },
      { name: "Rosa", hex: "#f5c6c6" },
      { name: "Amarillo", hex: "#f9e17a" },
      { name: "Verde", hex: "#b0d4b0" },
      { name: "Azul", hex: "#9fb8d8" },
    ],
    features: [
      "Chip A16 Bionic",
      "Cámara de 48 MP con zoom óptico 2x",
      "Pantalla Super Retina XDR 6.1\"",
      "Dynamic Island",
      "USB-C",
    ],
    variants: [
      { sku: "ip15-512-nuevo", storage: "512 GB", condition: "nuevo", price: 2920000, notes: "Sim física", inStock: true },
      { sku: "ip15-256-exh", storage: "256 GB", condition: "exhibicion", price: 2050000, inStock: true },
      { sku: "ip15-128-exh", storage: "128 GB", condition: "exhibicion", price: 1750000, inStock: true },
    ],
  },

  // ── iPhone 14 Pro Max ────────────────────────────────────────────────────
  {
    id: "iphone-14-pro-max",
    slug: "iphone-14-pro-max",
    name: "iPhone 14 Pro Max",
    category: "iphone",
    family: "iPhone 14",
    description: "iPhone 14 Pro Max en exhibición.",
    shortDescription: "Exhibición · 128 GB, 256 GB y 512 GB",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [],
    features: [],
    variants: [
      { sku: "ip14pm-512-exh", storage: "512 GB", condition: "exhibicion", price: 2450000, inStock: true },
      { sku: "ip14pm-256-exh", storage: "256 GB", condition: "exhibicion", price: 2350000, inStock: true },
      { sku: "ip14pm-128-exh", storage: "128 GB", condition: "exhibicion", price: 2100000, inStock: true },
    ],
  },

  // ── iPhone 14 Pro ────────────────────────────────────────────────────────
  {
    id: "iphone-14-pro",
    slug: "iphone-14-pro",
    name: "iPhone 14 Pro",
    category: "iphone",
    family: "iPhone 14",
    description: "iPhone 14 Pro en exhibición.",
    shortDescription: "Exhibición · 256 GB",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [],
    features: [],
    variants: [
      { sku: "ip14p-256-exh", storage: "256 GB", condition: "exhibicion", price: 2050000, inStock: true },
    ],
  },

  // ── iPhone 14 ────────────────────────────────────────────────────────────
  {
    id: "iphone-14",
    slug: "iphone-14",
    name: "iPhone 14",
    category: "iphone",
    family: "iPhone 14",
    description:
      "iPhone 14 con chip A15 Bionic, sistema de cámara dual de 12 MP y pantalla Super Retina XDR de 6.1\". Disponible nuevo a precio promocional y en exhibición.",
    shortDescription: "Chip A15 · Cámara 12 MP · Super Retina XDR",
    image: PLACEHOLDER.iphone,
    images: [PLACEHOLDER.iphone],
    colors: [
      { name: "Medianoche", hex: "#1c1c1e" },
      { name: "Blanco estrella", hex: "#f2f0eb" },
      { name: "Azul", hex: "#9fb8d8" },
      { name: "Morado", hex: "#a38cbf" },
      { name: "Rojo (PRODUCT)RED", hex: "#c0392b" },
    ],
    features: [
      "Chip A15 Bionic",
      "Cámara principal de 12 MP",
      "Pantalla Super Retina XDR de 6.1\"",
      "Detección de accidentes",
      "Resistencia al agua IP68",
    ],
    badge: "Mega descuento",
    variants: [
      { sku: "ip14-128-nuevo", storage: "128 GB", condition: "nuevo", price: 2250000, notes: "Mega descuento", inStock: true },
      { sku: "ip14-256-exh", storage: "256 GB", condition: "exhibicion", price: 1500000, inStock: true },
      { sku: "ip14-128-exh", storage: "128 GB", condition: "exhibicion", price: 1400000, inStock: true },
    ],
  },

  // ── iPhone 13 Pro Max ────────────────────────────────────────────────────
  {
    id: "iphone-13-pro-max",
    slug: "iphone-13-pro-max",
    name: "iPhone 13 Pro Max",
    category: "iphone",
    family: "iPhone 13",
    description: "iPhone 13 Pro Max en exhibición con batería al 100%.",
    shortDescription: "Exhibición · Batería al 100%",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [],
    features: [],
    variants: [
      { sku: "ip13pm-256-exh", storage: "256 GB", condition: "exhibicion", price: 2280000, notes: "Batería al 100%", inStock: true },
      { sku: "ip13pm-128-exh", storage: "128 GB", condition: "exhibicion", price: 1850000, notes: "Batería al 100%", inStock: true },
    ],
  },

  // ── iPhone 13 Pro ────────────────────────────────────────────────────────
  {
    id: "iphone-13-pro",
    slug: "iphone-13-pro",
    name: "iPhone 13 Pro",
    category: "iphone",
    family: "iPhone 13",
    description: "iPhone 13 Pro en exhibición.",
    shortDescription: "Exhibición · 128 GB y 256 GB",
    image: PLACEHOLDER.iphonePro,
    images: [PLACEHOLDER.iphonePro],
    colors: [],
    features: [],
    variants: [
      { sku: "ip13p-256-exh", storage: "256 GB", condition: "exhibicion", price: 1750000, inStock: true },
      { sku: "ip13p-128-exh", storage: "128 GB", condition: "exhibicion", price: 1600000, inStock: true },
    ],
  },

  // ── iPhone 13 ────────────────────────────────────────────────────────────
  {
    id: "iphone-13",
    slug: "iphone-13",
    name: "iPhone 13",
    category: "iphone",
    family: "iPhone 13",
    description: "iPhone 13 en exhibición con batería al 100%.",
    shortDescription: "Exhibición · Batería al 100%",
    image: PLACEHOLDER.iphone,
    images: [PLACEHOLDER.iphone],
    colors: [],
    features: [],
    variants: [
      { sku: "ip13-256-exh", storage: "256 GB", condition: "exhibicion", price: 1350000, notes: "Batería al 100%", inStock: true },
      { sku: "ip13-128-exh", storage: "128 GB", condition: "exhibicion", price: 1250000, notes: "Batería al 100%", inStock: true },
    ],
  },

  // ── iPad Pro M4 ──────────────────────────────────────────────────────────
  {
    id: "ipad-pro-m4",
    slug: "ipad-pro-m4",
    name: "iPad Pro M4",
    category: "ipad",
    family: "iPad Pro",
    description:
      "Ridículamente potente. Con chip M4, pantalla Ultra Retina XDR OLED tandem y diseño ultrafino de 5.1 mm.",
    shortDescription: "Chip M4 · OLED Ultra Retina · 5.1 mm",
    image: PLACEHOLDER.ipad,
    images: [PLACEHOLDER.ipad],
    colors: [
      { name: "Plata", hex: "#e3e3e3" },
      { name: "Negro Espacial", hex: "#3d3d3d" },
    ],
    features: [
      "Chip M4 con Neural Engine de 10 núcleos",
      "Pantalla Ultra Retina XDR OLED tandem",
      "Diseño ultrafino de 5.1 mm",
      "Compatible con Apple Pencil Pro",
      "Thunderbolt / USB 4",
    ],
    isNew: true,
    isFeatured: true,
    badge: "Nuevo",
    variants: [
      { sku: "ipadprom4-256", storage: "256 GB", condition: "nuevo", price: 4890000, inStock: true },
      { sku: "ipadprom4-512", storage: "512 GB", condition: "nuevo", price: 5890000, inStock: true },
      { sku: "ipadprom4-1tb", storage: "1 TB", condition: "nuevo", price: 7290000, inStock: true },
      { sku: "ipadprom4-2tb", storage: "2 TB", condition: "nuevo", price: 8490000, inStock: true },
    ],
  },

  // ── iPad A16 ─────────────────────────────────────────────────────────────
  {
    id: "ipad-a16",
    slug: "ipad-a16",
    name: "iPad A16",
    category: "ipad",
    family: "iPad",
    description:
      "El iPad más accesible con chip A16 y pantalla Liquid Retina de 10.9\". Perfecto para empezar en el ecosistema Apple.",
    shortDescription: "Chip A16 · Liquid Retina 10.9\"",
    image: PLACEHOLDER.ipadA16,
    images: [PLACEHOLDER.ipadA16],
    colors: [
      { name: "Azul", hex: "#a8c5da" },
      { name: "Rosa", hex: "#f2c4ce" },
      { name: "Amarillo", hex: "#f9e17a" },
      { name: "Plata", hex: "#e3e3e3" },
    ],
    features: [
      "Chip A16",
      "Pantalla Liquid Retina de 10.9\"",
      "Compatible con Apple Pencil (1.ª generación)",
      "Touch ID integrado",
      "Cámara frontal de 12 MP ultra gran angular",
    ],
    isFeatured: true,
    badge: "El más accesible",
    variants: [
      { sku: "ipada16-128", storage: "128 GB", condition: "nuevo", price: 1420000, inStock: true },
      { sku: "ipada16-256", storage: "256 GB", condition: "nuevo", price: 1820000, inStock: true },
    ],
  },

  // ── iPad Air ─────────────────────────────────────────────────────────────
  {
    id: "ipad-air",
    slug: "ipad-air",
    name: "iPad Air",
    category: "ipad",
    family: "iPad Air",
    description: "Potencia M2 en un diseño ligero. Pantalla Liquid Retina de 10.9\".",
    shortDescription: "Chip M2 · Liquid Retina · Ligero",
    image: PLACEHOLDER.ipadA16,
    images: [PLACEHOLDER.ipadA16],
    colors: [
      { name: "Azul", hex: "#a8c5da" },
      { name: "Rosa", hex: "#f2c4ce" },
      { name: "Amarillo", hex: "#f9e17a" },
      { name: "Gris espacial", hex: "#8e8e93" },
    ],
    features: [
      "Chip M2",
      "Pantalla Liquid Retina de 10.9\"",
      "Compatible con Apple Pencil (2.ª generación)",
      "Compatible con Magic Keyboard",
    ],
    variants: [
      { sku: "ipadair-64", storage: "64 GB", condition: "nuevo", price: 2850000, inStock: true },
      { sku: "ipadair-256", storage: "256 GB", condition: "nuevo", price: 3450000, inStock: true },
    ],
  },

  // ── Apple Watch Ultra 2 ──────────────────────────────────────────────────
  {
    id: "apple-watch-ultra-2",
    slug: "apple-watch-ultra-2",
    name: "Apple Watch Ultra 2",
    category: "watch",
    family: "Apple Watch",
    description:
      "El Apple Watch más avanzado. Carcasa de titanio de 49 mm para los aventureros más exigentes.",
    shortDescription: "Titanio · 49 mm · GPS doble frecuencia",
    image: PLACEHOLDER.watchUltra,
    images: [PLACEHOLDER.watchUltra],
    colors: [
      { name: "Titanio Natural", hex: "#b5a898" },
      { name: "Titanio Negro", hex: "#3d3d3d" },
    ],
    features: [
      "Carcasa de titanio de 49 mm",
      "GPS de doble frecuencia L1 y L5",
      "Profundidad hasta 100 m",
      "Hasta 60 horas de batería",
      "Pantalla 3000 nits",
    ],
    isFeatured: true,
    variants: [
      { sku: "awultra2", condition: "nuevo", price: 3450000, inStock: true },
    ],
  },

  // ── Apple Watch Series 9 ─────────────────────────────────────────────────
  {
    id: "apple-watch-series-9",
    slug: "apple-watch-series-9",
    name: "Apple Watch Series 9",
    category: "watch",
    family: "Apple Watch",
    description:
      "El Apple Watch más avanzado para el día a día. Chip S9, función de doble toque y Always-On Display.",
    shortDescription: "Chip S9 · Doble toque · 45 mm",
    image: PLACEHOLDER.watchSeries,
    images: [PLACEHOLDER.watchSeries],
    colors: [
      { name: "Medianoche", hex: "#1c1c1e" },
      { name: "Blanco estrella", hex: "#f2f0eb" },
      { name: "Rosa", hex: "#f2c4ce" },
      { name: "Rojo (PRODUCT)RED", hex: "#c0392b" },
    ],
    features: [
      "Chip S9",
      "Función de doble toque",
      "Always-On Retina Display",
      "Resistencia al agua 50 m",
      "ECG y detección de caídas",
    ],
    variants: [
      { sku: "awseries9", condition: "nuevo", price: 1890000, inStock: true },
    ],
  },

  // ── AirPods 4 ────────────────────────────────────────────────────────────
  {
    id: "airpods-4",
    slug: "airpods-4",
    name: "AirPods 4",
    category: "accesorios",
    family: "AirPods",
    description:
      "AirPods con sonido de alta fidelidad, cancelación de ruido activa y chip H2.",
    shortDescription: "Chip H2 · Cancelación de ruido · USB-C",
    image: PLACEHOLDER.airpods,
    images: [PLACEHOLDER.airpods],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    features: [
      "Chip H2",
      "Cancelación activa de ruido",
      "Audio espacial personalizado",
      "Estuche de carga USB-C",
      "Resistencia al agua IPX4",
    ],
    isNew: true,
    badge: "Nuevo",
    variants: [
      { sku: "airpods4", condition: "nuevo", price: 590000, inStock: true },
    ],
  },

  // ── Cargador USB-C 20W ───────────────────────────────────────────────────
  {
    id: "cargador-usbc-20w",
    slug: "cargador-usbc-20w",
    name: "Cargador USB-C 20W Apple",
    category: "accesorios",
    family: "Cargadores",
    description:
      "Cargador compacto USB-C de 20W de Apple. Compatible con iPhone 8 o superior y todos los iPad con USB-C.",
    shortDescription: "20W · USB-C · Carga rápida",
    image: PLACEHOLDER.accesorio,
    images: [PLACEHOLDER.accesorio],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    features: [
      "Potencia de 20W",
      "Conector USB-C",
      "Carga rápida para iPhone 8 o superior",
      "Compatible con iPad y AirPods",
    ],
    variants: [
      { sku: "charger20w", condition: "nuevo", price: 89000, inStock: true },
    ],
  },

  // ── Cable USB-C a Lightning ──────────────────────────────────────────────
  {
    id: "cable-usbc-lightning",
    slug: "cable-usbc-lightning",
    name: "Cable USB-C a Lightning 1m",
    category: "accesorios",
    family: "Cables",
    description:
      "Cable USB-C a Lightning de Apple certificado MFi. Carga rápida y transferencia de datos. Longitud de 1 metro.",
    shortDescription: "1 m · MFi · Carga rápida",
    image: PLACEHOLDER.accesorio,
    images: [PLACEHOLDER.accesorio],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    features: [
      "Certificado MFi",
      "Carga rápida compatible",
      "Longitud de 1 metro",
      "Transferencia de datos USB 2.0",
    ],
    variants: [
      { sku: "cable-c-lightning-1m", condition: "nuevo", price: 59000, inStock: true },
    ],
  },

  // ── Apple Pencil USB-C ───────────────────────────────────────────────────
  {
    id: "apple-pencil-usbc",
    slug: "apple-pencil-usbc",
    name: "Apple Pencil USB-C",
    category: "accesorios",
    family: "Apple Pencil",
    description:
      "Apple Pencil con conector USB-C. Escritura fluida y precisa para iPad.",
    shortDescription: "USB-C · Escritura precisa",
    image: PLACEHOLDER.ipad,
    images: [PLACEHOLDER.ipad],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    features: [
      "Conector USB-C",
      "Escritura y dibujo con baja latencia",
      "Rechazo de palma",
      "Compatible con iPad (10.ª gen o posterior)",
    ],
    variants: [
      { sku: "pencil-usbc", condition: "nuevo", price: 350000, inStock: true },
    ],
  },

  // ── Cargador MagSafe ─────────────────────────────────────────────────────
  {
    id: "magsafe-charger",
    slug: "magsafe-charger",
    name: "Cargador MagSafe",
    category: "accesorios",
    family: "Cargadores",
    description:
      "Cargador MagSafe de Apple con hasta 15W de carga inalámbrica para iPhone 12 o superior.",
    shortDescription: "15W · Magnético · iPhone 12+",
    image: PLACEHOLDER.accesorio,
    images: [PLACEHOLDER.accesorio],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    features: [
      "Hasta 15W de carga inalámbrica",
      "Alineación magnética perfecta",
      "Compatible con iPhone 12 o posterior",
      "Cable USB-C de 1 metro incluido",
    ],
    badge: "Popular",
    variants: [
      { sku: "magsafe", condition: "nuevo", price: 139000, inStock: true },
    ],
  },

  // ── MacBook Pro M5 14" ───────────────────────────────────────────────────
  {
    id: "macbook-pro-m5-14",
    slug: "macbook-pro-m5-14",
    name: "MacBook Pro 14\" M5",
    category: "macbook",
    family: "MacBook Pro",
    description: "MacBook Pro 14\" con chip M5. Garantía Apple de 1 año.",
    shortDescription: "M5 · 14\" · 16 GB RAM",
    image: PLACEHOLDER.macbook,
    images: [PLACEHOLDER.macbook],
    colors: [],
    features: ["Chip Apple M5", "Pantalla 14\"", "16 GB RAM unificada"],
    isNew: true,
    isFeatured: true,
    variants: [
      { sku: "mbp-m5-14-16-1tb", size: "14\"", ram: "16 GB", storage: "1 TB", condition: "nuevo", price: 8600000, inStock: true },
      { sku: "mbp-m5-14-16-512", size: "14\"", ram: "16 GB", storage: "512 GB", condition: "nuevo", price: 7700000, inStock: true },
    ],
  },

  // ── MacBook Pro M4 14" ───────────────────────────────────────────────────
  {
    id: "macbook-pro-m4-14",
    slug: "macbook-pro-m4-14",
    name: "MacBook Pro 14\" M4",
    category: "macbook",
    family: "MacBook Pro",
    description: "MacBook Pro 14\" con chip M4. Garantía Apple de 1 año.",
    shortDescription: "M4 · 14\" · 24 GB RAM · 512 GB",
    image: PLACEHOLDER.macbook,
    images: [PLACEHOLDER.macbook],
    colors: [],
    features: ["Chip Apple M4", "Pantalla 14\"", "24 GB RAM unificada"],
    variants: [
      { sku: "mbp-m4-14-24-512", size: "14\"", ram: "24 GB", storage: "512 GB", condition: "nuevo", price: 8400000, inStock: true },
    ],
  },

  // ── MacBook Pro M3 14" ───────────────────────────────────────────────────
  {
    id: "macbook-pro-m3-14",
    slug: "macbook-pro-m3-14",
    name: "MacBook Pro 14\" M3",
    category: "macbook",
    family: "MacBook Pro",
    description: "MacBook Pro 14\" con chip M3 (AS-IS).",
    shortDescription: "M3 · 14\" · 8 GB RAM · 1 TB",
    image: PLACEHOLDER.macbook,
    images: [PLACEHOLDER.macbook],
    colors: [],
    features: ["Chip Apple M3", "Pantalla 14\"", "8 GB RAM unificada"],
    variants: [
      { sku: "mbp-m3-14-8-1tb-asis", size: "14\"", ram: "8 GB", storage: "1 TB", condition: "as-is", price: 4300000, notes: "AS-IS", inStock: true },
    ],
  },

  // ── MacBook Air M5 13" ───────────────────────────────────────────────────
  {
    id: "macbook-air-m5-13",
    slug: "macbook-air-m5-13",
    name: "MacBook Air 13\" M5",
    category: "macbook",
    family: "MacBook Air",
    description: "MacBook Air 13\" con chip M5. Garantía Apple de 1 año.",
    shortDescription: "M5 · 13\" · 16 GB RAM",
    image: PLACEHOLDER.macbook,
    images: [PLACEHOLDER.macbook],
    colors: [],
    features: ["Chip Apple M5", "Pantalla 13\"", "16 GB RAM unificada"],
    isNew: true,
    isFeatured: true,
    variants: [
      { sku: "mba-m5-13-16-1tb", size: "13\"", ram: "16 GB", storage: "1 TB", condition: "nuevo", price: 5700000, inStock: true },
      { sku: "mba-m5-13-16-512", size: "13\"", ram: "16 GB", storage: "512 GB", condition: "nuevo", price: 4900000, inStock: true },
    ],
  },

  // ── MacBook Air M4 15" ───────────────────────────────────────────────────
  {
    id: "macbook-air-m4-15",
    slug: "macbook-air-m4-15",
    name: "MacBook Air 15\" M4",
    category: "macbook",
    family: "MacBook Air",
    description: "MacBook Air 15\" con chip M4 — preventa.",
    shortDescription: "M4 · 15\" · 16 GB RAM · 256 GB",
    image: PLACEHOLDER.macbook,
    images: [PLACEHOLDER.macbook],
    colors: [],
    features: ["Chip Apple M4", "Pantalla 15\"", "16 GB RAM unificada"],
    badge: "Preventa",
    variants: [
      { sku: "mba-m4-15-16-256", size: "15\"", ram: "16 GB", storage: "256 GB", condition: "preventa", price: 4750000, notes: "Preventa", inStock: true },
    ],
  },

  // ── MacBook Air M1 13" ───────────────────────────────────────────────────
  {
    id: "macbook-air-m1-13",
    slug: "macbook-air-m1-13",
    name: "MacBook Air 13\" M1",
    category: "macbook",
    family: "MacBook Air",
    description:
      "MacBook Air 13\" con chip M1 — open box, batería al 100% y 0 ciclos.",
    shortDescription: "M1 · 13\" · 8 GB RAM · 256 GB",
    image: PLACEHOLDER.macbook,
    images: [PLACEHOLDER.macbook],
    colors: [],
    features: ["Chip Apple M1", "Pantalla 13\"", "8 GB RAM unificada"],
    variants: [
      { sku: "mba-m1-13-8-256-ob", size: "13\"", ram: "8 GB", storage: "256 GB", condition: "open-box", price: 2700000, notes: "Open box, batería 100%, 0 ciclos", inStock: true },
    ],
  },

  // ── MacBook Neo ──────────────────────────────────────────────────────────
  {
    id: "macbook-neo",
    slug: "macbook-neo",
    name: "MacBook Neo",
    category: "macbook",
    family: "MacBook",
    description: "MacBook Neo 8 GB / 256 GB.",
    shortDescription: "8 GB RAM · 256 GB",
    image: PLACEHOLDER.macbook,
    images: [PLACEHOLDER.macbook],
    colors: [],
    features: [],
    variants: [
      { sku: "mb-neo-8-256", ram: "8 GB", storage: "256 GB", condition: "nuevo", price: 2850000, inStock: true },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Categorías y helpers
// ────────────────────────────────────────────────────────────────────────────

export const categories = [
  { id: "todos", label: "Todos" },
  { id: "iphone", label: "iPhone" },
  { id: "ipad", label: "iPad" },
  { id: "watch", label: "Apple Watch" },
  { id: "macbook", label: "MacBook" },
  { id: "accesorios", label: "Accesorios" },
] as const;

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "todos") return products;
  return products.filter((p) => p.category === category);
}

export function getMinPrice(product: Product): number {
  if (product.variants.length === 0) return 0;
  return Math.min(...product.variants.map((v) => v.price));
}

export function getMaxPrice(product: Product): number {
  if (product.variants.length === 0) return 0;
  return Math.max(...product.variants.map((v) => v.price));
}

export function getPriceRange(product: Product): { min: number; max: number } {
  return { min: getMinPrice(product), max: getMaxPrice(product) };
}

export function hasMultipleVariants(product: Product): boolean {
  return product.variants.length > 1;
}

export function getDefaultVariant(product: Product): Variant | undefined {
  if (product.variants.length === 0) return undefined;
  // Default: la variante de menor precio en stock; si ninguna tiene stock, la primera.
  const inStock = product.variants.filter((v) => v.inStock);
  const pool = inStock.length > 0 ? inStock : product.variants;
  return [...pool].sort((a, b) => a.price - b.price)[0];
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getAvailableConditions(product: Product): ProductCondition[] {
  const set = new Set<ProductCondition>();
  product.variants.forEach((v) => set.add(v.condition));
  return Array.from(set);
}
