"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCatalogStore } from "@/lib/catalog-store";
import { useSiteConfigStore } from "@/lib/site-config-store";
import {
  formatPrice,
  getMinPrice,
  type ProductCategory,
} from "@/lib/products";

type CategoryDef = {
  id: ProductCategory;
  label: string;
  tag: string;
};

const CATEGORIES: CategoryDef[] = [
  { id: "iphone", label: "iPhone", tag: "Nuevos y exhibición" },
  { id: "macbook", label: "MacBook", tag: "Pro y Air" },
  { id: "ipad", label: "iPad", tag: "Estudio y trabajo" },
  { id: "watch", label: "Apple Watch", tag: "Salud y deporte" },
  { id: "accesorios", label: "Accesorios", tag: "Cargadores · audio" },
];

/** Fondo blanco común para los paneles de imagen — coincide con el fondo blanco de las fotos de producto. */
const IMAGE_PANEL_BG = "bg-white";

export default function CategoryShowcase() {
  const products = useCatalogStore((s) => s.products);
  const overrides = useSiteConfigStore((s) => s.categoryShowcaseOverrides);
  const ecosystemTitle = useSiteConfigStore(
    (s) => s.landingTexts.ecosystemTitle
  );
  const ecosystemAccent = useSiteConfigStore(
    (s) => s.landingTexts.ecosystemAccent
  );

  const cards = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const inCat = products.filter((p) => p.category === cat.id);
      const cover =
        inCat.find((p) => p.isFeatured) ?? inCat.find((p) => p.isNew) ?? inCat[0];
      const minPrice = inCat.reduce<number>((acc, p) => {
        const m = getMinPrice(p);
        return m > 0 && (acc === 0 || m < acc) ? m : acc;
      }, 0);
      // Override desde admin tiene prioridad sobre la imagen del producto destacado
      const overrideImage = overrides?.[cat.id as keyof typeof overrides] || "";
      return {
        ...cat,
        image: overrideImage || cover?.image || null,
        productName: cover?.name ?? null,
        count: inCat.length,
        minPrice,
      };
    }).filter((c) => c.count > 0);
  }, [products, overrides]);

  if (cards.length === 0) return null;

  // Featured = first one (iPhone). Others go in the side grid.
  const [featured, ...rest] = cards;

  return (
    <section
      aria-labelledby="category-showcase-heading"
      className="py-14 md:py-24 bg-[#FAFAFA] border-y border-neutral-100"
    >
      <div className="max-w-7xl mx-auto">
        <div className="px-5 md:px-12 mb-7 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-end justify-between gap-4"
          >
            <div>
              <h2
                id="category-showcase-heading"
                className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.05]"
              >
                {ecosystemTitle}
                {ecosystemAccent && (
                  <span className="block text-[#CC0000]">{ecosystemAccent}</span>
                )}
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="hidden sm:inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-neutral-900 hover:text-[#CC0000] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] rounded px-1 group"
            >
              Catálogo completo
              <ArrowUpRight
                size={14}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                aria-hidden
              />
            </Link>
          </motion.div>
        </div>

        {/* Mobile: scroll horizontal de tiles. Desktop: featured + 2x2 side grid */}
        <div className="px-5 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            {/* FEATURED TILE — iPhone */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-6"
            >
              <Link
                href={`/catalogo?cat=${featured.id}`}
                aria-label={`Ver ${featured.label}${
                  featured.minPrice ? `, desde ${formatPrice(featured.minPrice)}` : ""
                }`}
                className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-neutral-200/70 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-20px_rgba(12,16,20,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 min-h-[400px] md:min-h-[520px]"
              >
                {/* Image panel — full bleed top, same warm bg as image */}
                <div
                  className={`relative ${IMAGE_PANEL_BG} aspect-[5/4] md:aspect-auto md:flex-1 overflow-hidden`}
                >
                  {featured.image && (
                    <Image
                      src={featured.image}
                      alt={featured.productName ?? featured.label}
                      fill
                      className="object-contain p-8 md:p-12 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      unoptimized
                    />
                  )}
                  <span className="absolute top-4 left-4 inline-block bg-white/95 backdrop-blur text-neutral-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-neutral-200/70">
                    {featured.tag}
                  </span>
                </div>

                {/* Footer info */}
                <div className="p-6 md:p-7 flex items-end justify-between gap-4 bg-white">
                  <div className="min-w-0">
                    <h3 className="text-2xl md:text-4xl font-bold text-neutral-900 tracking-tight leading-tight mb-2">
                      {featured.label}
                    </h3>
                    {featured.minPrice > 0 && (
                      <p className="text-sm text-neutral-500">
                        Desde{" "}
                        <strong className="text-neutral-900 font-semibold tabular-nums">
                          {formatPrice(featured.minPrice)}
                        </strong>
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 text-white shrink-0 group-hover:bg-[#CC0000] transition-colors">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* SIDE GRID — 2 cols × 2 rows, same look */}
            <div className="md:col-span-6 grid grid-cols-2 gap-4 md:gap-5">
              {rest.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.45,
                    delay: 0.06 + i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={`/catalogo?cat=${card.id}`}
                    aria-label={`Ver ${card.label}${
                      card.minPrice ? `, desde ${formatPrice(card.minPrice)}` : ""
                    }`}
                    className="group relative flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-neutral-200/70 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_-18px_rgba(12,16,20,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2"
                  >
                    {/* Image */}
                    <div
                      className={`relative ${IMAGE_PANEL_BG} aspect-square overflow-hidden`}
                    >
                      {card.image && (
                        <Image
                          src={card.image}
                          alt={card.productName ?? card.label}
                          fill
                          className="object-contain p-5 md:p-7 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                          unoptimized
                        />
                      )}
                      <span
                        className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm text-neutral-700 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                        aria-hidden
                      >
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                    {/* Info */}
                    <div className="p-4 md:p-5 flex-1 flex flex-col">
                      <h3 className="text-base md:text-lg font-bold text-neutral-900 leading-tight">
                        {card.label}
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                        {card.tag}
                      </p>
                      {card.minPrice > 0 ? (
                        <p className="text-sm font-bold text-neutral-900 mt-auto pt-3 tabular-nums">
                          Desde {formatPrice(card.minPrice)}
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-400 mt-auto pt-3">
                          Próximamente
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 mt-6 sm:hidden">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#CC0000] hover:text-[#A00000] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] rounded px-1"
          >
            Ver todo el catálogo
            <ArrowUpRight size={12} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
