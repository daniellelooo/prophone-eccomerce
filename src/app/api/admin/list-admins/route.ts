import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const serviceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function GET() {
  const supabase = serviceClient();

  const { data: admins, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, is_admin, created_at")
    .eq("is_admin", true)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Obtener emails desde auth.users
  const ids = (admins ?? []).map((a) => a.id);
  const emailMap: Record<string, { email: string; last_sign_in_at: string | null }> = {};

  for (const id of ids) {
    const { data } = await supabase.auth.admin.getUserById(id);
    if (data?.user) {
      emailMap[id] = {
        email: data.user.email ?? "",
        last_sign_in_at: data.user.last_sign_in_at ?? null,
      };
    }
  }

  const team = (admins ?? []).map((a) => ({
    id: a.id,
    fullName: a.full_name ?? "",
    phone: a.phone ?? "",
    role: a.role,
    isAdmin: a.is_admin,
    email: emailMap[a.id]?.email ?? null,
    createdAt: a.created_at,
    lastSignInAt: emailMap[a.id]?.last_sign_in_at ?? null,
  }));

  return NextResponse.json({ team });
}
