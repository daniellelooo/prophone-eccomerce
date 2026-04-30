"use client";

import { useEffect } from "react";
import { useSiteConfigStore } from "@/lib/site-config-store";

/**
 * Inyecta Meta Pixel y GA4 si están configurados desde admin → Configuración.
 * Solo carga scripts si los IDs están presentes; nada se inyecta sin config.
 */
export default function MarketingPixels() {
  const metaPixelId = useSiteConfigStore((s) => s.metaPixelId);
  const gaId = useSiteConfigStore((s) => s.gaMeasurementId);

  // Meta Pixel
  useEffect(() => {
    if (!metaPixelId) return;
    if (typeof window === "undefined") return;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const w = window as any;
    if (w.fbq) {
      w.fbq("track", "PageView");
      return;
    }
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
    fbq("track", "PageView");
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [metaPixelId]);

  // Google Analytics 4
  useEffect(() => {
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
    w.gtag("config", gaId);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }, [gaId]);

  if (!metaPixelId) return null;
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
