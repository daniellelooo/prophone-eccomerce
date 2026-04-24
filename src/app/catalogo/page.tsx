"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/lib/products";

function CatalogoContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") ?? "todos";

  const [activeCategory, setActiveCategory] = useState(
    categories.find((c) => c.id === initialCat)?.id ?? "todos"
  );
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const filtered = products
    .filter((p) => {
      const matchCat = activeCategory === "todos" || p.category === activeCategory;
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-6 px-5 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className="text-3xl md:text-6xl font-bold tracking-tight text-neutral-900 mb-2">
              Catálogo
            </h1>
            <p className="text-sm md:text-xl text-neutral-500">
              iPhone, iPad, Watch y accesorios con garantía oficial
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section className="sticky top-[96px] z-30 bg-white/90 backdrop-blur-xl border-b border-neutral-100 px-5 md:px-12 py-3">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          {/* Category pills — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 active:bg-neutral-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search + sort row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-neutral-100 rounded-full text-xs text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-neutral-100 text-neutral-700 text-xs py-2 pl-3 pr-7 rounded-full focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 shrink-0"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-8 px-5 md:px-12 bg-[#F5F5F7] min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg font-semibold text-neutral-700 mb-2">
                No se encontraron productos
              </p>
              <p className="text-neutral-400 text-sm">
                Intenta cambiar los filtros o busca otro término
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-neutral-500 mb-5">
                {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
                {filtered.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={
      <div className="pt-32 px-5 text-center text-neutral-400 text-sm">Cargando...</div>
    }>
      <CatalogoContent />
    </Suspense>
  );
}
