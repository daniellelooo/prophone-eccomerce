"use client";

import { useEffect, useState } from "react";
import { UserPlus, RefreshCw, Shield, ShoppingBag, Package, User, Eye, EyeOff, Copy, Check } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  role: string;
  email?: string;
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
  const [copied, setCopied] = useState(false);

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
        setCreateMsg({
          ok: true,
          text: `Usuario creado: ${createEmail.trim()}`,
        });
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

  const copyCredentials = () => {
    const text = `Usuario: ${createEmail}\nContraseña: ${createPassword}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const staffProfiles = profiles.filter((p) => p.role !== "cliente");
  const clientProfiles = profiles.filter((p) => p.role === "cliente");

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
            Usuarios
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gestiona roles del equipo. Los vendedores pueden registrar ventas físicas desde{" "}
            <a href="/vendedor" target="_blank" className="text-[#0071E3] underline">
              /vendedor
            </a>
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
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-[#A00000] transition disabled:opacity-50"
            >
              {creating ? "Creando…" : "Crear usuario"}
            </button>
            {createEmail && createPassword && !createMsg?.ok && (
              <button
                type="button"
                onClick={copyCredentials}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 border border-neutral-200 px-3 py-2 rounded-xl transition"
              >
                {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                {copied ? "¡Copiado!" : "Copiar credenciales"}
              </button>
            )}
          </div>
        </form>
        {createMsg && (
          <div className={`mt-3 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
            createMsg.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
          }`}>
            <span>{createMsg.text}</span>
            {createMsg.ok && (
              <button
                onClick={() => setCreateMsg(null)}
                className="text-xs opacity-60 hover:opacity-100 ml-4"
              >
                Cerrar
              </button>
            )}
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

      {/* Clientes */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-800">
            Clientes registrados ({clientProfiles.length})
          </h2>
          <p className="text-xs text-neutral-400">Solo lectura · Cambia rol en la fila para promover</p>
        </div>
        {loading ? (
          <div className="p-6 text-center text-sm text-neutral-400">Cargando…</div>
        ) : (
          <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
            {clientProfiles.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <User size={13} className="text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-700 truncate">
                    {p.full_name || "Sin nombre"}
                  </p>
                  {p.phone && (
                    <p className="text-xs text-neutral-400">{p.phone}</p>
                  )}
                </div>
                <select
                  value={p.role}
                  onChange={(e) => changeRole(p.id, e.target.value)}
                  disabled={saving === p.id}
                  className="text-xs px-2 py-1.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 disabled:opacity-50"
                >
                  <option value="cliente">Cliente</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="gestor_inventario">Gestor inventario</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
