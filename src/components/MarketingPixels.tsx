"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSiteConfigStore } from "@/lib/site-config-store";
import { track } from "@/lib/analytics";
import { getCookieConsent, onConsentChange } from "@/components/CookieBanner";

/**
 * Inyecta Meta Pixel y GA4 si están configurados desde admin → Configuración
 * Y el usuario otorgó consent (Ley 1581 Colombia). Sin consent no se carga
 * absolutamente nada de tracking.
 *
 * Dispara PageView en cada cambio de ruta (App Router no recarga en navegación).
 */
export default function MarketingPixels() {
  const metaPixelId = useSiteConfigStore((s) => s.metaPixelId);
  const gaId = useSiteConfigStore((s) => s.gaMeasurementId);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPageViewSent = useRef(false);

  // Consent del usuario para cookies de marketing/analytics.
  const [consentGranted, setConsentGranted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsentGranted(getCookieConsent() === "granted");
    return onConsentChange((s) => setConsentGranted(s === "granted"));
  }, []);

  // Meta Pixel — bootstrap una sola vez (solo si hay consent)
  useEffect(() => {
    if (!consentGranted) return;
    if (!metaPixelId) return;
    if (typeof window === "undefined") return;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const w = window as any;
    if (w.fbq) return;

    const fbq: any = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    w.fbq = fbq;
    w._fbq = fbq;

    const exists = document.querySelector<HTMLScriptElement>(
      `script[src*="connect.facebook.net/en_US/fbevents.js"]`
    );
    if (!exists) {
      const s = document.createElement("script");
      s.async = true;
      s.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(s);
    }
    fbq("init", metaPixelId);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [metaPixelId, consentGranted]);

  // GA4 — bootstrap una sola vez (solo con consent)
  useEffect(() => {
    if (!consentGranted) return;
    if (!gaId) return;
    if (typeof window === "undefined") return;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    if (!w.gtag) {
      w.gtag = function gtag(...args: unknown[]) {
        w.dataLayer.push(args);
      };
    }
    const exists = document.querySelector<HTMLScriptElement>(
      `script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`
    );
    if (!exists) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(s);
    }
    w.gtag("js", new Date());
    // send_page_view: false porque lo manejamos manualmente para SPA
    w.gtag("config", gaId, { send_page_view: false });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [gaId, consentGranted]);

  // PageView en cada cambio de ruta (incluye la inicial) — solo si hay consent
  useEffect(() => {
    if (!consentGranted) return;
    if (!metaPixelId && !gaId) return;
    if (typeof window === "undefined") return;
    // Pequeño defer para que el script del pixel termine de inicializarse en la primera carga
    const t = setTimeout(() => {
      track("page_view");
      initialPageViewSent.current = true;
    }, initialPageViewSent.current ? 0 : 200);
    return () => clearTimeout(t);
    // searchParams en deps para captar también query-string changes
  }, [pathname, searchParams, metaPixelId, gaId, consentGranted]);

  if (!metaPixelId || !consentGranted) return null;
  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
