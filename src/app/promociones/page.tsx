"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCatalogStore } from "@/lib/catalog-store";
import { useSiteConfigStore } from "@/lib/site-config-store";
import { hasActivePromotion, getBestDiscountPct } from "@/lib/products";

/**
 * Galería del hero estilo "feed de Instagram":
 *  - 1 imagen: principal sola (aspect 4:5 vertical, formato post de IG).
 *  - 2 imágenes: principal + 1 thumb cuadrado.
 *  - 3+ imágenes: principal + 2 thumbs cuadrados; el último muestra "+N" si hay más.
 *  - Mobile: carrusel a ancho completo con aspect 4:5 (sin thumbs).
 *  - Auto-rotate cada 4.5s; click en un thumb hace foco en esa imagen.
 *
 * `object-cover` garantiza que cualquier formato de IG (1:1, 4:5, 9:16) llene
 * el frame sin distorsionarse.
 */
function PromoHeroGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const total = images.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const t = setInterval(
      () => setActive((i) => (i + 1) % total),
      4500
    );
    return () => clearInterval(t);
  }, [total, paused]);

  if (total === 0) return null;

  // Para los 2 thumbs del lado derecho mostramos las siguientes 2 imágenes
  // después de la activa (wrapping). Así siempre vemos progreso visual.
  const thumb1Idx = (active + 1) % total;
  const thumb2Idx = (active + 2) % total;
  const remaining = Math.max(total - 3, 0);

  const goPrev = () => setActive((i) => (i - 1 + total) % total);
  const goNext = () => setActive((i) => (i + 1) % total);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="grid grid-cols-1 lg:grid-cols-5 gap-3"
    >
      {/* Imagen principal - aspect 4:5 vertical (formato post IG nativo) en todos los tamaños */}
      <div className="lg:col-span-3 relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-100 ring-1 ring-neutral-200 shadow-[0_30px_60px_-25px_rgba(12,16,20,0.22)]">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={`${title} ${active + 1}`}
              fill
              className="object-cover"
              priority={active === 0}
              unoptimized
              sizes="(max-width: 1024px) 100vw, 36vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Flechas - solo desktop, solo si hay 2+ */}
        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Anterior"
              className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 items-center justify-center shadow-md transition active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goNext}
              aria-label="Siguiente"
              className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-900 items-center justify-center shadow-md transition active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Dots de navegación - mobile + desktop */}
        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className={`rounded-full transition-all duration-500 ${
                  i === active
                    ? "w-6 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails laterales - solo desktop cuando hay 2+ */}
      {total >= 2 && (
        <div className="hidden lg:flex lg:col-span-2 flex-col gap-3">
          <button
            onClick={() => setActive(thumb1Idx)}
            aria-label="Ver imagen siguiente"
            className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-100 ring-1 ring-neutral-200 hover:ring-[#CC0000]/40 transition group flex-1"
          >
            <Image
              src={images[thumb1Idx]}
              alt={`${title} thumbnail`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
              sizes="20vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition" />
          </button>

          {total >= 3 && (
            <button
              onClick={() =>
                setActive(remaining > 0 ? (active + 3) % total : thumb2Idx)
              }
              aria-label={remaining > 0 ? `Ver más fotos (+${remaining})` : "Ver imagen"}
              className="relative aspect-square rounded-3xl overflow-hidden bg-neutral-100 ring-1 ring-neutral-200 hover:ring-[#CC0000]/40 transition group flex-1"
            >
              <Image
                src={images[thumb2Idx]}
                alt={`${title} thumbnail`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
                sizes="20vw"
              />
              {remaining > 0 && (
                <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex flex-col items-center justify-center text-white">
                  <span className="text-3xl font-bold leading-none tabular-nums">
                    +{remaining}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider mt-1 opacity-80">
                    fotos
                  </span>
                </div>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * /promociones — página dinámica para campañas (Día de las Madres, Black Friday, etc.).
 *
 * Toda la copy es editable desde admin → Configuración:
 *  - promoEnabled: oculta la página completa si está desactivado
 *  - promoLabel: título principal y link en el navbar
 *  - promoSubtitle: subtítulo bajo el título
 *  - promoImages: galería del hero. Si está vacío, no se muestra hero visual.
 *
 * Lista los productos con al menos una variante con comparePrice > price,
 * ordenados por mayor descuento primero.
 */
export default function PromocionesPage() {
  const products = useCatalogStore((s) => s.products);
  const promoEnabled = useSiteConfigStore((s) => s.promoEnabled);
  const promoLabel = useSiteConfigStore((s) => s.promoLabel);
  const promoSubtitle = useSiteConfigStore((s) => s.promoSubtitle);
  const promoImages = useSiteConfigStore((s) => s.promoImages);

  const hasImages = promoImages && promoImages.length > 0;

  const promoProducts = useMemo(() => {
    return products
      .filter(hasActivePromotion)
      .sort((a, b) => getBestDiscountPct(b) - getBestDiscountPct(a));
  }, [products]);

  if (!promoEnabled) {
    return (
      <div className="pt-32 min-h-screen bg-white px-5 md:px-12 pb-32">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-400 mb-5">
            <Tag size={22} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
            No hay promociones activas
          </h1>
          <p className="text-neutral-500 mb-8 text-sm md:text-base max-w-md mx-auto">
            Vuelve pronto — cuando tengamos descuentos especiales aparecerán aquí.
          </p>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#CC0000] transition active:scale-95"
          >
            Ir al catálogo
            <ArrowLeft size={15} className="rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-white pb-32">
      {/* Hero */}
      <section className="relative bg-[#FAFAFA] border-b border-neutral-100 px-5 md:px-12 py-7 md:py-20 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-[#CC0000]/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[24rem] h-[24rem] rounded-full bg-[#CC0000]/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Copy */}
          <div className={hasImages ? "lg:col-span-6 order-2 lg:order-1" : "lg:col-span-12 text-center"}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={hasImages ? "relative" : "relative max-w-3xl mx-auto"}
            >
              {/* Kicker minimalista editorial — líneas + texto, sin iconos */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className={`hidden md:inline-flex items-center gap-3 mb-4 ${
                  hasImages ? "" : "justify-center"
                }`}
              >
                <span className="w-8 h-px bg-[#CC0000]" />
                <span className="text-[10px] font-bold tracking-[0.32em] uppercase text-[#CC0000]">
                  Edición limitada
                </span>
                <span className="w-8 h-px bg-gradient-to-r from-[#CC0000]/60 to-transparent" />
              </motion.div>

              {/* Título editorial — última palabra en serif italic rojo */}
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="text-[2.5rem] leading-[0.98] md:text-7xl xl:text-[5.5rem] font-bold tracking-tight text-neutral-900 mb-3 md:mb-5"
              >
                {(() => {
                  const parts = promoLabel.trim().split(/\s+/);
                  if (parts.length <= 1) {
                    return (
                      <em className="font-serif font-normal italic text-[#CC0000]">
                        {promoLabel}
                      </em>
                    );
                  }
                  const last = parts.pop()!;
                  const first = parts.join(" ");
                  return (
                    <>
                      {first}{" "}
                      <em className="font-serif font-normal italic text-[#CC0000]">
                        {last}
                      </em>
                    </>
                  );
                })()}
              </motion.h1>

              {/* Línea decorativa: gradiente rojo → transparente — solo desktop */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`hidden md:block h-1 rounded-full bg-gradient-to-r from-[#CC0000] via-[#CC0000]/50 to-transparent mb-6 origin-left ${
                  hasImages ? "w-32" : "w-40 mx-auto"
                }`}
              />

              {/* Subtítulo — más compacto en mobile */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-neutral-600 text-sm md:text-xl leading-relaxed max-w-md mx-auto lg:mx-0 mb-4 md:mb-8 line-clamp-2 md:line-clamp-none"
              >
                {promoSubtitle}
              </motion.p>

              {/* Stats badge + CTA "Ver descuentos" en mobile para saltar al grid */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="flex flex-wrap items-center gap-2.5"
              >
                {promoProducts.length > 0 && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white ring-1 ring-neutral-200 shadow-sm">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                      <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs md:text-sm font-bold tabular-nums text-neutral-900">
                      {promoProducts.length}
                    </span>
                    <span className="text-[11px] md:text-xs font-medium text-neutral-500">
                      con descuento
                    </span>
                  </span>
                )}
                {promoProducts.length > 0 && (
                  <a
                    href="#productos-promo"
                    className="md:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#CC0000] text-white text-xs font-bold shadow-sm hover:bg-[#A00000] active:scale-95 transition"
                  >
                    Ver descuentos
                    <ArrowLeft size={12} className="-rotate-90" />
                  </a>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Galería estilo feed de Instagram (mosaic responsive) — arriba en mobile, derecha en desktop */}
          {hasImages && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-6 order-1 lg:order-2"
            >
              <PromoHeroGallery images={promoImages} title={promoLabel} />
            </motion.div>
          )}
        </div>
      </section>

      {/* Grid de productos en promo */}
      <section
        id="productos-promo"
        className="scroll-mt-24 px-5 md:px-12 py-8 md:py-14 bg-[#F7F7F8]"
      >
        <div className="max-w-7xl mx-auto">
          {promoProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
              <p className="text-base font-semibold text-neutral-700 mb-2">
                No hay productos con descuento todavía
              </p>
              <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">
                Asigna un &quot;Precio antes&quot; a las variantes que quieras poner en oferta desde el panel admin.
              </p>
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#CC0000] hover:underline"
              >
                Ver catálogo completo
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between mb-6 pb-4 border-b border-neutral-200">
                <p className="text-sm font-semibold text-neutral-900">
                  <span className="tabular-nums">{promoProducts.length}</span>{" "}
                  <span className="text-neutral-500 font-medium">
                    producto{promoProducts.length === 1 ? "" : "s"} en promoción
                  </span>
                </p>
                <Link
                  href="/catalogo"
                  className="text-xs font-semibold text-neutral-500 hover:text-[#CC0000] transition"
                >
                  Ver catálogo →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {promoProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
