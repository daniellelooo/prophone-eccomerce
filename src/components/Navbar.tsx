"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Menu,
  X,
  Search,
  CircleUser,
  Heart,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useSiteConfigStore, getWhatsappUrl } from "@/lib/site-config-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import SearchModal from "@/components/SearchModal";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCountRaw = useCartStore((s) => s.itemCount());
  const wishlistCountRaw = useWishlistStore((s) => s.slugs.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const itemCount = mounted ? itemCountRaw : 0;
  const wishlistCount = mounted ? wishlistCountRaw : 0;
  const whatsappNumber = useSiteConfigStore((s) => s.whatsappNumber);
  const whatsappMsg = useSiteConfigStore((s) => s.whatsappDefaultMessage);
  const waUrl = getWhatsappUrl(whatsappNumber, whatsappMsg);
  const promoEnabled = useSiteConfigStore((s) => s.promoEnabled);
  const promoLabel = useSiteConfigStore((s) => s.promoLabel);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const hasTickerSpace = pathname === "/" || pathname === "/catalogo";

  const navLinks: { href: string; label: string; promo?: boolean }[] = [
    { href: "/catalogo?cat=iphone", label: "iPhone" },
    { href: "/catalogo?cat=ipad", label: "iPad" },
    { href: "/catalogo?cat=watch", label: "Watch" },
    { href: "/catalogo?cat=accesorios", label: "Accesorios" },
  ];
  if (promoEnabled) {
    navLinks.push({
      href: "/promociones",
      label: promoLabel || "Promociones",
      promo: true,
    });
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed ${hasTickerSpace ? "top-8" : "top-0"} left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-2xl border-b border-neutral-200/60 shadow-sm"
            : "bg-white/60 backdrop-blur-xl"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-5 md:px-12 h-16 flex items-center justify-between gap-3">
          {/* Logo with red dot — distinctive Prophone mark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="relative">
              <Image
                src="/prophone-profile-pic.jpg"
                alt="Prophone Medellín"
                width={36}
                height={36}
                className="rounded-2xl object-cover ring-1 ring-neutral-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#CC0000] ring-2 ring-white" />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="block text-base font-bold tracking-tight text-neutral-900">
                Prophone
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#CC0000] mt-0.5">
                Medellín
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 px-3 py-1.5 rounded-full ${
                  link.promo
                    ? "bg-[#CC0000]/10 text-[#CC0000] hover:bg-[#CC0000] hover:text-white inline-flex items-center gap-1.5"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                {link.promo && <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000] animate-pulse" />}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search input-style — different from Macrocell pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-2xl bg-neutral-100 hover:bg-neutral-200/80 transition-colors text-neutral-500 text-xs min-w-[180px]"
              aria-label="Buscar"
            >
              <Search size={14} className="text-[#CC0000]" />
              <span className="flex-1 text-left">Buscar productos…</span>
              <kbd className="bg-white/90 text-neutral-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ring-1 ring-neutral-200">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
              aria-label="Buscar"
            >
              <Search size={18} className="text-[#CC0000]" />
            </button>

            {/* Icon cluster — segmented chip on desktop */}
            <div className="hidden md:flex items-center bg-neutral-100 rounded-2xl p-1 gap-0.5">
              <Link
                href="/cuenta"
                className="p-2 rounded-xl hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
                aria-label="Mi cuenta"
                title="Mi cuenta"
              >
                <CircleUser size={18} className="text-neutral-700" />
              </Link>
              <Link
                href="/wishlist"
                className="relative p-2 rounded-xl hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
                aria-label="Favoritos"
                title="Favoritos"
              >
                <Heart size={18} className="text-neutral-700" />
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      key="wish-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-[#CC0000] text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[16px] min-h-[16px] px-1 ring-2 ring-neutral-100"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-xl hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
                aria-label="Carrito"
              >
                <ShoppingCart size={18} className="text-neutral-700" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-[#CC0000] text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[16px] min-h-[16px] px-1 ring-2 ring-neutral-100"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Mobile icons — single icons */}
            <button
              onClick={toggleCart}
              className="md:hidden relative p-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
              aria-label="Carrito"
            >
              <ShoppingCart size={18} className="text-neutral-700" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#CC0000] text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* WhatsApp — minimal icon-only chip con punto verde pulsante */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Hablar por WhatsApp"
              title="Hablar por WhatsApp"
              className="hidden md:inline-flex items-center gap-2 bg-white text-neutral-800 pl-2 pr-3 py-1.5 rounded-2xl text-xs font-semibold border border-neutral-200 hover:border-[#25D366] hover:text-[#25D366] active:scale-95 transition-all duration-200"
            >
              <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-xl bg-[#25D366] text-white">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487 1.71.74 2.376.766 3.232.642.521-.075 1.604-.655 1.83-1.288.227-.633.227-1.176.158-1.288-.067-.111-.247-.179-.522-.319M12.04 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" />
                </svg>
              </span>
              <span className="hidden lg:inline">Escríbenos</span>
              <span className="lg:hidden">WA</span>
            </a>

            <button
              className="lg:hidden p-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
            >
              {mobileOpen ? (
                <X size={18} className="text-neutral-700" />
              ) : (
                <Menu size={18} className="text-neutral-700" />
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-neutral-200 shadow-lg lg:hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-base font-medium text-neutral-800 border-b border-neutral-100 last:border-0"
                >
                  {link.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Link
                  href="/cuenta"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-neutral-100 text-neutral-800 px-4 py-3 rounded-2xl text-sm font-semibold"
                >
                  <CircleUser size={16} /> Mi cuenta
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 bg-neutral-100 text-neutral-800 px-4 py-3 rounded-2xl text-sm font-semibold"
                >
                  <Heart size={16} /> Favoritos
                  {wishlistCount > 0 && (
                    <span className="bg-[#CC0000] text-white text-[10px] font-bold rounded-full px-1.5 min-w-[16px] text-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 bg-[#25D366] text-white px-5 py-3 rounded-2xl text-sm font-bold text-center"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
