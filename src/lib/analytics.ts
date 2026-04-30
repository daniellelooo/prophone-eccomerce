"use client";

/**
 * Helpers de tracking para Meta Pixel y Google Analytics 4.
 *
 * Los IDs se inyectan desde admin → Configuración → Pixels de marketing
 * vía <MarketingPixels />. Los helpers aquí son fail-safe: si el pixel
 * no está cargado, no hacen nada.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type FBEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Search"
  | "Lead";

type GA4EventName =
  | "page_view"
  | "view_item"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "search";

type CommonItem = {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
};

export type TrackParams = {
  value?: number;
  currency?: string;
  contentName?: string;
  contentCategory?: string;
  contentIds?: string[];
  items?: CommonItem[];
  orderId?: string;
  searchString?: string;
};

/** Dispara un evento al Pixel (si está cargado). */
export function fbqTrack(event: FBEventName, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (typeof w.fbq !== "function") return;
  try {
    if (params) w.fbq("track", event, params);
    else w.fbq("track", event);
  } catch (err) {
    console.warn("[fbq] failed", err);
  }
}

/** Dispara un evento a GA4 (si está cargado). */
export function gtagTrack(event: GA4EventName, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (typeof w.gtag !== "function") return;
  try {
    if (params) w.gtag("event", event, params);
    else w.gtag("event", event);
  } catch (err) {
    console.warn("[gtag] failed", err);
  }
}

/** Helper de alto nivel: dispara el evento equivalente en Pixel y GA4. */
export function track(
  event:
    | "page_view"
    | "view_content"
    | "add_to_cart"
    | "initiate_checkout"
    | "purchase"
    | "search",
  params: TrackParams = {}
) {
  const currency = params.currency ?? "COP";
  const ga4Items = params.items?.map((it) => ({
    item_id: it.id,
    item_name: it.name,
    item_category: it.category,
    price: it.price,
    quantity: it.quantity,
  }));

  switch (event) {
    case "page_view": {
      fbqTrack("PageView");
      gtagTrack("page_view");
      break;
    }
    case "view_content": {
      fbqTrack("ViewContent", {
        content_name: params.contentName,
        content_category: params.contentCategory,
        content_ids: params.contentIds,
        content_type: "product",
        value: params.value,
        currency,
      });
      gtagTrack("view_item", {
        currency,
        value: params.value,
        items: ga4Items,
      });
      break;
    }
    case "add_to_cart": {
      fbqTrack("AddToCart", {
        content_name: params.contentName,
        content_ids: params.contentIds,
        content_type: "product",
        value: params.value,
        currency,
      });
      gtagTrack("add_to_cart", {
        currency,
        value: params.value,
        items: ga4Items,
      });
      break;
    }
    case "initiate_checkout": {
      fbqTrack("InitiateCheckout", {
        content_ids: params.contentIds,
        content_type: "product",
        num_items: params.items?.reduce((s, i) => s + i.quantity, 0),
        value: params.value,
        currency,
      });
      gtagTrack("begin_checkout", {
        currency,
        value: params.value,
        items: ga4Items,
      });
      break;
    }
    case "purchase": {
      fbqTrack("Purchase", {
        content_ids: params.contentIds,
        content_type: "product",
        value: params.value,
        currency,
        order_id: params.orderId,
      });
      gtagTrack("purchase", {
        transaction_id: params.orderId,
        currency,
        value: params.value,
        items: ga4Items,
      });
      break;
    }
    case "search": {
      fbqTrack("Search", { search_string: params.searchString });
      gtagTrack("search", { search_term: params.searchString });
      break;
    }
  }
}
