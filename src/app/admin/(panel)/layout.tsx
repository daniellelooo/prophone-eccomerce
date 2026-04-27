"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  ExternalLink,
  LogOut,
  MapPin,
  Settings,
  Sparkles,
  Database,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/lib/admin-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin/productos", label: "Productos", icon: Box },
  { href: "/admin/promociones", label: "Promociones", icon: Sparkles },
  { href: "/admin/sedes", label: "Sedes", icon: MapPin },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  { href: "/admin/datos", label: "Datos (JSON)", icon: Database },
];

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Guard: consulta la sesión de Supabase (cookies) y escucha cambios en vivo.
  // setState dentro de useEffect es legítimo: sincroniza con el cliente
  // Supabase (sistema externo).
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthed(true);
      } else {
        router.replace("/admin");
      }
      setAuthChecked(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthed(!!session);
      if (!session) router.replace("/admin");
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/admin");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0C1014] flex items-center justify-center text-neutral-500 text-sm">
        Verificando sesión…
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex">
      {/* Sidebar — desktop fijo, móvil drawer */}
      <aside
        className={`fixed md:sticky md:top-0 md:h-screen z-40 inset-y-0 left-0 w-64 bg-[#0C1014] text-white flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <Image
            src="/prophone-profile-pic.jpg"
            alt="Prophone"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Panel
            </p>
            <p className="text-sm font-bold truncate">Prophone Admin</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-full hover:bg-white/10"
            aria-label="Cerrar menú"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-[#CC0000] text-white shadow-md"
                    : "text-neutral-300 hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 space-y-1 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-white/5 transition"
          >
            <ExternalLink size={15} />
            Ver tienda pública
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:bg-white/5 transition"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          aria-hidden
        />
      )}

      {/* Contenido */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar móvil */}
        <header className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-full hover:bg-neutral-100"
            aria-label="Abrir menú"
          >
            <Menu size={18} />
          </button>
          <p className="text-sm font-semibold">Prophone Admin</p>
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-full hover:bg-neutral-100"
            aria-label="Ver tienda"
          >
            <ExternalLink size={16} />
          </Link>
        </header>

        <main className="flex-1 p-5 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
