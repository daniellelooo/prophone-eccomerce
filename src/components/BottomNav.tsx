"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sparkles,
  ShoppingCart,
  Search,
  Boxes,
  CircleUser,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import SearchModal from "@/components/SearchModal";

/**
 * BottomNav distintivo de Prophone:
 *  - Tabs con indicador superior en rojo (no sólo color en el icono).
 *  - Acción central "Carrito" elevada con FAB rojo (ancla visual de
 *    la tarea más importante: comprar).
 *  - Iconos: Sparkles (Inicio) · Boxes (Catálogo) · ShoppingCart (FAB) ·
 *    Search · CircleUser (Cuenta).
 */
export default function BottomNav() {
  const pathname = usePathname();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const itemCountRaw = useCartStore((s) => s.itemCount());
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  const itemCount = mounted ? itemCountRaw : 0;

  const hide =
    pathname?.startsWith("/checkout") || pathname?.startsWith("/admin");
  if (hide) return null;

  const isActive = (match: (p: string) => boolean) =>
    pathname ? match(pathname) : false;

  // Pestañas a izquierda y derecha del FAB central.
  const leftItems = [
    {
      key: "inicio",
      label: "Inicio",
      icon: <Sparkles size={19} />,
      href: "/",
      active: isActive((p) => p === "/"),
    },
    {
      key: "catalogo",
      label: "Catálogo",
      icon: <Boxes size={19} />,
      href: "/catalogo",
      active: isActive(
        (p) => p.startsWith("/catalogo") || p.startsWith("/productos")
      ),
    },
  ];
  const rightItems = [
    {
      key: "buscar",
      label: "Buscar",
      icon: <Search size={19} />,
      onClick: () => setSearchOpen(true),
      active: isActive((p) => p.startsWith("/buscar")),
    },
    {
      key: "cuenta",
      label: "Cuenta",
      icon: <CircleUser size={19} />,
      href: "/cuenta",
      active: isActive((p) => p.startsWith("/cuenta")),
    },
  ];

  const renderTab = (item: {
    key: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }) => {
    const content = (
      <span
        className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 pt-3 pb-2 text-[10px] font-medium transition ${
          item.active ? "text-[#CC0000]" : "text-neutral-500"
        }`}
      >
        {/* Indicador superior (barra) en lugar de fondo o solo color */}
        <span
          className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all ${
            item.active ? "w-6 bg-[#CC0000]" : "w-0 bg-transparent"
          }`}
        />
        {item.icon}
        <span>{item.label}</span>
      </span>
    );
    if (item.href) {
      return (
        <Link key={item.key} href={item.href} className="flex-1 active:opacity-60 transition">
          {content}
        </Link>
      );
    }
    return (
      <button
        key={item.key}
        onClick={item.onClick}
        className="flex-1 active:opacity-60 transition"
        aria-label={item.label}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-neutral-200 pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegación inferior"
      >
        <div className="relative flex items-stretch justify-between px-1">
          {leftItems.map(renderTab)}

          {/* FAB central — Carrito (sin label, evita superposición) */}
          <div className="flex-1 flex items-start justify-center relative pt-2">
            <button
              onClick={toggleCart}
              aria-label="Carrito"
              title="Carrito"
              className="relative -translate-y-3 w-14 h-14 rounded-full bg-[#CC0000] text-white flex items-center justify-center shadow-[0_8px_18px_-6px_rgba(204,0,0,0.45)] active:scale-95 transition ring-4 ring-white hover:bg-[#A00000]"
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>

          {rightItems.map(renderTab)}
        </div>
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
