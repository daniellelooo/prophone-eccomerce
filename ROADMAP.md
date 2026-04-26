# Prophone Medellín — Roadmap del prototipo

> Documento vivo. Marca con `[x]` lo que se vaya completando.
> Objetivo: llegar a un prototipo lo bastante sólido como para convencer a los dueños de Prophone de adquirirlo.
> Fecha de creación: 2026-04-26.

---

## Decisiones tomadas con el cliente (2026-04-26)

- **Frontend primero**, backend y BD después.
- **Imágenes reales** desde apple.com/co e iphone-related en mac-center.com. **No inventar** información que no se encuentre.
- **No incluir**: plan canje (trade-in), reseñas con sistema, pasarela de pagos real, integración real con Banco de Bogotá, cálculo de envíos, página de cuenta de usuario, marketing/SEO técnico, operación/backoffice contable, confianza específica de reseller (origen, distribuidor autorizado), performance avanzado.
- **Sí incluir ahora**:
  - Variantes con precios diferentes (basado en lista de precios del cliente).
  - MacBooks como categoría real.
  - Galería de producto con zoom.
  - Panel admin (frontend, sin backend).
  - Estados de carga / skeletons.
  - Página 404 tematizada.
  - Búsqueda con autocompletado.
  - Minibuscador en navbar móvil.
  - UX móvil completa (bottom nav, sticky CTA, etc.).
- **MCP**: usar Playwright en lugar de Puppeteer.

---

## Lista de precios de referencia del cliente

### iPhone NUEVO (1 año garantía Apple)

| Modelo | Almacenamiento | Precio | Notas |
|---|---|---|---|
| iPhone 17 Pro Max | 256 GB | 5.100.000 | AS-IS sim física |
| iPhone 17 Pro Max | 1 TB | 6.800.000 | Naranja |
| iPhone 17 Pro Max | 512 GB | 6.200.000 | Naranja |
| iPhone 17 Pro Max | 256 GB | 5.400.000 | Todos los colores + parlante Anker |
| iPhone 16 | 128 GB | 2.950.000 | |
| iPhone 15 | 512 GB | 2.920.000 | sim física |
| iPhone 14 | 128 GB | 2.250.000 | Mega descuentos |

### iPhone EXHIBICIÓN (3.5 meses garantía)

| Modelo | Almacenamiento | Precio | Notas |
|---|---|---|---|
| iPhone 17 Pro Max | 256 GB | 4.750.000 | |
| iPhone 17 Pro | 512 GB | 4.600.000 | |
| iPhone 17 Pro | 256 GB | 4.400.000 | |
| iPhone 17 | 256 GB | 3.050.000 | |
| iPhone Air | 512 GB | 3.760.000 | |
| iPhone Air | 256 GB | 3.280.000 | |
| iPhone 16 Pro Max | 512 GB | 3.500.000 | |
| iPhone 16 Pro Max | 256 GB | 3.350.000 | |
| iPhone 16 Pro | 256 GB | 2.950.000 | |
| iPhone 16 Pro | 128 GB | 2.850.000 | |
| iPhone 16 Plus | 128 GB | 2.450.000 | Precios bomba |
| iPhone 16 | 128 GB | 2.200.000 | |
| iPhone 15 Pro Max | 1 TB | 3.050.000 | |
| iPhone 15 Pro Max | 256 GB | 2.700.000 | |
| iPhone 15 Pro | 512 GB | 2.400.000 | |
| iPhone 15 Pro | 256 GB | 2.250.000 | |
| iPhone 15 Pro | 128 GB | 2.150.000 | Batería 100% |
| iPhone 15 | 256 GB | 2.050.000 | |
| iPhone 15 | 128 GB | 1.750.000 | |
| iPhone 15 Plus | 128 GB | 1.800.000 | |
| iPhone 14 Pro Max | 512 GB | 2.450.000 | |
| iPhone 14 Pro Max | 256 GB | 2.350.000 | |
| iPhone 14 Pro Max | 128 GB | 2.100.000 | |
| iPhone 14 Pro | 256 GB | 2.050.000 | |
| iPhone 14 | 256 GB | 1.500.000 | |
| iPhone 14 | 128 GB | 1.400.000 | |
| iPhone 13 Pro Max | 256 GB | 2.280.000 | Batería 100% |
| iPhone 13 Pro Max | 128 GB | 1.850.000 | Batería 100% |
| iPhone 13 Pro | 256 GB | 1.750.000 | |
| iPhone 13 Pro | 128 GB | 1.600.000 | |
| iPhone 13 | 256 GB | 1.350.000 | Batería 100% |
| iPhone 13 | 128 GB | 1.250.000 | Batería 100% |

### MacBook NUEVA (1 año garantía Apple)

| Modelo | Configuración | Precio | Notas |
|---|---|---|---|
| MacBook Pro M5 14" | 16 / 1TB | 8.600.000 | |
| MacBook Pro M5 14" | 16 / 512GB | 7.700.000 | |
| MacBook Pro M4 14" | 24 / 512GB | 8.400.000 | |
| MacBook Pro M3 14" | 8 / 1TB | 4.300.000 | AS IS |
| MacBook Air M5 13" | 16 / 1TB | 5.700.000 | |
| MacBook Air M5 13" | 16 / 512GB | 4.900.000 | |
| MacBook Air M4 15" | 16 / 256GB | 4.750.000 | Preventa |
| MacBook Air M1 13" | 8 / 256GB | 2.700.000 | Open box, batería 100%, 0 ciclos |
| MacBook Neo | 8 / 256GB | 2.850.000 | |

---

## Fase 0 — Plan y herramientas

- [x] Roadmap.md creado
- [ ] MCP Playwright instalado y funcionando
- [ ] Tipos extendidos: variantes con precio, condición (`nuevo` | `exhibicion` | `as-is` | `open-box`), batería, sim, color, sede.

---

## Fase 1 — Datos y catálogo (PRIORIDAD ALTA)

### 1.1 Modelo de datos (`src/lib/products.ts`)

- [ ] Reescribir `Product.type` para soportar variantes:
  - [ ] `condition: "nuevo" | "exhibicion" | "as-is" | "open-box" | "preventa"`
  - [ ] `variants: { storage?, ram?, color?, simType?, batteryHealth?, price, sku, inStock, notes? }[]`
  - [ ] `warranty: "1-año-apple" | "3.5-meses-prophone" | "sin-garantia"` derivada de la condición
  - [ ] `category` ampliada con `"macbook"` real
- [ ] `formatPrice` ya existe — bien.
- [ ] Helper `getMinPrice(product)` y `getPriceRange(product)`.

### 1.2 Datos reales

- [x] Cargar todo el iPhone NUEVO y EXHIBICIÓN de la lista de precios.
- [x] Cargar todos los MacBook de la lista de precios.
- [x] `next.config.ts` con `images.remotePatterns` para `mac-center.com`, `cdn.shopify.com`, `www.apple.com`.
- [x] Imágenes oficiales linkadas desde Mac Center y apple.com/co cuando estaban disponibles:
  - [x] iPhone 17 / 17 Pro / 17 Pro Max / Air (Mac Center, varias colores)
  - [x] iPhone 16 / 16 Pro / 16 Pro Max (Mac Center)
  - [x] iPhone 15 / 15 Plus (Mac Center, varios colores)
  - [x] iPhone 14 / 14 Pro (Mac Center)
  - [x] iPad A16 (Mac Center, 4 colores)
  - [x] Apple Watch Ultra 2 (Mac Center)
  - [x] AirPods 4 (Mac Center)
  - [x] MacBook Pro M4 14" (Mac Center, Silver + Black)
  - [x] MacBook Air M5 13" / M4 15" (Mac Center)
- [ ] Imágenes pendientes (productos con placeholder genérico — anotados con comentario `// imagen pendiente — ver ROADMAP A2`):
  - [ ] iPhone 16 Plus
  - [ ] iPhone 15 Pro / 15 Pro Max
  - [ ] iPhone 14 Pro Max
  - [ ] iPhone 13 / 13 Pro / 13 Pro Max
  - [ ] iPad Pro M4
  - [ ] iPad Air M2
  - [ ] Apple Watch Series 9
  - [ ] Cargador USB-C 20W
  - [ ] Cable USB-C a Lightning
  - [ ] Apple Pencil USB-C
  - [ ] Cargador MagSafe
  - [ ] MacBook Pro M5 14"
  - [ ] MacBook Pro M3 14"
  - [ ] MacBook Air M1 13"
  - [ ] MacBook Neo
- [ ] Mover imágenes a `public/products/` y servirlas locales (mejor robustez y performance) — opcional, próxima iteración.
- [ ] Quitar `unoptimized` de los `<Image>` ahora que hay remotePatterns — opcional, próxima iteración (requiere validar que los CDN de Mac Center y Apple respondan correctamente al optimizador de Next).

### 1.3 Catálogo

- [ ] Página `/catalogo`: filtros adicionales — condición (Nuevo / Exhibición / Open Box), almacenamiento, rango de precio, color.
- [ ] Mostrar precio "desde" cuando hay varias variantes.
- [ ] Badge según condición ("Exhibición", "AS IS", "Batería 100%", etc.).

---

## Fase 2 — Ficha de producto + galería con zoom

- [x] Galería con miniaturas (`ProductGallery.tsx`).
- [x] **Zoom** al hover (desktop) — escala 1.8x con origen siguiendo el cursor.
- [x] Carrusel con swipe horizontal y dots en móvil.
- [x] Lightbox a pantalla completa (Esc cierra, flechas navegan, contador, AnimatePresence).
- [x] Selector de Condición (Nuevo / Exhibición / Open box / AS-IS / Preventa) que cambia variantes disponibles.
- [x] Selector de Configuración (almacenamiento / RAM / tamaño) que actualiza precio en tiempo real.
- [x] Botón "Agregar al carrito" deshabilitado si la variante no tiene stock.
- [x] Breadcrumbs (ya existían — verificados).
- [ ] Sticky add-to-cart en móvil (parte de Fase 4 — UX móvil).
- [ ] Sección "También te puede interesar" (productos relacionados por categoría).

---

## Fase 3 — Panel admin (frontend, sin backend)

> Persistencia: catálogo y configuración en `localStorage` vía Zustand persist.
> Cuando exista backend, los stores se reemplazan por fetch / server actions sin tocar UI.

- [x] Ruta `/admin` con login simulado (`admin` / `prophone2026` hardcoded en `src/lib/admin-auth.ts`).
- [x] Layout admin con sidebar (Productos, Promociones, Sedes, Configuración, Datos JSON) en route group `(panel)` y guard de auth.
- [x] **Productos**:
  - [x] Tabla con búsqueda, filtros por categoría, KPIs.
  - [x] Crear / editar / eliminar producto (modal de confirmación al eliminar).
  - [x] Editor de variantes (storage / RAM / size / condición / precio / notas / stock).
  - [x] Subida de imágenes (input file multi-select → base64 en localStorage), badge "Portada", reorganizar primaria, eliminar.
  - [x] Toggle `isFeatured`, `isNew`, badge custom (en editor + en tabla de promociones).
  - [x] Botón "Restaurar defaults" en la tabla.
- [x] **Promociones**: editor del banner ticker (toggle visible, ítems editables con preview), tabla masiva de flags isFeatured/isNew/badge por producto.
- [x] **Sedes**: editar lista de sedes (nombre, área, detalle), agregar/eliminar, horarios separados (semana / fin de semana).
- [x] **Configuración**: número de WhatsApp (validado, formato wa.me), mensaje por defecto, URL Instagram, link de prueba al WA.
- [x] **Datos**: exportar/importar JSON con `{ products, siteConfig }`, validación al importar, KPIs de tamaño localStorage, restaurar defaults total.
- [ ] Pedidos (mock) — fuera de alcance. Los pedidos siguen yendo por WhatsApp.

### Public sync con stores
- [x] `src/lib/catalog-store.ts` con persist + skipHydration.
- [x] `src/lib/site-config-store.ts` con persist + skipHydration.
- [x] `CatalogHydrator` rehidrata ambos en mount (root layout).
- [x] Public consumers migrados: home featured + sedes + ticker, catálogo, búsqueda, ficha de producto, SearchModal, Footer (sedes + horarios + WA + IG), Navbar (WA), BottomNav (WA), PriceTicker (banner items + visibilidad).
- [x] Chrome público (Navbar, Footer, PriceTicker, BottomNav) oculto en `/admin`.

---

## Fase 4 — UX móvil

- [x] **Bottom nav fija** en móvil: Inicio · Catálogo · Buscar · Carrito (con badge) · WhatsApp. Oculta en `/checkout`. Respeta `safe-area-inset-bottom` (iPhone notch).
- [x] Sticky CTA en ficha de producto móvil: precio + condición + "Agregar al carrito" + WhatsApp icon, flotando sobre el BottomNav.
- [ ] Carrito drawer revisado: muestre subtotal, envío estimado, CTA grande.
- [ ] Pull-to-refresh visual donde aplique.
- [x] Sheets/modales animados con Framer Motion (search modal, lightbox de galería, drawer de carrito).

---

## Fase 5 — Búsqueda

- [x] Página `/buscar` con resultados live (filtros por categoría + sort por relevancia/precio).
- [x] **Minibuscador en navbar** (desktop y móvil):
  - [x] Modal/dropdown que se abre con `Cmd/Ctrl+K` y con tap del icono.
  - [x] Autocompletado por nombre, descripción corta, familia y categoría.
  - [x] Resaltado de coincidencias (mark amarillo).
  - [x] Búsquedas recientes (localStorage, máx 5).
  - [x] Sugerencias populares (5 chips fijos).
- [x] Estado vacío con sugerencias y CTA a WhatsApp con la búsqueda fallida pre-rellenada.

---

## Fase 6 — Estados de carga + 404

- [x] `loading.tsx` por ruta (catálogo, ficha, búsqueda).
- [x] Skeletons consistentes (`ProductCardSkeleton` + `ProductGridSkeleton`).
- [x] **Página 404 tematizada**: ilustración 404 con etiqueta "Página agotada" rojo Prophone, CTAs Inicio/Catálogo/Buscar y enlace a WhatsApp.
- [x] `error.tsx` global con icono de alerta, ref `error.digest` y botón Reintentar (`reset()`).
- [ ] Spinners suaves donde haya transición (parcial — se delega al sistema de loading.tsx).
- [ ] `loading.tsx` para `/carrito` y `/checkout` (no es crítico — son páginas client-side rápidas).

---

## Fase 7 — Pulido y polish

- [ ] Estados vacíos del catálogo cuando no hay resultados.
- [ ] Animaciones de entrada/salida en filtros.
- [ ] Transiciones de página (View Transitions API o motion).
- [ ] Dark mode (opcional, se evalúa).
- [ ] Revisión de accesibilidad básica (alt, focus, aria-label, contraste).

---

## Fuera de alcance por ahora (cliente lo aplazó)

> Cuando llegue el momento, retomar de aquí.

### Pagos y operación legal
- Pasarela real (Wompi / Mercado Pago / ePayco / PayU): PSE, Nequi, Daviplata, Bancolombia QR.
- Cuotas con tarjeta + simulador.
- Integración real con Banco de Bogotá, Addi, Sistecrédito, Mercado Crédito.
- Envíos reales (Servientrega, Coordinadora, Interrapidísimo) con tracking.
- Pickup en sede como opción de envío.
- Cupones / códigos de descuento.
- IVA discriminado.
- Facturación electrónica DIAN.
- Política de retracto 5 días hábiles visible.
- Confirmación por email + factura PDF.

### Cuenta de usuario
- Registro / login (email, Google, Apple Sign-In).
- Mis pedidos, tracking, factura.
- Direcciones y métodos de pago guardados.
- Lista de deseos.
- Programa de puntos / referidos.

### Confianza y conversión avanzada
- Página "Sobre nosotros" con NIT, fotos del equipo y de las 4 sedes.
- Verificador de IMEI público.
- Sello de garantía Apple / autorización oficial.
- Reseñas Google embebidas (aclarado: no se construye sistema de reseñas propio).
- Política de devoluciones, garantía y privacidad (páginas legales — Habeas Data Ley 1581).
- T&C, tratamiento de datos, banner de cookies.
- FAQ extenso.
- Página de Garantía con proceso paso a paso.
- Trust bar fijo.

### SEO y marketing
- `metadata` por página (title, description, OG, Twitter card).
- Schema.org `Product`, `Offer`, `BreadcrumbList`, `Organization`, `LocalBusiness`, `Review`, `AggregateRating`.
- Sitemap.xml y robots.txt dinámicos.
- Open Graph images por producto.
- Blog / artículos.
- Píxel Meta, GA4, GTM, TikTok Pixel, Hotjar/Clarity.
- Google Merchant Center feed.
- Catálogo de Meta sincronizado para Instagram Shopping.
- WhatsApp Business API con catálogo.
- Email marketing (Mailchimp / Klaviyo) con popup y abandono de carrito.
- Notificaciones push y "avísame cuando vuelva a stock".

### Backoffice contable
- Roles: admin, vendedor por sede, contabilidad.
- Exportar pedidos a Excel/CSV.
- Integración con Siigo o Alegra.
- Inventario sincronizado con POS.
- Reportes (ventas por sede, producto top, conversión, ticket promedio).
- Gestión de promociones programadas (Black Friday, día sin IVA).

### Confianza específica reseller Apple
- Aclaración: ¿distribuidor autorizado, reseller independiente o importador?
- Diferencia entre garantía Apple internacional y garantía Prophone.
- Origen del equipo (USA, Hong Kong, Colombia oficial).
- Eventos en sede y citas agendables.

### Plataforma técnica
- `next.config.ts` con `images.remotePatterns` correcto + quitar `unoptimized`.
- Variables de entorno (`.env.local`) para WA, número, API keys.
- Tests Playwright en flujos críticos.
- Despliegue en Vercel con dominio `prophone.com.co`, redirects www.
- Sentry, Vercel Analytics, uptime.
- Backups y plan de recuperación.

### Productos avanzados
- Equipos seminuevos / reacondicionados con grado A/B/C, historial de batería, IMEI verificable.
- Comparador de modelos (iPhone 15 vs 16 vs 16 Pro).
- AppleCare como upsell.
- Plan canje (trade-in) — **descartado por el cliente**.
- Sistema de reseñas propio — **descartado por el cliente**.
- Preguntas y respuestas estilo Mercado Libre.
- Badges dinámicos ("Quedan 2", "X personas viendo").
- Multi-idioma.
- PWA instalable.

---

## Orden sugerido de ataque

1. **Fase 0** — instalar Playwright MCP, tipar las variantes.
2. **Fase 1.1 + 1.2** — modelo de datos nuevo + carga real de la lista de precios + descarga de imágenes Apple.
3. **Fase 2** — ficha de producto con galería + zoom + selector de variantes.
4. **Fase 6** — `loading.tsx` y 404 (rápido y vistoso para la demo).
5. **Fase 5** — búsqueda + minibuscador (alta percepción de "producto serio").
6. **Fase 4** — UX móvil (bottom nav, sticky CTA).
7. **Fase 1.3** — filtros avanzados de catálogo.
8. **Fase 3** — panel admin (lo más grande, último).
9. **Fase 7** — pulido final.

---

## Cómo trabajar este documento

- Marcar `[x]` apenas algo quede mergeado.
- Si surge algo nuevo, anotarlo bajo la fase correspondiente con fecha.
- Si se corre algo de "Fuera de alcance" hacia "en curso", moverlo arriba.
- Cuando se cierre una fase entera, escribir una línea de resumen al final de esa sección con la fecha.
