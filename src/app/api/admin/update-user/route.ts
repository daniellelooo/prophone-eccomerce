import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const serviceClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(req: Request) {
  const { userId, full_name, phone, email } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

  const supabase = serviceClient();

  await supabase.from("profiles").update({ full_name, phone }).eq("id", userId);

  if (email?.trim()) {
    await supabase.auth.admin.updateUserById(userId, { email: email.trim() });
  }

  return NextResponse.json({ ok: true });
}
