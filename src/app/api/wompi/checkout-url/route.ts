import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { buildCheckoutUrl } from "@/lib/wompi";

/**
 * POST /api/wompi/checkout-url
 *
 * Recibe `{ orderId }` y devuelve la URL firmada del Web Checkout de
 * Wompi. La orden ya debe existir en la DB (la crea el cliente con
 * createOrder antes de llamar a este endpoint).
 *
 * También marca la orden como `payment_provider='wompi'` y
 * `payment_status='pending'` para reflejar que se inició el flujo de
 * pago — si el cliente abandona, queda visible en el panel admin.
 */
export const runtime = "nodejs";

type Body = { orderId: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Body inválido. Esperado: { orderId }" },
      { status: 400 }
    );
  }
  const { orderId } = body;
  if (!orderId) {
    return NextResponse.json({ error: "Falta orderId" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
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
            /* ignored — Server Component sin write access */
          }
        },
      },
    }
  );

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json(
      { error: "Orden no encontrada o sin acceso" },
      { status: 404 }
    );
  }

  // Construir URL de redirect-url absoluta a partir del request.
  const origin =
    request.headers.get("origin") ??
    new URL(request.url).origin;
  const redirectUrl = `${origin}/checkout/resultado/${order.order_number}`;

  let checkoutUrl: string;
  try {
    checkoutUrl = await buildCheckoutUrl({
      reference: order.order_number,
      amountCop: order.total_cop,
      redirectUrl,
      customerEmail: order.customer_email ?? undefined,
      customerFullName: order.customer_name,
      customerPhoneNumber: order.customer_phone,
      shippingAddress: order.shipping_address
        ? {
            addressLine1: order.shipping_address,
            city: order.shipping_city ?? "",
            region: order.shipping_department ?? "",
            country: "CO",
            phoneNumber: order.customer_phone,
          }
        : undefined,
    });
  } catch (err) {
    console.error("[wompi/checkout-url] buildCheckoutUrl failed", err);
    return NextResponse.json(
      { error: "No se pudo construir la URL de pago." },
      { status: 500 }
    );
  }

  // Marcar la orden como inicio de flujo Wompi.
  await supabase
    .from("orders")
    .update({
      payment_provider: "wompi",
      payment_reference: order.order_number,
      payment_status: order.payment_status ?? "pending",
    })
    .eq("id", order.id);

  return NextResponse.json({ url: checkoutUrl });
}
