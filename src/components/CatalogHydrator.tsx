"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/lib/catalog-store";
import { useSiteConfigStore } from "@/lib/site-config-store";

/**
 * Hidrata catálogo + configuración desde Supabase apenas el cliente monta.
 * El primer render usa los defaults del código (igual que SSR), después se
 * reemplazan con la data real sin causar hydration mismatch.
 */
export default function CatalogHydrator() {
  useEffect(() => {
    void useCatalogStore.getState().hydrate();
    void useSiteConfigStore.getState().hydrate();
  }, []);
  return null;
}
