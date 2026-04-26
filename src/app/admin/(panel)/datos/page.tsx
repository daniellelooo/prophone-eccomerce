"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useCatalogStore } from "@/lib/catalog-store";
import {
  useSiteConfigStore,
  DEFAULT_SITE_CONFIG,
} from "@/lib/site-config-store";
import type { Product } from "@/lib/products";
import type { SiteConfig } from "@/lib/site-config-store";

type ExportPayload = {
  version: 1;
  exportedAt: string;
  products: Product[];
  siteConfig: SiteConfig;
};

export default function AdminDatosPage() {
  const products = useCatalogStore((s) => s.products);
  const setProducts = useCatalogStore((s) => s.setAll);
  const resetCatalog = useCatalogStore((s) => s.reset);

  const siteConfig = useSiteConfigStore((s) => s);
  const updateConfig = useSiteConfigStore((s) => s.update);
  const resetConfig = useSiteConfigStore((s) => s.reset);

  const fileRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<
    | { kind: "ok"; products: number; sedes: number }
    | { kind: "error"; message: string }
    | null
  >(null);

  const handleExport = () => {
    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      products,
      siteConfig: {
        whatsappNumber: siteConfig.whatsappNumber,
        whatsappDefaultMessage: siteConfig.whatsappDefaultMessage,
        instagramUrl: siteConfig.instagramUrl,
        bannerEnabled: siteConfig.bannerEnabled,
        bannerItems: siteConfig.bannerItems,
        hoursWeek: siteConfig.hoursWeek,
        hoursWeekend: siteConfig.hoursWeekend,
        sedes: siteConfig.sedes,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `prophone-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text) as Partial<ExportPayload>;
        if (!Array.isArray(parsed.products)) {
          throw new Error("Falta el array 'products' en el JSON.");
        }
        if (!parsed.siteConfig || typeof parsed.siteConfig !== "object") {
          throw new Error("Falta el objeto 'siteConfig' en el JSON.");
        }
        if (
          !confirm(
            `Vas a reemplazar el catálogo y la configuración con el JSON importado:\n\n• ${parsed.products.length} productos\n• ${parsed.siteConfig.sedes?.length ?? 0} sedes\n\n¿Continuar?`
          )
        ) {
          return;
        }
        setProducts(parsed.products);
        const cfg = parsed.siteConfig;
        updateConfig({
          whatsappNumber:
            cfg.whatsappNumber ?? DEFAULT_SITE_CONFIG.whatsappNumber,
          whatsappDefaultMessage:
            cfg.whatsappDefaultMessage ??
            DEFAULT_SITE_CONFIG.whatsappDefaultMessage,
          instagramUrl: cfg.instagramUrl ?? DEFAULT_SITE_CONFIG.instagramUrl,
          bannerEnabled:
            cfg.bannerEnabled ?? DEFAULT_SITE_CONFIG.bannerEnabled,
          bannerItems: cfg.bannerItems ?? DEFAULT_SITE_CONFIG.bannerItems,
          hoursWeek: cfg.hoursWeek ?? DEFAULT_SITE_CONFIG.hoursWeek,
          hoursWeekend: cfg.hoursWeekend ?? DEFAULT_SITE_CONFIG.hoursWeekend,
          sedes: cfg.sedes ?? DEFAULT_SITE_CONFIG.sedes,
        });
        setImportStatus({
          kind: "ok",
          products: parsed.products.length,
          sedes: cfg.sedes?.length ?? 0,
        });
      } catch (err) {
        setImportStatus({
          kind: "error",
          message: (err as Error).message ?? "JSON inválido",
        });
      }
    };
    reader.onerror = () =>
      setImportStatus({ kind: "error", message: "No se pudo leer el archivo." });
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    if (
      confirm(
        "Vas a restaurar TODO a los valores por defecto (catálogo + configuración + sedes + banner). Esto es irreversible. ¿Continuar?"
      )
    ) {
      resetCatalog();
      resetConfig();
    }
  };

  // Tamaño aproximado de localStorage
  const sizeKB = (() => {
    if (typeof window === "undefined") return 0;
    let total = 0;
    try {
      for (const key of Object.keys(localStorage)) {
        const v = localStorage.getItem(key) ?? "";
        total += key.length + v.length;
      }
    } catch {
      /* noop */
    }
    return Math.round((total * 2) / 1024); // UTF-16 = 2 bytes
  })();

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
          Datos (JSON)
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Exporta o importa todo el contenido del sitio como JSON. Sirve como
          puente al backend cuando llegue.
        </p>
      </motion.div>

      {/* Status persistencia */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Productos" value={String(products.length)} />
        <Kpi
          label="SKUs"
          value={String(
            products.reduce((s, p) => s + p.variants.length, 0)
          )}
        />
        <Kpi label="Sedes" value={String(siteConfig.sedes.length)} />
        <Kpi label="LocalStorage" value={`~${sizeKB} KB`} sub="cuota ≈ 5 MB" />
      </div>

      {/* Export */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl border border-neutral-200 p-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <Download size={16} className="text-[#0071E3]" />
          <h2 className="text-sm font-bold text-neutral-900">Exportar</h2>
        </div>
        <p className="text-[11px] text-neutral-500 mb-4">
          Descarga un JSON con todos los productos y la configuración del
          sitio. Útil para backup, para mover datos entre navegadores, o para
          migrar al backend cuando exista.
        </p>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 bg-[#0071E3] hover:bg-[#0051a2] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition active:scale-95"
        >
          <Download size={14} /> Descargar JSON
        </button>
      </motion.section>

      {/* Import */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white rounded-2xl border border-neutral-200 p-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <Upload size={16} className="text-amber-600" />
          <h2 className="text-sm font-bold text-neutral-900">Importar</h2>
        </div>
        <p className="text-[11px] text-neutral-500 mb-4">
          Sube un JSON con la estructura{" "}
          <code className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
            {`{ products, siteConfig }`}
          </code>
          . Reemplaza todo lo que haya guardado en este navegador.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImport(f);
            if (e.target) e.target.value = "";
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 bg-white border border-neutral-300 hover:border-amber-500 hover:text-amber-700 text-neutral-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <Upload size={14} /> Seleccionar JSON…
        </button>

        {importStatus?.kind === "ok" && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-800 text-sm">
            <Check size={14} />
            Importado: {importStatus.products} productos · {importStatus.sedes}{" "}
            sedes.
          </div>
        )}
        {importStatus?.kind === "error" && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-800 text-sm">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error al importar</p>
              <p className="text-[11px] mt-0.5">{importStatus.message}</p>
            </div>
          </div>
        )}
      </motion.section>

      {/* Reset */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="bg-white rounded-2xl border border-red-200 p-5"
      >
        <div className="flex items-center gap-2 mb-1">
          <RotateCcw size={16} className="text-[#CC0000]" />
          <h2 className="text-sm font-bold text-neutral-900">
            Restaurar todo a defaults
          </h2>
        </div>
        <p className="text-[11px] text-neutral-500 mb-4">
          Borra todo lo guardado en este navegador y vuelve al catálogo +
          configuración de fábrica. Esto NO afecta a otros dispositivos /
          navegadores donde tengas datos guardados.
        </p>
        <button
          onClick={handleResetAll}
          className="inline-flex items-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-[#CC0000] px-4 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          <RotateCcw size={14} /> Restaurar defaults
        </button>
      </motion.section>

      <p className="text-[11px] text-neutral-400 flex items-start gap-1.5">
        <Database size={11} className="shrink-0 mt-0.5" />
        Stack actual: catálogo + configuración persisten 100% en localStorage
        de este navegador. Cuando exista backend, los stores se reemplazan por
        fetch / server actions sin tocar UI ni este import/export — el JSON
        sirve como contrato.
      </p>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 px-4 py-3.5">
      <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="text-[10px] text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  );
}
