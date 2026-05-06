import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const serviceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request) {
  const { email, password, full_name } = await req.json();

  if (!email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }
  if (password.trim().length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const supabase = serviceClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password: password.trim(),
    email_confirm: true,
    user_metadata: { full_name: full_name?.trim() ?? "" },
    app_metadata: { role: "admin", is_admin: true },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Asegurar que el perfil tiene is_admin = true (el trigger puede tardar)
  await supabase
    .from("profiles")
    .upsert({
      id: data.user.id,
      full_name: full_name?.trim() ?? "",
      role: "admin",
      is_admin: true,
    });

  return NextResponse.json({ ok: true, userId: data.user.id });
}
