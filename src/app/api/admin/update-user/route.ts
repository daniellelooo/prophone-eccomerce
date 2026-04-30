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
  const fullName: string | undefined =
    typeof body.full_name === "string" ? body.full_name.trim() : undefined;
  const phone: string | undefined =
    typeof body.phone === "string" ? body.phone.trim() : undefined;
  const email: string | undefined =
    typeof body.email === "string" ? body.email.trim() : undefined;

  if (!targetId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Update profile (name + phone)
  const profilePatch: { full_name?: string; phone?: string } = {};
  if (fullName !== undefined) profilePatch.full_name = fullName;
  if (phone !== undefined) profilePatch.phone = phone;

  if (Object.keys(profilePatch).length > 0) {
    const { error: pErr } = await supabaseAdmin
      .from("profiles")
      .update(profilePatch)
      .eq("id", targetId);
    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 400 });
    }
  }

  // Update email en auth.users si vino
  if (email && email.length > 0) {
    const { error: aErr } = await supabaseAdmin.auth.admin.updateUserById(
      targetId,
      { email, email_confirm: true }
    );
    if (aErr) {
      return NextResponse.json({ error: aErr.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
