import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Devuelve el equipo (no clientes) con sus emails y fechas de auth.
 * Necesario porque auth.users no es accesible desde el cliente.
 */
export async function GET() {
  const cookieStore = await cookies();
  const supabaseCaller = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const {
    data: { user },
  } = await supabaseCaller.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: callerProfile } = await supabaseCaller
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single();

  if (
    !callerProfile ||
    (callerProfile.role !== "admin" && !callerProfile.is_admin)
  ) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: profiles, error: pErr } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, phone, role, is_admin, created_at")
    .neq("role", "cliente")
    .order("role")
    .order("full_name");

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  // Traer emails y last_sign_in de auth.users
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const authMap = new Map<
    string,
    { email: string | null; lastSignInAt: string | null }
  >();
  for (const u of authUsers?.users ?? []) {
    authMap.set(u.id, {
      email: u.email ?? null,
      lastSignInAt: u.last_sign_in_at ?? null,
    });
  }

  const team = (profiles ?? []).map((p) => {
    const auth = authMap.get(p.id);
    return {
      id: p.id,
      fullName: p.full_name ?? "",
      phone: p.phone ?? "",
      role: p.role ?? "",
      isAdmin: !!p.is_admin,
      email: auth?.email ?? null,
      createdAt: p.created_at,
      lastSignInAt: auth?.lastSignInAt ?? null,
    };
  });

  return NextResponse.json({ team });
}
