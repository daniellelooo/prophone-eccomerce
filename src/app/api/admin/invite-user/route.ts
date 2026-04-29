import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const VALID_ROLES = ["admin", "vendedor", "gestor_inventario"] as const;

export async function POST(req: NextRequest) {
  // 1. Verificar que el llamante es admin
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
  const { data: { user } } = await supabaseCaller.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile } = await supabaseCaller
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && !profile.is_admin)) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  // 2. Parsear body
  const body = await req.json();
  const email: string = body.email?.trim();
  const role: string = body.role ?? "vendedor";

  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });
  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  // 3. Invitar con service role key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { initial_role: role },
  });

  if (inviteErr) {
    return NextResponse.json({ error: inviteErr.message }, { status: 400 });
  }

  // 4. Actualizar rol en profiles (el trigger de Supabase crea el profile vacío)
  if (invited?.user?.id) {
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: invited.user.id, role, is_admin: role === "admin" });
  }

  return NextResponse.json({ ok: true });
}
