"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Package,
  ShoppingBag,
  Truck,
  CircleUser,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Save,
  Check,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getCurrentProfile,
  logoutCustomer,
  type CustomerProfile,
} from "@/lib/customer-auth";
import {
  listMyOrders,
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  type OrderRecord,
} from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { useCatalogStore } from "@/lib/catalog-store";
import CustomerAuthForm from "@/components/CustomerAuthForm";

type Tab = "pedidos" | "datos";

export default function CuentaPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [tab, setTab] = useState<Tab>("pedidos");
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [draftFullName, setDraftFullName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();

    const refresh = async () => {
      const p = await getCurrentProfile();
      if (cancelled) return;
       
      setProfile(p);
       
      setAuthChecked(true);
      if (p) {
        setDraftFullName(p.fullName);
        setDraftPhone(p.phone);
         
        setOrders(await listMyOrders());
      }
    };
    refresh();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } finally {
      window.location.href = "/";
    }
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: draftFullName.trim(),
        phone: draftPhone.trim(),
      })
      .eq("id", profile.id);
    setSavingProfile(false);
    if (error) {
      alert("Error guardando: " + error.message);
      return;
    }
    setProfile({
      ...profile,
      fullName: draftFullName.trim(),
      phone: draftPhone.trim(),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 1800);
  };

  if (!authChecked) {
    return (
      <div className="pt-32 px-5 text-center text-neutral-400 text-sm">
        Verificando sesión…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pt-24 min-h-screen bg-[#F5F5F7] px-5 md:px-12 py-12">
        <div className="max-w-md mx-auto">
          <CustomerAuthForm onSuccess={() => router.refresh()} />
        </div>
      </div>
    );
  }

  // Stats derivados de las órdenes
  const totalSpent = (orders ?? []).reduce(
    (s, o) => s + (o.totalCop ?? 0),
    0
  );
  // Si tenemos al menos un pedido, "miembro desde" = fecha del pedido más viejo.
  const oldestOrderAt = (orders ?? []).reduce<Date | null>((acc, o) => {
    const d = new Date(o.createdAt);
    return !acc || d < acc ? d : acc;
  }, null);
  const memberSince = oldestOrderAt
    ? oldestOrderAt.toLocaleDateString("es-CO", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="pt-24 min-h-screen bg-white px-5 md:px-12 py-10 pb-32">
      <div className="max-w-6xl mx-auto">
        {/* Hero header con gradient avatar + stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-8"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#CC0000] mb-3">
            Mi cuenta
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="flex items-center gap-5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-[#CC0000] flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg shadow-[#CC0000]/25">
                  {(profile.fullName || profile.email).charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-white flex items-center justify-center">
                  <ShieldCheck size={11} className="text-white" />
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-neutral-900 leading-tight truncate">
                  Hola, {(profile.fullName || profile.email.split("@")[0]).split(" ")[0]}
                </h1>
                <p className="text-sm text-neutral-500 truncate flex items-center gap-1.5 mt-1">
                  <Mail size={12} />
                  {profile.email}
                </p>
                {memberSince && (
                  <p className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1.5">
                    <Sparkles size={10} className="text-[#CC0000]" />
                    Cliente desde {memberSince}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {profile.isAdmin && (
                <Link
                  href="/admin/productos"
                  className="text-xs font-semibold text-[#CC0000] bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-2 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
                >
                  Panel admin →
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-[#CC0000] hover:bg-neutral-100 px-3 py-2 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000]"
              >
                <LogOut size={12} aria-hidden /> Salir
              </button>
            </div>
          </div>

          {/* Stats strip */}
          {orders && orders.length > 0 && (
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-6 max-w-2xl">
              <StatCard
                label="Pedidos"
                value={String(orders.length)}
                tone="dark"
              />
              <StatCard
                label="Invertido"
                value={formatPrice(totalSpent)}
                tone="accent"
              />
              <StatCard
                label="En curso"
                value={String(
                  orders.filter((o) =>
                    ["pending", "paid", "in_review"].includes(o.status)
                  ).length
                )}
                tone="soft"
              />
            </div>
          )}
        </motion.div>

        {/* Layout sidebar (desktop) + tabs horizontales (mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar nav */}
          <aside className="md:col-span-3">
            {/* Mobile: tabs horizontales */}
            <div
              className="flex gap-2 mb-2 overflow-x-auto no-scrollbar md:hidden"
              role="tablist"
            >
              <TabButton
                active={tab === "pedidos"}
                onClick={() => setTab("pedidos")}
                icon={<Package size={14} aria-hidden />}
              >
                Pedidos
                {orders && (
                  <span className="ml-1 text-[10px] opacity-70">
                    {orders.length}
                  </span>
                )}
              </TabButton>
              <TabButton
                active={tab === "datos"}
                onClick={() => setTab("datos")}
                icon={<CircleUser size={14} aria-hidden />}
              >
                Datos
              </TabButton>
            </div>

            {/* Desktop: sidebar list */}
            <div className="hidden md:flex flex-col gap-1 sticky top-24">
              <SidebarItem
                active={tab === "pedidos"}
                onClick={() => setTab("pedidos")}
                icon={<Package size={15} aria-hidden />}
                label="Mis pedidos"
                badge={orders?.length}
              />
              <SidebarItem
                active={tab === "datos"}
                onClick={() => setTab("datos")}
                icon={<CircleUser size={15} aria-hidden />}
                label="Datos personales"
              />
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-9">
        <AnimatePresence mode="wait">
          {tab === "pedidos" && (
            <motion.div
              key="pedidos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {orders === null ? (
                <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
                  <p className="text-sm text-neutral-400 animate-pulse">
                    Cargando tus pedidos…
                  </p>
                </div>
              ) : orders.length === 0 ? (
                <EmptyOrders />
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tab === "datos" && (
            <motion.div
              key="datos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8"
            >
              <h2 className="text-lg font-bold text-neutral-900 mb-6">
                Datos personales
              </h2>
              <div className="space-y-4 max-w-md">
                <Field label="Email" icon={<Mail size={12} aria-hidden />}>
                  <input
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-500"
                  />
                  <p className="text-[11px] text-neutral-400 mt-1">
                    El email no se puede cambiar desde aquí.
                  </p>
                </Field>
                <Field
                  label="Nombre completo"
                  icon={<CircleUser size={12} aria-hidden />}
                >
                  <input
                    type="text"
                    value={draftFullName}
                    onChange={(e) => setDraftFullName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                  />
                </Field>
                <Field label="Teléfono" icon={<Phone size={12} aria-hidden />}>
                  <input
                    type="tel"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(e.target.value)}
                    placeholder="300 000 0000"
                    className="w-full px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                  />
                </Field>
                <button
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2 ${
                    profileSaved
                      ? "bg-green-500"
                      : "bg-[#CC0000] hover:bg-[#A00000]"
                  }`}
                >
                  {profileSaved ? (
                    <>
                      <Check size={14} aria-hidden /> Guardado
                    </>
                  ) : (
                    <>
                      <Save size={14} aria-hidden /> Guardar cambios
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "dark" | "accent" | "soft";
}) {
  const styles = {
    dark: "bg-neutral-900 text-white",
    accent: "bg-[#CC0000] text-white",
    soft: "bg-neutral-100 text-neutral-900",
  };
  return (
    <div className={`rounded-2xl px-4 py-3.5 ${styles[tone]}`}>
      <p
        className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
          tone === "soft" ? "text-neutral-500" : "text-white/70"
        }`}
      >
        {label}
      </p>
      <p className="text-base md:text-xl font-bold tabular-nums truncate">
        {value}
      </p>
    </div>
  );
}

function SidebarItem({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] ${
        active
          ? "bg-[#CC0000] text-white shadow-md shadow-[#CC0000]/25"
          : "text-neutral-700 hover:bg-neutral-100"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      {typeof badge === "number" && badge > 0 && (
        <span
          className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
            active ? "bg-white/20" : "bg-neutral-200 text-neutral-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] ${
        active
          ? "bg-neutral-900 text-white shadow-sm"
          : "bg-white text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function OrderCard({ order }: { order: OrderRecord }) {
  const date = new Date(order.createdAt);
  const catalogProducts = useCatalogStore((s) => s.products);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden"
      aria-label={`Pedido ${order.orderNumber}`}
    >
      <header className="px-5 py-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
            <ShoppingBag size={16} className="text-neutral-500" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-neutral-900 font-mono truncate">
              {order.orderNumber}
            </p>
            <p className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Calendar size={10} aria-hidden />
              {date.toLocaleDateString("es-CO", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              ORDER_STATUS_COLOR[order.status] ?? "bg-neutral-200 text-neutral-700"
            }`}
          >
            {ORDER_STATUS_LABEL[order.status] ?? order.status}
          </span>
          <span className="text-base md:text-lg font-bold text-neutral-900">
            {formatPrice(order.totalCop)}
          </span>
        </div>
      </header>
      <ul className="px-5 py-3 space-y-2.5">
        {order.items.map((item, i) => {
          const catalogProduct = catalogProducts.find(
            (p) => p.id === item.productId || p.name === item.productName
          );
          const imageUrl = item.imageUrl ?? catalogProduct?.image ?? null;
          const productSlug = catalogProduct?.slug ?? null;

          const nameNode = productSlug ? (
            <Link
              href={`/productos/${productSlug}`}
              className="font-medium text-neutral-900 hover:text-[#CC0000] transition-colors truncate"
            >
              {item.productName}
            </Link>
          ) : (
            <span className="font-medium text-neutral-900 truncate">
              {item.productName}
            </span>
          );

          return (
            <li
              key={i}
              className="flex items-center gap-3 text-sm text-neutral-700"
            >
              <div className="relative w-12 h-12 bg-neutral-50 rounded-xl overflow-hidden shrink-0 border border-neutral-100">
                {imageUrl ? (
                  <>
                    {productSlug ? (
                      <Link href={`/productos/${productSlug}`} tabIndex={-1}>
                        <Image
                          src={imageUrl}
                          alt={item.productName}
                          fill
                          className="object-contain p-1.5"
                          unoptimized
                        />
                      </Link>
                    ) : (
                      <Image
                        src={imageUrl}
                        alt={item.productName}
                        fill
                        className="object-contain p-1.5"
                        unoptimized
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={16} className="text-neutral-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">
                  {nameNode}
                  <span className="text-neutral-400 font-normal">
                    {" "}
                    × {item.quantity}
                  </span>
                </div>
                {item.variantLabel && (
                  <p className="text-[11px] text-neutral-500 truncate">
                    {item.variantLabel}
                  </p>
                )}
              </div>
              <span className="text-sm font-semibold text-neutral-900 shrink-0">
                {formatPrice(item.unitPriceCop * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>
      {order.shippingAddress && (
        <footer className="px-5 py-3 border-t border-neutral-100 flex items-center gap-2 text-[11px] text-neutral-500">
          <Truck size={11} aria-hidden />
          {order.shippingAddress}, {order.shippingCity},{" "}
          {order.shippingDepartment}
        </footer>
      )}
    </motion.article>
  );
}

function EmptyOrders() {
  return (
    <div className="bg-white rounded-2xl p-12 text-center">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <Package size={22} className="text-neutral-400" aria-hidden />
      </div>
      <p className="text-base font-semibold text-neutral-700 mb-1">
        Aún no tienes pedidos
      </p>
      <p className="text-sm text-neutral-400 mb-6 max-w-sm mx-auto">
        Cuando hagas tu primera compra, vas a verla acá con su estado y todos
        los detalles.
      </p>
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#A00000] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2"
      >
        Ver catálogo <ChevronRight size={13} aria-hidden />
      </Link>
    </div>
  );
}
