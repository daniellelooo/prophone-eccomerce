"use client";

import { getSupabaseBrowserClient } from "./supabase/client";
import type { CartItem } from "./store";

export type CreateOrderInput = {
  userId: string | null; // null = guest checkout
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  shippingDepartment?: string;
  shippingCity?: string;
  shippingAddress?: string;
  notes?: string;
  items: CartItem[];
  shippingCop?: number;
  paymentMethod?: string;
};

export type OrderRecord = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingDepartment: string | null;
  shippingCity: string | null;
  shippingAddress: string | null;
  notes: string | null;
  subtotalCop: number;
  shippingCop: number;
  totalCop: number;
  paymentMethod: string | null;
  whatsappSent: boolean;
  createdAt: string;
  items: {
    productId: string | null;
    productName: string;
    variantSku: string | null;
    variantLabel: string | null;
    unitPriceCop: number;
    quantity: number;
    imageUrl: string | null;
  }[];
};

function variantLabel(item: CartItem): string {
  return [
    item.variant.size,
    item.variant.ram ? `${item.variant.ram} RAM` : undefined,
    item.variant.storage,
    item.variant.notes,
    item.selectedColor,
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function createOrder(
  input: CreateOrderInput
): Promise<{ ok: true; order: OrderRecord } | { ok: false; error: string }> {
  const supabase = getSupabaseBrowserClient();

  const subtotal = input.items.reduce(
    (sum, i) => sum + i.variant.price * i.quantity,
    0
  );
  const shipping = input.shippingCop ?? 0;
  const total = subtotal + shipping;

  // 1) Insertar orden y obtener su id + order_number
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: input.userId,
      customer_name: input.customerName.trim(),
      customer_email: input.customerEmail?.trim() || null,
      customer_phone: input.customerPhone.trim(),
      shipping_department: input.shippingDepartment ?? null,
      shipping_city: input.shippingCity ?? null,
      shipping_address: input.shippingAddress ?? null,
      notes: input.notes?.trim() || null,
      subtotal_cop: subtotal,
      shipping_cop: shipping,
      total_cop: total,
      payment_method: input.paymentMethod ?? null,
    })
    .select("*")
    .single();

  if (orderErr || !orderRow) {
    return {
      ok: false,
      error: orderErr?.message ?? "No se pudo crear la orden",
    };
  }

  // 2) Insertar order_items
  const itemRows = input.items.map((i) => ({
    order_id: orderRow.id,
    product_id: i.product.id,
    product_name: i.product.name,
    variant_sku: i.variant.sku,
    variant_label: variantLabel(i) || null,
    unit_price_cop: i.variant.price,
    quantity: i.quantity,
    image_url: i.product.image,
  }));

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemRows);
  if (itemsErr) {
    return { ok: false, error: itemsErr.message };
  }

  return {
    ok: true,
    order: {
      id: orderRow.id,
      orderNumber: orderRow.order_number,
      status: orderRow.status,
      customerName: orderRow.customer_name,
      customerPhone: orderRow.customer_phone,
      customerEmail: orderRow.customer_email,
      shippingDepartment: orderRow.shipping_department,
      shippingCity: orderRow.shipping_city,
      shippingAddress: orderRow.shipping_address,
      notes: orderRow.notes,
      subtotalCop: orderRow.subtotal_cop,
      shippingCop: orderRow.shipping_cop,
      totalCop: orderRow.total_cop,
      paymentMethod: orderRow.payment_method,
      whatsappSent: orderRow.whatsapp_sent,
      createdAt: orderRow.created_at,
      items: itemRows.map((r) => ({
        productId: r.product_id,
        productName: r.product_name,
        variantSku: r.variant_sku,
        variantLabel: r.variant_label,
        unitPriceCop: r.unit_price_cop,
        quantity: r.quantity,
        imageUrl: r.image_url,
      })),
    },
  };
}

export async function markOrderWhatsappSent(orderId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase
    .from("orders")
    .update({ whatsapp_sent: true })
    .eq("id", orderId);
}

export async function listMyOrders(): Promise<OrderRecord[]> {
  const supabase = getSupabaseBrowserClient();
  const { data: ordersData, error: oErr } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (oErr || !ordersData) return [];

  const ids = ordersData.map((o) => o.id);
  const { data: itemsData } = ids.length
    ? await supabase.from("order_items").select("*").in("order_id", ids)
    : { data: [] as never[] };

  return ordersData.map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    customerEmail: o.customer_email,
    shippingDepartment: o.shipping_department,
    shippingCity: o.shipping_city,
    shippingAddress: o.shipping_address,
    notes: o.notes,
    subtotalCop: o.subtotal_cop,
    shippingCop: o.shipping_cop,
    totalCop: o.total_cop,
    paymentMethod: o.payment_method,
    whatsappSent: o.whatsapp_sent,
    createdAt: o.created_at,
    items: ((itemsData ?? []) as Array<{
      order_id: string;
      product_id: string | null;
      product_name: string;
      variant_sku: string | null;
      variant_label: string | null;
      unit_price_cop: number;
      quantity: number;
      image_url: string | null;
    }>)
      .filter((it) => it.order_id === o.id)
      .map((it) => ({
        productId: it.product_id,
        productName: it.product_name,
        variantSku: it.variant_sku,
        variantLabel: it.variant_label,
        unitPriceCop: it.unit_price_cop,
        quantity: it.quantity,
        imageUrl: it.image_url,
      })),
  }));
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente de confirmación",
  confirmed: "Confirmado",
  shipped: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-neutral-200 text-neutral-600",
};
