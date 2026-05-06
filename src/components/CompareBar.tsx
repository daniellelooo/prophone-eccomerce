"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Scale, X, ArrowRight } from "lucide-react";
import { useCompareStore } from "@/lib/compare-store";
import { useCatalogStore } from "@/lib/catalog-store";

/**
 * Barra flotante inferior que aparece cuando hay 1+ productos seleccionados
 * para comparar. Muestra thumbnails de los productos seleccionados, no sólo
 * el slug — más visual que la versión genérica con texto.
 */
export default function CompareBar() {
  const slugs = useCompareStore((s) => s.slugs);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const products = useCatalogStore((s) => s.products);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || slugs.length === 0) return null;

  const items = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-[0_10px_40px_-15px_rgba(12,16,20,0.25)] px-2.5 py-2 flex items-center gap-2 max-w-[calc(100vw-1.5rem)]"
      style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-1.5 pl-1.5 pr-1 shrink-0">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#CC0000] text-white">
          <Scale size={13} />
        </span>
        <span className="hidden sm:inline text-[11px] font-bold text-neutral-700 tabular-nums">
          {slugs.length}/4
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {items.map((p) => (
          <div
            key={p.slug}
            className="relative shrink-0 group"
            title={p.name}
          >
            <Link
              href={`/productos/${p.slug}`}
              className="block w-10 h-10 rounded-xl bg-neutral-50 ring-1 ring-neutral-200 overflow-hidden"
            >
              <Image
                src={p.image}
                alt={p.name}
                width={48}
                height={48}
                className="object-contain w-full h-full p-1"
                unoptimized
              />
            </Link>
            <button
              onClick={() => remove(p.slug)}
              aria-label={`Quitar ${p.name}`}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={9} />
            </button>
          </div>
        ))}
      </div>

      <Link
        href="/comparar"
        className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-[#CC0000] text-white text-xs font-bold px-3.5 py-2 rounded-full transition active:scale-95 ml-1 shrink-0"
      >
        Comparar
        <ArrowRight size={12} />
      </Link>
      <button
        onClick={clear}
        title="Limpiar comparador"
        aria-label="Limpiar comparador"
        className="text-neutral-400 hover:text-[#CC0000] p-1 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
