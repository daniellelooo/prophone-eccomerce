import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { fetchTransaction, mapWompiStatus } from "@/lib/wompi";

/**
 * GET /api/wompi/transaction/[id]
 *
 * Consulta a Wompi por el estado real de la transacción y, si la
 * orden vinculada aún no fue actualizada por el webhook (porque acaba
 * de pasar), aplicamos el cambio acá también para no hacer esperar al
 * usuario en la página de resultado.
 *
 * Verificación de dueño (defense-in-depth además de RLS):
 *   - Resuelve la orden a partir de tx.reference (= order_number)
 *   - Si order.user_id NO es null → requiere sesión y user.id === order.user_id
 *   - Si order.user_id es null (guest checkout) → permite (el order_number
 *     funciona como token de acceso para órdenes guest)
 */
export const runtime = "nodejs";

export async function GET(
  request: Request,
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

  // Service-role client: necesario porque (1) las RLS de orders no
  // permiten al rol anon leer una orden de guest checkout, y (2) la RPC
  // apply_payment_event ahora solo tiene GRANT a service_role.
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, user_id")
    .eq("order_number", tx.reference)
    .maybeSingle();

  if (!order) {
    return NextResponse.json(
      { error: "Orden no encontrada para esta transacción." },
      { status: 404 }
    );
  }

  // Verificación de dueño con la sesión del caller para órdenes con user_id.
  if (order.user_id) {
    const cookieStore = await cookies();
    const userClient = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              /* ignored */
            }
          },
        },
      }
    );
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user || userData.user.id !== order.user_id) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esta transacción." },
        { status: 403 }
      );
    }
  }

  const internalStatus = mapWompiStatus(tx.status);
  await supabaseAdmin.rpc("apply_payment_event", {
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
