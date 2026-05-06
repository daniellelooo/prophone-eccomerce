"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Check,
  Image as ImageIcon,
  Trash2,
  Upload,
  Type,
  Plus,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * UI compartida del admin (Section / Label / ImageGallery).
 * Se usa en /admin/configuracion y /admin/promociones para mantener
 * el mismo look & feel sin duplicar código.
 */

export function Section({
  icon,
  title,
  desc,
  children,
  onSave,
  saved,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saved?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl border border-neutral-200 p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
          </div>
          {desc && <p className="text-[11px] text-neutral-500 mt-0.5">{desc}</p>}
        </div>
        {onSave && (
          <button
            onClick={onSave}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition active:scale-95 ${
              saved ? "bg-green-500" : "bg-[#CC0000] hover:bg-[#A00000]"
            }`}
          >
            {saved ? (
              <>
                <Check size={12} /> Guardado
              </>
            ) : (
              <>
                <Save size={12} /> Guardar
              </>
            )}
          </button>
        )}
      </div>
      {children}
    </motion.section>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
      {children}
    </label>
  );
}

export function ImageGallery({
  label,
  images,
  onChange,
  saved,
}: {
  label: string;
  images: string[];
  onChange: (imgs: string[]) => void;
  saved?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const uploaded: string[] = [];
      for (const f of Array.from(files)) {
        const ext = f.name.split(".").pop() || "jpg";
        const path = `site/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
        const { error } = await supabase.storage
          .from("product-images")
          .upload(path, f, { cacheControl: "3600", upsert: false });
        if (error) {
          alert(`Error: ${error.message}`);
          continue;
        }
        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
      if (uploaded.length > 0) onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (i: number) =>
    onChange(images.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/40">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
          <ImageIcon size={11} /> {label}
        </p>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-[11px] font-semibold text-green-600 inline-flex items-center gap-1">
              <Check size={11} /> Guardado
            </span>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CC0000] hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            <Upload size={12} /> {uploading ? "Subiendo…" : "Subir imágenes"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleUpload(e.target.files);
              if (e.target) e.target.value = "";
            }}
          />
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-xs text-neutral-400 text-center py-6">
          Sin imágenes — sube al menos una.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative group aspect-square rounded-lg bg-white border border-neutral-200 overflow-hidden"
            >
              <Image
                src={url}
                alt={`${label} ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="p-1.5 bg-white text-neutral-700 rounded-full disabled:opacity-30 hover:bg-neutral-100"
                  title="Mover arriba"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="p-1.5 bg-white text-neutral-700 rounded-full disabled:opacity-30 hover:bg-neutral-100"
                  title="Mover abajo"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="p-1.5 bg-white text-[#CC0000] rounded-full hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <span className="absolute top-1 left-1 bg-white/90 text-neutral-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          value={pasteUrl}
          onChange={(e) => setPasteUrl(e.target.value)}
          placeholder="Pegar URL de imagen…"
          className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
        />
        <button
          type="button"
          onClick={() => {
            const u = pasteUrl.trim();
            if (!u) return;
            onChange([...images, u]);
            setPasteUrl("");
          }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 hover:border-neutral-400 px-3 py-1.5 rounded-lg transition"
        >
          <Plus size={11} /> Agregar
        </button>
      </div>

      <p className="mt-2 text-[10px] text-neutral-400 inline-flex items-center gap-1">
        <Type size={10} /> El orden es el orden del carrusel. Hover sobre una
        imagen para reordenar o eliminar.
      </p>
    </div>
  );
}

/** Subir una sola imagen (helper para casos de "imagen única" como cards de showcase). */
export function SingleImageInput({
  label,
  url,
  onChange,
}: {
  label: string;
  url: string;
  onChange: (next: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const f = files[0];
      const ext = f.name.split(".").pop() || "jpg";
      const path = `site/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, f, { cacheControl: "3600", upsert: false });
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      onChange(data.publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {url ? (
          <div className="relative w-16 h-16 rounded-xl border border-neutral-200 bg-white overflow-hidden flex-shrink-0">
            <Image
              src={url}
              alt={label}
              fill
              className="object-contain p-1"
              unoptimized
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white text-[#CC0000] flex items-center justify-center shadow-sm hover:bg-red-50 text-[10px]"
              aria-label="Quitar imagen"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center flex-shrink-0">
            <ImageIcon size={18} className="text-neutral-300" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#CC0000] hover:bg-red-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            <Upload size={12} /> {uploading ? "Subiendo…" : "Subir imagen"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleUpload(e.target.files);
              if (e.target) e.target.value = "";
            }}
          />
          <input
            value={url}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…o pega una URL"
            className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
          />
        </div>
      </div>
    </div>
  );
}
