"use client";

import { getSupabaseBrowserClient } from "./supabase/client";

/**
 * Autenticación admin via Supabase Auth.
 *
 * - El usuario "admin" se crea desde el portal Supabase o vía SQL durante
 *   la fase de seed (ver migración 005). Cualquier usuario autenticado en
 *   el proyecto Supabase tiene permisos completos sobre las tablas (RLS).
 * - El cliente Supabase persiste la sesión en cookies/localStorage por
 *   defecto, así que `isAuthed()` consulta la sesión actual.
 */

export type AdminCredentials = {
  username: string; // email en Supabase Auth
  password: string;
};

export async function login(creds: AdminCredentials): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: creds.username,
    password: creds.password,
  });
  return !error;
}

export async function logout(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
}

/**
 * Sync — devuelve si hay sesión persistida en el cliente.
 * Usa esto después del primer render; antes es false en SSR.
 */
export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Supabase guarda la sesión en localStorage como sb-<ref>-auth-token
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const ref = url.replace(/^https?:\/\//, "").split(".")[0];
    const key = `sb-${ref}-auth-token`;
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (!session?.access_token) return false;
    // Validar expiración
    const expiresAt = session?.expires_at;
    if (expiresAt && Date.now() / 1000 > expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export const ADMIN_CREDENTIAL_HINT = {
  user: "daniellelo063@gmail.com",
  pass: "prophone2026",
};
