"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Star,
  Clock,
  CheckCircle,
  Truck,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/orders";

/* -------- Types -------- */

type OrderData = {
  id: string;
  order_number: string;
  status: string;
  total_cop: number;
  created_at: string;
  payment_provider: string | null;
  payment_method_type: string | null;
  customer_name: string;
  customer_phone: string;
};

type OrderItemData = {
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price_cop: number;
};

type TopProduct = {
  name: string;
  totalQty: number;
  totalRevenue: number;
};

type TopCustomer = {
  name: string;
  phone: string;
  ordersCount: number;
  totalSpend: number;
};

/* -------- Helpers -------- */

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

/* -------- Dashboard -------- */

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<OrderData[] | null>(null);
  const [items, setItems] = useState<OrderItemData[] | null>(null);
  const [outOfStock, setOutOfStock] = useState(0);
  const [totalSkus, setTotalSkus] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const [ordersRes, itemsRes, variantsRes, profilesRes] = await Promise.all([
          supabase
            .from("orders")
            .select(
              "id, order_number, status, total_cop, created_at, payment_provider, payment_method_type, customer_name, customer_phone"
            )
            .order("created_at", { ascending: false }),
          supabase
            .from("order_items")
            .select("order_id, product_name, quantity, unit_price_cop"),
          supabase.from("variants").select("sku, in_stock"),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);

        if (ordersRes.error) throw ordersRes.error;
        if (itemsRes.error) throw itemsRes.error;
        if (variantsRes.error) throw variantsRes.error;

        if (!cancelled) {
          setOrders(ordersRes.data ?? []);
          setItems(itemsRes.data ?? []);
          const variants = variantsRes.data ?? [];
          setTotalSkus(variants.length);
          setOutOfStock(variants.filter((v) => !v.in_stock).length);
          setCustomerCount(profilesRes.count ?? 0);
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    if (!orders) return null;

    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const nonCancelled = orders.filter((o) => o.status !== "cancelled");

    const totalRevenue = nonCancelled.reduce((s, o) => s + o.total_cop, 0);
    const thisMonthRevenue = nonCancelled
      .filter((o) => new Date(o.created_at) >= startOfThisMonth)
      .reduce((s, o) => s + o.total_cop, 0);
    const lastMonthRevenue = nonCancelled
      .filter((o) => {
        const d = new Date(o.created_at);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      })
      .reduce((s, o) => s + o.total_cop, 0);

    const avgOrderValue =
      nonCancelled.length > 0 ? Math.round(totalRevenue / nonCancelled.length) : 0;

    const byStatus: Record<string, number> = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    }

    // Revenue last 14 days
    const days14: { date: Date; label: string; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = startOfDay(d);
      const end = new Date(start.getTime() + 86400000);
      const rev = nonCancelled
        .filter((o) => {
          const od = new Date(o.created_at);
          return od >= start && od < end;
        })
        .reduce((s, o) => s + o.total_cop, 0);
      days14.push({ date: start, label: dayLabel(start), revenue: rev });
    }

    // Payment methods
    const paymentMethods: Record<string, number> = {};
    for (const o of nonCancelled) {
      const method =
        o.payment_provider === "wompi"
          ? o.payment_method_type ?? "Wompi"
          : "Efectivo / Manual";
      paymentMethods[method] = (paymentMethods[method] ?? 0) + 1;
    }

    return {
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      avgOrderValue,
      totalOrders: orders.length,
      pendingOrders: byStatus["pending"] ?? 0,
      confirmedOrders: byStatus["confirmed"] ?? 0,
      shippedOrders: byStatus["shipped"] ?? 0,
      deliveredOrders: byStatus["delivered"] ?? 0,
      cancelledOrders: byStatus["cancelled"] ?? 0,
      byStatus,
      days14,
      paymentMethods,
      recentOrders: orders.slice(0, 5),
    };
  }, [orders]);

  const topProducts = useMemo((): TopProduct[] => {
    if (!orders || !items) return [];
    const nonCancelledIds = new Set(
      orders.filter((o) => o.status !== "cancelled").map((o) => o.id)
    );
    const map = new Map<string, TopProduct>();
    for (const it of items) {
      if (!nonCancelledIds.has(it.order_id)) continue;
      const cur = map.get(it.product_name) ?? {
        name: it.product_name,
        totalQty: 0,
        totalRevenue: 0,
      };
      cur.totalQty += it.quantity;
      cur.totalRevenue += it.quantity * it.unit_price_cop;
      map.set(it.product_name, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);
  }, [orders, items]);

  const topCustomers = useMemo((): TopCustomer[] => {
    if (!orders) return [];
    const map = new Map<string, TopCustomer>();
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      const key = o.customer_phone;
      const cur = map.get(key) ?? {
        name: o.customer_name,
        phone: o.customer_phone,
        ordersCount: 0,
        totalSpend: 0,
      };
      cur.ordersCount += 1;
      cur.totalSpend += o.total_cop;
      map.set(key, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);
  }, [orders]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
        Error al cargar el dashboard: {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-52 bg-neutral-200 rounded-2xl animate-pulse" />
          <div className="h-52 bg-neutral-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const monthGrowth =
    metrics.lastMonthRevenue > 0
      ? ((metrics.thisMonthRevenue - metrics.lastMonthRevenue) /
          metrics.lastMonthRevenue) *
        100
      : null;

  const maxDayRevenue = Math.max(...metrics.days14.map((d) => d.revenue), 1);
  const statusOrder = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  const totalOrdersForPct = metrics.totalOrders || 1;

  const STATUS_BAR_COLOR: Record<string, string> = {
    pending: "bg-amber-400",
    confirmed: "bg-blue-500",
    shipped: "bg-violet-500",
    delivered: "bg-green-500",
    cancelled: "bg-neutral-300",
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-[#CC0000]" /> Dashboard
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Resumen general de ventas, pedidos y catálogo.
        </p>
      </motion.div>

      {/* KPI Row 1 — Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <KpiCard
          label="Ingresos totales"
          value={formatPrice(metrics.totalRevenue)}
          sub="Todos los pedidos no cancelados"
          icon={<TrendingUp size={15} className="text-[#CC0000]" />}
          highlight
        />
        <KpiCard
          label="Este mes"
          value={formatPrice(metrics.thisMonthRevenue)}
          sub={
            monthGrowth !== null
              ? `${monthGrowth >= 0 ? "+" : ""}${monthGrowth.toFixed(1)}% vs mes pasado`
              : "Primer mes con datos"
          }
          subColor={
            monthGrowth !== null
              ? monthGrowth >= 0
                ? "text-green-600"
                : "text-red-500"
              : undefined
          }
          icon={
            monthGrowth !== null && monthGrowth >= 0 ? (
              <TrendingUp size={15} className="text-green-500" />
            ) : (
              <TrendingDown size={15} className="text-red-400" />
            )
          }
        />
        <KpiCard
          label="Ticket promedio"
          value={formatPrice(metrics.avgOrderValue)}
          sub={`Sobre ${metrics.totalOrders - metrics.cancelledOrders} pedidos válidos`}
          icon={<CreditCard size={15} className="text-neutral-400" />}
        />
        <KpiCard
          label="Total pedidos"
          value={String(metrics.totalOrders)}
          sub={`${metrics.cancelledOrders} cancelados`}
          icon={<ShoppingBag size={15} className="text-neutral-400" />}
        />
      </motion.div>

      {/* KPI Row 2 — Operations */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <KpiCard
          label="Pendientes"
          value={String(metrics.pendingOrders)}
          sub="Esperando confirmación"
          icon={<Clock size={15} className="text-amber-500" />}
          urgent={metrics.pendingOrders > 0}
        />
        <KpiCard
          label="En proceso"
          value={String(metrics.confirmedOrders + metrics.shippedOrders)}
          sub={`${metrics.confirmedOrders} conf. · ${metrics.shippedOrders} en camino`}
          icon={<Truck size={15} className="text-blue-500" />}
        />
        <KpiCard
          label="Entregados"
          value={String(metrics.deliveredOrders)}
          sub="Completados exitosamente"
          icon={<CheckCircle size={15} className="text-green-500" />}
        />
        <KpiCard
          label="Clientes registrados"
          value={String(customerCount)}
          sub={`${totalSkus - outOfStock} de ${totalSkus} SKUs en stock`}
          icon={<Users size={15} className="text-neutral-400" />}
        />
      </motion.div>

      {/* Charts row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Revenue chart — 2/3 */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-5">
            Ingresos últimos 14 días
          </p>
          <div className="flex items-end gap-1 h-36">
            {metrics.days14.map((d, i) => {
              const pct = d.revenue / maxDayRevenue;
              const isToday = i === 13;
              return (
                <div
                  key={d.label}
                  className="flex-1 flex flex-col items-center gap-1 group relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                    {d.revenue > 0 ? formatPrice(d.revenue) : "—"}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all ${
                      isToday
                        ? "bg-[#CC0000]"
                        : d.revenue > 0
                          ? "bg-neutral-800"
                          : "bg-neutral-100"
                    }`}
                    style={{
                      height: `${Math.max(pct * 100, d.revenue > 0 ? 6 : 2)}%`,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-neutral-400">
              {metrics.days14[0].label}
            </span>
            <span className="text-[10px] text-neutral-400">
              {metrics.days14[13].label} (hoy)
            </span>
          </div>
          {metrics.days14.every((d) => d.revenue === 0) && (
            <p className="text-xs text-neutral-400 text-center mt-2">
              Sin ventas en los últimos 14 días
            </p>
          )}
        </div>

        {/* Orders by status — 1/3 */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-5">
            Pedidos por estado
          </p>
          {metrics.totalOrders === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin pedidos todavía
            </p>
          ) : (
            <div className="space-y-4">
              {statusOrder.map((s) => {
                const count = metrics.byStatus[s] ?? 0;
                const pct = (count / totalOrdersForPct) * 100;
                const barColor = STATUS_BAR_COLOR[s] ?? "bg-neutral-300";
                return (
                  <div key={s}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-600 font-medium">
                        {ORDER_STATUS_LABEL[s] ?? s}
                      </span>
                      <span className="font-bold text-neutral-900">{count}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Top products + Top customers */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Star size={12} className="text-[#CC0000]" /> Top productos
            </p>
            <span className="text-[10px] text-neutral-400">por unidades vendidas</span>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin datos todavía
            </p>
          ) : (
            <ol className="space-y-4">
              {topProducts.map((p, i) => {
                const maxQty = topProducts[0].totalQty;
                const pct = (p.totalQty / maxQty) * 100;
                return (
                  <li key={p.name} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-neutral-400 w-4 shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium text-neutral-800 flex-1 min-w-0 truncate">
                        {p.name}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 shrink-0">
                        {p.totalQty} ud.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#CC0000] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 shrink-0">
                        {formatPrice(p.totalRevenue)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Top customers */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Users size={12} className="text-[#CC0000]" /> Mejores clientes
            </p>
            <span className="text-[10px] text-neutral-400">por gasto total</span>
          </div>
          {topCustomers.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin datos todavía
            </p>
          ) : (
            <ol className="space-y-4">
              {topCustomers.map((c, i) => {
                const maxSpend = topCustomers[0].totalSpend;
                const pct = (c.totalSpend / maxSpend) * 100;
                return (
                  <li key={c.phone} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-neutral-400 w-4 shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium text-neutral-800 flex-1 min-w-0 truncate">
                        {c.name}
                      </span>
                      <span className="text-xs font-bold text-neutral-900 shrink-0">
                        {c.ordersCount} pedido{c.ordersCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pl-6">
                      <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-800 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 shrink-0">
                        {formatPrice(c.totalSpend)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </motion.div>

      {/* Recent orders + Payment + Stock */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Recent orders — 2/3 */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Clock size={12} /> Pedidos recientes
            </p>
            <Link
              href="/admin/ordenes"
              className="text-[11px] text-[#CC0000] font-semibold hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          {metrics.recentOrders.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin pedidos todavía
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {metrics.recentOrders.map((o) => {
                const statusLabel = ORDER_STATUS_LABEL[o.status] ?? o.status;
                const statusColor =
                  ORDER_STATUS_COLOR[o.status] ?? "bg-neutral-100 text-neutral-700";
                return (
                  <li key={o.id} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-neutral-700">
                          {o.order_number}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {o.customer_name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-neutral-900">
                        {formatPrice(o.total_cop)}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {new Date(o.created_at).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Payment + Stock — 1/3 */}
        <div className="space-y-4">
          {/* Payment methods */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-1.5">
              <CreditCard size={12} /> Métodos de pago
            </p>
            {Object.keys(metrics.paymentMethods).length === 0 ? (
              <p className="text-xs text-neutral-400">Sin datos todavía</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(metrics.paymentMethods)
                  .sort((a, b) => b[1] - a[1])
                  .map(([method, count]) => {
                    const total = Object.values(metrics.paymentMethods).reduce(
                      (s, v) => s + v,
                      0
                    );
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={method}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-neutral-600 truncate">{method}</span>
                          <span className="font-bold text-neutral-900 shrink-0 pl-1">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-800 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Stock status */}
          <div
            className={`rounded-2xl border p-5 ${
              outOfStock > 0
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-1.5">
              <Package size={12} /> Inventario SKUs
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-neutral-600">En stock</span>
                <span className="text-xs font-bold text-green-700">
                  {totalSkus - outOfStock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-neutral-600">Sin stock</span>
                <span
                  className={`text-xs font-bold ${
                    outOfStock > 0 ? "text-red-600" : "text-neutral-400"
                  }`}
                >
                  {outOfStock}
                </span>
              </div>
              <div className="h-1.5 bg-white/60 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${
                      totalSkus > 0
                        ? ((totalSkus - outOfStock) / totalSkus) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              {outOfStock > 0 && (
                <Link
                  href="/admin/productos"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline"
                >
                  <AlertTriangle size={11} /> Ver agotados
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* -------- KpiCard -------- */

function KpiCard({
  label,
  value,
  sub,
  icon,
  highlight = false,
  urgent = false,
  subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  urgent?: boolean;
  subColor?: string;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        urgent
          ? "bg-amber-50 border-amber-200"
          : highlight
            ? "bg-neutral-900 border-neutral-900"
            : "bg-white border-neutral-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p
          className={`text-[10px] uppercase tracking-wider font-semibold ${
            highlight ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          {label}
        </p>
        {icon}
      </div>
      <p
        className={`text-xl font-bold ${
          highlight
            ? "text-white"
            : urgent
              ? "text-amber-700"
              : "text-neutral-900"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-[10px] mt-0.5 ${
            subColor ??
            (highlight
              ? "text-neutral-500"
              : urgent
                ? "text-amber-600"
                : "text-neutral-400")
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
