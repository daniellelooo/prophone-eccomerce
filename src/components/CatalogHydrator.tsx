"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/lib/catalog-store";

/**
 * Lee el catálogo desde localStorage en el cliente y rehidrata el store.
 * Va una vez por sesión, montado en el root layout.
 */
export default function CatalogHydrator() {
  useEffect(() => {
    useCatalogStore.persist.rehydrate();
  }, []);
  return null;
}
