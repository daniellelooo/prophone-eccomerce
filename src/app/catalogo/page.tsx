"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import {
  categories,
  formatPrice,
  getMaxPrice,
  getMinPrice,
  conditionLabels,
  type Product,
  type ProductCondition,
} from "@/lib/products";
import { useCatalogStore } from "@/lib/catalog-store";
import { useSiteConfigStore, getWhatsappUrl } from "@/lib/site-config-store";

const CONDITION_FILTERS: { id: "todas" | ProductCondition; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "nuevo", label: conditionLabels.nuevo },
  { id: "exhibicion", label: conditionLabels.exhibicion },
  { id: "open-box", label: conditionLabels["open-box"] },
  { id: "as-is", label: conditionLabels["as-is"] },
  { id: "preventa", label: conditionLabels.preventa },
];

const STORAGE_OPTIONS = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"];

function uniqueColors(products: Product[]): { name: string; hex: string }[] {
  const map = new Map<string, string>();
  products.forEach((p) =>
    p.colors.forEach((c) => {
      if (!map.has(c.name)) map.set(c.name, c.hex);
    })
  );
  return Array.from(map, ([name, hex]) => ({ name, hex })).slice(0, 24);
}

function CatalogoContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") ?? "todos";
  const products = useCatalogStore((s) => s.products);
  const whatsappNumber = useSiteConfigStore((s) => s.whatsappNumber);

  const [activeCategory, setActiveCategory] = useState(
    categories.find((c) => c.id === initialCat)?.id ?? "todos"
  );

  useEffect(() => {
    const cat = searchParams.get("cat") ?? "todos";
    setActiveCategory(categories.find((c) => c.id === cat)?.id ?? "todos");
  }, [searchParams]);
  const [activeCondition, setActiveCondition] = useState<
    "todas" | ProductCondition
  >("todas");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [activeStorage, setActiveStorage] = useState<string | "todos">(
    "todos"
  );
  const [activeColor, setActiveColor] = useState<string | "todos">("todos");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Rango de precios disponible (computado del catálogo entero)
  const { absoluteMin, absoluteMax } = useMemo(() => {
    if (products.length === 0) return { absoluteMin: 0, absoluteMax: 10_000_000 };
    let min = Infinity;
    let max = 0;
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.price < min) min = v.price;
        if (v.price > max) max = v.price;
      });
    });
    return {
      absoluteMin: Number.isFinite(min) ? min : 0,
      absoluteMax: max || 10_000_000,
    };
  }, [products]);

  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const colors = useMemo(() => uniqueColors(products), [products]);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchCat =
          activeCategory === "todos" || p.category === activeCategory;
        const matchSearch =
          search === "" ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.shortDescription.toLowerCase().includes(search.toLowerCase());
        const matchCondition =
          activeCondition === "todas" ||
          p.variants.some((v) => v.condition === activeCondition);
        const matchStorage =
          activeStorage === "todos" ||
          p.variants.some((v) => v.storage === activeStorage);
        const matchColor =
          activeColor === "todos" ||
          p.colors.some((c) => c.name === activeColor);
        const min = getMinPrice(p);
        const max = getMaxPrice(p);
        const matchPrice =
          (priceMin === null || max >= priceMin) &&
          (priceMax === null || min <= priceMax);
        return (
          matchCat &&
          matchSearch &&
          matchCondition &&
          matchStorage &&
          matchColor &&
          matchPrice
        );
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return getMinPrice(a) - getMinPrice(b);
        if (sortBy === "price-desc") return getMinPrice(b) - getMinPrice(a);
        return 0;
      });
  }, [
    products,
    activeCategory,
    activeCondition,
    activeStorage,
    activeColor,
    priceMin,
    priceMax,
    search,
    sortBy,
  ]);

  const activeFilterCount =
    (activeCondition !== "todas" ? 1 : 0) +
    (activeStorage !== "todos" ? 1 : 0) +
    (activeColor !== "todos" ? 1 : 0) +
    (priceMin !== null || priceMax !== null ? 1 : 0);

  const clearAllFilters = () => {
    setActiveCondition("todas");
    setActiveStorage("todos");
    setActiveColor("todos");
    setPriceMin(null);
    setPriceMax(null);
    setSearch("");
    setSortBy("featured");
  };

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
              iPhone, iPad, Watch, MacBook y accesorios — nuevos y exhibición
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky filter bar */}
      <section
        className="sticky top-[96px] z-30 bg-white/90 backdrop-blur-xl border-b border-neutral-100 px-5 md:px-12 py-4"
        aria-label="Filtros del catálogo"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          {/* Category pills */}
          <div
            className="flex gap-2.5 overflow-x-auto no-scrollbar"
            role="tablist"
            aria-label="Categorías"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 ${
                  activeCategory === cat.id
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Condition pills */}
          <div
            className="flex gap-2 overflow-x-auto no-scrollbar"
            role="tablist"
            aria-label="Condición"
          >
            {CONDITION_FILTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCondition(c.id)}
                role="tab"
                aria-selected={activeCondition === c.id}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] ${
                  activeCondition === c.id
                    ? "bg-[#CC0000] text-white shadow-sm"
                    : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search + sort + advanced toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                aria-hidden
              />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar productos"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 rounded-full text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              />
            </div>
            <button
              onClick={() => setAdvancedOpen((v) => !v)}
              aria-expanded={advancedOpen}
              aria-controls="advanced-filters"
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] ${
                advancedOpen || activeFilterCount > 0
                  ? "bg-[#CC0000] text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <SlidersHorizontal size={14} aria-hidden />
              <span className="hidden sm:inline">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-white/30 text-white text-[11px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Ordenar por"
              className="appearance-none bg-neutral-100 text-neutral-700 text-sm py-2.5 pl-4 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 shrink-0 cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
            </select>
          </div>

          {/* Advanced filters (collapsible) */}
          <AnimatePresence initial={false}>
            {advancedOpen && (
              <motion.div
                id="advanced-filters"
                key="advanced"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 pb-1">
                  {/* Almacenamiento */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      Almacenamiento
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <FilterChip
                        active={activeStorage === "todos"}
                        onClick={() => setActiveStorage("todos")}
                      >
                        Todos
                      </FilterChip>
                      {STORAGE_OPTIONS.map((s) => (
                        <FilterChip
                          key={s}
                          active={activeStorage === s}
                          onClick={() =>
                            setActiveStorage(activeStorage === s ? "todos" : s)
                          }
                        >
                          {s}
                        </FilterChip>
                      ))}
                    </div>
                  </div>

                  {/* Rango de precio */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      Rango de precio
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={String(absoluteMin)}
                        value={priceMin ?? ""}
                        onChange={(e) =>
                          setPriceMin(
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        aria-label="Precio mínimo"
                        className="w-full px-2.5 py-1.5 bg-neutral-100 rounded-lg text-xs text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                      />
                      <span className="text-neutral-400 text-xs">—</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={String(absoluteMax)}
                        value={priceMax ?? ""}
                        onChange={(e) =>
                          setPriceMax(
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        aria-label="Precio máximo"
                        className="w-full px-2.5 py-1.5 bg-neutral-100 rounded-lg text-xs text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      desde {formatPrice(absoluteMin)} hasta{" "}
                      {formatPrice(absoluteMax)}
                    </p>
                  </div>

                  {/* Color */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                      Color
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <FilterChip
                        active={activeColor === "todos"}
                        onClick={() => setActiveColor("todos")}
                      >
                        Todos
                      </FilterChip>
                      {colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() =>
                            setActiveColor(
                              activeColor === c.name ? "todos" : c.name
                            )
                          }
                          aria-pressed={activeColor === c.name}
                          aria-label={c.name}
                          title={c.name}
                          className={`w-7 h-7 rounded-full border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 ${
                            activeColor === c.name
                              ? "border-[#CC0000] scale-110"
                              : "border-neutral-200 hover:scale-105"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500">
                      {activeFilterCount} filtro
                      {activeFilterCount !== 1 ? "s" : ""} activo
                      {activeFilterCount !== 1 ? "s" : ""}
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CC0000] hover:text-[#A00000] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] rounded px-1"
                    >
                      <RotateCcw size={11} aria-hidden /> Limpiar todo
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Product grid */}
      <section className="py-8 px-5 md:px-12 bg-[#F5F5F7] min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <EmptyCatalog
              search={search}
              activeFilterCount={activeFilterCount}
              onClear={clearAllFilters}
              whatsappNumber={whatsappNumber}
            />
          ) : (
            <>
              <p className="text-xs text-neutral-500 mb-5">
                {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              </p>
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((product, i) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{
                        duration: 0.3,
                        delay: i * 0.02,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <ProductCard product={product} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] ${
        active
          ? "bg-neutral-900 text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyCatalog({
  search,
  activeFilterCount,
  onClear,
  whatsappNumber,
}: {
  search: string;
  activeFilterCount: number;
  onClear: () => void;
  whatsappNumber: string;
}) {
  const term = search.trim();
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center py-20 max-w-md mx-auto"
    >
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
        <Filter size={22} className="text-neutral-300" aria-hidden />
      </div>
      <p className="text-lg font-semibold text-neutral-700 mb-2">
        {term
          ? `No encontramos productos para "${term}"`
          : "Ningún producto coincide con esos filtros"}
      </p>
      <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
        Quítale algunos filtros, busca otro término o escríbenos por WhatsApp y
        te conseguimos lo que buscas.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {activeFilterCount > 0 || term ? (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 bg-white border border-neutral-200 hover:border-neutral-400 text-neutral-700 px-5 py-2.5 rounded-full text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
          >
            <X size={13} aria-hidden /> Limpiar filtros
          </button>
        ) : null}
        <a
          href={getWhatsappUrl(
            whatsappNumber,
            term
              ? `Hola, busco un ${term} pero no apareció en la web. ¿Tienen disponibilidad?`
              : "Hola, no encontré lo que buscaba. ¿Me ayudan?"
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
        >
          Pregúntanos por WhatsApp
        </a>
      </div>
      <Link
        href="/catalogo"
        className="block mt-6 text-xs text-neutral-400 hover:text-neutral-700 transition"
      >
        Volver a ver todo el catálogo
      </Link>
    </motion.div>
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
