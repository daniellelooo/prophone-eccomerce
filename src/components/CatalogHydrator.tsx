"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/lib/catalog-store";
import { useSiteConfigStore } from "@/lib/site-config-store";

/**
 * Rehidrata todos los stores que persisten en localStorage.
 * Va una vez por sesión, montado en el root layout.
 */
export default function CatalogHydrator() {
  useEffect(() => {
    useCatalogStore.persist.rehydrate();
    useSiteConfigStore.persist.rehydrate();
  }, []);
  return null;
}
