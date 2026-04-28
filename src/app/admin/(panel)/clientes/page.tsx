"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingBag,
  ChevronRight,
  Shield,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";

type CustomerRow = {
  userId: string;
  fullName: string;
  phone: string;
  email: string | null;
  isAdmin: boolean;
  createdAt: string;
  ordersCount: number;
  ordersTotalCop: number;
  lastOrderAt: string | null;
};

export default function AdminClientesPage() {
  const [rows, setRows] = useState<CustomerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCustomers();
        if (!cancelled) setRows(list);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.email ?? "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const totals = useMemo(() => {
    if (!rows) return { customers: 0, withOrders: 0, revenue: 0 };
    return {
      customers: rows.length,
      withOrders: rows.filter((r) => r.ordersCount > 0).length,
      revenue: rows.reduce((s, r) => s + r.ordersTotalCop, 0),
    };
  }, [rows]);

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <Users size={22} className="text-[#CC0000]" /> Clientes
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Personas que se han registrado en la tienda. Click en cualquiera para
          ver sus pedidos.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Kpi label="Clientes registrados" value={String(totals.customers)} />
        <Kpi label="Con al menos un pedido" value={String(totals.withOrders)} />
        <Kpi label="Ventas a clientes" value={formatPrice(totals.revenue)} />
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
          No se pudieron cargar los clientes: {error}
        </div>
      )}

      {!rows && !error && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-sm text-neutral-400">
          Cargando clientes…
        </div>
      )}

      {rows && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center">
          <Users size={28} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-700">
            {search
              ? "Ningún cliente coincide con tu búsqueda."
              : "Todavía no hay clientes registrados."}
          </p>
          {!search && (
            <p className="text-xs text-neutral-400 mt-1">
              Cuando alguien se registre desde la tienda, aparecerá acá.
            </p>
          )}
        </div>
      )}

      {rows && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <ul className="divide-y divide-neutral-100">
            {filtered.map((c) => (
              <li key={c.userId}>
                <Link
                  href={`/admin/ordenes?cliente=${encodeURIComponent(
                    c.userId
                  )}`}
                  className="flex items-center gap-4 px-4 md:px-5 py-4 hover:bg-neutral-50 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {initials(c.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {c.fullName || "(sin nombre)"}
                      </p>
                      {c.isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold bg-[#CC0000]/10 text-[#CC0000] px-1.5 py-0.5 rounded-full">
                          <Shield size={9} /> admin
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-neutral-500 mt-0.5">
                      {c.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail size={10} /> {c.email}
                        </span>
                      )}
                      {c.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={10} /> {c.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-neutral-900 inline-flex items-center gap-1">
                      <ShoppingBag size={11} className="text-neutral-400" />
                      {c.ordersCount}
                    </p>
                    {c.ordersTotalCop > 0 ? (
                      <p className="text-[11px] text-neutral-500">
                        {formatPrice(c.ordersTotalCop)}
                      </p>
                    ) : (
                      <p className="text-[10px] text-neutral-400">sin compras</p>
                    )}
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-neutral-300 group-hover:text-neutral-500 transition shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ----------------------- helpers ----------------------- */

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 px-4 py-3.5">
      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Carga clientes (profiles) y agrega métricas de pedidos por cada uno.
 *
 * No podemos leer `auth.users.email` desde el cliente — Supabase lo expone solo
 * con service_role. Por eso intentamos obtener el email desde el último pedido
 * del cliente (campo `customer_email` en `orders`). Sirve para identificar.
 */
async function fetchCustomers(): Promise<CustomerRow[]> {
  const supabase = getSupabaseBrowserClient();

  const [profilesRes, ordersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, is_admin, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("user_id, customer_email, total_cop, created_at")
      .not("user_id", "is", null),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (ordersRes.error) throw ordersRes.error;

  const profiles = profilesRes.data ?? [];
  const orders = ordersRes.data ?? [];

  // Agrupar pedidos por user_id.
  const byUser = new Map<
    string,
    { count: number; total: number; lastAt: string | null; lastEmail: string | null }
  >();
  for (const o of orders) {
    const id = o.user_id!;
    const cur = byUser.get(id) ?? {
      count: 0,
      total: 0,
      lastAt: null,
      lastEmail: null,
    };
    cur.count += 1;
    cur.total += o.total_cop ?? 0;
    if (!cur.lastAt || (o.created_at && o.created_at > cur.lastAt)) {
      cur.lastAt = o.created_at;
      cur.lastEmail = o.customer_email ?? cur.lastEmail;
    } else if (!cur.lastEmail) {
      cur.lastEmail = o.customer_email ?? null;
    }
    byUser.set(id, cur);
  }

  return profiles.map((p) => {
    const stats = byUser.get(p.id);
    return {
      userId: p.id,
      fullName: p.full_name ?? "",
      phone: p.phone ?? "",
      email: stats?.lastEmail ?? null,
      isAdmin: !!p.is_admin,
      createdAt: p.created_at,
      ordersCount: stats?.count ?? 0,
      ordersTotalCop: stats?.total ?? 0,
      lastOrderAt: stats?.lastAt ?? null,
    };
  });
}
