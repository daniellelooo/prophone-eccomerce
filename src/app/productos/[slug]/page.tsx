"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Check,
} from "lucide-react";
import {
  formatPrice,
  conditionLabels,
  conditionWarranty,
  type ProductCondition,
} from "@/lib/products";
import { useCatalogStore } from "@/lib/catalog-store";
import { useCartStore } from "@/lib/store";
import ProductGallery from "@/components/ProductGallery";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const product = useCatalogStore((s) =>
    s.products.find((p) => p.slug === params.slug)
  );

  if (!product) notFound();

  const conditions = useMemo(() => {
    const set = new Set<ProductCondition>();
    product.variants.forEach((v) => set.add(v.condition));
    return Array.from(set);
  }, [product]);

  const [selectedCondition, setSelectedCondition] = useState<ProductCondition>(
    conditions[0] ?? "nuevo"
  );

  const variantsForCondition = useMemo(
    () => product.variants.filter((v) => v.condition === selectedCondition),
    [product, selectedCondition]
  );

  const [selectedSku, setSelectedSku] = useState<string>(
    variantsForCondition[0]?.sku ?? ""
  );
  const selectedVariant =
    product.variants.find((v) => v.sku === selectedSku) ??
    variantsForCondition[0] ??
    product.variants[0];

  const handleConditionChange = (c: ProductCondition) => {
    setSelectedCondition(c);
    const first = product.variants.find((v) => v.condition === c);
    if (first) setSelectedSku(first.sku);
  };

  const [selectedColor, setSelectedColor] = useState(
    product.colors[0]?.name ?? ""
  );
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, { variant: selectedVariant, color: selectedColor });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const variantInfo = [
    selectedVariant?.size,
    selectedVariant?.ram ? `${selectedVariant.ram} RAM` : undefined,
    selectedVariant?.storage,
    selectedColor || undefined,
    selectedVariant?.notes,
  ]
    .filter(Boolean)
    .join(" · ");

  const whatsappMsg = `Hola, me interesa el ${product.name}${
    variantInfo ? ` (${variantInfo})` : ""
  }. ¿Tienen disponibilidad?`;

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 pb-28 md:pb-8">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-10">
          <Link
            href="/"
            className="hover:text-neutral-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Inicio
          </Link>
          <ChevronRight size={14} />
          <Link
            href="/catalogo"
            className="hover:text-neutral-900 transition-colors"
          >
            Catálogo
          </Link>
          <ChevronRight size={14} />
          <span className="text-neutral-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Galería con zoom + lightbox */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-24"
          >
            <ProductGallery
              key={product.slug}
              images={product.images.length > 0 ? product.images : [product.image]}
              alt={product.name}
              badge={product.badge}
            />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 py-4"
          >
            <div>
              <p className="text-sm text-[#0071E3] font-semibold mb-2 uppercase tracking-wide">
                {product.category.charAt(0).toUpperCase() +
                  product.category.slice(1)}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-3">
                {product.name}
              </h1>
              <p className="text-neutral-500 text-base leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <p className="text-3xl font-bold text-neutral-900">
                {formatPrice(selectedVariant?.price ?? 0)}
              </p>
              {selectedVariant && (
                <p className="text-xs text-neutral-500 mt-1">
                  {conditionWarranty[selectedVariant.condition]}
                </p>
              )}
            </div>

            {/* Condición */}
            {conditions.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">
                  Condición:{" "}
                  <span className="text-neutral-900 font-bold">
                    {conditionLabels[selectedCondition]}
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {conditions.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleConditionChange(c)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        selectedCondition === c
                          ? "border-[#0071E3] bg-blue-50 text-[#0071E3]"
                          : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      {conditionLabels[c]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes (almacenamiento / RAM / tamaño) */}
            {variantsForCondition.length > 1 && (
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">
                  Configuración
                </p>
                <div className="flex gap-2 flex-wrap">
                  {variantsForCondition.map((v) => {
                    const label = [v.size, v.ram, v.storage]
                      .filter(Boolean)
                      .join(" / ");
                    return (
                      <button
                        key={v.sku}
                        onClick={() => setSelectedSku(v.sku)}
                        className={`flex flex-col items-start px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          selectedSku === v.sku
                            ? "border-[#0071E3] bg-blue-50 text-[#0071E3]"
                            : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                        }`}
                      >
                        <span>{label || "Estándar"}</span>
                        <span className="text-[11px] opacity-70">
                          {formatPrice(v.price)}
                          {v.notes ? ` · ${v.notes}` : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">
                  Color:{" "}
                  <span className="text-neutral-900 font-bold">
                    {selectedColor}
                  </span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? "border-[#0071E3] scale-110 shadow-md"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant?.inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-base transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-[#0071E3] text-white hover:bg-[#0051a2]"
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} /> Agregado al carrito
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Agregar al carrito
                  </>
                )}
              </button>
              <a
                href={`https://wa.me/573148941200?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-base bg-[#25D366] text-white hover:bg-[#1ebe5d] active:scale-98 transition-all"
              >
                Pedir por WhatsApp
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex gap-4 flex-wrap pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <ShieldCheck size={16} className="text-[#0071E3]" />
                {selectedVariant
                  ? conditionWarranty[selectedVariant.condition]
                  : "Garantía oficial"}
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Truck size={16} className="text-[#0071E3]" />
                Envío a todo Colombia
              </div>
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="pt-2">
                <h3 className="text-base font-semibold text-neutral-900 mb-4">
                  Características destacadas
                </h3>
                <ul className="space-y-2.5">
                  {product.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-neutral-600"
                    >
                      <Check
                        size={15}
                        className="text-[#0071E3] mt-0.5 flex-shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Sticky CTA móvil — flota arriba del BottomNav */}
      <div className="md:hidden fixed left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-neutral-200 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]" style={{ bottom: "68px" }}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-shrink-0">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider leading-none">
              {selectedVariant ? conditionLabels[selectedVariant.condition] : ""}
            </p>
            <p className="text-base font-bold text-neutral-900 leading-tight">
              {formatPrice(selectedVariant?.price ?? 0)}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant?.inStock}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              added ? "bg-green-500 text-white" : "bg-[#CC0000] text-white"
            }`}
          >
            {added ? (
              <>
                <Check size={15} /> Agregado
              </>
            ) : (
              <>
                <ShoppingBag size={15} /> Agregar
              </>
            )}
          </button>
          <a
            href={`https://wa.me/573148941200?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 w-11 h-11 rounded-2xl bg-[#25D366] text-white flex items-center justify-center active:scale-95 transition"
            aria-label="WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
