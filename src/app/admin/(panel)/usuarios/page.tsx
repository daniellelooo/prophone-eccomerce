"use client";

import { useEffect, useState } from "react";
import { UserPlus, RefreshCw, Shield, ShoppingBag, Package, User } from "lucide-react";
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

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("vendedor");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<{ ok: boolean; text: string } | null>(null);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteMsg(null);
    try {
      const res = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const json = await res.json();
      if (res.ok) {
        setInviteMsg({ ok: true, text: `Invitación enviada a ${inviteEmail}` });
        setInviteEmail("");
        load();
      } else {
        setInviteMsg({ ok: false, text: json.error ?? "Error al invitar" });
      }
    } catch {
      setInviteMsg({ ok: false, text: "Error de red" });
    }
    setInviting(false);
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

      {/* Invitar usuario */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h2 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
          <UserPlus size={15} className="text-[#CC0000]" />
          Invitar nuevo usuario
        </h2>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
            className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30 bg-white"
          >
            <option value="vendedor">Vendedor</option>
            <option value="gestor_inventario">Gestor de inventario</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={inviting}
            className="px-5 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-[#A00000] transition disabled:opacity-50"
          >
            {inviting ? "Enviando…" : "Invitar"}
          </button>
        </form>
        {inviteMsg && (
          <p className={`mt-3 text-sm font-medium ${inviteMsg.ok ? "text-green-600" : "text-red-600"}`}>
            {inviteMsg.text}
          </p>
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
