export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "iphone" | "ipad" | "watch" | "macbook" | "accesorios";
  price: number;
  originalPrice?: number;
  badge?: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  colors: { name: string; hex: string }[];
  storage: string[];
  features: string[];
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
};

export const products: Product[] = [
  {
    id: "iphone-16-pro",
    slug: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "iphone",
    price: 5290000,
    badge: "Nuevo",
    description:
      "El iPhone más avanzado de Apple. Con chip A18 Pro, sistema de cámaras Pro de 48MP y pantalla Super Retina XDR de 6.3 pulgadas con ProMotion.",
    shortDescription: "Chip A18 Pro · Cámara 48MP · Titanio",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgc3-nl3Vn7l48ZC8Nms17dFZcVZFGDsqv1rt3Pa9KOvhOrvW88Vkakicz4VL7J4hs9f7kvhK-0xO34BwsW2oHiTOCya_vX4FRlYE6byFYALH422czxJOyPSOnNho72DmrUlichAOCrEAS-KGBlMWS0UClwjwvR_DAclyHF2nRLxUMeN8iiXTJcHb1nuHUJxs3PymxyhO8TzqZsd8X8ctCpLStuwUrZ7sk6c7N8nZ9nz5NWWlrSzj1rLkV8Eq0EXHVkRR17VJuoT4",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgc3-nl3Vn7l48ZC8Nms17dFZcVZFGDsqv1rt3Pa9KOvhOrvW88Vkakicz4VL7J4hs9f7kvhK-0xO34BwsW2oHiTOCya_vX4FRlYE6byFYALH422czxJOyPSOnNho72DmrUlichAOCrEAS-KGBlMWS0UClwjwvR_DAclyHF2nRLxUMeN8iiXTJcHb1nuHUJxs3PymxyhO8TzqZsd8X8ctCpLStuwUrZ7sk6c7N8nZ9nz5NWWlrSzj1rLkV8Eq0EXHVkRR17VJuoT4",
    ],
    colors: [
      { name: "Titanio Natural", hex: "#b5a898" },
      { name: "Titanio Negro", hex: "#3d3d3d" },
      { name: "Titanio Blanco", hex: "#f0ede8" },
      { name: "Titanio Desierto", hex: "#c5b59a" },
    ],
    storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
    features: [
      "Chip A18 Pro con Neural Engine de 16 núcleos",
      "Sistema de cámara Pro con sensor de 48MP",
      "Pantalla Super Retina XDR 6.3\" ProMotion 120Hz",
      "Dynamic Island",
      "Botón de Acción personalizable",
      "Diseño en titanio grado aeroespacial",
      "Batería de hasta 27 horas",
      "Resistencia al agua IP68",
    ],
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "iphone-16",
    slug: "iphone-16",
    name: "iPhone 16",
    category: "iphone",
    price: 4200000,
    badge: "Nuevo",
    description:
      "Diseñado para Apple Intelligence. Con chip A18, sistema de cámaras Fusion de 48MP y pantalla Super Retina XDR de 6.1 pulgadas.",
    shortDescription: "Chip A18 · Cámara 48MP · Dynamic Island",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9g9pZG9mhpEKLP5AZyOP9WlwKdQ2k-VVn1kN-sqAo1TsbnsGjV_Sby7pexA8SBrhl_CPz0aDbuPPSJYy3UUUoKf7AWiECBAet6C-CgJjso76WYXMCgldFx_4dwWJ_uycuJ_iUCw46_kwO34XUM-6tl39QUb94vderlZ-gKeY_u3ph67syax9sp_CBbW_S8J0koexKLIUQ4O5kZWtw5ENcqi_7X64wVr0-Y95zLEjNXVgXoNOkgUeGaCS3muXRnlwkEcei9uFRjn0",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9g9pZG9mhpEKLP5AZyOP9WlwKdQ2k-VVn1kN-sqAo1TsbnsGjV_Sby7pexA8SBrhl_CPz0aDbuPPSJYy3UUUoKf7AWiECBAet6C-CgJjso76WYXMCgldFx_4dwWJ_uycuJ_iUCw46_kwO34XUM-6tl39QUb94vderlZ-gKeY_u3ph67syax9sp_CBbW_S8J0koexKLIUQ4O5kZWtw5ENcqi_7X64wVr0-Y95zLEjNXVgXoNOkgUeGaCS3muXRnlwkEcei9uFRjn0",
    ],
    colors: [
      { name: "Negro Ultramarino", hex: "#1c1c1c" },
      { name: "Blanco", hex: "#f5f5f0" },
      { name: "Rosa", hex: "#f4c2c2" },
      { name: "Verde Azulado", hex: "#4a7c7e" },
      { name: "Ultramarino", hex: "#3f4e8c" },
    ],
    storage: ["128 GB", "256 GB", "512 GB"],
    features: [
      "Chip A18 con Neural Engine de 16 núcleos",
      "Cámara Fusion de 48MP con zoom óptico 2x",
      "Pantalla Super Retina XDR 6.1\" ProMotion",
      "Dynamic Island",
      "Botón de Acción y Botón de Cámara",
      "Batería de hasta 22 horas",
      "Resistencia al agua IP68",
    ],
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "iphone-15-pro",
    slug: "iphone-15-pro",
    name: "iPhone 15 Pro",
    category: "iphone",
    price: 4890000,
    description:
      "Chip A17 Pro de titanio. Con sistema de cámaras Pro de 48MP y acción personalizable.",
    shortDescription: "Chip A17 Pro · Titanio · USB-C",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9g9pZG9mhpEKLP5AZyOP9WlwKdQ2k-VVn1kN-sqAo1TsbnsGjV_Sby7pexA8SBrhl_CPz0aDbuPPSJYy3UUUoKf7AWiECBAet6C-CgJjso76WYXMCgldFx_4dwWJ_uycuJ_iUCw46_kwO34XUM-6tl39QUb94vderlZ-gKeY_u3ph67syax9sp_CBbW_S8J0koexKLIUQ4O5kZWtw5ENcqi_7X64wVr0-Y95zLEjNXVgXoNOkgUeGaCS3muXRnlwkEcei9uFRjn0",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9g9pZG9mhpEKLP5AZyOP9WlwKdQ2k-VVn1kN-sqAo1TsbnsGjV_Sby7pexA8SBrhl_CPz0aDbuPPSJYy3UUUoKf7AWiECBAet6C-CgJjso76WYXMCgldFx_4dwWJ_uycuJ_iUCw46_kwO34XUM-6tl39QUb94vderlZ-gKeY_u3ph67syax9sp_CBbW_S8J0koexKLIUQ4O5kZWtw5ENcqi_7X64wVr0-Y95zLEjNXVgXoNOkgUeGaCS3muXRnlwkEcei9uFRjn0",
    ],
    colors: [
      { name: "Titanio Natural", hex: "#b5a898" },
      { name: "Titanio Negro", hex: "#3d3d3d" },
      { name: "Titanio Azul", hex: "#4a6fa5" },
      { name: "Titanio Blanco", hex: "#f0ede8" },
    ],
    storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
    features: [
      "Chip A17 Pro con GPU de 6 núcleos",
      "Sistema de cámara Pro con teleobjetivo 5x",
      "Pantalla Super Retina XDR 6.1\" ProMotion",
      "Botón de Acción",
      "USB 3 con USB-C",
      "Diseño en titanio",
    ],
    inStock: true,
    isFeatured: true,
  },
  {
    id: "iphone-14",
    slug: "iphone-14",
    name: "iPhone 14",
    category: "iphone",
    price: 2200000,
    description:
      "El iPhone 14 con chip A15 Bionic, sistema de cámara dual de 12MP y pantalla Super Retina XDR de 6.1 pulgadas. La mejor relación precio-rendimiento.",
    shortDescription: "Chip A15 · Cámara 12MP · Super Retina XDR",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgc3-nl3Vn7l48ZC8Nms17dFZcVZFGDsqv1rt3Pa9KOvhOrvW88Vkakicz4VL7J4hs9f7kvhK-0xO34BwsW2oHiTOCya_vX4FRlYE6byFYALH422czxJOyPSOnNho72DmrUlichAOCrEAS-KGBlMWS0UClwjwvR_DAclyHF2nRLxUMeN8iiXTJcHb1nuHUJxs3PymxyhO8TzqZsd8X8ctCpLStuwUrZ7sk6c7N8nZ9nz5NWWlrSzj1rLkV8Eq0EXHVkRR17VJuoT4",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgc3-nl3Vn7l48ZC8Nms17dFZcVZFGDsqv1rt3Pa9KOvhOrvW88Vkakicz4VL7J4hs9f7kvhK-0xO34BwsW2oHiTOCya_vX4FRlYE6byFYALH422czxJOyPSOnNho72DmrUlichAOCrEAS-KGBlMWS0UClwjwvR_DAclyHF2nRLxUMeN8iiXTJcHb1nuHUJxs3PymxyhO8TzqZsd8X8ctCpLStuwUrZ7sk6c7N8nZ9nz5NWWlrSzj1rLkV8Eq0EXHVkRR17VJuoT4",
    ],
    colors: [
      { name: "Medianoche", hex: "#1c1c1e" },
      { name: "Blanco estrella", hex: "#f2f0eb" },
      { name: "Azul", hex: "#9fb8d8" },
      { name: "Morado", hex: "#a38cbf" },
      { name: "Rojo (PRODUCT)RED", hex: "#c0392b" },
    ],
    storage: ["128 GB", "256 GB", "512 GB"],
    features: [
      "Chip A15 Bionic con Neural Engine de 16 núcleos",
      "Cámara principal de 12MP con apertura ƒ/1.5",
      "Pantalla Super Retina XDR de 6.1\"",
      "Modo de acción de emergencia SOS vía satélite",
      "Detección de accidentes",
      "Resistencia al agua IP68",
      "Batería de hasta 20 horas",
    ],
    inStock: true,
    isFeatured: false,
  },
  {
    id: "iphone-15",
    slug: "iphone-15",
    name: "iPhone 15",
    category: "iphone",
    price: 3600000,
    description:
      "Dynamic Island. Chip A16 Bionic con cámara de 48MP y conector USB-C.",
    shortDescription: "Chip A16 · Dynamic Island · USB-C",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgc3-nl3Vn7l48ZC8Nms17dFZcVZFGDsqv1rt3Pa9KOvhOrvW88Vkakicz4VL7J4hs9f7kvhK-0xO34BwsW2oHiTOCya_vX4FRlYE6byFYALH422czxJOyPSOnNho72DmrUlichAOCrEAS-KGBlMWS0UClwjwvR_DAclyHF2nRLxUMeN8iiXTJcHb1nuHUJxs3PymxyhO8TzqZsd8X8ctCpLStuwUrZ7sk6c7N8nZ9nz5NWWlrSzj1rLkV8Eq0EXHVkRR17VJuoT4",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBgc3-nl3Vn7l48ZC8Nms17dFZcVZFGDsqv1rt3Pa9KOvhOrvW88Vkakicz4VL7J4hs9f7kvhK-0xO34BwsW2oHiTOCya_vX4FRlYE6byFYALH422czxJOyPSOnNho72DmrUlichAOCrEAS-KGBlMWS0UClwjwvR_DAclyHF2nRLxUMeN8iiXTJcHb1nuHUJxs3PymxyhO8TzqZsd8X8ctCpLStuwUrZ7sk6c7N8nZ9nz5NWWlrSzj1rLkV8Eq0EXHVkRR17VJuoT4",
    ],
    colors: [
      { name: "Negro", hex: "#1c1c1c" },
      { name: "Rosa", hex: "#f5c6c6" },
      { name: "Amarillo", hex: "#f9e17a" },
      { name: "Verde", hex: "#b0d4b0" },
      { name: "Azul", hex: "#9fb8d8" },
    ],
    storage: ["128 GB", "256 GB", "512 GB"],
    features: [
      "Chip A16 Bionic",
      "Cámara de 48MP con zoom óptico 2x",
      "Pantalla Super Retina XDR 6.1\"",
      "Dynamic Island",
      "USB-C",
    ],
    inStock: true,
  },
  {
    id: "ipad-pro-m4",
    slug: "ipad-pro-m4",
    name: "iPad Pro M4",
    category: "ipad",
    price: 4890000,
    badge: "Nuevo",
    description:
      "Ridículamente potente. Con chip M4, pantalla Ultra Retina XDR OLED tandem y diseño ultrafino de 5.1mm.",
    shortDescription: "Chip M4 · OLED Ultra Retina · 5.1mm",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChQmBTGDPK2majj1XYr2eQJDvtLS6WF7nrgUQhD1wjHRPKtjflzdoK24G2E7yd1PV9d0D2svmvM5g5p5pvmk844ICda2yB37-_d24y60yGht04BvOLHOm-cTppqmst7YqxY7jzqH1q5PgorbE6Xs3M9TgIqOqTfWUrMB-or6U3CDXxyrhdJujyJCa2PT8uVNfTyqchnvMOG74eGHRG0kQZodUXAzJZuMnt0oeqhYIcSu2InlLmPhVGZg3uPwFYTJIw4dWgQVtohLM",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChQmBTGDPK2majj1XYr2eQJDvtLS6WF7nrgUQhD1wjHRPKtjflzdoK24G2E7yd1PV9d0D2svmvM5g5p5pvmk844ICda2yB37-_d24y60yGht04BvOLHOm-cTppqmst7YqxY7jzqH1q5PgorbE6Xs3M9TgIqOqTfWUrMB-or6U3CDXxyrhdJujyJCa2PT8uVNfTyqchnvMOG74eGHRG0kQZodUXAzJZuMnt0oeqhYIcSu2InlLmPhVGZg3uPwFYTJIw4dWgQVtohLM",
    ],
    colors: [
      { name: "Plata", hex: "#e3e3e3" },
      { name: "Negro Espacial", hex: "#3d3d3d" },
    ],
    storage: ["256 GB", "512 GB", "1 TB", "2 TB"],
    features: [
      "Chip M4 con Neural Engine de 10 núcleos",
      "Pantalla Ultra Retina XDR OLED tandem",
      "Diseño ultrafino de 5.1mm",
      "Cámara frontal TrueDepth horizontal",
      "Compatible con Apple Pencil Pro",
      "Thunderbolt / USB 4",
    ],
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: "ipad-a16",
    slug: "ipad-a16",
    name: "iPad A16",
    category: "ipad",
    price: 1420000,
    badge: "El más barato",
    description:
      "El iPad más accesible con chip A16, pantalla Liquid Retina de 10.9\" y compatibilidad con Apple Pencil. Perfecto para empezar en el ecosistema Apple.",
    shortDescription: "Chip A16 · Liquid Retina 10.9\" · Desde $1.420.000",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7hcyOUaTXeSbVGw0BsOns7PXEa5In9n2uDeSg05GPvRDkqGl9dtwSE2uUqMQpPs5Ddglf619pcEanVs3Rn_U4Zz_4EmYgbE5JVtmnyyRl35qOHKO-3RLwD_NkDarrBNNZqSJOyAJK_OVGWyBmKeCovjSPNzx5wFWG_ZVf7HExGOMXSYcrZk0k1imHB9WOVVUz_9FlnzyfbA0jQ19vGeWBUlhlP-hyM9tnUw9jRyFww9ado_RRNPyywTns66pkOjKB_9O4hMnIG0U",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7hcyOUaTXeSbVGw0BsOns7PXEa5In9n2uDeSg05GPvRDkqGl9dtwSE2uUqMQpPs5Ddglf619pcEanVs3Rn_U4Zz_4EmYgbE5JVtmnyyRl35qOHKO-3RLwD_NkDarrBNNZqSJOyAJK_OVGWyBmKeCovjSPNzx5wFWG_ZVf7HExGOMXSYcrZk0k1imHB9WOVVUz_9FlnzyfbA0jQ19vGeWBUlhlP-hyM9tnUw9jRyFww9ado_RRNPyywTns66pkOjKB_9O4hMnIG0U",
    ],
    colors: [
      { name: "Azul", hex: "#a8c5da" },
      { name: "Rosa", hex: "#f2c4ce" },
      { name: "Amarillo", hex: "#f9e17a" },
      { name: "Plata", hex: "#e3e3e3" },
    ],
    storage: ["128 GB", "256 GB"],
    features: [
      "Chip A16 de última generación",
      "Pantalla Liquid Retina de 10.9\"",
      "Compatible con Apple Pencil (1.ª generación)",
      "Touch ID integrado",
      "Cámara frontal de 12MP ultra gran angular",
      "Batería de hasta 10 horas",
    ],
    inStock: true,
    isFeatured: true,
  },
  {
    id: "ipad-air",
    slug: "ipad-air",
    name: "iPad Air",
    category: "ipad",
    price: 2850000,
    description:
      "Potencia M2 en un diseño ligero. Con pantalla Liquid Retina de 10.9\" y compatibilidad con Apple Pencil.",
    shortDescription: "Chip M2 · Liquid Retina · Ligero",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7hcyOUaTXeSbVGw0BsOns7PXEa5In9n2uDeSg05GPvRDkqGl9dtwSE2uUqMQpPs5Ddglf619pcEanVs3Rn_U4Zz_4EmYgbE5JVtmnyyRl35qOHKO-3RLwD_NkDarrBNNZqSJOyAJK_OVGWyBmKeCovjSPNzx5wFWG_ZVf7HExGOMXSYcrZk0k1imHB9WOVVUz_9FlnzyfbA0jQ19vGeWBUlhlP-hyM9tnUw9jRyFww9ado_RRNPyywTns66pkOjKB_9O4hMnIG0U",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC7hcyOUaTXeSbVGw0BsOns7PXEa5In9n2uDeSg05GPvRDkqGl9dtwSE2uUqMQpPs5Ddglf619pcEanVs3Rn_U4Zz_4EmYgbE5JVtmnyyRl35qOHKO-3RLwD_NkDarrBNNZqSJOyAJK_OVGWyBmKeCovjSPNzx5wFWG_ZVf7HExGOMXSYcrZk0k1imHB9WOVVUz_9FlnzyfbA0jQ19vGeWBUlhlP-hyM9tnUw9jRyFww9ado_RRNPyywTns66pkOjKB_9O4hMnIG0U",
    ],
    colors: [
      { name: "Azul", hex: "#a8c5da" },
      { name: "Rosa", hex: "#f2c4ce" },
      { name: "Amarillo", hex: "#f9e17a" },
      { name: "Gris espacial", hex: "#8e8e93" },
    ],
    storage: ["64 GB", "256 GB"],
    features: [
      "Chip M2",
      "Pantalla Liquid Retina de 10.9\"",
      "Compatible con Apple Pencil de 2.ª generación",
      "Compatible con Magic Keyboard",
      "Centro de escáner inteligente",
    ],
    inStock: true,
    isFeatured: false,
  },
  {
    id: "apple-watch-ultra-2",
    slug: "apple-watch-ultra-2",
    name: "Apple Watch Ultra 2",
    category: "watch",
    price: 3450000,
    description:
      "El Apple Watch más avanzado. Diseñado para los aventureros más exigentes con carcasa de titanio y pantalla LTPO de 49mm.",
    shortDescription: "Titanio · 49mm · GPS doble frecuencia",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCF3Zwi1jHIr2w31iOmURSErcQ8T-BaEGdy-UsV_0eDo3YzYcpU_sn5JbAe1n29P-bjb8YldJdF1APEJOlsNrKlrBAn4Bef6gLu70plqvEcN8YBH4R6UXiVAbxp8uI-S-IlKtLK89h64zzVS2V7lqe06WjDJz-p-7xQ1Lyvdw_m8tUs7cl5YVBQVbMted1NddHOFeHOU5rgpAwMPXvejVfkHFqmySRJ_gZo267UwmaUYRt_a-DXo_uQ29VWTQe1V6DYK1yLNBbYAyk",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCF3Zwi1jHIr2w31iOmURSErcQ8T-BaEGdy-UsV_0eDo3YzYcpU_sn5JbAe1n29P-bjb8YldJdF1APEJOlsNrKlrBAn4Bef6gLu70plqvEcN8YBH4R6UXiVAbxp8uI-S-IlKtLK89h64zzVS2V7lqe06WjDJz-p-7xQ1Lyvdw_m8tUs7cl5YVBQVbMted1NddNdOFeHOU5rgpAwMPXvejVfkHFqmySRJ_gZo267UwmaUYRt_a-DXo_uQ29VWTQe1V6DYK1yLNBbYAyk",
    ],
    colors: [
      { name: "Titanio Natural", hex: "#b5a898" },
      { name: "Titanio Negro", hex: "#3d3d3d" },
    ],
    storage: [],
    features: [
      "Carcasa de titanio de 49mm",
      "GPS de doble frecuencia L1 y L5",
      "Profundidad hasta 100m (EN 13319)",
      "Hasta 60 horas de batería",
      "Pantalla más brillante del mundo (3000 nits)",
      "Botón de Acción naranja",
    ],
    inStock: true,
    isFeatured: true,
  },
  {
    id: "apple-watch-series-9",
    slug: "apple-watch-series-9",
    name: "Apple Watch Series 9",
    category: "watch",
    price: 1890000,
    description:
      "El Apple Watch más avanzado para el día a día. Con chip S9, nueva función de doble toque y Always-On Display.",
    shortDescription: "Chip S9 · Doble toque · 45mm",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw3zo8Jla8vhu74BR0HBBXexXP4UTWfM_m25P6WvJZmIxfQnIffyVwdg7s5VsKq4Se7NHC3O_gY9Eh4M4APmJGBCRC9yE3bcUUHqIsstdj6ooUxLwbaRCiwcR73-aG7LS5w8auQ_wXhmLUbLaZItEBMFbLP1g-DI_Um0b_6kPZmtkQFscDUev9wFWCvygT_34rKOMsCZW51J3OOf6VELi3xAeJq4RwUaCxMfGATcIq-g0IqNAqeiC_6ZRPJCpGzz5bQYjJ2URYEZw",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw3zo8Jla8vhu74BR0HBBXexXP4UTWfM_m25P6WvJZmIxfQnIffyVwdg7s5VsKq4Se7NHC3O_gY9Eh4M4APmJGBCRC9yE3bcUUHqIsstdj6ooUxLwbaRCiwcR73-aG7LS5w8auQ_wXhmLUbLaZItEBMFbLP1g-DI_Um0b_6kPZmtkQFscDUev9wFWCvygT_34rKOMsCZW51J3OOf6VELi3xAeJq4RwUaCxMfGATcIq-g0IqNAqeiC_6ZRPJCpGzz5bQYjJ2URYEZw",
    ],
    colors: [
      { name: "Medianoche", hex: "#1c1c1e" },
      { name: "Blanco estrella", hex: "#f2f0eb" },
      { name: "Rosa", hex: "#f2c4ce" },
      { name: "Rojo (PRODUCT)RED", hex: "#c0392b" },
    ],
    storage: [],
    features: [
      "Chip S9 SiP",
      "Función de doble toque",
      "Always-On Retina Display",
      "Resistencia al agua 50m",
      "Temperatura corporal",
      "ECG y detección de caídas",
    ],
    inStock: true,
  },
  {
    id: "airpods-4",
    slug: "airpods-4",
    name: "AirPods 4",
    category: "accesorios",
    price: 590000,
    badge: "Nuevo",
    description:
      "Los AirPods más avanzados. Sonido de alta fidelidad, cancelación de ruido activa y chip H2 para una experiencia sin igual.",
    shortDescription: "Chip H2 · Cancelación de ruido · USB-C",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdBBl3KFwzPGhRlxcOiyRaGcIXs2aBdKK1UfSJJzXqKklpXFuSakGp8D1GD5tNYCn3xSdmkf93nPMhEVAXLBXi6DAlAXCCzlQxPtD7l6RU-vj1kXEQTlJb97uagRBFlf8jJL6rG_mT5m3-8LVxhQMnbHJlBl_cDqiDjEqBYz-H3LGflU5FQE9P1RUv7TfcEH9OFp-9BF2Uh5Phu3VbmMlqxJnBHUCvlS2n7FBp3HIMmGJhzFZBOzSc0CdBT5FXpFf2xmJVfSug",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdBBl3KFwzPGhRlxcOiyRaGcIXs2aBdKK1UfSJJzXqKklpXFuSakGp8D1GD5tNYCn3xSdmkf93nPMhEVAXLBXi6DAlAXCCzlQxPtD7l6RU-vj1kXEQTlJb97uagRBFlf8jJL6rG_mT5m3-8LVxhQMnbHJlBl_cDqiDjEqBYz-H3LGflU5FQE9P1RUv7TfcEH9OFp-9BF2Uh5Phu3VbmMlqxJnBHUCvlS2n7FBp3HIMmGJhzFZBOzSc0CdBT5FXpFf2xmJVfSug",
    ],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    storage: [],
    features: [
      "Chip H2 de Apple",
      "Cancelación activa de ruido",
      "Audio espacial personalizado",
      "Estuche de carga USB-C",
      "Hasta 30 horas de batería total",
      "Resistencia al agua IPX4",
    ],
    inStock: true,
    isNew: true,
    isFeatured: false,
  },
  {
    id: "cargador-usbc-20w",
    slug: "cargador-usbc-20w",
    name: "Cargador USB-C 20W Apple",
    category: "accesorios",
    price: 89000,
    description:
      "Cargador compacto USB-C de 20W de Apple. Compatible con iPhone 8 o superior y todos los iPad con USB-C. Carga rápida incluida.",
    shortDescription: "20W · USB-C · Carga rápida",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvuS5CqHhkf8Dh3_Oc-vBjMV43XKE3mHqNrVeVs_56EwUTVt1pjFH4xvJSzU-kizEKIzD06pEi0v0Cj2W_GW2m6I2oQcR3sczp0cxTOt7kHBhsS5R0Zxii3bsumSqhbQHMOT_8AEPzGODSfmpMMDL3KLB0oNZlOE7B-EAJmMXAQbpFZ2Nt1a63bTwRy9NBZJW8DFB9WlGwkwqsVKSG7m0XKXSoiEkD0vVkCiqDfVEJeIJ2YgBXAkN0EAKGG9KT-EXWQHKbTbQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvuS5CqHhkf8Dh3_Oc-vBjMV43XKE3mHqNrVeVs_56EwUTVt1pjFH4xvJSzU-kizEKIzD06pEi0v0Cj2W_GW2m6I2oQcR3sczp0cxTOt7kHBhsS5R0Zxii3bsumSqhbQHMOT_8AEPzGODSfmpMMDL3KLB0oNZlOE7B-EAJmMXAQbpFZ2Nt1a63bTwRy9NBZJW8DFB9WlGwkwqsVKSG7m0XKXSoiEkD0vVkCiqDfVEJeIJ2YgBXAkN0EAKGG9KT-EXWQHKbTbQ",
    ],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    storage: [],
    features: [
      "Potencia de 20W",
      "Conector USB-C",
      "Carga rápida para iPhone 8 o superior",
      "Compatible con iPad y AirPods",
      "Diseño compacto",
    ],
    inStock: true,
    isFeatured: false,
  },
  {
    id: "cable-usbc-lightning",
    slug: "cable-usbc-lightning",
    name: "Cable USB-C a Lightning 1m",
    category: "accesorios",
    price: 59000,
    description:
      "Cable USB-C a Lightning de Apple certificado MFi. Carga rápida para iPhone y transferencia de datos. Longitud de 1 metro.",
    shortDescription: "1m · MFi · Carga rápida",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvuS5CqHhkf8Dh3_Oc-vBjMV43XKE3mHqNrVeVs_56EwUTVt1pjFH4xvJSzU-kizEKIzD06pEi0v0Cj2W_GW2m6I2oQcR3sczp0cxTOt7kHBhsS5R0Zxii3bsumSqhbQHMOT_8AEPzGODSfmpMMDL3KLB0oNZlOE7B-EAJmMXAQbpFZ2Nt1a63bTwRy9NBZJW8DFB9WlGwkwqsVKSG7m0XKXSoiEkD0vVkCiqDfVEJeIJ2YgBXAkN0EAKGG9KT-EXWQHKbTbQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvuS5CqHhkf8Dh3_Oc-vBjMV43XKE3mHqNrVeVs_56EwUTVt1pjFH4xvJSzU-kizEKIzD06pEi0v0Cj2W_GW2m6I2oQcR3sczp0cxTOt7kHBhsS5R0Zxii3bsumSqhbQHMOT_8AEPzGODSfmpMMDL3KLB0oNZlOE7B-EAJmMXAQbpFZ2Nt1a63bTwRy9NBZJW8DFB9WlGwkwqsVKSG7m0XKXSoiEkD0vVkCiqDfVEJeIJ2YgBXAkN0EAKGG9KT-EXWQHKbTbQ",
    ],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    storage: [],
    features: [
      "Certificado MFi (Made for iPhone)",
      "Carga rápida compatible",
      "Longitud de 1 metro",
      "Transferencia de datos USB 2.0",
      "Compatible con iPhone 5 o superior",
    ],
    inStock: true,
    isFeatured: false,
  },
  {
    id: "apple-pencil-usbc",
    slug: "apple-pencil-usbc",
    name: "Apple Pencil USB-C",
    category: "accesorios",
    price: 350000,
    description:
      "Apple Pencil con conector USB-C. Escritura fluida y precisa para iPad. Compatible con todos los iPad con conector USB-C.",
    shortDescription: "USB-C · Escritura precisa · Compatible con iPad",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChQmBTGDPK2majj1XYr2eQJDvtLS6WF7nrgUQhD1wjHRPKtjflzdoK24G2E7yd1PV9d0D2svmvM5g5p5pvmk844ICda2yB37-_d24y60yGht04BvOLHOm-cTppqmst7YqxY7jzqH1q5PgorbE6Xs3M9TgIqOqTfWUrMB-or6U3CDXxyrhdJujyJCa2PT8uVNfTyqchnvMOG74eGHRG0kQZodUXAzJZuMnt0oeqhYIcSu2InlLmPhVGZg3uPwFYTJIw4dWgQVtohLM",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChQmBTGDPK2majj1XYr2eQJDvtLS6WF7nrgUQhD1wjHRPKtjflzdoK24G2E7yd1PV9d0D2svmvM5g5p5pvmk844ICda2yB37-_d24y60yGht04BvOLHOm-cTppqmst7YqxY7jzqH1q5PgorbE6Xs3M9TgIqOqTfWUrMB-or6U3CDXxyrhdJujyJCa2PT8uVNfTyqchnvMOG74eGHRG0kQZodUXAzJZuMnt0oeqhYIcSu2InlLmPhVGZg3uPwFYTJIw4dWgQVtohLM",
    ],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    storage: [],
    features: [
      "Conector USB-C integrado",
      "Escritura y dibujo con baja latencia",
      "Rechazo de palma",
      "Compatible con iPad (10.ª gen o posterior)",
      "Compatible con iPad mini (6.ª gen o posterior)",
    ],
    inStock: true,
    isFeatured: false,
  },
  {
    id: "magsafe-charger",
    slug: "magsafe-charger",
    name: "Cargador MagSafe",
    category: "accesorios",
    price: 139000,
    badge: "Popular",
    description:
      "Cargador MagSafe de Apple con hasta 15W de carga inalámbrica para iPhone 12 o superior. Conexión magnética perfecta.",
    shortDescription: "15W · Magnético · iPhone 12+",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvuS5CqHhkf8Dh3_Oc-vBjMV43XKE3mHqNrVeVs_56EwUTVt1pjFH4xvJSzU-kizEKIzD06pEi0v0Cj2W_GW2m6I2oQcR3sczp0cxTOt7kHBhsS5R0Zxii3bsumSqhbQHMOT_8AEPzGODSfmpMMDL3KLB0oNZlOE7B-EAJmMXAQbpFZ2Nt1a63bTwRy9NBZJW8DFB9WlGwkwqsVKSG7m0XKXSoiEkD0vVkCiqDfVEJeIJ2YgBXAkN0EAKGG9KT-EXWQHKbTbQ",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvuS5CqHhkf8Dh3_Oc-vBjMV43XKE3mHqNrVeVs_56EwUTVt1pjFH4xvJSzU-kizEKIzD06pEi0v0Cj2W_GW2m6I2oQcR3sczp0cxTOt7kHBhsS5R0Zxii3bsumSqhbQHMOT_8AEPzGODSfmpMMDL3KLB0oNZlOE7B-EAJmMXAQbpFZ2Nt1a63bTwRy9NBZJW8DFB9WlGwkwqsVKSG7m0XKXSoiEkD0vVkCiqDfVEJeIJ2YgBXAkN0EAKGG9KT-EXWQHKbTbQ",
    ],
    colors: [{ name: "Blanco", hex: "#f5f5f0" }],
    storage: [],
    features: [
      "Hasta 15W de carga inalámbrica",
      "Alineación magnética perfecta",
      "Compatible con iPhone 12 o posterior",
      "Cable USB-C de 1 metro incluido",
      "Compatible con Qi",
    ],
    inStock: true,
    isFeatured: false,
  },
];

export const categories = [
  { id: "todos", label: "Todos" },
  { id: "iphone", label: "iPhone" },
  { id: "ipad", label: "iPad" },
  { id: "watch", label: "Apple Watch" },
  { id: "macbook", label: "MacBook" },
  { id: "accesorios", label: "Accesorios" },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(
  category: string
): Product[] {
  if (category === "todos") return products;
  return products.filter((p) => p.category === category);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
