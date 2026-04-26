"use client";

import { create } from "zustand";
import { products as defaultProducts, type Product } from "./products";
import { getSupabaseBrowserClient } from "./supabase/client";
import { productToRows, rowToProduct } from "./supabase/mappers";

type CatalogState = {
  products: Product[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  /** Carga inicial desde Supabase (sin bloquear UI). */
  hydrate: () => Promise<void>;
  /** Refresca desde Supabase ignorando cache local. */
  refresh: () => Promise<void>;
  /** Crea o actualiza un producto (write-through a Supabase). */
  upsert: (product: Product) => Promise<void>;
  /** Borra un producto y sus relaciones (variants, images cascade). */
  remove: (id: string) => Promise<void>;
  /** Reemplaza todo el catálogo (usado por importar JSON). */
  setAll: (products: Product[]) => Promise<void>;
  /** Restaura los defaults hardcoded en código y los persiste a Supabase. */
  reset: () => Promise<void>;
};

/**
 * Catálogo en memoria sincronizado con Supabase.
 *
 * - El primer render del cliente muestra `defaultProducts` (mismos defaults
 *   que en SSR para evitar hydration mismatch).
 * - `<CatalogHydrator/>` llama `hydrate()` en mount y reemplaza los
 *   defaults con la data real de Supabase.
 * - Cada mutación hace write-through a Supabase y actualiza el state.
 */
export const useCatalogStore = create<CatalogState>()((set, get) => ({
  products: defaultProducts,
  loaded: false,
  loading: false,
  error: null,

  hydrate: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true, error: null });
    try {
      const list = await fetchAllProducts();
      set({ products: list, loaded: true, loading: false });
    } catch (err) {
      console.error("[catalog-store] hydrate failed", err);
      set({ loading: false, error: (err as Error).message });
    }
  },

  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const list = await fetchAllProducts();
      set({ products: list, loaded: true, loading: false });
    } catch (err) {
      console.error("[catalog-store] refresh failed", err);
      set({ loading: false, error: (err as Error).message });
    }
  },

  upsert: async (product) => {
    const supabase = getSupabaseBrowserClient();
    const { product: row, variants, images } = productToRows(product);

    // Upsert producto
    const { error: pErr } = await supabase.from("products").upsert(row);
    if (pErr) throw pErr;

    // Reemplazar variantes
    const { error: dvErr } = await supabase
      .from("variants")
      .delete()
      .eq("product_id", product.id);
    if (dvErr) throw dvErr;
    if (variants.length > 0) {
      const { error: ivErr } = await supabase.from("variants").insert(variants);
      if (ivErr) throw ivErr;
    }

    // Reemplazar imágenes
    const { error: diErr } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", product.id);
    if (diErr) throw diErr;
    if (images.length > 0) {
      const { error: iiErr } = await supabase
        .from("product_images")
        .insert(images);
      if (iiErr) throw iiErr;
    }

    // Sync local
    set((s) => {
      const exists = s.products.some((p) => p.id === product.id);
      return {
        products: exists
          ? s.products.map((p) => (p.id === product.id ? product : p))
          : [...s.products, product],
      };
    });
  },

  remove: async (id) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },

  setAll: async (products) => {
    const supabase = getSupabaseBrowserClient();
    // Borra todo y vuelve a insertar (cascade limpia variants y images)
    const { error: delErr } = await supabase
      .from("products")
      .delete()
      .neq("id", "__never__");
    if (delErr) throw delErr;

    if (products.length > 0) {
      const productRows = products.map((p) => productToRows(p).product);
      const { error: pErr } = await supabase.from("products").upsert(productRows);
      if (pErr) throw pErr;

      const variantRows = products.flatMap((p) => productToRows(p).variants);
      if (variantRows.length > 0) {
        const { error: vErr } = await supabase.from("variants").insert(variantRows);
        if (vErr) throw vErr;
      }

      const imageRows = products.flatMap((p) => productToRows(p).images);
      if (imageRows.length > 0) {
        const { error: iErr } = await supabase
          .from("product_images")
          .insert(imageRows);
        if (iErr) throw iErr;
      }
    }
    set({ products });
  },

  reset: async () => {
    await get().setAll(defaultProducts);
  },
}));

async function fetchAllProducts(): Promise<Product[]> {
  const supabase = getSupabaseBrowserClient();
  const [pRes, vRes, iRes] = await Promise.all([
    supabase.from("products").select("*").order("sort_order"),
    supabase.from("variants").select("*"),
    supabase.from("product_images").select("*"),
  ]);
  if (pRes.error) throw pRes.error;
  if (vRes.error) throw vRes.error;
  if (iRes.error) throw iRes.error;

  const products = pRes.data ?? [];
  const variants = vRes.data ?? [];
  const images = iRes.data ?? [];

  return products.map((p) =>
    rowToProduct(
      p,
      variants.filter((v) => v.product_id === p.id),
      images.filter((i) => i.product_id === p.id)
    )
  );
}
