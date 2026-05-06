"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import {
  type Product,
  type ProductCategory,
  type ProductCondition,
  type Variant,
  conditionLabels,
} from "@/lib/products";

// ─── Configuración por categoría ───────────────────────────────────

export type Axes = {
  storage: boolean;
  color: boolean;
  ram: boolean;
  size: boolean;
};

export const CATEGORY_AXES: Record<ProductCategory, Axes> = {
  iphone: { storage: true, color: true, ram: false, size: false },
  ipad: { storage: true, color: true, ram: false, size: true },
  watch: { storage: false, color: true, ram: false, size: true },
  macbook: { storage: true, color: true, ram: true, size: true },
  accesorios: { storage: false, color: true, ram: false, size: false },
};

const CONDITIONS: ProductCondition[] = ["nuevo", "exhibicion", "preventa"];
/** Condiciones que muestran campos extras de batería y detalles del estado. */
const USED_CONDITIONS: ProductCondition[] = [
  "exhibicion",
  "open-box",
  "as-is",
];
const STORAGE_OPTIONS = [
  "64 GB",
  "128 GB",
  "256 GB",
  "512 GB",
  "1 TB",
  "2 TB",
];

// ─── SKU + slug helpers ────────────────────────────────────────────

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function autoSku(
  productId: string,
  variant: Pick<Variant, "storage" | "ram" | "condition" | "color">,
  existing: string[]
): string {
  const conditionShort: Record<string, string> = {
    nuevo: "n",
    exhibicion: "exh",
    preventa: "pre",
    "open-box": "ob",
    "as-is": "asis",
  };
  const parts = [
    productId,
    variant.storage ? slugify(variant.storage) : null,
    variant.ram ? slugify(variant.ram) : null,
    conditionShort[variant.condition] ?? variant.condition,
    variant.color ? slugify(variant.color).slice(0, 6) : null,
  ].filter(Boolean);
  let base = parts.join("-");
  if (!existing.includes(base)) return base;
  let n = 2;
  while (existing.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

// ─── Color helpers ────────────────────────────────────────────────

const COMMON_COLOR_HEX: Record<string, string> = {
  negro: "#1a1a1a",
  blanco: "#fafafa",
  rojo: "#cc0000",
  azul: "#1d4ed8",
  verde: "#15803d",
  amarillo: "#facc15",
  morado: "#7c3aed",
  rosa: "#ec4899",
  naranja: "#f97316",
  gris: "#737373",
  plata: "#c0c0c0",
  dorado: "#d4af37",
  titanio: "#5a5a5a",
};

function guessHex(name: string): string {
  const k = name.toLowerCase().trim();
  for (const key of Object.keys(COMMON_COLOR_HEX)) {
    if (k.includes(key)) return COMMON_COLOR_HEX[key];
  }
  return "#888888";
}

type ColorGroup = {
  colorName: string;
  hex: string;
  variants: Variant[];
};

function groupVariantsByColor(
  variants: Variant[],
  productColors: { name: string; hex: string }[]
): ColorGroup[] {
  const groups = new Map<string, ColorGroup>();
  variants.forEach((v) => {
    const colorKey = v.color ?? "";
    if (!groups.has(colorKey)) {
      const knownHex = productColors.find((c) => c.name === colorKey)?.hex;
      groups.set(colorKey, {
        colorName: colorKey,
        hex: knownHex ?? guessHex(colorKey),
        variants: [],
      });
    }
    groups.get(colorKey)!.variants.push(v);
  });
  // Asegurar que todos los colores declarados aparezcan aunque no tengan variantes
  productColors.forEach((c) => {
    if (!groups.has(c.name)) {
      groups.set(c.name, { colorName: c.name, hex: c.hex, variants: [] });
    }
  });
  return Array.from(groups.values());
}

// ─── Public API ────────────────────────────────────────────────────

type Props = {
  draft: Product;
  setDraft: React.Dispatch<React.SetStateAction<Product>>;
  axes: Axes;
};

export default function ColorGroupedVariants({ draft, setDraft, axes }: Props) {
  const groups = useMemo(
    () => groupVariantsByColor(draft.variants, draft.colors),
    [draft.variants, draft.colors]
  );

  const productId = draft.id || slugify(draft.name) || "sku";

  const updateVariant = (sku: string, patch: Partial<Variant>) =>
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v) =>
        v.sku === sku ? { ...v, ...patch } : v
      ),
    }));

  const removeVariant = (sku: string) =>
    setDraft((d) => ({
      ...d,
      variants: d.variants.filter((v) => v.sku !== sku),
    }));

  const duplicateVariant = (sku: string) =>
    setDraft((d) => {
      const orig = d.variants.find((v) => v.sku === sku);
      if (!orig) return d;
      const skus = d.variants.map((v) => v.sku);
      const copy: Variant = {
        ...orig,
        sku: autoSku(productId, orig, skus),
      };
      const idx = d.variants.findIndex((v) => v.sku === sku);
      const next = [...d.variants];
      next.splice(idx + 1, 0, copy);
      return { ...d, variants: next };
    });

  const addColor = (name: string, hex: string) => {
    const cleanName = name.trim();
    if (!cleanName) return;
    if (
      draft.colors.some(
        (c) => c.name.toLowerCase() === cleanName.toLowerCase()
      )
    ) {
      alert(`El color "${cleanName}" ya existe.`);
      return;
    }
    const skus = draft.variants.map((v) => v.sku);
    const newVariant: Variant = {
      sku: autoSku(
        productId,
        {
          storage: undefined,
          ram: undefined,
          condition: "nuevo",
          color: cleanName,
        },
        skus
      ),
      color: cleanName,
      condition: "nuevo",
      price: 0,
      inStock: true,
      stockQuantity: 0,
    };
    setDraft((d) => ({
      ...d,
      colors: [...d.colors, { name: cleanName, hex }],
      variants: [...d.variants, newVariant],
    }));
  };

  const renameColor = (oldName: string, newName: string, newHex: string) => {
    const cleanNew = newName.trim();
    if (!cleanNew || cleanNew === oldName) {
      if (newHex !== draft.colors.find((c) => c.name === oldName)?.hex) {
        setDraft((d) => ({
          ...d,
          colors: d.colors.map((c) =>
            c.name === oldName ? { ...c, hex: newHex } : c
          ),
        }));
      }
      return;
    }
    const conflict = draft.colors.find(
      (c) =>
        c.name !== oldName && c.name.toLowerCase() === cleanNew.toLowerCase()
    );
    setDraft((d) => {
      if (conflict) {
        return {
          ...d,
          colors: d.colors.filter((c) => c.name !== oldName),
          variants: d.variants.map((v) =>
            v.color === oldName ? { ...v, color: conflict.name } : v
          ),
        };
      }
      return {
        ...d,
        colors: d.colors.map((c) =>
          c.name === oldName ? { name: cleanNew, hex: newHex } : c
        ),
        variants: d.variants.map((v) =>
          v.color === oldName ? { ...v, color: cleanNew } : v
        ),
      };
    });
  };

  const removeColor = (colorName: string) => {
    if (!confirm(`Eliminar el color "${colorName}" y todas sus variantes?`))
      return;
    setDraft((d) => ({
      ...d,
      colors: d.colors.filter((c) => c.name !== colorName),
      variants: d.variants.filter((v) => (v.color ?? "") !== colorName),
    }));
  };

  const addStorageToColor = (
    colorName: string,
    storage: string,
    condition: ProductCondition = "nuevo"
  ) => {
    const cleanStorage = storage.trim();
    if (!cleanStorage) return;
    const colorVariants = draft.variants.filter(
      (v) => (v.color ?? "") === colorName
    );

    if (condition === "nuevo") {
      const dup = colorVariants.some(
        (v) => v.storage === cleanStorage && v.condition === "nuevo"
      );
      if (dup) {
        alert(
          `${colorName || "Sin color"} ya tiene un equipo NUEVO de ${cleanStorage}. Para agregar varios usa el botón de duplicar.`
        );
        return;
      }
    }

    const sibling = draft.variants.find(
      (v) => v.storage === cleanStorage && v.condition === condition
    );
    const skus = draft.variants.map((v) => v.sku);
    const newVariant: Variant = {
      sku: autoSku(
        productId,
        {
          storage: cleanStorage,
          ram: undefined,
          condition,
          color: colorName || undefined,
        },
        skus
      ),
      color: colorName || undefined,
      storage: cleanStorage,
      condition,
      price: sibling?.price ?? 0,
      inStock: true,
      stockQuantity: USED_CONDITIONS.includes(condition) ? 1 : 0,
    };
    setDraft((d) => ({ ...d, variants: [...d.variants, newVariant] }));
  };

  const moveVariantToColor = (sku: string, targetColor: string) => {
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v) =>
        v.sku === sku ? { ...v, color: targetColor || undefined } : v
      ),
    }));
  };

  const addStandaloneVariant = (colorName?: string) => {
    const skus = draft.variants.map((v) => v.sku);
    const newV: Variant = {
      sku: autoSku(
        productId,
        { condition: "nuevo", color: colorName },
        skus
      ),
      color: colorName,
      condition: "nuevo",
      price: 0,
      inStock: true,
      stockQuantity: 0,
    };
    setDraft((d) => ({ ...d, variants: [...d.variants, newV] }));
  };

  if (groups.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-xl">
        <p className="text-sm font-semibold text-neutral-700 mb-1">
          Aún no hay variantes
        </p>
        <p className="text-xs text-neutral-400 mb-4">
          Empieza agregando un color (o una variante sin color para productos como cargadores).
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <AddColorButton onAdd={addColor} />
          <button
            type="button"
            onClick={() => addStandaloneVariant(undefined)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-700 bg-white border border-neutral-200 px-3 py-2 rounded-lg hover:border-neutral-400 transition"
          >
            <Plus size={14} /> Variante única (sin color)
          </button>
        </div>
      </div>
    );
  }

  const hideColorUI =
    !axes.color && !groups.some((g) => g.colorName !== "");

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <ColorGroupCard
          key={g.colorName || "__none__"}
          group={g}
          axes={axes}
          hideColorChrome={hideColorUI}
          onRenameColor={(newName, newHex) =>
            renameColor(g.colorName, newName, newHex)
          }
          onRemoveColor={() => removeColor(g.colorName)}
          onAddStorage={(storage, condition) =>
            addStorageToColor(g.colorName, storage, condition)
          }
          onAddVariantNoStorage={() =>
            addStandaloneVariant(g.colorName || undefined)
          }
          onUpdateVariant={updateVariant}
          onRemoveVariant={removeVariant}
          onDuplicateVariant={duplicateVariant}
          onDropVariant={(sku) => moveVariantToColor(sku, g.colorName)}
        />
      ))}

      <div className="flex flex-wrap gap-2 pt-2">
        {axes.color && <AddColorButton onAdd={addColor} />}
        {!groups.some((g) => g.colorName === "") && (
          <button
            type="button"
            onClick={() => addStandaloneVariant(undefined)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 px-3 py-2 rounded-lg hover:border-neutral-400 transition"
          >
            <Plus size={14} /> {axes.color ? "Variante sin color" : "Agregar variante"}
          </button>
        )}
      </div>

      {axes.color && (
        <p className="text-[11px] text-neutral-400 mt-3 leading-relaxed">
          💡 <strong>Tip</strong>: arrastra una variante por su <span className="text-neutral-600">⋮⋮</span> izquierdo para moverla a otro color. Las
          variantes <strong>nuevas</strong> y las de <strong>exhibición</strong> aparecen en secciones separadas dentro de cada color.
        </p>
      )}
    </div>
  );
}

// ─── Color group card ──────────────────────────────────────────────

function ColorGroupCard({
  group,
  axes,
  hideColorChrome,
  onRenameColor,
  onRemoveColor,
  onAddStorage,
  onAddVariantNoStorage,
  onUpdateVariant,
  onRemoveVariant,
  onDuplicateVariant,
  onDropVariant,
}: {
  group: ColorGroup;
  axes: Axes;
  hideColorChrome: boolean;
  onRenameColor: (newName: string, newHex: string) => void;
  onRemoveColor: () => void;
  onAddStorage: (storage: string, condition?: ProductCondition) => void;
  onAddVariantNoStorage: () => void;
  onUpdateVariant: (sku: string, patch: Partial<Variant>) => void;
  onRemoveVariant: (sku: string) => void;
  onDuplicateVariant: (sku: string) => void;
  onDropVariant: (sku: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [draftName, setDraftName] = useState(group.colorName);
  const [showAddStorage, setShowAddStorage] = useState<ProductCondition | null>(
    null
  );
  const [newStorage, setNewStorage] = useState("");
  const [dropHover, setDropHover] = useState(false);

  const totalStock = group.variants.reduce(
    (s, v) => s + (v.stockQuantity ?? 0),
    0
  );
  const isNoColor = group.colorName === "";

  const newVariants = group.variants.filter(
    (v) => v.condition === "nuevo" || v.condition === "preventa"
  );
  const usedVariants = group.variants.filter((v) =>
    USED_CONDITIONS.includes(v.condition)
  );

  const commitName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setDraftName(group.colorName);
      return;
    }
    if (trimmed === group.colorName) return;
    onRenameColor(trimmed, group.hex);
  };

  const handleHexChange = (hex: string) => {
    if (hex !== group.hex) onRenameColor(group.colorName, hex);
  };

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition ${
        dropHover
          ? "border-[#CC0000] ring-2 ring-[#CC0000]/30"
          : "border-neutral-200"
      }`}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("application/x-variant-sku")) {
          e.preventDefault();
          setDropHover(true);
        }
      }}
      onDragLeave={() => setDropHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDropHover(false);
        const sku = e.dataTransfer.getData("application/x-variant-sku");
        if (sku) onDropVariant(sku);
      }}
    >
      {!hideColorChrome && (
        <div className="px-4 py-3 bg-neutral-50/70 border-b border-neutral-200 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="text-neutral-400 hover:text-neutral-700 transition"
            aria-label={collapsed ? "Expandir" : "Colapsar"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${collapsed ? "" : "rotate-90"}`}
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          {!isNoColor ? (
            <>
              <input
                type="color"
                value={group.hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-7 h-7 rounded border border-neutral-200 cursor-pointer shrink-0"
                title="Cambiar tono"
              />
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  } else if (e.key === "Escape") {
                    setDraftName(group.colorName);
                    e.currentTarget.blur();
                  }
                }}
                className="bg-transparent text-sm font-bold text-neutral-900 px-2 py-1 rounded hover:bg-white focus:bg-white focus:ring-2 focus:ring-[#CC0000]/30 focus:outline-none transition w-32"
              />
            </>
          ) : (
            <span className="text-sm font-bold text-neutral-900">Sin color</span>
          )}

          <span className="text-[11px] text-neutral-500 ml-auto">
            {group.variants.length} variante
            {group.variants.length === 1 ? "" : "s"} · stock total {totalStock}
          </span>

          {!isNoColor && (
            <button
              type="button"
              onClick={onRemoveColor}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#CC0000] hover:bg-red-50 transition"
              title="Eliminar color y sus variantes"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}

      {!collapsed && (
        <div className="px-4 py-4 space-y-5">
          {group.variants.length === 0 ? (
            <p className="text-xs text-neutral-400 italic py-2">
              Sin variantes. Agrega una abajo.
            </p>
          ) : (
            <>
              {newVariants.length > 0 && (
                <div>
                  <SectionHeader
                    label="Equipos nuevos / preventa"
                    count={newVariants.length}
                    variant="new"
                  />
                  <VariantTable
                    variants={newVariants}
                    axes={axes}
                    onUpdate={onUpdateVariant}
                    onRemove={onRemoveVariant}
                    onDuplicate={onDuplicateVariant}
                  />
                </div>
              )}
              {usedVariants.length > 0 && (
                <div>
                  <SectionHeader
                    label="Equipos de exhibición"
                    count={usedVariants.length}
                    variant="used"
                  />
                  <VariantTable
                    variants={usedVariants}
                    axes={axes}
                    onUpdate={onUpdateVariant}
                    onRemove={onRemoveVariant}
                    onDuplicate={onDuplicateVariant}
                    showUsedFields
                  />
                </div>
              )}
            </>
          )}

          {!axes.storage && (
            <div className="pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={onAddVariantNoStorage}
                className="text-xs font-semibold text-[#CC0000] bg-white border border-[#CC0000] hover:bg-red-50 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
              >
                <Plus size={12} /> Agregar variante
              </button>
            </div>
          )}

          {axes.storage && (
            <div className="pt-2 border-t border-neutral-100 space-y-3">
              {/* Agregar EQUIPO NUEVO */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 mb-1.5">
                  Agregar equipo nuevo
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STORAGE_OPTIONS.filter(
                    (s) =>
                      !group.variants.some(
                        (v) => v.storage === s && v.condition === "nuevo"
                      )
                  )
                    .slice(0, 5)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onAddStorage(s, "nuevo")}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-green-200 bg-green-50/50 text-green-700 hover:border-green-500 hover:bg-green-100 transition"
                      >
                        + {s}
                      </button>
                    ))}
                  {showAddStorage === "nuevo" ? (
                    <CustomStorageInput
                      value={newStorage}
                      onChange={setNewStorage}
                      onSubmit={() => {
                        if (newStorage.trim()) {
                          onAddStorage(newStorage.trim(), "nuevo");
                          setNewStorage("");
                          setShowAddStorage(null);
                        }
                      }}
                      onCancel={() => {
                        setShowAddStorage(null);
                        setNewStorage("");
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddStorage("nuevo")}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-[#CC0000] px-2.5 py-1 transition"
                    >
                      + Otro
                    </button>
                  )}
                </div>
              </div>

              {/* Agregar EQUIPO DE EXHIBICIÓN */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1.5">
                  Agregar equipo de exhibición
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STORAGE_OPTIONS.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onAddStorage(s, "exhibicion")}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50/50 text-amber-700 hover:border-amber-500 hover:bg-amber-100 transition"
                      title="Cada click crea un equipo de exhibición distinto"
                    >
                      + {s}
                    </button>
                  ))}
                  {showAddStorage === "exhibicion" ? (
                    <CustomStorageInput
                      value={newStorage}
                      onChange={setNewStorage}
                      onSubmit={() => {
                        if (newStorage.trim()) {
                          onAddStorage(newStorage.trim(), "exhibicion");
                          setNewStorage("");
                          setShowAddStorage(null);
                        }
                      }}
                      onCancel={() => {
                        setShowAddStorage(null);
                        setNewStorage("");
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAddStorage("exhibicion")}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-[#CC0000] px-2.5 py-1 transition"
                    >
                      + Otro
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1.5">
                  Cada click crea un equipo distinto — puedes tener varios del mismo almacenamiento (cada uno con su batería y detalles).
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Variant table + row ────────────────────────────────────────────

function SectionHeader({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "new" | "used";
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
          variant === "new"
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {label}
      </span>
      <span className="text-[10px] text-neutral-400">
        {count} variante{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function VariantTable({
  variants,
  axes,
  onUpdate,
  onRemove,
  onDuplicate,
  showUsedFields = false,
}: {
  variants: Variant[];
  axes: Axes;
  onUpdate: (sku: string, patch: Partial<Variant>) => void;
  onRemove: (sku: string) => void;
  onDuplicate: (sku: string) => void;
  showUsedFields?: boolean;
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-wider text-neutral-500">
            <th className="px-1 py-1.5 w-6"></th>
            {axes.storage && (
              <th className="px-2 py-1.5 font-semibold">Almacen.</th>
            )}
            {axes.ram && <th className="px-2 py-1.5 font-semibold">RAM</th>}
            <th className="px-2 py-1.5 font-semibold">Condición</th>
            <th className="px-2 py-1.5 font-semibold text-right">Precio (COP)</th>
            <th
              className="px-2 py-1.5 font-semibold text-right"
              title="Precio antes del descuento (opcional). Si es mayor al precio actual se muestra tachado en la tienda."
            >
              Antes
            </th>
            <th className="px-2 py-1.5 font-semibold text-right">Stock</th>
            {showUsedFields && (
              <>
                <th className="px-2 py-1.5 font-semibold text-right">Batería %</th>
                <th className="px-2 py-1.5 font-semibold">Detalles del estado</th>
              </>
            )}
            {!showUsedFields && (
              <th className="px-2 py-1.5 font-semibold">Notas</th>
            )}
            <th className="w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {variants.map((v) => (
            <VariantRow
              key={v.sku}
              variant={v}
              axes={axes}
              showUsedFields={showUsedFields}
              onUpdate={(patch) => onUpdate(v.sku, patch)}
              onRemove={() => onRemove(v.sku)}
              onDuplicate={() => onDuplicate(v.sku)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VariantRow({
  variant: v,
  axes,
  showUsedFields,
  onUpdate,
  onRemove,
  onDuplicate,
}: {
  variant: Variant;
  axes: Axes;
  showUsedFields: boolean;
  onUpdate: (patch: Partial<Variant>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  const stock = v.stockQuantity ?? 0;
  const stockColor =
    stock === 0
      ? "text-red-600"
      : stock <= 2
        ? "text-amber-600"
        : "text-green-600";
  const battery = v.batteryHealth;
  const batteryColor =
    battery === undefined || battery >= 90
      ? "text-green-600"
      : battery >= 80
        ? "text-amber-600"
        : "text-red-600";

  return (
    <tr
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-variant-sku", v.sku);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="group hover:bg-neutral-50"
    >
      <td
        className="px-1 py-1.5 cursor-move text-center text-neutral-300 group-hover:text-neutral-500 select-none"
        title="Arrastra para mover a otro color"
      >
        ⋮⋮
      </td>
      {axes.storage && (
        <td className="px-2 py-1.5">
          <input
            value={v.storage ?? ""}
            onChange={(e) =>
              onUpdate({ storage: e.target.value || undefined })
            }
            placeholder="—"
            list="storage-options"
            className="w-24 px-2 py-1.5 rounded border border-neutral-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#CC0000] bg-white"
          />
        </td>
      )}
      {axes.ram && (
        <td className="px-2 py-1.5">
          <input
            value={v.ram ?? ""}
            onChange={(e) => onUpdate({ ram: e.target.value || undefined })}
            placeholder="—"
            className="w-20 px-2 py-1.5 rounded border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#CC0000] bg-white"
          />
        </td>
      )}
      <td className="px-2 py-1.5">
        <select
          value={v.condition}
          onChange={(e) => {
            const newCond = e.target.value as ProductCondition;
            const becameNew = newCond === "nuevo" || newCond === "preventa";
            onUpdate({
              condition: newCond,
              batteryHealth: becameNew ? undefined : v.batteryHealth,
              conditionDetails: becameNew ? undefined : v.conditionDetails,
            });
          }}
          className="w-32 px-2 py-1.5 rounded border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#CC0000]"
        >
          {!CONDITIONS.includes(v.condition) && (
            <option value={v.condition}>
              {conditionLabels[v.condition] ?? v.condition}
            </option>
          )}
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {conditionLabels[c]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1.5">
        <div className="flex items-center justify-end gap-0.5">
          <span className="text-neutral-400 text-[10px]">$</span>
          <PriceInput
            value={v.price}
            onChange={(n) => onUpdate({ price: n })}
            placeholder="0"
          />
        </div>
      </td>
      <td className="px-2 py-1.5">
        <div className="flex items-center justify-end gap-0.5">
          <span className="text-neutral-400 text-[10px]">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={v.comparePrice ? v.comparePrice.toLocaleString("es-CO") : ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              const n = digits ? Number(digits) : 0;
              onUpdate({ comparePrice: n > 0 ? n : undefined });
            }}
            placeholder="—"
            title="Precio antes del descuento. Déjalo vacío si no hay promoción."
            className={`w-24 px-2 py-1.5 rounded border text-right focus:outline-none focus:ring-1 focus:ring-[#CC0000] bg-white ${
              v.comparePrice && v.comparePrice > v.price
                ? "border-amber-300 text-amber-700 line-through"
                : "border-neutral-200 text-neutral-500"
            }`}
          />
        </div>
        {v.comparePrice && v.comparePrice > v.price && (
          <p className="text-[9px] text-[#CC0000] font-bold text-right mt-0.5">
            -{Math.floor(((v.comparePrice - v.price) / v.comparePrice) * 100)}%
          </p>
        )}
      </td>
      <td className="px-2 py-1.5">
        <div className="flex items-center justify-end gap-0.5">
          <input
            type="number"
            value={String(stock)}
            onChange={(e) =>
              onUpdate({
                stockQuantity: Math.max(0, Number(e.target.value) || 0),
              })
            }
            placeholder="0"
            className={`w-14 px-2 py-1.5 rounded border border-neutral-200 text-right font-bold focus:outline-none focus:ring-1 focus:ring-[#CC0000] bg-white ${stockColor}`}
          />
          <span className="text-neutral-400 text-[10px]">u.</span>
        </div>
      </td>
      {showUsedFields ? (
        <>
          <td className="px-2 py-1.5">
            <div className="flex items-center justify-end gap-0.5">
              <input
                type="number"
                value={battery !== undefined ? String(battery) : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    onUpdate({ batteryHealth: undefined });
                  } else {
                    const n = Math.max(0, Math.min(100, Number(val) || 0));
                    onUpdate({ batteryHealth: n });
                  }
                }}
                placeholder="—"
                min={0}
                max={100}
                className={`w-12 px-2 py-1.5 rounded border border-neutral-200 text-right font-bold focus:outline-none focus:ring-1 focus:ring-[#CC0000] bg-white ${batteryColor}`}
              />
              <span className="text-neutral-400 text-[10px]">%</span>
            </div>
          </td>
          <td className="px-2 py-1.5">
            <input
              value={v.conditionDetails ?? ""}
              onChange={(e) =>
                onUpdate({ conditionDetails: e.target.value || undefined })
              }
              placeholder="Pequeño rayón en marco, incluye caja…"
              className="w-full min-w-[200px] px-2 py-1.5 rounded border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#CC0000] bg-white"
            />
          </td>
        </>
      ) : (
        <td className="px-2 py-1.5">
          <input
            value={v.notes ?? ""}
            onChange={(e) => onUpdate({ notes: e.target.value || undefined })}
            placeholder="Sim física, opcional…"
            className="w-full min-w-[160px] px-2 py-1.5 rounded border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#CC0000] bg-white"
          />
        </td>
      )}
      <td className="px-1 py-1.5">
        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-white transition"
            title="Duplicar"
          >
            <Copy size={11} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Eliminar"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder = "0",
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
}) {
  const display = value > 0 ? value.toLocaleString("es-CO") : "";
  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        onChange(digits ? Number(digits) : 0);
      }}
      placeholder={placeholder}
      className="w-28 px-2 py-1.5 rounded border border-neutral-200 text-right font-semibold focus:outline-none focus:ring-1 focus:ring-[#CC0000] bg-white"
    />
  );
}

function CustomStorageInput({
  value,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-neutral-200 rounded-full px-1 py-0.5">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Otro (ej: 64 GB)"
        list="storage-options"
        autoFocus
        className="text-[11px] px-2 py-0.5 focus:outline-none w-32 bg-transparent"
      />
      <datalist id="storage-options">
        {STORAGE_OPTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <button
        type="button"
        onClick={onSubmit}
        className="text-[11px] font-semibold text-[#CC0000] px-1.5"
      >
        ✓
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-[11px] text-neutral-400 px-1.5"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Add color button ──────────────────────────────────────────────

function AddColorButton({
  onAdd,
}: {
  onAdd: (name: string, hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#888888");

  const submit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), hex);
    setName("");
    setHex("#888888");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#CC0000] bg-white border border-[#CC0000] hover:bg-red-50 px-3 py-2 rounded-lg transition"
      >
        <Plus size={14} /> Agregar color
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-2 py-1.5 rounded-lg">
      <input
        type="color"
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        className="w-7 h-7 rounded border border-neutral-200 cursor-pointer"
      />
      <input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          const guess = guessHex(e.target.value);
          if (guess !== "#888888") setHex(guess);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        autoFocus
        placeholder="Nombre del color"
        className="px-2 py-1 text-sm focus:outline-none w-36"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!name.trim()}
        className="text-xs font-semibold text-[#CC0000] hover:bg-red-50 px-2 py-1 rounded transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Agregar
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setName("");
        }}
        className="text-xs text-neutral-400 hover:text-neutral-700"
      >
        Cancelar
      </button>
    </div>
  );
}
