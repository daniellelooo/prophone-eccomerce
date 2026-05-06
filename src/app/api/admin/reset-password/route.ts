import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const serviceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request) {
  const { userId, newPassword } = await req.json();
  if (!userId || !newPassword?.trim()) {
    return NextResponse.json({ error: "userId y newPassword requeridos" }, { status: 400 });
  }
  if (newPassword.trim().length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
  }

  const supabase = serviceClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword.trim(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
