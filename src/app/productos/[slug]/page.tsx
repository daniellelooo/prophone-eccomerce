"use client";

import Image from "next/image";
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
  getProductBySlug,
  formatPrice,
  conditionLabels,
  conditionWarranty,
  type ProductCondition,
} from "@/lib/products";
import { useCartStore } from "@/lib/store";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const product = getProductBySlug(params.slug);

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
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
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
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-24"
          >
            <div className="relative aspect-square bg-neutral-50 rounded-3xl flex items-center justify-center p-12 overflow-hidden">
              {product.badge && (
                <span className="absolute top-6 left-6 bg-[#0071E3] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {product.badge}
                </span>
              )}
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="w-full h-full object-contain drop-shadow-2xl"
                priority
                unoptimized
              />
            </div>
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
    </div>
  );
}
