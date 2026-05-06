"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  AtSign,
  Image as ImageIcon,
  Search,
  BarChart3,
  Building2,
  Package,
  LayoutGrid,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useSiteConfigStore,
  type FeaturedOffer,
} from "@/lib/site-config-store";
import {
  Section,
  Label,
  ImageGallery,
  SingleImageInput,
} from "@/components/admin/AdminUI";

export default function AdminConfiguracionPage() {
  const cfg = useSiteConfigStore();
  const update = useSiteConfigStore((s) => s.update);

  const [draftWA, setDraftWA] = useState(cfg.whatsappNumber);
  const [draftWAMsg, setDraftWAMsg] = useState(cfg.whatsappDefaultMessage);
  const [draftIG, setDraftIG] = useState(cfg.instagramUrl);
  const [draftTT, setDraftTT] = useState(cfg.tiktokUrl);
  const [draftFB, setDraftFB] = useState(cfg.facebookUrl);

  const [draftHeroTitle, setDraftHeroTitle] = useState(cfg.heroTitle);
  const [draftHeroSub, setDraftHeroSub] = useState(cfg.heroSubtitle);
  const [draftHoursWeek, setDraftHoursWeek] = useState(cfg.hoursWeek);
  const [draftHoursWeekend, setDraftHoursWeekend] = useState(cfg.hoursWeekend);
  const [draftFooter, setDraftFooter] = useState(cfg.footerTagline);

  const [draftSeoTitle, setDraftSeoTitle] = useState(cfg.seoTitle);
  const [draftSeoDesc, setDraftSeoDesc] = useState(cfg.seoDescription);
  const [draftOgImage, setDraftOgImage] = useState(cfg.ogImageUrl);

  const [draftPixel, setDraftPixel] = useState(cfg.metaPixelId);
  const [draftGa, setDraftGa] = useState(cfg.gaMeasurementId);

  const [draftLowStock, setDraftLowStock] = useState(cfg.stockLowThreshold);

  // "El precio manda" — bento de 3 ofertas editables
  const [draftOffers, setDraftOffers] = useState<FeaturedOffer[]>(
    cfg.featuredOffers
  );

  // Override de imágenes del ecosistema Apple (CategoryShowcase)
  const [draftShowcase, setDraftShowcase] = useState(
    cfg.categoryShowcaseOverrides
  );

  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const flash = (key: string) => {
    setSavedKey(key);
    setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 1800);
  };

  const trySave = async (key: string, fn: () => Promise<void>) => {
    setErrorMsg(null);
    try {
      await fn();
      flash(key);
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
          Configuración del sitio
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Header, redes sociales, SEO, pixels de marketing e inventario.
        </p>
      </motion.div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Hero / Header del home */}
      <Section
        icon={<ImageIcon size={16} className="text-[#CC0000]" />}
        title="Header del home"
        desc="Carruseles e imagenes destacadas que ven los clientes al entrar."
        onSave={() =>
          trySave("hero", () =>
            update({
              heroTitle: draftHeroTitle.trim(),
              heroSubtitle: draftHeroSub.trim(),
            })
          )
        }
        saved={savedKey === "hero"}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Título del hero (opcional)</Label>
              <input
                value={draftHeroTitle}
                onChange={(e) => setDraftHeroTitle(e.target.value)}
                placeholder="iPhone 17 Pro disponible"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              />
            </div>
            <div>
              <Label>Subtítulo del hero (opcional)</Label>
              <input
                value={draftHeroSub}
                onChange={(e) => setDraftHeroSub(e.target.value)}
                placeholder="Garantía oficial · Envío gratis"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              />
            </div>
          </div>

          <ImageGallery
            label="Carrusel desktop (imágenes verticales 4:5)"
            images={cfg.heroImagesDesktop}
            onChange={(imgs) =>
              trySave("hero-desktop", () =>
                update({ heroImagesDesktop: imgs })
              )
            }
            saved={savedKey === "hero-desktop"}
          />

          <ImageGallery
            label="Carrusel mobile (imágenes horizontales 16:9)"
            images={cfg.heroImagesMobile}
            onChange={(imgs) =>
              trySave("hero-mobile", () =>
                update({ heroImagesMobile: imgs })
              )
            }
            saved={savedKey === "hero-mobile"}
          />
        </div>
      </Section>

      {/* Ecosistema Apple — override de imágenes por categoría */}
      <Section
        icon={<LayoutGrid size={16} className="text-[#CC0000]" />}
        title='Ecosistema Apple — "El ecosistema, a precio reseller"'
        desc="Imagen de portada por categoría en la sección del ecosistema. Si la dejas vacía, se usa automáticamente la del producto destacado de esa categoría."
        onSave={() =>
          trySave("showcase", () =>
            update({ categoryShowcaseOverrides: draftShowcase })
          )
        }
        saved={savedKey === "showcase"}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SingleImageInput
            label="iPhone"
            url={draftShowcase.iphone}
            onChange={(url) =>
              setDraftShowcase((s) => ({ ...s, iphone: url }))
            }
          />
          <SingleImageInput
            label="MacBook"
            url={draftShowcase.macbook}
            onChange={(url) =>
              setDraftShowcase((s) => ({ ...s, macbook: url }))
            }
          />
          <SingleImageInput
            label="iPad"
            url={draftShowcase.ipad}
            onChange={(url) => setDraftShowcase((s) => ({ ...s, ipad: url }))}
          />
          <SingleImageInput
            label="Apple Watch"
            url={draftShowcase.watch}
            onChange={(url) =>
              setDraftShowcase((s) => ({ ...s, watch: url }))
            }
          />
          <SingleImageInput
            label="Accesorios"
            url={draftShowcase.accesorios}
            onChange={(url) =>
              setDraftShowcase((s) => ({ ...s, accesorios: url }))
            }
          />
        </div>
      </Section>

      {/* "El precio manda" — bento de ofertas destacadas */}
      <Section
        icon={<Sparkles size={16} className="text-[#CC0000]" />}
        title='Ofertas destacadas — "El precio manda"'
        desc="Las 3 tarjetas del bento debajo del ecosistema. La primera se renderiza grande y las siguientes en grilla. Edita imagen, precio, badge y link de cada una."
        onSave={() =>
          trySave("offers", () =>
            update({
              featuredOffers: draftOffers
                .map((o) => ({
                  ...o,
                  badge: o.badge.trim(),
                  title: o.title.trim(),
                  subtitle: o.subtitle.trim(),
                  image: o.image.trim(),
                  href: o.href.trim() || "/catalogo",
                  price: Number(o.price) || 0,
                }))
                .filter((o) => o.title.length > 0),
            })
          )
        }
        saved={savedKey === "offers"}
      >
        <div className="space-y-4">
          {draftOffers.map((offer, i) => (
            <div
              key={offer.id || i}
              className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Tile #{i + 1} {i === 0 && "· Grande"}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDraftOffers((d) => d.filter((_, idx) => idx !== i))
                  }
                  className="text-[#CC0000] hover:bg-red-50 p-1.5 rounded-lg transition"
                  aria-label="Eliminar"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <SingleImageInput
                label="Imagen del producto"
                url={offer.image}
                onChange={(url) =>
                  setDraftOffers((d) => {
                    const next = [...d];
                    next[i] = { ...next[i], image: url };
                    return next;
                  })
                }
              />

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Badge / etiqueta</Label>
                  <input
                    value={offer.badge}
                    onChange={(e) =>
                      setDraftOffers((d) => {
                        const next = [...d];
                        next[i] = { ...next[i], badge: e.target.value };
                        return next;
                      })
                    }
                    placeholder="Nuevo · Sellado"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                  />
                </div>
                <div>
                  <Label>Color del badge</Label>
                  <select
                    value={offer.badgeStyle}
                    onChange={(e) =>
                      setDraftOffers((d) => {
                        const next = [...d];
                        next[i] = {
                          ...next[i],
                          badgeStyle: e.target.value as FeaturedOffer["badgeStyle"],
                        };
                        return next;
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                  >
                    <option value="primary">Rojo (destacado)</option>
                    <option value="dark">Negro</option>
                    <option value="subtle">Gris claro</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Título del tile</Label>
                <input
                  value={offer.title}
                  onChange={(e) =>
                    setDraftOffers((d) => {
                      const next = [...d];
                      next[i] = { ...next[i], title: e.target.value };
                      return next;
                    })
                  }
                  placeholder="iPhone 16. Recién llegado."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                />
              </div>

              <div>
                <Label>Subtítulo / descripción corta</Label>
                <textarea
                  value={offer.subtitle}
                  onChange={(e) =>
                    setDraftOffers((d) => {
                      const next = [...d];
                      next[i] = { ...next[i], subtitle: e.target.value };
                      return next;
                    })
                  }
                  rows={2}
                  placeholder="128 GB · Garantía oficial Apple"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Precio (COP, sin separadores)</Label>
                  <input
                    type="number"
                    value={offer.price}
                    onChange={(e) =>
                      setDraftOffers((d) => {
                        const next = [...d];
                        next[i] = {
                          ...next[i],
                          price: Number(e.target.value) || 0,
                        };
                        return next;
                      })
                    }
                    placeholder="2950000"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                  />
                </div>
                <div>
                  <Label>Link de destino</Label>
                  <input
                    value={offer.href}
                    onChange={(e) =>
                      setDraftOffers((d) => {
                        const next = [...d];
                        next[i] = { ...next[i], href: e.target.value };
                        return next;
                      })
                    }
                    placeholder="/catalogo"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setDraftOffers((d) => [
                ...d,
                {
                  id: `tile-${Date.now()}`,
                  badge: "Oferta",
                  badgeStyle: "primary",
                  title: "",
                  subtitle: "",
                  image: "",
                  price: 0,
                  href: "/catalogo",
                },
              ])
            }
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#CC0000] hover:bg-red-50 px-3 py-2 rounded-lg transition"
          >
            <Plus size={13} /> Agregar tile
          </button>
          <p className="text-[11px] text-neutral-400">
            💡 El primer tile se renderiza grande con foto flotante. Los siguientes son horizontales más compactos. Para que la sección no aparezca, borra todos los tiles.
          </p>
        </div>
      </Section>

      {/* WhatsApp */}
      <Section
        icon={<MessageCircle size={16} className="text-[#25D366]" />}
        title="WhatsApp"
        desc="Aparece en navbar, bottom nav, footer, ficha de producto, carrito y checkout."
        onSave={() =>
          trySave("wa", async () => {
            const sanitized = draftWA.replace(/\D/g, "");
            if (sanitized.length < 10) {
              throw new Error(
                "El número debe incluir el código de país (ej: 573148941200)"
              );
            }
            await update({
              whatsappNumber: sanitized,
              whatsappDefaultMessage: draftWAMsg.trim(),
            });
          })
        }
        saved={savedKey === "wa"}
      >
        <div className="space-y-3">
          <div>
            <Label>Número (con código país, sin espacios ni +)</Label>
            <input
              value={draftWA}
              onChange={(e) => setDraftWA(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="573148941200"
            />
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Formato wa.me — solo dígitos. Ejemplo Colombia: 573148941200
            </p>
          </div>
          <div>
            <Label>Mensaje por defecto</Label>
            <textarea
              value={draftWAMsg}
              onChange={(e) => setDraftWAMsg(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 resize-none"
              placeholder="Hola, me interesa un producto de Prophone…"
            />
          </div>
          <a
            href={`https://wa.me/${draftWA.replace(/\D/g, "")}${
              draftWAMsg ? `?text=${encodeURIComponent(draftWAMsg)}` : ""
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[#25D366] font-semibold hover:underline"
          >
            <MessageCircle size={12} />
            Probar enlace
          </a>
        </div>
      </Section>

      {/* Redes sociales */}
      <Section
        icon={<AtSign size={16} className="text-pink-500" />}
        title="Redes sociales"
        desc="URLs completas. Aparecen en footer y links del sitio."
        onSave={() =>
          trySave("redes", () =>
            update({
              instagramUrl: draftIG.trim(),
              tiktokUrl: draftTT.trim(),
              facebookUrl: draftFB.trim(),
            })
          )
        }
        saved={savedKey === "redes"}
      >
        <div className="space-y-3">
          <div>
            <Label>Instagram</Label>
            <input
              value={draftIG}
              onChange={(e) => setDraftIG(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="https://www.instagram.com/prophone_medellin/"
            />
          </div>
          <div>
            <Label>TikTok</Label>
            <input
              value={draftTT}
              onChange={(e) => setDraftTT(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="https://www.tiktok.com/@prophone"
            />
          </div>
          <div>
            <Label>Facebook</Label>
            <input
              value={draftFB}
              onChange={(e) => setDraftFB(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="https://facebook.com/prophone"
            />
          </div>
        </div>
      </Section>

      {/* Horarios + footer */}
      <Section
        icon={<Building2 size={16} className="text-neutral-500" />}
        title="Horarios y footer"
        desc="Aparecen en footer, contacto y página de sedes."
        onSave={() =>
          trySave("hours", () =>
            update({
              hoursWeek: draftHoursWeek.trim(),
              hoursWeekend: draftHoursWeekend.trim(),
              footerTagline: draftFooter.trim(),
            })
          )
        }
        saved={savedKey === "hours"}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Horario lun-sáb</Label>
              <input
                value={draftHoursWeek}
                onChange={(e) => setDraftHoursWeek(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              />
            </div>
            <div>
              <Label>Horario fin de semana / festivos</Label>
              <input
                value={draftHoursWeekend}
                onChange={(e) => setDraftHoursWeekend(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              />
            </div>
          </div>
          <div>
            <Label>Tagline del footer</Label>
            <input
              value={draftFooter}
              onChange={(e) => setDraftFooter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="Reseller Apple en Medellín, Colombia."
            />
          </div>
        </div>
      </Section>

      {/* SEO */}
      <Section
        icon={<Search size={16} className="text-blue-500" />}
        title="SEO"
        desc="Título, descripción e imagen Open Graph para Google y previsualizaciones en redes."
        onSave={() =>
          trySave("seo", () =>
            update({
              seoTitle: draftSeoTitle.trim(),
              seoDescription: draftSeoDesc.trim(),
              ogImageUrl: draftOgImage.trim(),
            })
          )
        }
        saved={savedKey === "seo"}
      >
        <div className="space-y-3">
          <div>
            <Label>Título por defecto (≤ 60 caracteres ideal)</Label>
            <input
              value={draftSeoTitle}
              onChange={(e) => setDraftSeoTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              {draftSeoTitle.length}/60
            </p>
          </div>
          <div>
            <Label>Meta descripción (≤ 160 caracteres ideal)</Label>
            <textarea
              value={draftSeoDesc}
              onChange={(e) => setDraftSeoDesc(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 resize-none"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              {draftSeoDesc.length}/160
            </p>
          </div>
          <div>
            <Label>Imagen Open Graph (1200×630)</Label>
            <input
              value={draftOgImage}
              onChange={(e) => setDraftOgImage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="https://… o /og.png"
            />
          </div>
        </div>
      </Section>

      {/* Marketing pixels */}
      <Section
        icon={<BarChart3 size={16} className="text-purple-500" />}
        title="Pixels de marketing"
        desc="Se cargan automáticamente en todas las páginas. Solo se inyectan si pones un ID."
        onSave={() =>
          trySave("pixels", () =>
            update({
              metaPixelId: draftPixel.trim(),
              gaMeasurementId: draftGa.trim(),
            })
          )
        }
        saved={savedKey === "pixels"}
      >
        <div className="space-y-3">
          <div>
            <Label>Meta Pixel ID</Label>
            <input
              value={draftPixel}
              onChange={(e) => setDraftPixel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="123456789012345"
            />
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Lo encuentras en Meta Business Suite → Píxeles. Las ventas web
              aquí coinciden con las del dashboard (no se mezclan con local).
            </p>
          </div>
          <div>
            <Label>Google Analytics 4 (Measurement ID)</Label>
            <input
              value={draftGa}
              onChange={(e) => setDraftGa(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>
      </Section>

      {/* Inventario */}
      <Section
        icon={<Package size={16} className="text-amber-500" />}
        title="Inventario"
        desc="Configuración de alertas de stock."
        onSave={() =>
          trySave("inv", () =>
            update({
              stockLowThreshold: Math.max(0, Number(draftLowStock) || 0),
            })
          )
        }
        saved={savedKey === "inv"}
      >
        <div>
          <Label>Umbral de stock crítico (unidades)</Label>
          <input
            type="number"
            min={0}
            value={draftLowStock}
            onChange={(e) => setDraftLowStock(Number(e.target.value) || 0)}
            className="w-32 px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
          />
          <p className="text-[11px] text-neutral-400 mt-1.5">
            Variantes con stock ≤ este valor se marcan como críticas en
            productos y aparecen como alerta.
          </p>
        </div>
      </Section>
    </div>
  );
}

