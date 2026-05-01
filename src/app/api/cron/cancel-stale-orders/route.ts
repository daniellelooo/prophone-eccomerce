import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * GET /api/cron/cancel-stale-orders
 *
 * Cancela órdenes web que llevan más de 30 minutos en estado 'pending'
 * sin pago aprobado. El trigger trg_restore_stock_on_cancel se encarga
 * de devolver el stock al inventario.
 *
 * Programado vía vercel.json (crons) para correr cada 15 minutos.
 *
 * Auth: requiere header `Authorization: Bearer ${CRON_SECRET}` o que
 * Vercel mande el header `x-vercel-cron` (lo agrega automáticamente
 * cuando es invocado por el scheduler).
 */
export const runtime = "nodejs";

const STALE_MINUTES = 30;

export async function GET(request: Request) {
  // Vercel agrega este header automáticamente para invocaciones de cron.
  const isVercelCron = request.headers.get("x-vercel-cron") !== null;

  if (!isVercelCron) {
    const auth = request.headers.get("authorization");
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (!process.env.CRON_SECRET || auth !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabaseAdmin.rpc(
    "cancel_stale_pending_orders",
    { p_minutes: STALE_MINUTES }
  );

  if (error) {
    console.error("[cron/cancel-stale-orders] failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const count = (data as number | null) ?? 0;
  return NextResponse.json({
    ok: true,
    cancelled: count,
    threshold_minutes: STALE_MINUTES,
    ran_at: new Date().toISOString(),
  });
}
