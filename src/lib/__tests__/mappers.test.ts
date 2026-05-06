import { describe, it, expect } from "vitest";
import { configRowsToSiteConfig } from "../supabase/mappers";
import { DEFAULT_SITE_CONFIG } from "../site-config-store";

type Row = { key: string; value: unknown; updated_at: string };

const row = (key: string, value: unknown): Row => ({
  key,
  value,
  updated_at: "2026-05-06T00:00:00Z",
});

/**
 * Estos tests son la red de seguridad para cuando se agregan campos nuevos
 * a SiteConfig. Si la fila no existe en DB (migración pendiente, seed
 * incompleto), el mapper TIENE que caer al default — si no, la web
 * rompe en producción con `Cannot read properties of undefined`.
 */
describe("configRowsToSiteConfig: fallback a defaults", () => {
  it("sin filas, retorna 100% defaults", () => {
    const cfg = configRowsToSiteConfig([], []);
    expect(cfg.whatsappNumber).toBe(DEFAULT_SITE_CONFIG.whatsappNumber);
    expect(cfg.heroImagesDesktop).toEqual(
      DEFAULT_SITE_CONFIG.heroImagesDesktop
    );
    expect(cfg.featuredOffers).toEqual(DEFAULT_SITE_CONFIG.featuredOffers);
    expect(cfg.landingTexts).toEqual(DEFAULT_SITE_CONFIG.landingTexts);
  });

  it("override parcial: aplica el valor de DB sin afectar otros campos", () => {
    const cfg = configRowsToSiteConfig(
      [row("whatsapp_number", "573001112233")],
      []
    );
    expect(cfg.whatsappNumber).toBe("573001112233");
    expect(cfg.instagramUrl).toBe(DEFAULT_SITE_CONFIG.instagramUrl);
  });

  it("landing_texts: merge con defaults — campo nuevo en código pero no en DB no rompe", () => {
    // Simulamos que en DB sólo hay heroLine1 (resto faltante)
    const cfg = configRowsToSiteConfig(
      [row("landing_texts", { heroLine1: "Custom" })],
      []
    );
    expect(cfg.landingTexts.heroLine1).toBe("Custom");
    // Los demás campos vienen del default
    expect(cfg.landingTexts.heroDescription).toBe(
      DEFAULT_SITE_CONFIG.landingTexts.heroDescription
    );
    expect(cfg.landingTexts.ecosystemTitle).toBe(
      DEFAULT_SITE_CONFIG.landingTexts.ecosystemTitle
    );
  });

  it("respeta sedes pasadas como parámetro", () => {
    const sedes = [
      { id: "s1", name: "Test", area: "Test", detail: "Test" },
    ];
    const cfg = configRowsToSiteConfig([], sedes);
    expect(cfg.sedes).toEqual(sedes);
  });

  it("featured_offers se reemplaza completo (no merge), no es Partial", () => {
    const customOffers = [
      {
        id: "x",
        badge: "Test",
        badgeStyle: "primary" as const,
        title: "X",
        subtitle: "X",
        image: "/x.jpg",
        price: 100000,
        href: "/x",
      },
    ];
    const cfg = configRowsToSiteConfig(
      [row("featured_offers", customOffers)],
      []
    );
    expect(cfg.featuredOffers).toEqual(customOffers);
    expect(cfg.featuredOffers).toHaveLength(1);
  });
});
