"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, CheckCircle2, User } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/products";
import { useSiteConfigStore, getWhatsappUrl } from "@/lib/site-config-store";
import { getCurrentProfile, type CustomerProfile } from "@/lib/customer-auth";
import { createOrder, markOrderWhatsappSent } from "@/lib/orders";

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
  const whatsappNumber = useSiteConfigStore((s) => s.whatsappNumber);
  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
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

  // Pre-rellenar datos si hay sesión
  useEffect(() => {
    let cancelled = false;
    getCurrentProfile().then((p) => {
      if (cancelled || !p) return;
       
      setProfile(p);
      const [first, ...rest] = (p.fullName || "").split(" ");
      setForm((prev) => ({
        ...prev,
        nombre: prev.nombre || first || "",
        apellido: prev.apellido || rest.join(" "),
        email: prev.email || p.email,
        telefono: prev.telefono || p.phone,
      }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);

    // 1) Crear orden en Supabase
    const created = await createOrder({
      userId: profile?.id ?? null,
      customerName: `${form.nombre} ${form.apellido}`.trim(),
      customerEmail: form.email || profile?.email,
      customerPhone: form.telefono,
      shippingDepartment: form.departamento,
      shippingCity: form.ciudad,
      shippingAddress: form.direccion,
      notes: form.notas,
      items,
    });

    if (!created.ok) {
      alert(
        "No se pudo registrar el pedido en nuestra base de datos: " +
          created.error +
          "\n\nTe enviaremos por WhatsApp de todas formas."
      );
    }

    // 2) Construir mensaje WhatsApp con order_number
    const orderLines = items
      .map((item) => {
        const variantInfo = [
          item.variant.size,
          item.variant.ram ? `${item.variant.ram} RAM` : undefined,
          item.variant.storage,
          item.variant.notes,
        ]
          .filter(Boolean)
          .join(" · ");
        const suffix = variantInfo ? ` (${variantInfo})` : "";
        return `• ${item.product.name}${suffix} x${item.quantity} → ${formatPrice(
          item.variant.price * item.quantity
        )}`;
      })
      .join("\n");

    const orderRef = created.ok ? created.order.orderNumber : "";
    const msg = `🛒 *Nuevo pedido - Prophone Medellín*${
      orderRef ? `\n*Pedido:* ${orderRef}` : ""
    }

*Cliente:* ${form.nombre} ${form.apellido}
*Teléfono:* ${form.telefono}
${form.email ? `*Email:* ${form.email}\n` : ""}*Ciudad:* ${form.ciudad}, ${form.departamento}
*Dirección:* ${form.direccion}
${form.notas ? `*Notas:* ${form.notas}\n` : ""}
*Productos:*
${orderLines}

*Total: ${formatPrice(cartTotal)}*

¡Gracias! 🙏`;

    window.open(getWhatsappUrl(whatsappNumber, msg), "_blank");

    if (created.ok) {
      setOrderNumber(created.order.orderNumber);
      void markOrderWhatsappSent(created.order.id);
    }

    clearCart();
    setSubmitting(false);
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
          {orderNumber && (
            <div className="bg-neutral-50 rounded-xl px-4 py-3 mb-6 inline-block">
              <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-0.5">
                Número de pedido
              </p>
              <p className="text-sm font-mono font-bold text-neutral-900">
                {orderNumber}
              </p>
            </div>
          )}
          <p className="text-neutral-500 mb-8 text-sm leading-relaxed">
            Tu pedido fue registrado y enviado por WhatsApp. Un asesor te
            contactará pronto para confirmar el pago y envío.
            {profile && (
              <>
                {" "}Puedes seguir su estado en{" "}
                <Link
                  href="/cuenta"
                  className="text-[#CC0000] font-semibold hover:underline"
                >
                  Mi cuenta
                </Link>
                .
              </>
            )}
          </p>
          <Link
            href={profile ? "/cuenta" : "/"}
            className="bg-[#CC0000] text-white px-8 py-3 rounded-full font-medium hover:bg-[#A00000] transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CC0000] focus-visible:ring-offset-2"
          >
            {profile ? "Ver mis pedidos" : "Volver al inicio"}
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

        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">
          {step === "form" ? "Datos de envío" : "Confirma tu pedido"}
        </h1>

        {!profile && step === "form" && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 mb-6 flex items-start gap-3">
            <User size={16} className="text-blue-600 mt-0.5 shrink-0" aria-hidden />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-blue-900">
                ¿Querés ver tu pedido luego?
              </p>
              <p className="text-blue-800 text-xs leading-relaxed mt-0.5">
                <Link
                  href="/cuenta"
                  className="underline font-semibold hover:text-blue-950"
                >
                  Inicia sesión o crea una cuenta
                </Link>{" "}
                para ver el historial de tus compras y agilizar el próximo
                checkout. También puedes seguir como invitado.
              </p>
            </div>
          </div>
        )}

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
                {items.map((item) => {
                  const variantInfo = [
                    item.variant.size,
                    item.variant.ram ? `${item.variant.ram} RAM` : undefined,
                    item.variant.storage,
                  ]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <div key={item.variant.sku} className="flex gap-3 items-center">
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
                        {variantInfo && (
                          <p className="text-xs text-neutral-500">{variantInfo}</p>
                        )}
                        {item.variant.notes && (
                          <p className="text-xs text-neutral-400">
                            {item.variant.notes}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-neutral-900">
                          {formatPrice(item.variant.price)} ×{item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
