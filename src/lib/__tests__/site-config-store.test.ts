import { describe, it, expect } from "vitest";
import { getWhatsappUrl } from "../site-config-store";

/**
 * Bug histórico: un botón usaba `https://wa.me/573001234567` hardcoded.
 * Estos tests garantizan que getWhatsappUrl produce siempre URLs válidas
 * de wa.me, sin importar qué basura le entre como número.
 */
describe("getWhatsappUrl", () => {
  it("genera una URL válida con número limpio", () => {
    expect(getWhatsappUrl("573148941200")).toBe("https://wa.me/573148941200");
  });

  it("sanitiza dígitos: descarta +, espacios y guiones", () => {
    expect(getWhatsappUrl("+57 314 8941200")).toBe(
      "https://wa.me/573148941200"
    );
    expect(getWhatsappUrl("(57) 314-894-1200")).toBe(
      "https://wa.me/573148941200"
    );
  });

  it("agrega ?text= cuando hay mensaje", () => {
    const url = getWhatsappUrl("573148941200", "Hola, me interesa");
    expect(url).toContain("https://wa.me/573148941200");
    expect(url).toContain("?text=");
    expect(url).toContain("Hola");
  });

  it("encodeURI maneja caracteres especiales en mensajes", () => {
    const url = getWhatsappUrl(
      "573148941200",
      "Precio del iPhone 16 (¿garantía?)"
    );
    // El & y los paréntesis y signos deben estar encodeados
    expect(url).toContain("%C2%BFgarant%C3%ADa%3F");
    expect(url).not.toContain("¿");
  });

  it("no agrega ?text= cuando el mensaje es vacío", () => {
    expect(getWhatsappUrl("573148941200", "")).toBe(
      "https://wa.me/573148941200"
    );
    expect(getWhatsappUrl("573148941200")).toBe(
      "https://wa.me/573148941200"
    );
  });
});
