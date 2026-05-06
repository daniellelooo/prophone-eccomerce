import { describe, it, expect } from "vitest";
import {
  getMinPrice,
  getMaxPrice,
  hasMultipleVariants,
  getDiscountPct,
  hasActivePromotion,
  getBestDiscountPct,
  getProductsOnPromo,
  getDefaultVariant,
  formatPrice,
  type Product,
  type Variant,
} from "../products";

const variant = (overrides: Partial<Variant> = {}): Variant => ({
  sku: "test-sku",
  condition: "nuevo",
  price: 1000000,
  inStock: true,
  ...overrides,
});

const product = (variants: Variant[]): Product => ({
  id: "test",
  slug: "test",
  name: "Test product",
  category: "iphone",
  description: "",
  shortDescription: "",
  image: "",
  images: [],
  colors: [],
  features: [],
  variants,
});

/**
 * Estos tests cubren lógica que afecta directamente lo que el cliente paga
 * y ve. Si algo aquí falla en producción es plata perdida o muestra precios
 * incorrectos — por eso se considera crítico.
 */
describe("products: pricing helpers", () => {
  it("getMinPrice retorna 0 si no hay variantes", () => {
    expect(getMinPrice(product([]))).toBe(0);
  });

  it("getMinPrice y getMaxPrice consideran todas las variantes", () => {
    const p = product([
      variant({ price: 2000000 }),
      variant({ price: 1500000, sku: "v2" }),
      variant({ price: 3000000, sku: "v3" }),
    ]);
    expect(getMinPrice(p)).toBe(1500000);
    expect(getMaxPrice(p)).toBe(3000000);
  });

  it("hasMultipleVariants es true sólo con 2+", () => {
    expect(hasMultipleVariants(product([variant()]))).toBe(false);
    expect(
      hasMultipleVariants(
        product([variant(), variant({ sku: "v2" })])
      )
    ).toBe(true);
  });

  it("getDefaultVariant prefiere la más barata en stock", () => {
    const p = product([
      variant({ price: 2000000, inStock: true, sku: "a" }),
      variant({ price: 1500000, inStock: false, sku: "b" }),
      variant({ price: 1800000, inStock: true, sku: "c" }),
    ]);
    expect(getDefaultVariant(p)?.sku).toBe("c");
  });

  it("getDefaultVariant cae a la más barata si ninguna tiene stock", () => {
    const p = product([
      variant({ price: 2000000, inStock: false, sku: "a" }),
      variant({ price: 1500000, inStock: false, sku: "b" }),
    ]);
    expect(getDefaultVariant(p)?.sku).toBe("b");
  });
});

describe("products: promo / discount logic", () => {
  it("getDiscountPct es null cuando comparePrice no existe", () => {
    expect(getDiscountPct(variant({ price: 1000000 }))).toBeNull();
  });

  it("getDiscountPct es null cuando comparePrice <= price (no hay descuento real)", () => {
    expect(
      getDiscountPct(variant({ price: 1000000, comparePrice: 1000000 }))
    ).toBeNull();
    expect(
      getDiscountPct(variant({ price: 1000000, comparePrice: 800000 }))
    ).toBeNull();
  });

  it("getDiscountPct calcula el % entero correctamente", () => {
    // 50% off: antes 2M, ahora 1M
    expect(
      getDiscountPct(variant({ price: 1000000, comparePrice: 2000000 }))
    ).toBe(50);
    // 25% off: antes 4M, ahora 3M
    expect(
      getDiscountPct(variant({ price: 3000000, comparePrice: 4000000 }))
    ).toBe(25);
  });

  it("hasActivePromotion detecta si CUALQUIER variante tiene descuento", () => {
    const sinPromo = product([variant({ price: 1000000 })]);
    expect(hasActivePromotion(sinPromo)).toBe(false);

    const conPromo = product([
      variant({ price: 1000000, sku: "a" }),
      variant({ price: 800000, comparePrice: 1000000, sku: "b" }),
    ]);
    expect(hasActivePromotion(conPromo)).toBe(true);
  });

  it("getBestDiscountPct retorna el mayor descuento de todas las variantes", () => {
    const p = product([
      variant({ price: 900000, comparePrice: 1000000, sku: "a" }), // 10%
      variant({ price: 500000, comparePrice: 1000000, sku: "b" }), // 50%
      variant({ price: 1000000, sku: "c" }), // sin
    ]);
    expect(getBestDiscountPct(p)).toBe(50);
  });

  it("getProductsOnPromo filtra correctamente", () => {
    const p1 = product([variant({ price: 1000000 })]);
    const p2 = product([
      variant({ price: 800000, comparePrice: 1000000 }),
    ]);
    const list = getProductsOnPromo([p1, p2]);
    expect(list).toHaveLength(1);
    expect(list[0]).toBe(p2);
  });
});

describe("products: formatPrice", () => {
  it("formatea precios en COP sin decimales", () => {
    const formatted = formatPrice(2350000);
    // formato es-CO usa "$" con espacio non-breaking — no asumimos el separador exacto, solo que el número aparece
    expect(formatted).toContain("2");
    expect(formatted).toContain("350");
    expect(formatted).toContain("000");
    // No debe terminar con decimales (",00" o ".00" al final)
    expect(formatted).not.toMatch(/[.,]\d{2}$/);
  });

  it("retorna $0 para 0", () => {
    expect(formatPrice(0)).toMatch(/0/);
  });
});
