"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  BadgeDollarSign,
  HeadphonesIcon,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Star,
  CreditCard,
  Gift,
  BadgeCheck,
  Truck,
  Heart,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import AnimatedSection from "@/components/AnimatedSection";
import CategoryShowcase from "@/components/CategoryShowcase";
import { formatPrice } from "@/lib/products";
import { useCatalogStore } from "@/lib/catalog-store";
import { useSiteConfigStore, getWhatsappUrl } from "@/lib/site-config-store";

function MobileCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const list = images.length > 0 ? images : [""];

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % list.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [list.length]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-white grid">
      {list.map((src, i) =>
        src ? (
          <div
            key={i}
            className={`col-start-1 row-start-1 transition-opacity duration-1000 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={src}
              alt={`Prophone ${i + 1}`}
              width={1080}
              height={1350}
              className="w-full h-auto block"
              priority={i === 0}
              unoptimized
            />
          </div>
        ) : null
      )}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-500 ${
              i === current ? "w-5 h-1.5 bg-[#CC0000]" : "w-1.5 h-1.5 bg-black/20"
            }`}
            aria-label={`Imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function HeroCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const list = images.length > 0 ? images : [""];

  useEffect(() => {
    if (list.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % list.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [list.length]);

  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] aspect-[4/5] bg-white shadow-[0_30px_60px_-25px_rgba(12,16,20,0.25)]">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {list[current] && (
            <Image
              src={list[current]}
              alt={`Prophone Medellín ${current + 1}`}
              fill
              className="object-contain"
              priority={current === 0}
              unoptimized
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {list.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-500 ${
              i === current ? "w-5 h-1.5 bg-[#CC0000]" : "w-1.5 h-1.5 bg-black/20"
            }`}
            aria-label={`Imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const products = useCatalogStore((s) => s.products);
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const sedes = useSiteConfigStore((s) => s.sedes);
  const hoursWeek = useSiteConfigStore((s) => s.hoursWeek);
  const hoursWeekend = useSiteConfigStore((s) => s.hoursWeekend);
  const whatsappNumber = useSiteConfigStore((s) => s.whatsappNumber);
  const whatsappMsg = useSiteConfigStore((s) => s.whatsappDefaultMessage);
  const instagramUrl = useSiteConfigStore((s) => s.instagramUrl);
  const heroImagesDesktop = useSiteConfigStore((s) => s.heroImagesDesktop);
  const heroImagesMobile = useSiteConfigStore((s) => s.heroImagesMobile);
  const promoEnabled = useSiteConfigStore((s) => s.promoEnabled);
  const promoLabel = useSiteConfigStore((s) => s.promoLabel);
  const promoHeroCta = useSiteConfigStore((s) => s.promoHeroCta);
  const featuredOffers = useSiteConfigStore((s) => s.featuredOffers);
  const t = useSiteConfigStore((s) => s.landingTexts);
  const WA_URL = getWhatsappUrl(whatsappNumber, whatsappMsg);

  // Estilos del badge según el tipo configurado en admin
  const badgeStyleClass = (style: "primary" | "dark" | "subtle") => {
    if (style === "dark") return "bg-neutral-900 text-white";
    if (style === "subtle") return "bg-neutral-100 text-neutral-700";
    return "bg-[#CC0000] text-white";
  };

  const bigOffer = featuredOffers[0];
  const smallOffers = featuredOffers.slice(1);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-[#FAFAFA] pt-24 pb-10 md:pt-28 md:pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
        {/* Decorative shape behind product */}
        <div
          className="absolute right-0 top-1/4 hidden lg:block w-[55vw] h-[80vh] bg-gradient-to-br from-[#CC0000] via-[#A00000] to-[#3a0000] -z-0"
          style={{
            clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
            transform: "translateX(20%)",
          }}
        />
        <div className="absolute right-0 top-1/4 hidden lg:block w-[55vw] h-[80vh] ribbon-stripe -z-0"
          style={{
            clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%)",
            transform: "translateX(20%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto w-full px-5 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-10 items-center lg:min-h-[calc(100svh-10rem)]">
            {/* Mobile carousel with floating stickers */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="order-1 lg:hidden mb-8 relative"
            >
              <MobileCarousel images={heroImagesMobile} />

              <motion.div
                initial={{ opacity: 0, rotate: -10, y: 10 }}
                animate={{ opacity: 1, rotate: -6, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -top-2 -left-2 z-20 bg-white rounded-2xl px-3 py-1.5 shadow-lg border border-neutral-100"
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Stock</p>
                <p className="text-xs font-bold text-neutral-900">Disponible hoy</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, rotate: 10, y: 10 }}
                animate={{ opacity: 1, rotate: 5, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -bottom-2 -right-2 z-20 bg-[#CC0000] text-white rounded-2xl px-3.5 py-2 shadow-xl"
              >
                <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">Desde</p>
                <p className="text-sm font-bold">{formatPrice(1420000)}</p>
              </motion.div>
            </motion.div>

            {/* Text — left 6 cols */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="text-[2.6rem] leading-[1.05] md:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold tracking-tight text-neutral-900 mb-6"
              >
                {t.heroLine1}
                {t.heroLine2 && (
                  <>
                    <br />
                    {t.heroLine2}
                  </>
                )}
                {t.heroLine3Accent && (
                  <>
                    <br />
                    <span className="text-[#CC0000]">{t.heroLine3Accent}</span>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="text-base md:text-lg text-neutral-600 mb-8 max-w-md leading-relaxed"
              >
                {t.heroDescription}
              </motion.p>

              {/* CTA promo destacado — solo cuando hay campaña activa */}
              {promoEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.22 }}
                  className="mb-4"
                >
                  <Link
                    href="/promociones"
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#CC0000]/30 text-[#CC0000] text-xs font-bold hover:bg-[#CC0000] hover:text-white hover:border-[#CC0000] transition-all shadow-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000] animate-pulse group-hover:bg-white" />
                    {promoHeroCta || promoLabel || "Ver promociones"}
                    <ArrowRight size={13} />
                  </Link>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-3 mb-10"
              >
                <Link
                  href="/catalogo"
                  className="group inline-flex items-center justify-center gap-2 bg-[#CC0000] text-white px-7 py-4 sm:py-[18px] rounded-2xl font-semibold text-base hover:bg-[#A00000] active:scale-95 transition-all shadow-lg shadow-[#CC0000]/30 ring-1 ring-[#CC0000]/40"
                >
                  {t.heroCtaPrimary}
                  <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-7 py-4 sm:py-[18px] rounded-2xl font-semibold text-base hover:bg-black active:scale-95 transition-all shadow-md shadow-neutral-900/15 ring-1 ring-white/10"
                >
                  <svg
                    className="w-[17px] h-[17px]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  {t.heroCtaSecondary}
                </a>
              </motion.div>

              {/* Inline trust strip — chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {[
                  { icon: <ShieldCheck size={13} />, text: "Garantía Apple 1 año" },
                  { icon: <Truck size={13} />, text: "Envío gratis" },
                  { icon: <CreditCard size={13} />, text: "Crédito Banco Bogotá" },
                  { icon: <Heart size={13} />, text: "+200K seguidores" },
                ].map((c) => (
                  <span
                    key={c.text}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-[11px] font-medium text-neutral-700"
                  >
                    <span className="text-[#CC0000]">{c.icon}</span>
                    {c.text}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Desktop product showcase — right 6 cols */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 order-1 lg:order-2 hidden lg:block"
            >
              <div className="relative">
                {/* Floating sticker badges */}
                <motion.div
                  initial={{ opacity: 0, rotate: -15, y: 10 }}
                  animate={{ opacity: 1, rotate: -8, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="absolute -top-3 -left-4 z-20 bg-white rounded-2xl px-3.5 py-2 shadow-lg border border-neutral-100"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Stock</p>
                  <p className="text-sm font-bold text-neutral-900">Disponible hoy</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, rotate: 15, y: 10 }}
                  animate={{ opacity: 1, rotate: 6, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="absolute -bottom-3 -right-3 z-20 bg-[#CC0000] text-white rounded-2xl px-4 py-2.5 shadow-xl"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Desde</p>
                  <p className="text-base font-bold">{formatPrice(1420000)}</p>
                </motion.div>

                <div className="max-w-[480px] mx-auto">
                  <HeroCarousel images={heroImagesDesktop} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Marquee ticker at bottom — full width */}
        <div className="relative mt-10 md:mt-20 border-y border-neutral-200 bg-white overflow-hidden py-3.5 md:py-4">
          <div className="flex animate-ticker whitespace-nowrap">
            {Array.from({ length: 2 }).flatMap((_, copy) =>
              [
                "Garantía oficial Apple",
                "Envío gratis a toda Colombia",
                "Crédito con Banco de Bogotá",
                "4 sedes en Medellín e Itagüí",
                "+200K seguidores en Instagram",
                "Vidrio + estuche de regalo",
              ].map((item, i) => (
                <span
                  key={`${copy}-${i}`}
                  className="inline-flex items-center gap-3 px-5 md:px-6 text-xs md:text-sm font-medium text-neutral-700"
                >
                  {item}
                  <span className="text-[#CC0000]">●</span>
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── COMPRA POR LÍNEA ──────────────────────────────────────── */}
      <CategoryShowcase />

      {/* ── PRECIOS DESTACADOS — bento (editable desde admin/configuracion) ──── */}
      {bigOffer && (
        <section className="py-14 md:py-24 bg-[#FAFAFA]">
          <div className="max-w-6xl mx-auto px-5 md:px-12">
            <AnimatedSection className="mb-9 md:flex md:items-end md:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.05] mb-2">
                  {t.priceCommandTitle}{" "}
                  {t.priceCommandAccent && (
                    <em className="font-serif text-[#CC0000] font-normal">
                      {t.priceCommandAccent}
                    </em>
                  )}
                  .
                </h2>
                <p className="text-neutral-500 text-sm md:text-base">
                  {t.priceCommandSubtitle}
                </p>
              </div>
              <Link
                href="/catalogo"
                className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 mt-4 group"
              >
                Ver todas las ofertas
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </AnimatedSection>

            {/* Bento: 1 grande + N pequeños */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
              {/* Big tile */}
              <Link
                href={bigOffer.href || "/catalogo"}
                className="md:col-span-7 md:row-span-2 group relative bg-white rounded-3xl overflow-hidden tile-shadow min-h-[440px] flex flex-col border border-neutral-200/70"
              >
                <div className="p-7 md:p-10 pb-0">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-5 ${badgeStyleClass(bigOffer.badgeStyle)}`}>
                    {bigOffer.badge}
                  </span>
                  <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.05] mb-3">
                    {bigOffer.title}
                  </h3>
                  <p className="text-neutral-500 text-sm md:text-base max-w-md">
                    {bigOffer.subtitle}
                  </p>
                </div>

                <div className="relative flex-1 mt-6 mx-5 md:mx-7 rounded-2xl bg-white overflow-hidden min-h-[220px] md:min-h-[260px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-[60%] md:w-[55%] aspect-[3/4] animate-float-soft">
                      {bigOffer.image && (
                        <Image
                          src={bigOffer.image}
                          alt={bigOffer.title}
                          fill
                          className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.18)]"
                          unoptimized
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between p-7 md:p-10 pt-5">
                  <div>
                    <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-semibold mb-1">Precio hoy</p>
                    <p className="text-3xl md:text-5xl font-bold text-neutral-900 tabular-nums">
                      {formatPrice(bigOffer.price)}
                    </p>
                  </div>
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-900 text-white group-hover:bg-[#CC0000] transition-colors">
                    <ArrowUpRight size={20} />
                  </span>
                </div>
              </Link>

              {/* Small tiles */}
              {smallOffers.map((offer) => (
                <Link
                  key={offer.id}
                  href={offer.href || "/catalogo"}
                  className="md:col-span-5 group relative bg-white rounded-3xl overflow-hidden tile-shadow min-h-[210px] flex flex-row items-stretch border border-neutral-200/70"
                >
                  <div className="flex flex-col p-5 md:p-6 flex-1 min-w-0">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 self-start ${badgeStyleClass(offer.badgeStyle)}`}>
                      {offer.badge}
                    </span>
                    <h3 className="text-lg md:text-2xl font-bold text-neutral-900 leading-tight mb-0.5">
                      {offer.title}
                    </h3>
                    <p className="text-[11px] md:text-xs text-neutral-500 mb-3">
                      {offer.subtitle}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-neutral-900 mt-auto tabular-nums">
                      {formatPrice(offer.price)}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#CC0000] group-hover:gap-2 transition-all">
                      Ver más <ArrowUpRight size={12} />
                    </span>
                  </div>
                  <div className="relative w-[44%] shrink-0 bg-white flex items-center justify-center">
                    <div className="relative w-[70%] aspect-square">
                      {offer.image && (
                        <Image
                          src={offer.image}
                          alt={offer.title}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PRODUCTOS DESTACADOS ──────────────────────────────────── */}
      <section className="py-14 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="flex items-end justify-between mb-9 px-5 md:px-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-1 leading-[1.05]">
                {t.featuredTitle}{" "}
                {t.featuredAccent && (
                  <em className="font-serif font-normal text-[#CC0000]">
                    {t.featuredAccent}
                  </em>
                )}
                .
              </h2>
              <p className="text-neutral-500 text-sm">{t.featuredSubtitle}</p>
            </div>
            <Link
              href="/catalogo"
              className="flex items-center gap-1 text-xs md:text-sm font-semibold text-neutral-900 shrink-0 ml-4 group"
            >
              Catálogo completo <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </AnimatedSection>

          <div className="px-5 md:px-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ PROPHONE — bento 2x2 ─────────────────────────── */}
      <section className="py-14 md:py-24 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-5 md:px-12">
          <AnimatedSection className="mb-9 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
              {t.whyProphoneTitle}{" "}
              {t.whyProphoneAccent && (
                <em className="font-serif font-normal text-[#CC0000]">
                  {t.whyProphoneAccent}
                </em>
              )}
              .
            </h2>
          </AnimatedSection>

          {/* Bento grid 2 cols × 3 rows on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
            {/* Brand statement tile */}
            <AnimatedSection className="md:col-span-3 md:row-span-2 relative bg-gradient-to-br from-[#CC0000] to-[#7a0000] rounded-3xl p-7 md:p-10 overflow-hidden tile-shadow-red text-white flex flex-col justify-between min-h-[280px]">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="relative">
                <span className="inline-block text-[11px] font-bold tracking-[0.25em] uppercase opacity-80 mb-4">
                  Prophone · 2026
                </span>
                <h3 className="text-2xl md:text-4xl font-bold leading-[1.1] tracking-tight max-w-[16ch]">
                  Apple, sin sobreprecios. Apple, sin filas.
                </h3>
              </div>
              <div className="relative flex items-center gap-4 mt-8 pt-6 border-t border-white/15">
                <div className="text-3xl md:text-4xl font-bold tabular-nums">200K+</div>
                <div className="text-xs opacity-80 leading-tight">
                  personas en<br />Antioquia confían
                </div>
              </div>
            </AnimatedSection>

            {/* Feature tile 1 */}
            <AnimatedSection delay={0.05} className="md:col-span-3 group bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 hover:border-neutral-300 transition-colors flex items-start gap-4 min-h-[140px]">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#FFF1F1] flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#CC0000]" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-neutral-900 mb-1">
                  Garantía oficial Apple
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Un año de respaldo Apple en equipos nuevos. Sin letra pequeña.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature tile 2 */}
            <AnimatedSection delay={0.1} className="md:col-span-3 group bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 hover:border-neutral-300 transition-colors flex items-start gap-4 min-h-[140px]">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#FFF1F1] flex items-center justify-center">
                <BadgeDollarSign size={20} className="text-[#CC0000]" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-neutral-900 mb-1">
                  Mejores precios de Medellín
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Compramos directo. Trasladamos el ahorro. Sin intermediarios.
                </p>
              </div>
            </AnimatedSection>

            {/* Feature tile 3 — full width below */}
            <AnimatedSection delay={0.15} className="md:col-span-6 group bg-white rounded-3xl p-6 md:p-8 border border-neutral-200 hover:border-neutral-300 transition-colors flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#FFF1F1] flex items-center justify-center">
                  <HeadphonesIcon size={20} className="text-[#CC0000]" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-neutral-900 mb-1">
                    Asesoría humana por WhatsApp
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed max-w-md">
                    Te ayudamos a elegir el equipo ideal. Si no te conviene, te lo decimos.
                  </p>
                </div>
              </div>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-2xl text-sm font-semibold hover:bg-black active:scale-95 transition-all shrink-0"
              >
                Hablar con un asesor
                <ArrowRight size={14} />
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── TU COMPRA INCLUYE — chips encadenados ─────────────────── */}
      <section className="py-14 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-12">
          <AnimatedSection className="mb-9 md:flex md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.05] mb-2">
                {t.giftsTitle}{" "}
                {t.giftsAccent && (
                  <em className="font-serif font-normal text-[#CC0000]">
                    {t.giftsAccent}
                  </em>
                )}
              </h2>
              <p className="text-neutral-500 text-sm">{t.giftsSubtitle}</p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Gift,
                title: "Vidrio templado",
                desc: "+ Membresía 1 año para cambio gratuito.",
                accent: "bg-[#FFF1F1]",
              },
              {
                icon: ShieldCheck,
                title: "Estuche protector",
                desc: "Original, ajustado al modelo. Sin costo.",
                accent: "bg-[#F5F5F7]",
              },
              {
                icon: BadgeCheck,
                title: "Garantía 1 año",
                desc: "Respaldo Apple + soporte Prophone.",
                accent: "bg-neutral-900 text-white",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              const isDark = item.accent.includes("neutral-900");
              return (
                <AnimatedSection
                  key={item.title}
                  delay={i * 0.08}
                  className={`relative ${item.accent} rounded-3xl p-6 md:p-7 overflow-hidden flex flex-col min-h-[200px]`}
                >
                  <div className={`text-[8rem] font-black leading-none absolute -top-2 -right-1 select-none tabular-nums ${isDark ? "text-white/8" : "text-black/[0.04]"}`}>
                    0{i + 1}
                  </div>
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${isDark ? "bg-white/10" : "bg-white"} mb-4`}>
                      <Icon size={20} className={isDark ? "text-white" : "text-[#CC0000]"} />
                    </div>
                    <h3 className={`text-base md:text-lg font-bold mb-1 ${isDark ? "text-white" : "text-neutral-900"}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-neutral-500"}`}>
                      {item.desc}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          <p className="text-xs text-neutral-400 mt-5">
            * Aplica para compras en efectivo. Pregunta por condiciones.
          </p>
        </div>
      </section>

      {/* ── CRÉDITO BANCO DE BOGOTÁ ───────────────────────────── */}
      <section className="py-14 md:py-24 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-5 md:px-12">
          <div className="relative bg-gradient-to-br from-[#FFFAF0] via-[#FFF5E6] to-[#FFE9D1] rounded-[2.5rem] p-8 md:p-14 overflow-hidden tile-shadow grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            {/* Left: copy */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard size={14} className="text-[#CC0000]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  Alianza oficial
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.05] mb-5">
                ¿Sin todo el efectivo?{" "}
                <span className="text-[#CC0000]">Te financiamos.</span>
              </h2>
              <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-7 max-w-md">
                Aprobación rápida, cuotas flexibles, sin fiador. Llévate tu iPhone hoy y paga en cómodos pagos.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-7">
                {["Aprobación rápida", "Cuotas flexibles", "Sin fiador", "Entrega inmediata"].map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full shrink-0" />
                    <span className="text-neutral-700 text-sm">{b}</span>
                  </div>
                ))}
              </div>

              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-neutral-900 text-white px-7 py-4 rounded-2xl text-sm font-semibold hover:bg-black active:scale-95 transition-all"
              >
                Solicitar crédito
                <ArrowRight size={14} />
              </a>
            </div>

            {/* Right: official logo lockup */}
            <div className="relative flex flex-col items-center md:items-start gap-5">
              <div className="relative w-full max-w-sm aspect-[16/9] bg-white rounded-3xl shadow-xl border border-neutral-200/60 p-7 flex items-center justify-center">
                <Image
                  src="/banco-de-bogota-logo-png_seeklogo-16005-removebg-preview.png"
                  alt="Banco de Bogotá"
                  fill
                  className="object-contain p-7"
                />
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-white border border-neutral-200/60 shadow-sm">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-medium text-neutral-700">
                  Crédito disponible · Aprobación en minutos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESEÑAS — score panel + quotes ──────────────────────── */}
      <section className="py-14 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            {/* Left: rating dashboard */}
            <AnimatedSection className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-neutral-900 rounded-3xl p-7 md:p-9 text-white">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-6xl md:text-7xl font-bold tracking-tight tabular-nums leading-none">
                    4,9
                  </span>
                  <span className="text-neutral-400 text-sm">/5</span>
                </div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={18}
                      className="text-[#CC0000] fill-[#CC0000]"
                    />
                  ))}
                </div>
                <p className="text-sm text-neutral-300 mb-7">
                  Basado en <strong className="text-white font-semibold">+1.200 reseñas</strong> verificadas en Google e Instagram.
                </p>

                {/* Breakdown bars */}
                <div className="space-y-2 mb-7">
                  {[
                    { stars: 5, pct: 94 },
                    { stars: 4, pct: 5 },
                    { stars: 3, pct: 1 },
                    { stars: 2, pct: 0 },
                    { stars: 1, pct: 0 },
                  ].map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-xs">
                      <span className="w-3 text-neutral-400 font-medium tabular-nums">{row.stars}</span>
                      <Star size={11} className="text-[#CC0000] fill-[#CC0000]" />
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-[#CC0000] rounded-full"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-neutral-400 tabular-nums">{row.pct}%</span>
                    </div>
                  ))}
                </div>

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white border-b border-white/30 hover:border-[#CC0000] hover:text-[#FF3B3B] pb-0.5 transition-colors"
                >
                  Ver más en Instagram
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </AnimatedSection>

            {/* Right: quotes list */}
            <div className="lg:col-span-8">
              <AnimatedSection className="mb-8">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
                  {t.reviewsTitle}
                </h2>
              </AnimatedSection>

              <div className="space-y-0">
                {[
                  {
                    name: "Valentina G.",
                    location: "Medellín",
                    date: "Hace 3 días",
                    text: "Compré mi iPhone 16 Pro y el precio fue el mejor que encontré. Me regalaron el vidrio y el estuche, atención impecable.",
                    product: "iPhone 16 Pro",
                  },
                  {
                    name: "Sebastián M.",
                    location: "Itagüí",
                    date: "Hace 1 semana",
                    text: "3 años comprando en Prophone. Siempre garantía real y precios que no consigo en otro lado. 100% recomendados.",
                    product: "iPhone 15",
                  },
                  {
                    name: "Camila R.",
                    location: "El Poblado",
                    date: "Hace 2 semanas",
                    text: "Muy fácil el crédito con Banco de Bogotá. En media hora ya tenía mi iPhone 15 listo. Servicio rapidísimo.",
                    product: "iPhone 15 · Crédito",
                  },
                  {
                    name: "Juan D.",
                    location: "Envigado",
                    date: "Hace 3 semanas",
                    text: "Llegué con dudas y salí decidido. Me explicaron las diferencias entre modelos sin presionar. Excelente asesoría.",
                    product: "iPad Air",
                  },
                ].map((review, i) => (
                  <AnimatedSection
                    key={review.name}
                    delay={i * 0.06}
                    className="py-7 md:py-8 border-t border-neutral-200 first:border-t-0 first:pt-0"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            size={13}
                            className="text-[#CC0000] fill-[#CC0000]"
                          />
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                        <BadgeCheck size={11} />
                        Verificado
                      </span>
                      <span className="text-[11px] text-neutral-400 ml-auto">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-neutral-800 text-base md:text-lg leading-relaxed mb-4">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <strong className="text-neutral-900 font-semibold">
                        {review.name}
                      </strong>
                      <span>·</span>
                      <span>{review.location}</span>
                      <span>·</span>
                      <span className="text-[#CC0000] font-medium">
                        {review.product}
                      </span>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEDES — map-pin grid ─────────────────────────────────── */}
      <section id="sedes" className="py-14 md:py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <AnimatedSection className="mb-9 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-2 leading-[1.05]">
              {sedes.length} sedes para <em className="font-serif font-normal text-[#CC0000]">verte</em>.
            </h2>
            <p className="text-neutral-500 text-sm">
              Visítanos y llévate tu equipo hoy mismo · Medellín e Itagüí
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {sedes.map((sede, i) => (
              <AnimatedSection
                key={sede.id}
                delay={i * 0.06}
                className="group relative bg-white rounded-3xl p-5 md:p-6 border border-neutral-200 hover:border-[#CC0000]/30 transition-all overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-[#FFF1F1] group-hover:scale-110 transition-transform" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-[#CC0000] text-white mb-4">
                    <MapPin size={15} />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium mb-1">
                    Sede {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-sm md:text-base font-bold text-neutral-900 mb-1">
                    {sede.name}
                  </h3>
                  <p className="text-[11px] md:text-xs text-neutral-500 mb-0.5">{sede.area}</p>
                  <p className="text-[11px] md:text-xs text-neutral-400">{sede.detail}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-6 px-4 py-3 bg-white rounded-2xl border border-neutral-200 max-w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-neutral-700 font-medium">
              {hoursWeek} · {hoursWeekend}
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — tile rojo signature ─────────────────────── */}
      <section className="py-14 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-12">
          <div className="relative bg-gradient-to-br from-[#CC0000] via-[#A00000] to-[#5a0000] rounded-[2.5rem] p-10 md:p-20 text-center overflow-hidden tile-shadow-red">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <AnimatedSection className="relative max-w-2xl mx-auto text-white">
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight mb-5 leading-[1.02]">
                {t.finalCtaTitle}{" "}
                {t.finalCtaAccent && (
                  <em className="font-serif font-normal opacity-80">
                    {t.finalCtaAccent}
                  </em>
                )}
                .
              </h2>
              <p className="text-white/70 text-base md:text-lg mb-8 max-w-md mx-auto leading-relaxed">
                {t.finalCtaDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#CC0000] px-8 py-4 rounded-2xl text-sm font-bold hover:bg-neutral-100 active:scale-95 transition-all"
                >
                  Hablar por WhatsApp
                  <ArrowRight size={15} />
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-white/20 active:scale-95 transition-all"
                >
                  Ver Instagram
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
