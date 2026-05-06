"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  Package,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/products";

type OrderRow = {
  id: string;
  total_cop: number;
  created_at: string;
  status: string;
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const [ordersRes, itemsRes, productsRes] = await Promise.all([
          supabase.from("orders").select("id, total_cop, created_at, status"),
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

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === "cancelled") return false;
      const d = new Date(o.created_at.replace(" ", "T"));
      if (range.start && d < range.start) return false;
      if (range.end && d > range.end) return false;
      return true;
    });
  }, [orders, range]);

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
    return {
      revenue,
      count,
      avg: count > 0 ? Math.round(revenue / count) : 0,
    };
  }, [filteredOrders]);

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
    const summary = [
      ["Reporte Prophone", range.label],
      ["Generado", new Date().toLocaleString("es-CO")],
      [""],
      ["Métrica", "Valor"],
      ["Ingresos", periodTotals.revenue],
      ["Pedidos", periodTotals.count],
      ["Ticket promedio", periodTotals.avg],
    ];
    const breakdown = useDailyBreakdown
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
    const cats = [
      ["Categoría", "Ingresos", "Unidades"],
      ...byCategory.map((c) => [c.cat, c.revenue, c.qty]),
    ];
    const top = [
      ["#", "Producto", "Unidades", "Ingresos"],
      ...topProducts.map((p, i) => [i + 1, p.name, p.qty, p.revenue]),
    ];
    return { summary, breakdown, cats, top };
  };

  const fileBaseName = () =>
    `reporte-prophone-${range.label.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;

  const exportCsv = () => {
    const { summary, breakdown, cats, top } = buildSheets();
    const toCsv = (rows: (string | number)[][]) =>
      rows
        .map((r) =>
          r
            .map((c) => {
              const s = String(c);
              return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            })
            .join(",")
        )
        .join("\n");
    const content = [
      toCsv(summary),
      "",
      "Desglose",
      toCsv(breakdown),
      "",
      "Por categoría",
      toCsv(cats),
      "",
      "Top productos",
      toCsv(top),
    ].join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileBaseName()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportXlsx = async () => {
    const XLSX = await import("xlsx");
    const { summary, breakdown, cats, top } = buildSheets();
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(summary),
      "Resumen"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(breakdown),
      useDailyBreakdown ? "Por día" : "Por mes"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(cats),
      "Por categoría"
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(top),
      "Top productos"
    );
    XLSX.writeFile(wb, `${fileBaseName()}.xlsx`);
  };

  const exportPdf = async () => {
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
    doc.text(
      `Generado: ${new Date().toLocaleString("es-CO")}`,
      40,
      108
    );

    autoTable(doc, {
      startY: 130,
      head: [["Métrica", "Valor"]],
      body: [
        ["Ingresos", formatPrice(periodTotals.revenue)],
        ["Pedidos", String(periodTotals.count)],
        ["Ticket promedio", formatPrice(periodTotals.avg)],
      ],
      headStyles: { fillColor: [12, 16, 20], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: 40, right: 40 },
    });

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
      styles: { fontSize: 9 },
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
        styles: { fontSize: 10 },
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
        styles: { fontSize: 9 },
        margin: { left: 40, right: 40 },
      });
    }

    doc.save(`${fileBaseName()}.pdf`);
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

          {/* Dropdown de descargas */}
          <div className="relative">
            <button
              onClick={() => setDownloadOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              <Download size={13} /> Descargar
              <ChevronDown size={12} />
            </button>
            {downloadOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDownloadOpen(false)}
                />
                <div className="absolute top-full right-0 mt-1.5 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      exportXlsx();
                      setDownloadOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-2"
                  >
                    <FileSpreadsheet size={13} className="text-emerald-600" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => {
                      exportPdf();
                      setDownloadOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-2 border-t border-neutral-100"
                  >
                    <FileText size={13} className="text-[#CC0000]" />
                    PDF (.pdf)
                  </button>
                  <button
                    onClick={() => {
                      exportCsv();
                      setDownloadOpen(false);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Kpi
          label="Ingresos"
          value={formatPrice(periodTotals.revenue)}
          icon={<TrendingUp size={15} className="text-green-300" />}
          highlight
        />
        <Kpi label="Pedidos" value={String(periodTotals.count)} />
        <Kpi label="Ticket promedio" value={formatPrice(periodTotals.avg)} />
      </div>

      {/* Desglose */}
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
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 flex items-center gap-1.5">
            <Package size={12} /> Ventas por categoría
          </p>
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
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
            Top productos
          </p>
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
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
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
    </div>
  );
}
