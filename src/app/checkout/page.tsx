"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/products";

type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ciudad: string;
  departamento: string;
  direccion: string;
  notas: string;
};

const DEPARTAMENTOS = [
  "Antioquia",
  "Bogotá D.C.",
  "Valle del Cauca",
  "Cundinamarca",
  "Atlántico",
  "Bolívar",
  "Santander",
  "Nariño",
  "Córdoba",
  "Otro",
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const cartTotal = total();
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [form, setForm] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    ciudad: "",
    departamento: "Antioquia",
    direccion: "",
    notas: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid =
    form.nombre &&
    form.apellido &&
    form.telefono &&
    form.ciudad &&
    form.direccion;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    const orderLines = items
      .map(
        (item) =>
          `• ${item.product.name}${item.selectedStorage ? ` (${item.selectedStorage})` : ""} x${item.quantity} → ${formatPrice(item.product.price * item.quantity)}`
      )
      .join("\n");

    const msg = `🛒 *Nuevo pedido - Prophone Medellín*

*Cliente:* ${form.nombre} ${form.apellido}
*Teléfono:* ${form.telefono}
${form.email ? `*Email:* ${form.email}\n` : ""}*Ciudad:* ${form.ciudad}, ${form.departamento}
*Dirección:* ${form.direccion}
${form.notas ? `*Notas:* ${form.notas}\n` : ""}
*Productos:*
${orderLines}

*Total: ${formatPrice(cartTotal)}*

¡Gracias! 🙏`;

    window.open(
      `https://wa.me/573148941200?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
    clearCart();
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="pt-24 min-h-screen bg-[#F5F5F7] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-3xl p-12 max-w-md w-full text-center shadow-sm"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-3">
            ¡Pedido enviado!
          </h2>
          <p className="text-neutral-500 mb-8">
            Tu pedido fue enviado por WhatsApp. Uno de nuestros asesores te
            contactará pronto para confirmar y coordinar el pago y envío.
          </p>
          <Link
            href="/"
            className="bg-[#CC0000] text-white px-8 py-3 rounded-full font-medium hover:bg-[#A00000] transition-colors inline-block"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-[#F5F5F7] px-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <Link
            href="/carrito"
            className="hover:text-neutral-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Carrito
          </Link>
          <ChevronRight size={14} />
          <span
            className={step === "form" ? "text-neutral-900 font-medium" : ""}
          >
            Datos de envío
          </span>
          <ChevronRight size={14} />
          <span
            className={
              step === "confirm" ? "text-neutral-900 font-medium" : ""
            }
          >
            Confirmar pedido
          </span>
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-10">
          {step === "form" ? "Datos de envío" : "Confirma tu pedido"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === "form" && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-3xl p-8 shadow-sm space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Nombre *
                      </label>
                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Juan"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Apellido *
                      </label>
                      <input
                        name="apellido"
                        value={form.apellido}
                        onChange={handleChange}
                        required
                        placeholder="Pérez"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        WhatsApp / Teléfono *
                      </label>
                      <input
                        name="telefono"
                        value={form.telefono}
                        onChange={handleChange}
                        required
                        placeholder="300 000 0000"
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Correo electrónico
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="correo@ejemplo.com"
                        type="email"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Departamento *
                      </label>
                      <select
                        name="departamento"
                        value={form.departamento}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition-all bg-white"
                      >
                        {DEPARTAMENTOS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Ciudad / Municipio *
                      </label>
                      <input
                        name="ciudad"
                        value={form.ciudad}
                        onChange={handleChange}
                        required
                        placeholder="Medellín"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Dirección de entrega *
                    </label>
                    <input
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      required
                      placeholder="Calle 10 # 43-20, Apto 501"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Notas adicionales
                    </label>
                    <textarea
                      name="notas"
                      value={form.notas}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Instrucciones especiales para la entrega..."
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000] focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid}
                    className="w-full bg-[#CC0000] text-white py-4 rounded-2xl font-semibold text-base hover:bg-[#A00000] active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continuar al resumen
                  </button>
                </motion.form>
              )}

              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-5">
                      Datos de envío
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        {
                          label: "Nombre",
                          value: `${form.nombre} ${form.apellido}`,
                        },
                        { label: "Teléfono", value: form.telefono },
                        { label: "Ciudad", value: `${form.ciudad}, ${form.departamento}` },
                        { label: "Dirección", value: form.direccion },
                        ...(form.email
                          ? [{ label: "Email", value: form.email }]
                          : []),
                        ...(form.notas
                          ? [{ label: "Notas", value: form.notas }]
                          : []),
                      ].map((row) => (
                        <div key={row.label}>
                          <p className="text-neutral-500">{row.label}</p>
                          <p className="font-medium text-neutral-900">
                            {row.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep("form")}
                      className="mt-5 text-sm text-[#CC0000] hover:underline"
                    >
                      Editar datos
                    </button>
                  </div>

                  <p className="text-sm text-neutral-500 bg-white rounded-2xl p-4 shadow-sm">
                    📱 Al confirmar, te redirigiremos a WhatsApp con el resumen
                    de tu pedido. Un asesor te contactará para coordinar el pago
                    (transferencia, Nequi, PSE) y confirmar el envío.
                  </p>

                  <button
                    onClick={handleConfirm}
                    className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-base hover:bg-[#1ebe5d] active:scale-98 transition-all"
                  >
                    Confirmar y enviar por WhatsApp
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 shadow-sm sticky top-24"
            >
              <h2 className="text-base font-semibold text-neutral-900 mb-5">
                Tu pedido ({items.length})
              </h2>
              <div className="space-y-4 mb-5">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 bg-neutral-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden p-2">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={56}
                        height={56}
                        className="object-contain w-full h-full"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {item.product.name}
                      </p>
                      {item.selectedStorage && (
                        <p className="text-xs text-neutral-500">
                          {item.selectedStorage}
                        </p>
                      )}
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatPrice(item.product.price)} ×{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-100 pt-4">
                <div className="flex justify-between font-bold text-neutral-900">
                  <span>Total estimado</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  El valor puede ajustarse según disponibilidad
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
