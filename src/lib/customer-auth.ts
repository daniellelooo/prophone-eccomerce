"use client";

import { getSupabaseBrowserClient } from "./supabase/client";

/**
 * Auth de clientes (registro / login / sesión).
 * Comparte Supabase Auth con el admin — la diferenciación es por
 * `profiles.is_admin = true`. Cualquier usuario "normal" registrado desde
 * `/cuenta/registro` queda con is_admin = false.
 */

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

export type CustomerProfile = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  isAdmin: boolean;
};

export async function registerCustomer(
  data: RegisterPayload
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        phone: data.phone ?? "",
      },
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function logoutCustomer(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
}

export async function sendPasswordReset(
  email: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseBrowserClient();
  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/cuenta`
      : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getCurrentProfile(): Promise<CustomerProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      profile?.full_name ??
      (user.user_metadata?.full_name as string | undefined) ??
      "",
    phone:
      profile?.phone ??
      (user.user_metadata?.phone as string | undefined) ??
      "",
    isAdmin: !!profile?.is_admin,
  };
}
