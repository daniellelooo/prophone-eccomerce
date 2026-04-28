import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { fetchTransaction, mapWompiStatus } from "@/lib/wompi";

/**
 * GET /api/wompi/transaction/[id]
 *
 * Consulta a Wompi por el estado real de la transacción y, si la
 * orden vinculada aún no fue actualizada por el webhook (porque acaba
 * de pasar), aplicamos el cambio acá también para no hacer esperar al
 * usuario en la página de resultado.
 */
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Falta id" }, { status: 400 });
  }

  const tx = await fetchTransaction(id);
  if (!tx) {
    return NextResponse.json(
      { error: "Transacción no encontrada en Wompi" },
      { status: 404 }
    );
  }

  // Apply same RPC para sincronizar la orden con el estado actual
  // (idempotente — sobrescribe).
  const internalStatus = mapWompiStatus(tx.status);
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
  await supabase.rpc("apply_payment_event", {
    p_reference: tx.reference,
    p_payment_status: internalStatus,
    p_transaction_id: tx.id,
    p_method_type: tx.payment_method_type,
    p_paid_at: tx.finalized_at ?? new Date().toISOString(),
    p_provider: "wompi",
  });

  return NextResponse.json({
    transaction: {
      id: tx.id,
      reference: tx.reference,
      status: tx.status,
      internalStatus,
      amount_in_cents: tx.amount_in_cents,
      currency: tx.currency,
      payment_method_type: tx.payment_method_type,
      finalized_at: tx.finalized_at,
    },
  });
}
