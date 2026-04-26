"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Check, MessageCircle, AtSign } from "lucide-react";
import { useSiteConfigStore } from "@/lib/site-config-store";

export default function AdminConfiguracionPage() {
  const whatsappNumber = useSiteConfigStore((s) => s.whatsappNumber);
  const whatsappDefaultMessage = useSiteConfigStore(
    (s) => s.whatsappDefaultMessage
  );
  const instagramUrl = useSiteConfigStore((s) => s.instagramUrl);
  const update = useSiteConfigStore((s) => s.update);

  const [draftWA, setDraftWA] = useState(whatsappNumber);
  const [draftMsg, setDraftMsg] = useState(whatsappDefaultMessage);
  const [draftIG, setDraftIG] = useState(instagramUrl);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const sanitizedWA = draftWA.replace(/\D/g, "");
    if (sanitizedWA.length < 10) {
      alert(
        "El número de WhatsApp parece incorrecto. Debe incluir el código de país (ej: 573148941200)."
      );
      return;
    }
    try {
      await update({
        whatsappNumber: sanitizedWA,
        whatsappDefaultMessage: draftMsg.trim(),
        instagramUrl: draftIG.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      alert("Error: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            Configuración
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            WhatsApp y redes sociales que aparecen en todo el sitio.
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition active:scale-95 ${
            saved ? "bg-green-500" : "bg-[#CC0000] hover:bg-[#A00000]"
          }`}
        >
          {saved ? (
            <>
              <Check size={15} /> Guardado
            </>
          ) : (
            <>
              <Save size={15} /> Guardar
            </>
          )}
        </button>
      </motion.div>

      <Section
        icon={<MessageCircle size={16} className="text-[#25D366]" />}
        title="WhatsApp"
        desc="Aparece en navbar, bottom nav, footer, ficha de producto, carrito y checkout."
      >
        <div className="space-y-4">
          <div>
            <Label>Número (con código país, sin espacios ni +)</Label>
            <input
              value={draftWA}
              onChange={(e) => setDraftWA(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              placeholder="573148941200"
            />
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Formato wa.me — solo dígitos, código de país incluido. Ejemplo
              Colombia: 573148941200
            </p>
          </div>
          <div>
            <Label>Mensaje por defecto</Label>
            <textarea
              value={draftMsg}
              onChange={(e) => setDraftMsg(e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 resize-none"
              placeholder="Hola, me interesa un producto de Prophone…"
            />
            <p className="text-[11px] text-neutral-400 mt-1.5">
              Texto que se pre-llena cuando un cliente abre la conversación
              desde el navbar / bottom nav.
            </p>
          </div>
          <a
            href={`https://wa.me/${draftWA.replace(/\D/g, "")}${
              draftMsg ? `?text=${encodeURIComponent(draftMsg)}` : ""
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[#25D366] font-semibold hover:underline"
          >
            <MessageCircle size={12} />
            Probar enlace
          </a>
        </div>
      </Section>

      <Section
        icon={<AtSign size={16} className="text-pink-500" />}
        title="Instagram"
        desc="URL del perfil. Se usa en el footer y en el CTA final del home."
      >
        <Label>URL completa</Label>
        <input
          value={draftIG}
          onChange={(e) => setDraftIG(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
          placeholder="https://www.instagram.com/prophone_medellin/"
        />
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-2xl border border-neutral-200 p-5"
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
      </div>
      {desc && <p className="text-[11px] text-neutral-500 mb-4">{desc}</p>}
      {children}
    </motion.section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
      {children}
    </label>
  );
}
