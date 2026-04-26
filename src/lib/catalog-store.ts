"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { products as defaultProducts, type Product } from "./products";

type CatalogState = {
  products: Product[];
  upsert: (product: Product) => void;
  remove: (id: string) => void;
  setAll: (products: Product[]) => void;
  reset: () => void;
};

/**
 * Catálogo persistido en localStorage.
 *
 * `skipHydration: true` evita el mismatch SSR/cliente: el primer render del
 * cliente usa los defaults (igual que el server), y un componente
 * <CatalogHydrator/> dispara `rehydrate()` después de montar.
 *
 * Cuando exista backend, este store se reemplaza por una capa de fetch /
 * server actions sin cambiar consumidores (mantienen la misma API).
 */
export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      products: defaultProducts,

      upsert: (product) =>
        set((state) => {
          const exists = state.products.some((p) => p.id === product.id);
          return {
            products: exists
              ? state.products.map((p) => (p.id === product.id ? product : p))
              : [...state.products, product],
          };
        }),

      remove: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      setAll: (products) => set({ products }),

      reset: () => set({ products: defaultProducts }),
    }),
    {
      name: "prophone-catalog-v1",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);
