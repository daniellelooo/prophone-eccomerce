"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCartStore } from "@/lib/store";
import SearchModal from "@/components/SearchModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCount = useCartStore((s) => s.itemCount());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Atajo Cmd/Ctrl+K abre el buscador (estándar)
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

  const navLinks = [
    { href: "/catalogo?cat=iphone", label: "iPhone" },
    { href: "/catalogo?cat=ipad", label: "iPad" },
    { href: "/catalogo?cat=watch", label: "Watch" },
    { href: "/catalogo?cat=accesorios", label: "Accesorios" },
    { href: "/#sedes", label: "Sedes" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/85 backdrop-blur-2xl border-b border-neutral-200/60 shadow-sm"
            : "bg-white/60 backdrop-blur-xl"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            <Image
              src="/prophone-profile-pic.jpg"
              alt="Prophone Medellín"
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
            <span className="text-lg font-bold tracking-tight text-neutral-900">
              Prophone
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100/80 hover:bg-neutral-200/70 transition-colors text-neutral-500 text-xs"
              aria-label="Buscar"
            >
              <Search size={14} />
              <span>Buscar…</span>
              <kbd className="bg-white/80 text-neutral-500 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Buscar"
            >
              <Search size={20} className="text-neutral-700" />
            </button>

            <button
              onClick={toggleCart}
              className="relative p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag size={20} className="text-neutral-700" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#CC0000] text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px] px-[3px]"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <a
              href="https://wa.me/573148941200?text=Hola%2C%20me%20interesa%20un%20producto%20de%20Prophone%20Medell%C3%ADn"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex bg-[#CC0000] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#A00000] active:scale-95 transition-all duration-200"
            >
              WhatsApp
            </a>

            <button
              className="md:hidden p-2 rounded-full hover:bg-neutral-100 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menú"
            >
              {mobileOpen ? (
                <X size={20} className="text-neutral-700" />
              ) : (
                <Menu size={20} className="text-neutral-700" />
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
            className="fixed top-24 inset-x-0 z-40 bg-white/95 backdrop-blur-2xl border-b border-neutral-200 shadow-lg md:hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
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
              <a
                href="https://wa.me/573148941200?text=Hola%2C%20me%20interesa%20un%20producto%20de%20Prophone%20Medell%C3%ADn"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 bg-[#CC0000] text-white px-5 py-3 rounded-full text-sm font-medium text-center"
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
