"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowUpRight, Scale, ImageOff } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCompareStore } from "@/lib/compare-store";
import {
  type Product,
  formatPrice,
  getMinPrice,
  hasMultipleVariants,
  hasActivePromotion,
  getBestDiscountPct,
} from "@/lib/products";

type Props = {
  product: Product;
  index?: number;
};

export default function ProductCard({ product, index = 0 }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWished = useWishlistStore((s) => s.has(product.slug));
  const toggleCompare = useCompareStore((s) => s.toggle);
  const inCompare = useCompareStore((s) => s.has(product.slug));
  const minPrice = getMinPrice(product);
  const showFromLabel = hasMultipleVariants(product);
  const allOutOfStock = product.variants.every((v) => !v.inStock);
  const onSale = hasActivePromotion(product);
  const bestDiscount = getBestDiscountPct(product);
  // Para mostrar el "antes" tachado en la card usamos el comparePrice de la
  // variante más barata (la que aporta el `Desde`).
  const cheapestVariant = product.variants
    .slice()
    .sort((a, b) => a.price - b.price)[0];
  const compareAtMin = cheapestVariant?.comparePrice;
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "200px 0px" }}
      transition={{
        duration: 0.4,
        delay: Math.min((index % 8) * 0.04, 0.28),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex flex-col h-full rounded-3xl border border-neutral-200/70 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_18px_40px_-22px_rgba(12,16,20,0.18)]"
    >
      {/* Image area — fondo blanco para fundir con fotos de producto blancas */}
      <Link
        href={`/productos/${product.slug}`}
        className="relative block aspect-square bg-white overflow-hidden"
      >
        {allOutOfStock && (
          <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-neutral-900/85 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Sin stock
            </span>
          </div>
        )}

        {/* Badge stack — top-left. Sale badge tiene prioridad sobre todo. */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {onSale && !allOutOfStock && (
            <span className="bg-[#CC0000] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
              -{bestDiscount}%
            </span>
          )}
          {product.badge && !allOutOfStock && !onSale && (
            <span className="bg-[#CC0000] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              {product.badge}
            </span>
          )}
          {product.isNew && !product.badge && !allOutOfStock && !onSale && (
            <span className="bg-neutral-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Nuevo
            </span>
          )}
        </div>

        {/* Wishlist + Compare stack — top-right minimal */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.slug);
            }}
            aria-label={isWished ? "Quitar de favoritos" : "Agregar a favoritos"}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 ${
              isWished
                ? "bg-[#CC0000] text-white"
                : "bg-white/80 text-neutral-500 backdrop-blur-sm hover:bg-white hover:text-[#CC0000]"
            }`}
          >
            <Heart
              size={14}
              className={isWished ? "fill-white" : ""}
              strokeWidth={2}
            />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              const ok = toggleCompare(product.slug);
              if (!ok && !inCompare) {
                alert("Solo puedes comparar hasta 4 productos a la vez.");
              }
            }}
            aria-label={inCompare ? "Quitar del comparador" : "Comparar"}
            title={inCompare ? "En el comparador" : "Comparar este producto"}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all hover:scale-110 ${
              inCompare
                ? "bg-neutral-900 text-white"
                : "bg-white/80 text-neutral-500 backdrop-blur-sm hover:bg-white hover:text-neutral-900"
            }`}
          >
            <Scale size={14} />
          </button>
        </div>

        {imgFailed || !product.image ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-300 gap-1.5">
            <ImageOff size={28} />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              Sin foto
            </span>
          </div>
        ) : (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            unoptimized
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Hover arrow ↘ */}
        <span
          aria-hidden
          className="absolute bottom-3 right-3 z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-neutral-900 text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          <ArrowUpRight size={15} />
        </span>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 md:p-5 border-t border-neutral-100">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-semibold text-neutral-900 text-sm md:text-[15px] leading-snug mb-1 group-hover:text-[#CC0000] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] text-neutral-400 mb-4 leading-snug line-clamp-1">
          {product.shortDescription}
        </p>

        <div className="flex items-end justify-between mt-auto gap-2">
          <div className="min-w-0">
            {showFromLabel && (
              <p className="text-[10px] font-medium text-neutral-400 leading-none mb-0.5">
                Desde
              </p>
            )}
            {compareAtMin && compareAtMin > minPrice && (
              <p className="text-[10px] text-neutral-400 line-through leading-none mb-0.5 tabular-nums">
                {formatPrice(compareAtMin)}
              </p>
            )}
            <p
              className={`text-base md:text-lg font-bold tabular-nums leading-none ${
                onSale ? "text-[#CC0000]" : "text-neutral-900"
              }`}
            >
              {formatPrice(minPrice)}
            </p>
          </div>
          {allOutOfStock ? (
            <span className="text-[10px] font-semibold text-neutral-400 px-2 py-1.5">
              Agotado
            </span>
          ) : (
            <button
              onClick={() => addItem(product)}
              className="inline-flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-[#CC0000] text-white text-[11px] font-semibold px-3 py-2 rounded-full transition-all active:scale-95 shrink-0"
              aria-label="Agregar al carrito"
            >
              <ShoppingBag size={12} />
              <span className="hidden sm:inline">Agregar</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
