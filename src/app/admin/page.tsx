"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, KeyRound } from "lucide-react";
import { ADMIN_CREDENTIAL_HINT, isAuthed, login } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión, mandar al panel directamente
  useEffect(() => {
    if (isAuthed()) {
      router.replace("/admin/productos");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const ok = login({ username: user, password: pass });
    if (ok) {
      router.replace("/admin/productos");
    } else {
      setError("Usuario o contraseña incorrectos.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C1014] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition mb-8"
        >
          <ArrowLeft size={12} /> Volver al sitio público
        </Link>

        <div className="bg-[#13181E] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-7">
            <Image
              src="/prophone-profile-pic.jpg"
              alt="Prophone"
              width={42}
              height={42}
              className="rounded-full object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                Panel
              </p>
              <p className="text-base font-bold text-white">Prophone Admin</p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white mb-2">Iniciar sesión</h1>
          <p className="text-sm text-neutral-400 mb-7 leading-relaxed">
            Acceso al gestor de catálogo, promociones y configuración.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Usuario
              </label>
              <input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#0C1014] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/50 focus:border-[#CC0000]/50 transition"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                className="w-full bg-[#0C1014] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/50 focus:border-[#CC0000]/50 transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#A00000] text-white font-semibold text-sm py-3 rounded-xl transition active:scale-95 disabled:opacity-50"
            >
              <Lock size={14} /> Entrar
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-white/10">
            <p className="text-[11px] text-neutral-500 flex items-center gap-1.5 mb-2">
              <KeyRound size={11} /> Demo credentials
            </p>
            <div className="bg-[#0C1014] rounded-xl px-3 py-2.5 font-mono text-xs text-neutral-400 space-y-1">
              <p>
                user: <span className="text-neutral-200">{ADMIN_CREDENTIAL_HINT.user}</span>
              </p>
              <p>
                pass: <span className="text-neutral-200">{ADMIN_CREDENTIAL_HINT.pass}</span>
              </p>
            </div>
            <p className="text-[10px] text-neutral-600 mt-3 leading-relaxed">
              Auth simulada (localStorage). Cuando exista backend se reemplaza
              por sesión real sin tocar UI.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
