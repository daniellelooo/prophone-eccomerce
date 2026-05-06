"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Users,
  MapPin,
  CreditCard,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";

type OrderRow = {
  id: string;
  order_number: string | null;
  total_cop: number;
  created_at: string;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  shipping_city: string | null;
  shipping_department: string | null;
  payment_method: string | null;
  payment_status: string | null;
};

type ItemRow = {
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price_cop: number;
};

type ProductMeta = {
  id: string;
  category: string;
};

// ─── Período ───────────────────────────────────────────────────────

type PeriodKey =
  | "today"
  | "7d"
  | "30d"
  | "thisMonth"
  | "lastMonth"
  | "ytd"
  | "year"
  | "month"
  | "all";

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "Últimos 7 días" },
  { key: "30d", label: "Últimos 30 días" },
  { key: "thisMonth", label: "Este mes" },
  { key: "lastMonth", label: "Mes pasado" },
  { key: "ytd", label: "Año en curso" },
  { key: "year", label: "Año específico…" },
  { key: "month", label: "Mes específico…" },
  { key: "all", label: "Todo el tiempo" },
];

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendientes",
  paid: "Pagadas",
  processing: "En proceso",
  shipped: "Enviadas",
  delivered: "Entregadas",
  cancelled: "Canceladas",
  failed: "Fallidas",
};

const PAYMENT_LABELS: Record<string, string> = {
  card: "Tarjeta",
  pse: "PSE",
  nequi: "Nequi",
  bancolombia: "Bancolombia",
  cash: "Efectivo",
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(y: number, m: number) {
  return new Date(y, m + 1, 0, 23, 59, 59, 999);
}

function resolveRange(
  key: PeriodKey,
  customYear: number,
  customMonth: number
): { start: Date | null; end: Date | null; label: string } {
  const now = new Date();
  const today = startOfDay(now);
  switch (key) {
    case "today": {
      const end = new Date(today.getTime() + 86400000 - 1);
      return { start: today, end, label: "Hoy" };
    }
    case "7d": {
      const start = new Date(today.getTime() - 6 * 86400000);
      return { start, end: now, label: "Últimos 7 días" };
    }
    case "30d": {
      const start = new Date(today.getTime() - 29 * 86400000);
      return { start, end: now, label: "Últimos 30 días" };
    }
    case "thisMonth": {
      const start = startOfMonth(now);
      return {
        start,
        end: now,
        label: `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`,
      };
    }
    case "lastMonth": {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        start: lm,
        end: endOfMonth(lm.getFullYear(), lm.getMonth()),
        label: `${MONTH_NAMES[lm.getMonth()]} ${lm.getFullYear()}`,
      };
    }
    case "ytd": {
      const start = new Date(now.getFullYear(), 0, 1);
      return {
        start,
        end: now,
        label: `Año ${now.getFullYear()} (en curso)`,
      };
    }
    case "year": {
      const start = new Date(customYear, 0, 1);
      const end = new Date(customYear, 11, 31, 23, 59, 59, 999);
      return { start, end, label: `Año ${customYear}` };
    }
    case "month": {
      const start = new Date(customYear, customMonth, 1);
      const end = endOfMonth(customYear, customMonth);
      return {
        start,
        end,
        label: `${MONTH_NAMES[customMonth]} ${customYear}`,
      };
    }
    case "all":
      return { start: null, end: null, label: "Todo el tiempo" };
  }
}

/**
 * Ventana del período anterior con la misma duración. Se usa para mostrar
 * el % de variación. Para "all" no hay comparación.
 */
function previousRange(
  start: Date | null,
  end: Date | null
): { start: Date; end: Date } | null {
  if (!start || !end) return null;
  const span = end.getTime() - start.getTime();
  return {
    start: new Date(start.getTime() - span - 1),
    end: new Date(start.getTime() - 1),
  };
}

/**
 * Dispara una descarga de un Blob desde el browser. Funciona en Safari /
 * iOS porque el <a> se inserta en el DOM antes del click y se libera
 * después, en lugar de usarse fuera del documento.
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Damos tiempo al browser a iniciar la descarga antes de revocar el URL.
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

// ─── Página ────────────────────────────────────────────────────────

export default function AdminReportesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [productMeta, setProductMeta] = useState<Map<string, ProductMeta>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<PeriodKey>("ytd");
  const now = new Date();
  const [customYear, setCustomYear] = useState<number>(now.getFullYear());
  const [customMonth, setCustomMonth] = useState<number>(now.getMonth());
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloading, setDownloading] = useState<null | "csv" | "xlsx" | "pdf">(
    null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const [ordersRes, itemsRes, productsRes] = await Promise.all([
          supabase
            .from("orders")
            .select(
              "id, order_number, total_cop, created_at, status, customer_name, customer_phone, shipping_city, shipping_department, payment_method, payment_status"
            ),
          supabase
            .from("order_items")
            .select(
              "order_id, product_id, product_name, quantity, unit_price_cop"
            ),
          supabase.from("products").select("id, category"),
        ]);
        if (ordersRes.error) throw ordersRes.error;
        if (itemsRes.error) throw itemsRes.error;
        if (productsRes.error) throw productsRes.error;
        if (cancelled) return;
        setOrders((ordersRes.data ?? []) as OrderRow[]);
        setItems((itemsRes.data ?? []) as ItemRow[]);
        const map = new Map<string, ProductMeta>();
        for (const p of productsRes.data ?? []) {
          map.set(p.id, { id: p.id, category: p.category });
        }
        setProductMeta(map);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const range = useMemo(
    () => resolveRange(period, customYear, customMonth),
    [period, customYear, customMonth]
  );
  const prevRange = useMemo(
    () => previousRange(range.start, range.end),
    [range]
  );

  const inRange = (
    iso: string,
    start: Date | null,
    end: Date | null
  ) => {
    const d = new Date(iso.replace(" ", "T"));
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  };

  // Pedidos NO cancelados dentro del rango (los principales para revenue)
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status !== "cancelled" &&
        o.status !== "failed" &&
        inRange(o.created_at, range.start, range.end)
    );
  }, [orders, range]);

  // TODOS los pedidos del rango (incluye cancelled/failed) — para tasa de cancelación
  const allInRangeOrders = useMemo(() => {
    return orders.filter((o) => inRange(o.created_at, range.start, range.end));
  }, [orders, range]);

  // Pedidos del período anterior (no cancelados) — para comparación
  const prevPeriodOrders = useMemo(() => {
    if (!prevRange) return [];
    return orders.filter(
      (o) =>
        o.status !== "cancelled" &&
        o.status !== "failed" &&
        inRange(o.created_at, prevRange.start, prevRange.end)
    );
  }, [orders, prevRange]);

  const filteredOrderIds = useMemo(
    () => new Set(filteredOrders.map((o) => o.id)),
    [filteredOrders]
  );

  const filteredItems = useMemo(
    () => items.filter((it) => filteredOrderIds.has(it.order_id)),
    [items, filteredOrderIds]
  );

  // Si el período es anual o YTD, mostramos desglose mensual; si es mensual, diario.
  const useDailyBreakdown =
    period === "today" ||
    period === "7d" ||
    period === "30d" ||
    period === "thisMonth" ||
    period === "lastMonth" ||
    period === "month";

  const monthly = useMemo(() => {
    if (useDailyBreakdown) return [];
    const yearForBreakdown =
      period === "year" ? customYear : new Date().getFullYear();
    const data = Array.from({ length: 12 }, (_, m) => ({
      label: new Date(yearForBreakdown, m, 1).toLocaleDateString("es-CO", {
        month: "short",
      }),
      revenue: 0,
      orders: 0,
    }));
    for (const o of filteredOrders) {
      const d = new Date(o.created_at.replace(" ", "T"));
      if (d.getFullYear() !== yearForBreakdown) continue;
      data[d.getMonth()].revenue += o.total_cop;
      data[d.getMonth()].orders += 1;
    }
    return data;
  }, [filteredOrders, period, customYear, useDailyBreakdown]);

  const daily = useMemo(() => {
    if (!useDailyBreakdown || !range.start) return [];
    const days: { label: string; date: Date; revenue: number; orders: number }[] = [];
    const start = startOfDay(range.start);
    const end = startOfDay(range.end ?? new Date());
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push({
        label: cursor.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "short",
        }),
        date: new Date(cursor),
        revenue: 0,
        orders: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const o of filteredOrders) {
      const d = startOfDay(new Date(o.created_at.replace(" ", "T")));
      const idx = days.findIndex((x) => x.date.getTime() === d.getTime());
      if (idx >= 0) {
        days[idx].revenue += o.total_cop;
        days[idx].orders += 1;
      }
    }
    return days;
  }, [filteredOrders, range, useDailyBreakdown]);

  const periodTotals = useMemo(() => {
    const revenue = filteredOrders.reduce((s, o) => s + o.total_cop, 0);
    const count = filteredOrders.length;
    const totalQty = filteredItems.reduce((s, it) => s + it.quantity, 0);
    return {
      revenue,
      count,
      avg: count > 0 ? Math.round(revenue / count) : 0,
      itemsPerOrder: count > 0 ? Math.round((totalQty / count) * 10) / 10 : 0,
      totalQty,
    };
  }, [filteredOrders, filteredItems]);

  const prevPeriodTotals = useMemo(() => {
    const revenue = prevPeriodOrders.reduce((s, o) => s + o.total_cop, 0);
    const count = prevPeriodOrders.length;
    return {
      revenue,
      count,
      avg: count > 0 ? Math.round(revenue / count) : 0,
    };
  }, [prevPeriodOrders]);

  // % cambio vs período anterior
  const variation = useMemo(() => {
    const calc = (cur: number, prev: number) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 100);
    };
    return {
      revenue: calc(periodTotals.revenue, prevPeriodTotals.revenue),
      count: calc(periodTotals.count, prevPeriodTotals.count),
      avg: calc(periodTotals.avg, prevPeriodTotals.avg),
    };
  }, [periodTotals, prevPeriodTotals]);

  const byCategory = useMemo(() => {
    const map = new Map<string, { revenue: number; qty: number }>();
    for (const it of filteredItems) {
      const cat =
        (it.product_id && productMeta.get(it.product_id)?.category) || "otros";
      const cur = map.get(cat) ?? { revenue: 0, qty: 0 };
      cur.revenue += it.unit_price_cop * it.quantity;
      cur.qty += it.quantity;
      map.set(cat, cur);
    }
    return Array.from(map.entries())
      .map(([cat, v]) => ({ cat, ...v }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredItems, productMeta]);

  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >();
    for (const it of filteredItems) {
      const cur = map.get(it.product_name) ?? {
        name: it.product_name,
        qty: 0,
        revenue: 0,
      };
      cur.qty += it.quantity;
      cur.revenue += it.unit_price_cop * it.quantity;
      map.set(it.product_name, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredItems]);

  // Top clientes (agrupados por phone — más confiable que name)
  const topCustomers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; phone: string; orders: number; revenue: number }
    >();
    for (const o of filteredOrders) {
      const phone = o.customer_phone || "anon";
      const name = o.customer_name || "Anónimo";
      const cur = map.get(phone) ?? {
        name,
        phone,
        orders: 0,
        revenue: 0,
      };
      cur.orders += 1;
      cur.revenue += o.total_cop;
      map.set(phone, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrders]);

  // Top ciudades
  const topCities = useMemo(() => {
    const map = new Map<
      string,
      { city: string; orders: number; revenue: number }
    >();
    for (const o of filteredOrders) {
      const city = o.shipping_city?.trim() || "Sin ciudad";
      const cur = map.get(city) ?? { city, orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += o.total_cop;
      map.set(city, cur);
    }
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [filteredOrders]);

  // Distribución por método de pago
  const paymentMethods = useMemo(() => {
    const map = new Map<string, { method: string; count: number; revenue: number }>();
    for (const o of filteredOrders) {
      const m = o.payment_method || "sin_metodo";
      const cur = map.get(m) ?? { method: m, count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += o.total_cop;
      map.set(m, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredOrders]);

  // Status breakdown — incluye cancelled/failed
  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of allInRangeOrders) {
      map.set(o.status, (map.get(o.status) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [allInRangeOrders]);

  const cancellationRate = useMemo(() => {
    if (allInRangeOrders.length === 0) return 0;
    const cancelled = allInRangeOrders.filter(
      (o) => o.status === "cancelled" || o.status === "failed"
    ).length;
    return Math.round((cancelled / allInRangeOrders.length) * 100);
  }, [allInRangeOrders]);

  // Día de la semana con más ventas
  const byWeekday = useMemo(() => {
    const data = Array.from({ length: 7 }, (_, i) => ({
      day: WEEKDAY_NAMES[i],
      revenue: 0,
      orders: 0,
    }));
    for (const o of filteredOrders) {
      const d = new Date(o.created_at.replace(" ", "T"));
      data[d.getDay()].revenue += o.total_cop;
      data[d.getDay()].orders += 1;
    }
    return data;
  }, [filteredOrders]);

  // Hora pico
  const peakHour = useMemo(() => {
    const hours = Array(24).fill(0);
    for (const o of filteredOrders) {
      const d = new Date(o.created_at.replace(" ", "T"));
      hours[d.getHours()] += 1;
    }
    let bestHour = 0;
    let bestCount = 0;
    hours.forEach((h, i) => {
      if (h > bestCount) {
        bestCount = h;
        bestHour = i;
      }
    });
    return bestCount > 0
      ? `${String(bestHour).padStart(2, "0")}:00 – ${String(
          (bestHour + 1) % 24
        ).padStart(2, "0")}:00`
      : "—";
  }, [filteredOrders]);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const o of orders) {
      set.add(new Date(o.created_at.replace(" ", "T")).getFullYear());
    }
    set.add(new Date().getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [orders]);

  // ─── Exportadores ─────────────────────────────────────────────────

  const buildSheets = () => {
    const summary: (string | number)[][] = [
      ["Reporte Prophone", range.label],
      ["Generado", new Date().toLocaleString("es-CO")],
      [""],
      ["Métrica", "Valor", "Período anterior", "Variación"],
      [
        "Ingresos",
        periodTotals.revenue,
        prevPeriodTotals.revenue,
        `${variation.revenue > 0 ? "+" : ""}${variation.revenue}%`,
      ],
      [
        "Pedidos",
        periodTotals.count,
        prevPeriodTotals.count,
        `${variation.count > 0 ? "+" : ""}${variation.count}%`,
      ],
      [
        "Ticket promedio",
        periodTotals.avg,
        prevPeriodTotals.avg,
        `${variation.avg > 0 ? "+" : ""}${variation.avg}%`,
      ],
      ["Items por pedido", periodTotals.itemsPerOrder, "", ""],
      ["Unidades vendidas", periodTotals.totalQty, "", ""],
      ["Tasa de cancelación", `${cancellationRate}%`, "", ""],
      ["Hora pico de compras", peakHour, "", ""],
    ];
    const breakdown: (string | number)[][] = useDailyBreakdown
      ? [
          ["Día", "Ingresos", "Pedidos", "Ticket promedio"],
          ...daily.map((d) => [
            d.label,
            d.revenue,
            d.orders,
            d.orders > 0 ? Math.round(d.revenue / d.orders) : 0,
          ]),
        ]
      : [
          ["Mes", "Ingresos", "Pedidos", "Ticket promedio"],
          ...monthly.map((m) => [
            m.label,
            m.revenue,
            m.orders,
            m.orders > 0 ? Math.round(m.revenue / m.orders) : 0,
          ]),
        ];
    const cats: (string | number)[][] = [
      ["Categoría", "Ingresos", "Unidades"],
      ...byCategory.map((c) => [c.cat, c.revenue, c.qty]),
    ];
    const top: (string | number)[][] = [
      ["#", "Producto", "Unidades", "Ingresos"],
      ...topProducts.map((p, i) => [i + 1, p.name, p.qty, p.revenue]),
    ];
    const customers: (string | number)[][] = [
      ["#", "Cliente", "Teléfono", "Pedidos", "Total"],
      ...topCustomers.map((c, i) => [
        i + 1,
        c.name,
        c.phone,
        c.orders,
        c.revenue,
      ]),
    ];
    const cities: (string | number)[][] = [
      ["#", "Ciudad", "Pedidos", "Ingresos"],
      ...topCities.map((c, i) => [i + 1, c.city, c.orders, c.revenue]),
    ];
    const payments: (string | number)[][] = [
      ["Método", "Pedidos", "Ingresos"],
      ...paymentMethods.map((p) => [
        PAYMENT_LABELS[p.method] || p.method,
        p.count,
        p.revenue,
      ]),
    ];
    const statuses: (string | number)[][] = [
      ["Estado", "Pedidos"],
      ...statusBreakdown.map((s) => [
        STATUS_LABELS[s.status] || s.status,
        s.count,
      ]),
    ];
    const weekday: (string | number)[][] = [
      ["Día", "Pedidos", "Ingresos"],
      ...byWeekday.map((w) => [w.day, w.orders, w.revenue]),
    ];
    return {
      summary,
      breakdown,
      cats,
      top,
      customers,
      cities,
      payments,
      statuses,
      weekday,
    };
  };

  const fileBaseName = () =>
    `reporte-prophone-${range.label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}`;

  const exportCsv = () => {
    setDownloading("csv");
    try {
      const sheets = buildSheets();
      const toCsv = (rows: (string | number)[][]) =>
        rows
          .map((r) =>
            r
              .map((c) => {
                const s = String(c ?? "");
                return /[,"\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
              })
              .join(",")
          )
          .join("\n");
      const sections: [string, (string | number)[][]][] = [
        ["Resumen", sheets.summary],
        [useDailyBreakdown ? "Por día" : "Por mes", sheets.breakdown],
        ["Por categoría", sheets.cats],
        ["Top productos", sheets.top],
        ["Top clientes", sheets.customers],
        ["Top ciudades", sheets.cities],
        ["Métodos de pago", sheets.payments],
        ["Estados de pedidos", sheets.statuses],
        ["Por día de la semana", sheets.weekday],
      ];
      const content = sections
        .map(([title, rows]) => `${title}\n${toCsv(rows)}`)
        .join("\n\n");
      // BOM para que Excel detecte UTF-8 correctamente al abrir el .csv
      const blob = new Blob(["﻿" + content], {
        type: "text/csv;charset=utf-8",
      });
      downloadBlob(blob, `${fileBaseName()}.csv`);
    } catch (err) {
      alert(`No se pudo generar el CSV: ${(err as Error).message}`);
    } finally {
      setDownloading(null);
    }
  };

  const exportXlsx = async () => {
    setDownloading("xlsx");
    try {
      const XLSX = await import("xlsx");
      const sheets = buildSheets();
      const wb = XLSX.utils.book_new();
      const append = (data: (string | number)[][], name: string) => {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(data), name);
      };
      append(sheets.summary, "Resumen");
      append(sheets.breakdown, useDailyBreakdown ? "Por día" : "Por mes");
      append(sheets.cats, "Por categoría");
      append(sheets.top, "Top productos");
      append(sheets.customers, "Top clientes");
      append(sheets.cities, "Top ciudades");
      append(sheets.payments, "Métodos pago");
      append(sheets.statuses, "Estados");
      append(sheets.weekday, "Día de semana");

      // Generar buffer y forzar download por blob (más robusto en mobile/Safari)
      const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, `${fileBaseName()}.xlsx`);
    } catch (err) {
      alert(`No se pudo generar el Excel: ${(err as Error).message}`);
    } finally {
      setDownloading(null);
    }
  };

  const exportPdf = async () => {
    setDownloading("pdf");
    try {
      const [{ default: jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const autoTable = (
        autoTableMod as unknown as {
          default: (d: unknown, opts: object) => void;
        }
      ).default;

      const W = doc.internal.pageSize.getWidth();
      doc.setFillColor(204, 0, 0);
      doc.rect(0, 0, W, 60, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Prophone Medellín · Reporte", 40, 38);

      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Período: ${range.label}`, 40, 90);
      doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, 40, 108);

      // Resumen ejecutivo con variación
      autoTable(doc, {
        startY: 130,
        head: [["Métrica", "Valor", "Período anterior", "Variación"]],
        body: [
          [
            "Ingresos",
            formatPrice(periodTotals.revenue),
            formatPrice(prevPeriodTotals.revenue),
            `${variation.revenue > 0 ? "+" : ""}${variation.revenue}%`,
          ],
          [
            "Pedidos",
            String(periodTotals.count),
            String(prevPeriodTotals.count),
            `${variation.count > 0 ? "+" : ""}${variation.count}%`,
          ],
          [
            "Ticket promedio",
            formatPrice(periodTotals.avg),
            formatPrice(prevPeriodTotals.avg),
            `${variation.avg > 0 ? "+" : ""}${variation.avg}%`,
          ],
          ["Items por pedido", String(periodTotals.itemsPerOrder), "", ""],
          ["Unidades vendidas", String(periodTotals.totalQty), "", ""],
          ["Tasa de cancelación", `${cancellationRate}%`, "", ""],
          ["Hora pico", peakHour, "", ""],
        ],
        headStyles: { fillColor: [12, 16, 20], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: 40, right: 40 },
      });

      // Desglose por día/mes
      autoTable(doc, {
        head: [
          useDailyBreakdown
            ? ["Día", "Ingresos", "Pedidos", "Ticket prom."]
            : ["Mes", "Ingresos", "Pedidos", "Ticket prom."],
        ],
        body: (useDailyBreakdown ? daily : monthly).map((r) => [
          r.label,
          formatPrice(r.revenue),
          String(r.orders),
          r.orders > 0 ? formatPrice(Math.round(r.revenue / r.orders)) : "—",
        ]),
        headStyles: { fillColor: [204, 0, 0], textColor: 255 },
        styles: { fontSize: 8 },
        margin: { left: 40, right: 40 },
      });

      if (byCategory.length > 0) {
        autoTable(doc, {
          head: [["Categoría", "Ingresos", "Unidades"]],
          body: byCategory.map((c) => [
            c.cat,
            formatPrice(c.revenue),
            String(c.qty),
          ]),
          headStyles: { fillColor: [12, 16, 20], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 40, right: 40 },
        });
      }

      if (topProducts.length > 0) {
        autoTable(doc, {
          head: [["#", "Producto", "Unidades", "Ingresos"]],
          body: topProducts.map((p, i) => [
            String(i + 1),
            p.name,
            String(p.qty),
            formatPrice(p.revenue),
          ]),
          headStyles: { fillColor: [204, 0, 0], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 40, right: 40 },
        });
      }

      if (topCustomers.length > 0) {
        autoTable(doc, {
          head: [["#", "Cliente", "Teléfono", "Pedidos", "Total"]],
          body: topCustomers.map((c, i) => [
            String(i + 1),
            c.name,
            c.phone,
            String(c.orders),
            formatPrice(c.revenue),
          ]),
          headStyles: { fillColor: [12, 16, 20], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 40, right: 40 },
        });
      }

      if (topCities.length > 0) {
        autoTable(doc, {
          head: [["#", "Ciudad", "Pedidos", "Ingresos"]],
          body: topCities.map((c, i) => [
            String(i + 1),
            c.city,
            String(c.orders),
            formatPrice(c.revenue),
          ]),
          headStyles: { fillColor: [204, 0, 0], textColor: 255 },
          styles: { fontSize: 8 },
          margin: { left: 40, right: 40 },
        });
      }

      if (paymentMethods.length > 0) {
        autoTable(doc, {
          head: [["Método", "Pedidos", "Ingresos"]],
          body: paymentMethods.map((p) => [
            PAYMENT_LABELS[p.method] || p.method,
            String(p.count),
            formatPrice(p.revenue),
          ]),
          headStyles: { fillColor: [12, 16, 20], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 40, right: 40 },
        });
      }

      if (statusBreakdown.length > 0) {
        autoTable(doc, {
          head: [["Estado", "Pedidos"]],
          body: statusBreakdown.map((s) => [
            STATUS_LABELS[s.status] || s.status,
            String(s.count),
          ]),
          headStyles: { fillColor: [12, 16, 20], textColor: 255 },
          styles: { fontSize: 9 },
          margin: { left: 40, right: 40 },
        });
      }

      // Genera el PDF como blob y dispara el download — más robusto que doc.save() en algunos browsers
      const blob = doc.output("blob");
      downloadBlob(blob, `${fileBaseName()}.pdf`);
    } catch (err) {
      alert(`No se pudo generar el PDF: ${(err as Error).message}`);
    } finally {
      setDownloading(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
        Error: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-neutral-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-72 bg-neutral-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const breakdownRows = useDailyBreakdown ? daily : monthly;
  const maxBreakdown = Math.max(...breakdownRows.map((r) => r.revenue), 1);

  return (
    <div className="space-y-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <FileBarChart size={22} className="text-[#CC0000]" /> Reportes
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Filtra por período y descarga en CSV, Excel o PDF.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de período */}
          <div className="inline-flex items-center bg-white border border-neutral-200 rounded-xl px-2.5 py-2 gap-2">
            <Calendar size={14} className="text-neutral-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
              className="text-sm font-medium text-neutral-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {period === "year" && (
            <select
              value={customYear}
              onChange={(e) => setCustomYear(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-800 focus:outline-none cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}

          {period === "month" && (
            <>
              <select
                value={customMonth}
                onChange={(e) => setCustomMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-800 focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={customYear}
                onChange={(e) => setCustomYear(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-800 focus:outline-none cursor-pointer"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Dropdown de descargas con loading state */}
          <div className="relative">
            <button
              onClick={() => setDownloadOpen((v) => !v)}
              disabled={!!downloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Generando {downloading.toUpperCase()}…
                </>
              ) : (
                <>
                  <Download size={13} /> Descargar
                  <ChevronDown size={12} />
                </>
              )}
            </button>
            {downloadOpen && !downloading && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDownloadOpen(false)}
                />
                <div className="absolute top-full right-0 mt-1.5 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setDownloadOpen(false);
                      void exportXlsx();
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-2"
                  >
                    <FileSpreadsheet size={13} className="text-emerald-600" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => {
                      setDownloadOpen(false);
                      void exportPdf();
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-2 border-t border-neutral-100"
                  >
                    <FileText size={13} className="text-[#CC0000]" />
                    PDF (.pdf)
                  </button>
                  <button
                    onClick={() => {
                      setDownloadOpen(false);
                      exportCsv();
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-2 border-t border-neutral-100"
                  >
                    <FileText size={13} className="text-neutral-500" />
                    CSV (.csv)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Period chip */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-700">
        <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000]" />
        Mostrando: {range.label}
      </div>

      {/* KPIs principales con variación vs período anterior */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi
          label="Ingresos"
          value={formatPrice(periodTotals.revenue)}
          delta={prevRange ? variation.revenue : null}
          icon={<TrendingUp size={15} className="text-green-300" />}
          highlight
        />
        <Kpi
          label="Pedidos"
          value={String(periodTotals.count)}
          delta={prevRange ? variation.count : null}
        />
        <Kpi
          label="Ticket promedio"
          value={formatPrice(periodTotals.avg)}
          delta={prevRange ? variation.avg : null}
        />
        <Kpi
          label="Items / pedido"
          value={String(periodTotals.itemsPerOrder)}
        />
      </div>

      {/* KPIs secundarios — health check del negocio */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniKpi
          label="Unidades vendidas"
          value={String(periodTotals.totalQty)}
          icon={<Package size={13} className="text-neutral-400" />}
        />
        <MiniKpi
          label="Tasa cancelación"
          value={`${cancellationRate}%`}
          icon={
            <AlertCircle
              size={13}
              className={
                cancellationRate > 15 ? "text-red-500" : "text-neutral-400"
              }
            />
          }
          warn={cancellationRate > 15}
        />
        <MiniKpi
          label="Hora pico"
          value={peakHour}
          icon={<Clock size={13} className="text-neutral-400" />}
        />
        <MiniKpi
          label="Clientes únicos"
          value={String(topCustomers.length === 10 ? "10+" : topCustomers.length)}
          icon={<Users size={13} className="text-neutral-400" />}
        />
      </div>

      {/* Desglose temporal */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
          {useDailyBreakdown ? "Desglose por día" : "Desglose mensual"}
        </p>
        {breakdownRows.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-8">
            Sin datos en este período
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="text-left py-2 font-semibold">
                    {useDailyBreakdown ? "Día" : "Mes"}
                  </th>
                  <th className="text-left py-2 font-semibold w-1/2">
                    Ingresos
                  </th>
                  <th className="text-right py-2 font-semibold">Pedidos</th>
                  <th className="text-right py-2 font-semibold">
                    Ticket prom.
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {breakdownRows.map((r, i) => {
                  const avg = r.orders > 0 ? Math.round(r.revenue / r.orders) : 0;
                  const pct = (r.revenue / maxBreakdown) * 100;
                  return (
                    <tr key={`${r.label}-${i}`}>
                      <td className="py-2.5 capitalize font-medium">
                        {r.label}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden max-w-xs">
                            <div
                              className="h-full bg-[#CC0000] rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-neutral-900 shrink-0">
                            {formatPrice(r.revenue)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-semibold">
                        {r.orders}
                      </td>
                      <td className="py-2.5 text-right text-neutral-600">
                        {r.orders > 0 ? formatPrice(avg) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Por categoría + Top productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Ventas por categoría" icon={<Package size={12} />}>
          {byCategory.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin datos
            </p>
          ) : (
            <div className="space-y-3">
              {byCategory.map((c) => {
                const max = byCategory[0].revenue;
                const pct = (c.revenue / max) * 100;
                return (
                  <div key={c.cat}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-700 capitalize font-medium">
                        {c.cat}
                      </span>
                      <span className="font-bold text-neutral-900">
                        {formatPrice(c.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-800 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 shrink-0">
                        {c.qty} ud.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Top productos">
          {topProducts.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin datos
            </p>
          ) : (
            <ol className="space-y-2.5">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-neutral-400 w-4 shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-medium text-neutral-800 flex-1 min-w-0 truncate">
                    {p.name}
                  </span>
                  <span className="text-neutral-500 shrink-0">{p.qty} ud.</span>
                  <span className="font-bold text-neutral-900 shrink-0">
                    {formatPrice(p.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      {/* Top clientes + Top ciudades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Top clientes" icon={<Users size={12} />}>
          {topCustomers.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin datos
            </p>
          ) : (
            <ol className="space-y-2.5">
              {topCustomers.map((c, i) => (
                <li key={c.phone} className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-neutral-400 w-4 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 truncate">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 tabular-nums">
                      {c.phone}
                    </p>
                  </div>
                  <span className="text-neutral-500 shrink-0">
                    {c.orders} ped.
                  </span>
                  <span className="font-bold text-neutral-900 shrink-0 tabular-nums">
                    {formatPrice(c.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Top ciudades" icon={<MapPin size={12} />}>
          {topCities.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin datos
            </p>
          ) : (
            <div className="space-y-2.5">
              {topCities.map((c) => {
                const max = topCities[0].revenue;
                const pct = (c.revenue / max) * 100;
                return (
                  <div key={c.city}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-700 font-medium">
                        {c.city}
                      </span>
                      <span className="font-bold text-neutral-900 tabular-nums">
                        {formatPrice(c.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#CC0000] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 shrink-0">
                        {c.orders} ped.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Métodos de pago + Estados de pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Métodos de pago" icon={<CreditCard size={12} />}>
          {paymentMethods.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin datos
            </p>
          ) : (
            <div className="space-y-2.5">
              {paymentMethods.map((p) => {
                const total = paymentMethods.reduce((s, x) => s + x.count, 0);
                const pct = (p.count / total) * 100;
                return (
                  <div key={p.method}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-700 font-medium">
                        {PAYMENT_LABELS[p.method] || p.method}
                      </span>
                      <span className="text-neutral-500">
                        {p.count} ped. ·{" "}
                        <span className="font-bold text-neutral-900 tabular-nums">
                          {formatPrice(p.revenue)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 shrink-0 tabular-nums">
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Estados de pedidos">
          {statusBreakdown.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4">
              Sin datos
            </p>
          ) : (
            <div className="space-y-2">
              {statusBreakdown.map((s) => {
                const total = allInRangeOrders.length;
                const pct = total > 0 ? (s.count / total) * 100 : 0;
                const color =
                  s.status === "delivered" || s.status === "paid"
                    ? "bg-emerald-500"
                    : s.status === "cancelled" || s.status === "failed"
                      ? "bg-red-500"
                      : s.status === "pending"
                        ? "bg-amber-500"
                        : "bg-neutral-400";
                return (
                  <div
                    key={s.status}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-neutral-700 font-medium flex-1">
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                    <span className="text-neutral-500 tabular-nums">
                      {s.count}
                    </span>
                    <span className="text-[10px] text-neutral-400 w-10 text-right tabular-nums">
                      {Math.round(pct)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Día de la semana — full width */}
      <Card title="Ventas por día de la semana">
        <div className="grid grid-cols-7 gap-2">
          {byWeekday.map((w) => {
            const max = Math.max(...byWeekday.map((x) => x.revenue), 1);
            const pct = (w.revenue / max) * 100;
            return (
              <div key={w.day} className="text-center">
                <div className="h-24 flex items-end justify-center mb-1.5">
                  <div
                    className="w-full bg-[#CC0000] rounded-t-md transition-all"
                    style={{ height: `${pct}%`, minHeight: w.revenue > 0 ? 2 : 0 }}
                    title={formatPrice(w.revenue)}
                  />
                </div>
                <p className="text-[10px] font-semibold text-neutral-700">
                  {w.day.slice(0, 3)}
                </p>
                <p className="text-[10px] text-neutral-400 tabular-nums">
                  {w.orders}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  delta?: number | null;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  const showDelta = delta !== null && delta !== undefined;
  const positive = (delta ?? 0) >= 0;
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        highlight
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
          highlight ? "text-white" : "text-neutral-900"
        }`}
      >
        {value}
      </p>
      {showDelta && (
        <p
          className={`text-[10px] mt-1 inline-flex items-center gap-1 font-semibold ${
            positive
              ? highlight
                ? "text-emerald-400"
                : "text-emerald-600"
              : highlight
                ? "text-red-400"
                : "text-red-600"
          }`}
        >
          {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {positive ? "+" : ""}
          {delta}% vs período anterior
        </p>
      )}
    </div>
  );
}

function MiniKpi({
  label,
  value,
  icon,
  warn = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 bg-white ${
        warn ? "border-red-200 bg-red-50/30" : "border-neutral-200"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        {icon}
        <p className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">
          {label}
        </p>
      </div>
      <p
        className={`text-base font-bold tabular-nums ${
          warn ? "text-red-700" : "text-neutral-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-1.5">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}
