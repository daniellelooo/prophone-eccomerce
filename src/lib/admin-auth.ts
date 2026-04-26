"use client";

/**
 * Autenticación simulada para el panel admin.
 *
 * Credenciales hardcodeadas para la demo.
 * Cuando exista backend → reemplazar por NextAuth / sesión real, manteniendo
 * la misma API (login/logout/isAuthed) para no tocar componentes.
 */

const STORAGE_KEY = "prophone-admin-session";
const VALID_USER = "admin";
const VALID_PASS = "prophone2026";

export type AdminCredentials = {
  username: string;
  password: string;
};

export function login(creds: AdminCredentials): boolean {
  if (creds.username === VALID_USER && creds.password === VALID_PASS) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: VALID_USER, ts: Date.now() })
      );
    } catch {
      /* noop */
    }
    return true;
  }
  return false;
}

export function logout(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.user === VALID_USER;
  } catch {
    return false;
  }
}

export const ADMIN_CREDENTIAL_HINT = {
  user: VALID_USER,
  pass: VALID_PASS,
};
