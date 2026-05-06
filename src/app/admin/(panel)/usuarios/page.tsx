"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  UserPlus, RefreshCw, Shield, Check, Copy, Key,
  Search, MoreVertical, Pencil, Trash2, Mail, Phone,
  X, Plus, Clock, Eye, EyeOff,
} from "lucide-react";

type Admin = {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  isAdmin: boolean;
  email: string | null;
  createdAt: string;
  lastSignInAt: string | null;
};

type CreatedCreds = { email: string; password: string; name: string };

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Crear
  const [showCreate, setShowCreate] = useState(false);
  const [fullName, setFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [lastCreds, setLastCreds] = useState<CreatedCreds | null>(null);
  const [credsCopied, setCredsCopied] = useState(false);

  // Editar
  const [editTarget, setEditTarget] = useState<Admin | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [editMsg, setEditMsg] = useState<string | null>(null);

  // Reset password
  const [resetTarget, setResetTarget] = useState<Admin | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetCopied, setResetCopied] = useState(false);

  // Eliminar
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/list-admins", { credentials: "include" });
      const json = await res.json();
      if (res.ok) setAdmins(json.team as Admin[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const { data } = await getSupabaseBrowserClient().auth.getUser();
      setMeId(data.user?.id ?? null);
    })();
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        a.phone.includes(q)
    );
  }, [admins, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim() || !createPassword.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: createEmail.trim(),
          password: createPassword.trim(),
          full_name: fullName.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setLastCreds({ email: createEmail.trim(), password: createPassword.trim(), name: fullName.trim() });
        setFullName(""); setCreateEmail(""); setCreatePassword("");
        setShowCreate(false);
        flash("Admin creado");
        load();
      } else {
        setCreateMsg(json.error ?? "Error al crear admin");
      }
    } catch {
      setCreateMsg("Error de red");
    }
    setCreating(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditing(true); setEditMsg(null);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editTarget.id,
          full_name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim() && editEmail.trim() !== (editTarget.email ?? "") ? editEmail.trim() : undefined,
        }),
      });
      if (res.ok) { setEditTarget(null); flash("Datos actualizados"); load(); }
      else { const j = await res.json(); setEditMsg(j.error ?? "Error"); }
    } catch { setEditMsg("Error de red"); }
    setEditing(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget || !resetPassword.trim()) return;
    setResetting(true); setResetMsg(null);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetTarget.id, newPassword: resetPassword.trim() }),
      });
      const j = await res.json();
      setResetMsg(res.ok ? { ok: true, text: "Contraseña actualizada." } : { ok: false, text: j.error ?? "Error" });
    } catch { setResetMsg({ ok: false, text: "Error de red" }); }
    setResetting(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true); setDeleteMsg(null);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteTarget.id }),
      });
      const j = await res.json();
      if (res.ok) { setDeleteTarget(null); flash("Admin eliminado"); load(); }
      else setDeleteMsg(j.error ?? "Error");
    } catch { setDeleteMsg("Error de red"); }
    setDeleting(false);
  };

  const copy = (text: string, after?: () => void) =>
    navigator.clipboard.writeText(text).then(() => after?.());

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
          <Check size={14} className="text-green-400" /> {toast}
        </div>
      )}

      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">Admins</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Usuarios con acceso completo al panel de administración.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition"
            title="Recargar"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="inline-flex items-center gap-1.5 bg-[#CC0000] hover:bg-[#A00000] text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition"
          >
            {showCreate ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nuevo admin</>}
          </button>
        </div>
      </div>

      {/* Credenciales del último admin creado */}
      {lastCreds && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900">
              Credenciales del admin creado{lastCreds.name ? ` — ${lastCreds.name}` : ""}
            </p>
            <button onClick={() => setLastCreds(null)} className="text-xs text-blue-500 hover:text-blue-800">Cerrar</button>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 px-4 py-3 font-mono text-sm space-y-1">
            <p><span className="text-neutral-500">Usuario:</span> {lastCreds.email}</p>
            <p><span className="text-neutral-500">Contraseña:</span> {lastCreds.password}</p>
          </div>
          <button
            onClick={() => copy(`Usuario: ${lastCreds.email}\nContraseña: ${lastCreds.password}`, () => { setCredsCopied(true); setTimeout(() => setCredsCopied(false), 2000); })}
            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 border border-blue-200 px-3 py-1.5 rounded-lg transition"
          >
            {credsCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
            {credsCopied ? "¡Copiado!" : "Copiar credenciales"}
          </button>
          <p className="text-[11px] text-blue-600">Guarda esta información — no se volverá a mostrar al cerrar.</p>
        </div>
      )}

      {/* Formulario crear admin */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h2 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <UserPlus size={15} className="text-[#CC0000]" />
            Crear nuevo admin
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
            <div className="relative">
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
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-[#A00000] transition disabled:opacity-50"
            >
              {creating ? "Creando…" : "Crear admin"}
            </button>
          </form>
          {createMsg && (
            <div className="mt-3 bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium">
              {createMsg}
            </div>
          )}
        </div>
      )}

      {/* Lista de admins */}
      <div className="bg-white rounded-2xl border border-neutral-200">
        <div className="px-4 py-3 border-b border-neutral-100">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar entre ${admins.length} admin${admins.length !== 1 ? "s" : ""}…`}
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-400">Cargando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-400">
            {admins.length === 0 ? 'Sin admins. Crea uno con "Nuevo admin".' : "Ningún admin coincide."}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {filtered.map((a) => (
              <AdminRow
                key={a.id}
                a={a}
                isMe={a.id === meId}
                onEdit={() => { setEditTarget(a); setEditName(a.fullName); setEditPhone(a.phone); setEditEmail(a.email ?? ""); setEditMsg(null); }}
                onResetPassword={() => { setResetTarget(a); setResetPassword(""); setResetMsg(null); setShowResetPw(false); }}
                onDelete={() => { setDeleteTarget(a); setDeleteMsg(null); }}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Modal: Editar */}
      {editTarget && (
        <Modal title="Editar admin" subtitle={editTarget.fullName || "Admin"} onClose={() => setEditTarget(null)}>
          <form onSubmit={handleEdit} className="space-y-3">
            <Field label="Nombre completo">
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30" />
            </Field>
            <Field label="Teléfono">
              <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+57 314 894 1200"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30" />
            </Field>
            <Field label="Email">
              <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30" />
              <p className="text-[10px] text-neutral-400 mt-1">Cambiar el email afecta el login.</p>
            </Field>
            {editMsg && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">{editMsg}</div>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={editing}
                className="flex-1 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-[#A00000] transition disabled:opacity-50">
                {editing ? "Guardando…" : "Guardar cambios"}
              </button>
              <button type="button" onClick={() => setEditTarget(null)}
                className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Reset password */}
      {resetTarget && (
        <Modal title="Cambiar contraseña" subtitle={resetTarget.fullName || "Admin"} onClose={() => setResetTarget(null)}>
          <form onSubmit={handleReset} className="space-y-3">
            <div className="relative">
              <input type={showResetPw ? "text" : "password"} value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Nueva contraseña (mín. 8 caracteres)" required minLength={8}
                className="w-full pr-10 px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/30" />
              <button type="button" onClick={() => setShowResetPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition">
                {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {resetMsg && (
              <div className={`rounded-xl px-4 py-3 text-sm font-medium ${resetMsg.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                {resetMsg.text}
              </div>
            )}
            {resetMsg?.ok && resetPassword && (
              <button type="button"
                onClick={() => copy(resetPassword, () => { setResetCopied(true); setTimeout(() => setResetCopied(false), 2000); })}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 border border-neutral-200 px-3 py-1.5 rounded-lg transition">
                {resetCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                {resetCopied ? "¡Copiado!" : "Copiar contraseña"}
              </button>
            )}
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={resetting}
                className="flex-1 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-[#A00000] transition disabled:opacity-50">
                {resetting ? "Guardando…" : "Actualizar contraseña"}
              </button>
              <button type="button" onClick={() => setResetTarget(null)}
                className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition">
                Cerrar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Eliminar */}
      {deleteTarget && (
        <Modal title="Eliminar admin" subtitle={deleteTarget.fullName || "Admin"} onClose={() => setDeleteTarget(null)}>
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 leading-relaxed">
              <p className="font-semibold mb-1">Esta acción es permanente.</p>
              <p>El admin perderá acceso inmediatamente. Los pedidos ya registrados <strong>no se borran</strong>.</p>
            </div>
            {deleteMsg && <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">{deleteMsg}</div>}
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-[#CC0000] text-white rounded-xl text-sm font-semibold hover:bg-[#A00000] transition disabled:opacity-50 inline-flex items-center justify-center gap-1.5">
                <Trash2 size={14} />
                {deleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition">
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Subcomponentes ─────────────────────────────────────────────── */

function AdminRow({ a, isMe, onEdit, onResetPassword, onDelete }: {
  a: Admin; isMe: boolean;
  onEdit: () => void; onResetPassword: () => void; onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  return (
    <li className="px-4 md:px-5 py-4 flex items-center gap-3 md:gap-4">
      <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
        {initials(a.fullName)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-neutral-900 truncate">{a.fullName || "(sin nombre)"}</p>
          {isMe && (
            <span className="text-[9px] uppercase tracking-wider font-bold bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded-full">Tú</span>
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            <Shield size={10} /> Admin
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-neutral-500 mt-0.5">
          {a.email && <span className="inline-flex items-center gap-1 truncate max-w-[260px]"><Mail size={10} /> {a.email}</span>}
          {a.phone && <span className="inline-flex items-center gap-1"><Phone size={10} /> {a.phone}</span>}
          <span className="inline-flex items-center gap-1 text-neutral-400">
            <Clock size={10} /> {a.lastSignInAt ? formatRelative(new Date(a.lastSignInAt)) : "Nunca ingresó"}
          </span>
        </div>
      </div>

      <button onClick={onDelete} disabled={isMe}
        title={isMe ? "No puedes eliminarte a ti mismo" : "Eliminar admin"}
        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white text-[11px] font-semibold text-neutral-500 hover:border-[#CC0000] hover:text-[#CC0000] hover:bg-red-50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-neutral-200 disabled:hover:text-neutral-500 disabled:hover:bg-white shrink-0">
        <Trash2 size={12} />
        <span className="hidden lg:inline">Eliminar</span>
      </button>

      <div className="relative shrink-0" ref={menuRef}>
        <button onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition"
          aria-label="Más acciones">
          <MoreVertical size={14} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-30 bg-white rounded-xl border border-neutral-200 shadow-lg w-48 py-1">
            <MenuItem icon={<Pencil size={13} />} label="Editar datos" onClick={() => { setMenuOpen(false); onEdit(); }} />
            <MenuItem icon={<Key size={13} />} label="Cambiar contraseña" onClick={() => { setMenuOpen(false); onResetPassword(); }} />
            <div className="sm:hidden">
              <div className="my-1 border-t border-neutral-100" />
              <MenuItem icon={<Trash2 size={13} />} label="Eliminar" danger disabled={isMe}
                onClick={() => { if (isMe) return; setMenuOpen(false); onDelete(); }} />
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

function MenuItem({ icon, label, onClick, danger = false, disabled = false }: {
  icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs transition ${disabled ? "text-neutral-300 cursor-not-allowed" : danger ? "text-[#CC0000] hover:bg-red-50" : "text-neutral-700 hover:bg-neutral-50"}`}>
      {icon}{label}
    </button>
  );
}

function Modal({ title, subtitle, onClose, children }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-neutral-900">{title}</h2>
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 -m-1" aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "hace un momento";
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} día${days === 1 ? "" : "s"}`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
  return `hace ${Math.floor(days / 365)} año${Math.floor(days / 365) === 1 ? "" : "s"}`;
}
