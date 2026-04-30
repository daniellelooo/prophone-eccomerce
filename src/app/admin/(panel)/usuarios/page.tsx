"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserPlus, RefreshCw, Shield, ShoppingBag, Package, User, Eye, EyeOff,
  Copy, Check, Key, TrendingUp,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  role: string;
};

type CreatedCreds = {
  email: string;
  password: string;
  name: string;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  vendedor: "Vendedor",
  gestor_inventario: "Gestor de inventario",
  cliente: "Cliente",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  vendedor: "bg-blue-100 text-blue-700",
  gestor_inventario: "bg-purple-100 text-purple-700",
  cliente: "bg-neutral-100 text-neutral-600",
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  admin: Shield,
  vendedor: ShoppingBag,
  gestor_inventario: Package,
  cliente: User,
};

export default function UsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Create user form
  const [fullName, setFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [createRole, setCreateRole] = useState("vendedor");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [lastCreds, setLastCreds] = useState<CreatedCreds | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<Profile | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetCopied, setResetCopied] = useState(false);

  const supabase = getSupabaseBrowserClient();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, is_admin, role")
      .order("role")
      .order("full_name");
    setProfiles((data ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const changeRole = async (id: string, role: string) => {
    setSaving(id);
    await supabase
      .from("profiles")
      .update({ role, is_admin: role === "admin" })
      .eq("id", id);
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, role, is_admin: role === "admin" } : p))
    );
    setSaving(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim() || !createPassword.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail.trim(),
          password: createPassword.trim(),
          full_name: fullName.trim(),
          role: createRole,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setLastCreds({
          email: createEmail.trim(),
          password: createPassword.trim(),
          name: fullName.trim(),
        });
        setCreateMsg({ ok: true, text: `Usuario creado: ${createEmail.trim()}` });
        setFullName("");
        setCreateEmail("");
        setCreatePassword("");
        load();
      } else {
        setCreateMsg({ ok: false, text: json.error ?? "Error al crear usuario" });
      }
    } catch {
      setCreateMsg({ ok: false, text: "Error de red" });
    }
    setCreating(false);
  };

  const copyCredentials = (creds: { email: string; password: string }) => {
    const text = `Usuario: ${creds.email}\nContraseña: ${creds.password}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyResetPassword = () => {
    navigator.clipboard.writeText(resetPassword).then(() => {
      setResetCopied(true);
      setTimeout(() => setResetCopied(false), 2000);
    });
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || !resetPassword.trim()) return;
    setResetting(true);
    setResetMsg(null);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetTarget.id, newPassword: resetPassword.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setResetMsg({ ok: true, text: "Contraseña actualizada correctamente." });
      } else {
        setResetMsg({ ok: false, text: json.error ?? "Error al cambiar contraseña" });
      }
    } catch {
      setResetMsg({ ok: false, text: "Error de red" });
    }
    setResetting(false);
  };

  const staffProfiles = profiles.filter((p) => p.role !== "cliente");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            Equipo
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Admins, vendedores y gestores de inventario. Los clientes
            registrados están en{" "}
            <Link href="/admin/clientes" className="text-[#CC0000] underline">
              Clientes
            </Link>
            .
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition"
          title="Recargar"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Credenciales del último usuario creado — persisten hasta que el admin cierre */}
      {lastCreds && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900">
              Credenciales del usuario creado{lastCreds.name ? ` — ${lastCreds.name}` : ""}
            </p>
            <button
              onClick={() => setLastCreds(null)}
              className="text-xs text-blue-500 hover:text-blue-800"
            >
              Cerrar
            </button>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 px-4 py-3 font-mono text-sm space-y-1">
            <p><span className="text-neutral-500">Usuario:</span> {lastCreds.email}</p>
            <p><span className="text-neutral-500">Contraseña:</span> {lastCreds.password}</p>
          </div>
          <button
            onClick={() => copyCredentials(lastCreds)}
            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg transition"
          >
            {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            {copied ? "¡Copiado!" : "Copiar credenciales"}
          </button>
          <p className="text-[11px] text-blue-600">
            Guarda esta información — no se volverá a mostrar una vez que cierres este aviso.
          </p>
        </div>
      )}

      {/* Crear usuario */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
          <UserPlus size={15} className="text-[#CC0000]" />
          Crear nuevo usuario
        </h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre completo"
              className="px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
            />
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              className="px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <input
                type={showPassword ? "text" : "password"}
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Contraseña (mín. 8 caracteres)"
                required
                minLength={8}
                className="w-full pr-10 px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 bg-white"
            >
              <option value="vendedor">Vendedor</option>
              <option value="gestor_inventario">Gestor de inventario</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-[#A00000] transition disabled:opacity-50"
          >
            {creating ? "Creando…" : "Crear usuario"}
          </button>
        </form>
        {createMsg && !createMsg.ok && (
          <div className="mt-3 bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium">
            {createMsg.text}
          </div>
        )}
      </div>

      {/* Staff */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-800">Equipo ({staffProfiles.length})</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-400">Cargando…</div>
        ) : staffProfiles.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-400">
            Sin usuarios con rol de equipo aún.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {staffProfiles.map((p) => {
              const RoleIcon = ROLE_ICONS[p.role] ?? User;
              return (
                <div key={p.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                    <RoleIcon size={15} className="text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {p.full_name || "Sin nombre"}
                    </p>
                    <p className="text-xs text-neutral-400 font-mono truncate">{p.id.slice(0, 16)}…</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${ROLE_COLORS[p.role]}`}>
                    {ROLE_LABELS[p.role]}
                  </span>
                  {(p.role === "vendedor") && (
                    <Link
                      href={`/admin/vendedor/${p.id}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white text-[11px] font-semibold hover:bg-neutral-700 transition"
                      title="Ver ventas del vendedor"
                    >
                      <TrendingUp size={12} /> Ver ventas
                    </Link>
                  )}
                  <button
                    onClick={() => { setResetTarget(p); setResetPassword(""); setResetMsg(null); }}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 transition"
                    title="Cambiar contraseña"
                  >
                    <Key size={13} />
                  </button>
                  <select
                    value={p.role}
                    onChange={(e) => changeRole(p.id, e.target.value)}
                    disabled={saving === p.id}
                    className="text-xs px-2 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 disabled:opacity-50"
                  >
                    <option value="admin">Admin</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="gestor_inventario">Gestor inventario</option>
                    <option value="cliente">Cliente</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset password modal */}
      {resetTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setResetTarget(null); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Cambiar contraseña</h2>
              <p className="text-sm text-neutral-500 mt-1">
                {resetTarget.full_name || "Usuario"} · {resetTarget.role}
              </p>
            </div>
            <form onSubmit={handleReset} className="space-y-3">
              <div className="relative">
                <input
                  type={showResetPw ? "text" : "password"}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Nueva contraseña (mín. 8 caracteres)"
                  required
                  minLength={8}
                  className="w-full pr-10 px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition"
                >
                  {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {resetMsg && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  resetMsg.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                }`}>
                  {resetMsg.text}
                </div>
              )}
              {resetMsg?.ok && resetPassword && (
                <button
                  type="button"
                  onClick={copyResetPassword}
                  className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-lg transition"
                >
                  {resetCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                  {resetCopied ? "¡Copiado!" : "Copiar contraseña"}
                </button>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex-1 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-[#A00000] transition disabled:opacity-50"
                >
                  {resetting ? "Guardando…" : "Actualizar contraseña"}
                </button>
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
