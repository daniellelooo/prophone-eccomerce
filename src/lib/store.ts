"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Variant } from "./products";
import { getDefaultVariant } from "./products";

export type CartItem = {
  product: Product;
  variant: Variant;
  quantity: number;
  selectedColor?: string;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (
    product: Product,
    options?: { variant?: Variant; color?: string }
  ) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, options) => {
        const variant = options?.variant ?? getDefaultVariant(product);
        if (!variant) return;

        set((state) => {
          const existing = state.items.find(
            (item) => item.variant.sku === variant.sku
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variant.sku === variant.sku
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
              isOpen: true,
            };
          }
          return {
            items: [
              ...state.items,
              {
                product,
                variant,
                quantity: 1,
                selectedColor: options?.color,
              },
            ],
            isOpen: true,
          };
        });
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((item) => item.variant.sku !== sku),
        }));
      },

      updateQuantity: (sku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.variant.sku === sku ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.variant.price * item.quantity,
          0
        ),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "prophone-cart-v2" }
  )
);
