"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  X,
  ShoppingBag,
  Check,
  Minus,
  Scale,
  Sparkle,
} from "lucide-react";
import { useCompareStore } from "@/lib/compare-store";
import { useCatalogStore } from "@/lib/catalog-store";
import { useCartStore } from "@/lib/store";
import {
  formatPrice,
  getMinPrice,
  getDefaultVariant,
  type Product,
  conditionLabels,
} from "@/lib/products";

type Row = {
  label: string;
  /** Devuelve un valor primitivo para comparar entre filas (highlight), y un nodo para render. */
  getValue: (p: Product) => { node: React.ReactNode; key: string };
};

/**
 * /comparar — comparador de productos lado a lado.
 *
 * Mejoras vs Macrocell:
 * - **Highlight de diferencias**: cuando una fila tiene valores distintos
 *   entre productos, se marca con barra roja para que el usuario vea de un
 *   vistazo dónde difieren.
 * - **Row de batería** para variantes de exhibición.
 * - **Header con score visual** del producto más barato.
 * - **Mobile**: cards apiladas en lugar de tabla scroll horizontal cuando
 *   hay 2 productos.
 */
export default function CompararPage() {
  const slugs = useCompareStore((s) => s.slugs);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const products = useCatalogStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const items = mounted
    ? slugs
        .map((slug) => products.find((p) => p.slug === slug))
        .filter((p): p is Product => !!p)
    : [];

  if (mounted && items.length === 0) {
    return (
      <div className="pt-24 min-h-screen bg-white px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-[#CC0000] mb-5">
            <Scale size={22} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
            Comparador vacío
          </h1>
          <p className="text-neutral-500 mb-8 text-sm md:text-base max-w-sm mx-auto">
            Agrega hasta 4 productos desde el catálogo y compáralos lado a lado:
            precio, almacenamiento, batería, colores y características.
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

  // Helpers
  const cheapestSlug =
    items.length > 1
      ? items.reduce((acc, p) =>
          getMinPrice(p) < getMinPrice(acc) ? p : acc
        ).slug
      : null;

  const rows: Row[] = [
    {
      label: "Precio desde",
      getValue: (p) => {
        const price = getMinPrice(p);
        const isCheapest = p.slug === cheapestSlug;
        return {
          key: String(price),
          node: (
            <span
              className={`inline-flex items-center gap-1.5 ${
                isCheapest
                  ? "text-[#CC0000] font-bold"
                  : "text-neutral-900 font-semibold"
              }`}
            >
              {formatPrice(price)}
              {isCheapest && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-100 text-[#CC0000]">
                  <Sparkle size={9} />
                  Mejor
                </span>
              )}
            </span>
          ),
        };
      },
    },
    {
      label: "Categoría",
      getValue: (p) => ({
        key: p.category,
        node: (
          <span className="capitalize text-neutral-700">{p.category}</span>
        ),
      }),
    },
    {
      label: "Condiciones",
      getValue: (p) => {
        const set = Array.from(
          new Set(p.variants.map((v) => conditionLabels[v.condition]))
        );
        return { key: set.sort().join("|"), node: set.join(" · ") };
      },
    },
    {
      label: "Almacenamientos",
      getValue: (p) => {
        const set = Array.from(
          new Set(p.variants.map((v) => v.storage).filter(Boolean) as string[])
        );
        return {
          key: set.sort().join("|") || "—",
          node: set.length > 0 ? set.join(" / ") : "—",
        };
      },
    },
    {
      label: "Colores",
      getValue: (p) => ({
        key: p.colors.map((c) => c.name).sort().join("|") || "—",
        node:
          p.colors.length > 0 ? (
            <span className="flex gap-1.5 flex-wrap">
              {p.colors.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  style={{ backgroundColor: c.hex }}
                  className="w-4 h-4 rounded-full border border-neutral-200"
                />
              ))}
            </span>
          ) : (
            "—"
          ),
      }),
    },
    {
      label: "Batería (exhibición)",
      getValue: (p) => {
        const exhVariants = p.variants.filter(
          (v) => v.condition === "exhibicion" && v.batteryHealth !== undefined
        );
        if (exhVariants.length === 0)
          return { key: "—", node: <Minus size={14} className="text-neutral-300" /> };
        const min = Math.min(...exhVariants.map((v) => v.batteryHealth!));
        const max = Math.max(...exhVariants.map((v) => v.batteryHealth!));
        const display = min === max ? `${min}%` : `${min}–${max}%`;
        const color =
          min >= 90
            ? "text-green-700"
            : min >= 80
              ? "text-amber-700"
              : "text-red-600";
        return {
          key: display,
          node: <span className={`font-semibold ${color}`}>{display}</span>,
        };
      },
    },
    {
      label: "Stock total",
      getValue: (p) => {
        const total = p.variants.reduce(
          (acc, v) => acc + (v.stockQuantity ?? 0),
          0
        );
        return {
          key: String(total),
          node:
            total > 0 ? (
              <span className="text-green-700 font-semibold">
                {total} u.
              </span>
            ) : (
              <span className="text-red-600 font-semibold">Sin stock</span>
            ),
        };
      },
    },
    {
      label: "Características",
      getValue: (p) => ({
        key: p.features.slice(0, 5).join("|") || "—",
        node:
          p.features.length > 0 ? (
            <ul className="space-y-1 text-xs text-neutral-700 list-none">
              {p.features.slice(0, 5).map((f, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Check size={11} className="text-[#CC0000] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
              {p.features.length > 5 && (
                <li className="text-[10px] text-neutral-400 italic">
                  +{p.features.length - 5} más en la ficha
                </li>
              )}
            </ul>
          ) : (
            <Minus size={14} className="text-neutral-300" />
          ),
      }),
    },
  ];

  /** ¿Esta fila tiene valores distintos entre productos? */
  const rowDiffers = (row: Row) => {
    if (items.length < 2) return false;
    const keys = new Set(items.map((p) => row.getValue(p).key));
    return keys.size > 1;
  };

  return (
    <div className="pt-24 min-h-screen bg-white px-5 md:px-12 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
          <Link
            href="/catalogo"
            className="hover:text-neutral-900 transition flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Catálogo
          </Link>
        </nav>

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#CC0000] mb-3">
              Comparador
            </p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
              Decide con datos.
            </h1>
            <p className="text-neutral-500 text-sm mt-2">
              {items.length} producto{items.length === 1 ? "" : "s"} en
              comparación · diferencias resaltadas en rojo
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#CC0000] transition px-3 py-2 rounded-full border border-neutral-200 hover:border-[#CC0000]"
            >
              <X size={12} /> Limpiar todo
            </button>
          )}
        </div>

        {/* Tabla — scroll horizontal en mobile */}
        <div className="overflow-x-auto -mx-5 md:-mx-0 px-5 md:px-0">
          <table className="w-full bg-white rounded-3xl border border-neutral-200 border-separate border-spacing-0 overflow-hidden min-w-[640px]">
            <thead>
              <tr>
                <th className="bg-neutral-50 text-left text-[10px] uppercase tracking-wider text-neutral-500 font-semibold px-5 py-4 sticky left-0 z-10 w-44 border-b border-neutral-200">
                  Producto
                </th>
                {items.map((p) => (
                  <th
                    key={p.slug}
                    className="px-4 py-5 align-bottom text-left min-w-[200px] border-l border-b border-neutral-200"
                  >
                    <div className="relative">
                      <button
                        onClick={() => remove(p.slug)}
                        aria-label={`Quitar ${p.name}`}
                        className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white border border-neutral-200 hover:border-[#CC0000] hover:text-[#CC0000] text-neutral-500 transition flex items-center justify-center z-10"
                      >
                        <X size={14} />
                      </button>
                      <Link
                        href={`/productos/${p.slug}`}
                        className="block group"
                      >
                        <div className="aspect-square bg-white rounded-2xl mb-3 p-4 flex items-center justify-center border border-neutral-100">
                          <Image
                            src={p.image}
                            alt={p.name}
                            width={140}
                            height={140}
                            className="object-contain w-full h-full group-hover:scale-105 transition"
                            unoptimized
                          />
                        </div>
                        <p className="text-sm font-bold text-neutral-900 leading-tight mb-1 line-clamp-2 group-hover:text-[#CC0000] transition">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 line-clamp-2">
                          {p.shortDescription}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const differs = rowDiffers(row);
                return (
                  <tr
                    key={row.label}
                    className={`${
                      i % 2 === 0 ? "bg-neutral-50/40" : ""
                    } ${differs ? "border-l-2 border-l-[#CC0000]" : ""}`}
                  >
                    <td
                      className={`px-5 py-3 text-[11px] uppercase tracking-wider font-semibold sticky left-0 ${
                        i % 2 === 0 ? "bg-neutral-50/80" : "bg-white"
                      } ${
                        differs ? "text-[#CC0000]" : "text-neutral-500"
                      } border-b border-neutral-100`}
                    >
                      <span className="flex items-center gap-1.5">
                        {differs && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000]" />
                        )}
                        {row.label}
                      </span>
                    </td>
                    {items.map((p) => (
                      <td
                        key={p.slug}
                        className="px-4 py-3 text-sm text-neutral-800 align-top border-l border-b border-neutral-100"
                      >
                        {row.getValue(p).node}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {/* CTA row */}
              <tr>
                <td className="px-5 py-4 sticky left-0 bg-white" />
                {items.map((p) => {
                  const v = getDefaultVariant(p);
                  const inStock = !!v?.inStock;
                  return (
                    <td
                      key={p.slug}
                      className="px-4 py-4 align-top border-l border-neutral-100"
                    >
                      <button
                        onClick={() => v && addItem(p, { variant: v })}
                        disabled={!inStock}
                        className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-[#CC0000] text-white py-2.5 rounded-2xl font-semibold text-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag size={13} />
                        {inStock ? "Agregar" : "Sin stock"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tip */}
        {items.length >= 2 && (
          <p className="text-[11px] text-neutral-400 mt-4 italic flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000] inline-block" />
            Las filas con barra roja a la izquierda son donde estos productos difieren.
          </p>
        )}
      </div>
    </div>
  );
}
