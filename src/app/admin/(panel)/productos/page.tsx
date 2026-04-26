"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ExternalLink, Pencil, Tag } from "lucide-react";
import { useCatalogStore } from "@/lib/catalog-store";
import {
  formatPrice,
  getMinPrice,
  getMaxPrice,
  conditionLabels,
  categories,
  type ProductCategory,
} from "@/lib/products";

export default function AdminProductosPage() {
  const products = useCatalogStore((s) => s.products);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"todos" | ProductCategory>(
    "todos"
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === "todos" || p.category === activeCategory;
      const matchSearch =
        search.trim() === "" ||
        [p.name, p.id, p.family, p.shortDescription]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, search, activeCategory]);

  // Métricas rápidas
  const totalSKUs = products.reduce((sum, p) => sum + p.variants.length, 0);
  const inStockSKUs = products.reduce(
    (sum, p) => sum + p.variants.filter((v) => v.inStock).length,
    0
  );
  const featuredCount = products.filter((p) => p.isFeatured).length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            Productos
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestiona el catálogo: precios, variantes, stock y condición.
          </p>
        </div>
        <button
          disabled
          title="Disponible en C2"
          className="inline-flex items-center gap-2 bg-[#CC0000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition opacity-50 cursor-not-allowed"
        >
          <Plus size={15} />
          Crear producto
        </button>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Productos" value={String(products.length)} />
        <Kpi label="SKUs totales" value={String(totalSKUs)} />
        <Kpi label="En stock" value={`${inStockSKUs}/${totalSKUs}`} />
        <Kpi label="Destacados home" value={String(featuredCount)} />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, id, familia…"
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-100 rounded-xl text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as "todos" | ProductCategory)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left text-[11px] uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Variantes</th>
                <th className="px-4 py-3 font-semibold">Rango precio</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Flags</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((p) => {
                const min = getMinPrice(p);
                const max = getMaxPrice(p);
                const inStock = p.variants.filter((v) => v.inStock).length;
                const conds = Array.from(new Set(p.variants.map((v) => v.condition)));
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate max-w-[200px]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[200px]">
                            {p.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded-full capitalize">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-neutral-900">
                          {p.variants.length} {p.variants.length === 1 ? "SKU" : "SKUs"}
                        </span>
                        <div className="flex gap-1 flex-wrap">
                          {conds.map((c) => (
                            <span
                              key={c}
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                c === "nuevo"
                                  ? "bg-green-100 text-green-700"
                                  : c === "exhibicion"
                                  ? "bg-blue-100 text-blue-700"
                                  : c === "open-box"
                                  ? "bg-purple-100 text-purple-700"
                                  : c === "preventa"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-neutral-200 text-neutral-700"
                              }`}
                            >
                              {conditionLabels[c]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-neutral-900 whitespace-nowrap">
                        {min === max
                          ? formatPrice(min)
                          : `${formatPrice(min)} – ${formatPrice(max)}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          inStock === 0
                            ? "text-red-600"
                            : inStock < p.variants.length
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {inStock}/{p.variants.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isFeatured && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 uppercase tracking-wider">
                            Destacado
                          </span>
                        )}
                        {p.isNew && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase tracking-wider">
                            Nuevo
                          </span>
                        )}
                        {p.badge && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#CC0000]/10 text-[#CC0000] uppercase tracking-wider flex items-center gap-1">
                            <Tag size={9} /> {p.badge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/productos/${p.slug}`}
                          target="_blank"
                          className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition"
                          aria-label="Ver en sitio público"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          disabled
                          title="Editor disponible en C2"
                          className="p-2 text-neutral-300 rounded-lg cursor-not-allowed"
                          aria-label="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-neutral-700 mb-1">
              No hay productos que coincidan
            </p>
            <p className="text-xs text-neutral-400">
              Cambia los filtros o limpia la búsqueda.
            </p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-neutral-400">
        Edición inline + editor completo + crear nuevo + eliminar — disponibles en C2.
      </p>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 px-4 py-3.5">
      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}
