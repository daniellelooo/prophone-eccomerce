import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
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

  const body = await req.json();
  const targetId: string = body.userId;
  if (!targetId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  if (targetId === user.id) {
    return NextResponse.json(
      { error: "No puedes eliminarte a ti mismo." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Verificar que el target exista y obtener su rol
  const { data: targetProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("id", targetId)
    .single();

  if (!targetProfile) {
    return NextResponse.json(
      { error: "Usuario no encontrado" },
      { status: 404 }
    );
  }

  // Si el target es admin, asegurar que no sea el último admin
  if (targetProfile.role === "admin") {
    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "No puedes eliminar al último admin." },
        { status: 400 }
      );
    }
  }

  // Borrar de auth.users (cascade a profiles vía FK)
  const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(targetId);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 400 });
  }

  // Asegurar limpieza del profile por si no había cascade
  await supabaseAdmin.from("profiles").delete().eq("id", targetId);

  return NextResponse.json({ ok: true });
}
