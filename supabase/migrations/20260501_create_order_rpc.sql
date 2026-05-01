-- RPC SECURITY DEFINER para crear orden + items atómicamente.
--
-- Antes el cliente hacía 2 INSERT separados (orders + order_items) desde
-- el browser, lo cual:
--   1. No es atómico — si falla el segundo INSERT queda una orden huérfana
--   2. Pelea con RLS para guest checkouts
--
-- Esta función ejecuta como owner (SECURITY DEFINER), valida internamente
-- que el caller no pueda crear órdenes a nombre de otro usuario, y mete
-- todo en una sola transacción.

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_user_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_department text,
  p_shipping_city text,
  p_shipping_address text,
  p_notes text,
  p_subtotal_cop bigint,
  p_shipping_cop bigint,
  p_total_cop bigint,
  p_payment_method text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_status text;
  v_created_at timestamptz;
  v_caller_uid uuid := auth.uid();
  v_item jsonb;
  v_items_count int;
BEGIN
  -- Si viene un user_id explícito y NO coincide con auth.uid(), rechazar
  -- (a menos que el caller sea staff del equipo).
  IF p_user_id IS NOT NULL AND p_user_id <> v_caller_uid THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = v_caller_uid
        AND p.role IN ('admin', 'vendedor', 'gestor_inventario')
    ) THEN
      RAISE EXCEPTION 'No puedes crear órdenes a nombre de otro usuario';
    END IF;
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'La orden debe tener al menos un producto';
  END IF;

  v_items_count := jsonb_array_length(p_items);

  INSERT INTO public.orders (
    user_id, customer_name, customer_email, customer_phone,
    shipping_department, shipping_city, shipping_address,
    notes, subtotal_cop, shipping_cop, total_cop, payment_method
  ) VALUES (
    p_user_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_department, p_shipping_city, p_shipping_address,
    p_notes, p_subtotal_cop, p_shipping_cop, p_total_cop, p_payment_method
  )
  RETURNING id, order_number, status, created_at
  INTO v_order_id, v_order_number, v_status, v_created_at;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, product_name,
      variant_sku, variant_label, unit_price_cop, quantity, image_url
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::text,
      v_item->>'product_name',
      v_item->>'variant_sku',
      v_item->>'variant_label',
      (v_item->>'unit_price_cop')::bigint,
      (v_item->>'quantity')::int,
      v_item->>'image_url'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'status', v_status,
    'created_at', v_created_at,
    'items_count', v_items_count
  );
END $$;

GRANT EXECUTE ON FUNCTION public.create_order_with_items(
  uuid, text, text, text, text, text, text, text,
  bigint, bigint, bigint, text, jsonb
) TO anon, authenticated;
