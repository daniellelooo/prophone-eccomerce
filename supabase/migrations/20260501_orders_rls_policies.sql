-- Políticas RLS para orders y order_items
--
-- Soporta:
--   1. Checkout invitado (user_id IS NULL) — anon puede crear orden
--   2. Checkout autenticado — el usuario crea con su propio user_id
--   3. Cliente lee sus propias órdenes
--   4. Admin lee/actualiza todas las órdenes
--   5. Admin/vendedor crea ventas locales

-- ─── ORDERS ──────────────────────────────────────────────────────────

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop si existen para que la migración sea idempotente
DROP POLICY IF EXISTS "orders_insert_guest_or_owner" ON public.orders;
DROP POLICY IF EXISTS "orders_select_owner" ON public.orders;
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_delete_admin" ON public.orders;

-- INSERT: guest (user_id null) o el dueño autenticado.
-- También admins/vendedores/gestores autenticados pueden crear con cualquier user_id (ventas locales).
CREATE POLICY "orders_insert_guest_or_owner"
  ON public.orders
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'vendedor', 'gestor_inventario')
    )
  );

-- SELECT: el dueño puede leer sus órdenes
CREATE POLICY "orders_select_owner"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- SELECT: admins/equipo leen todas
CREATE POLICY "orders_select_admin"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'vendedor', 'gestor_inventario')
    )
  );

-- UPDATE: solo admin/equipo (cambiar estado, marcar whatsapp_sent, etc.)
CREATE POLICY "orders_update_admin"
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'vendedor', 'gestor_inventario')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'vendedor', 'gestor_inventario')
    )
  );

-- DELETE: solo admin
CREATE POLICY "orders_delete_admin"
  ON public.orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );


-- ─── ORDER_ITEMS ─────────────────────────────────────────────────────

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_insert_with_order" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_owner" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_admin" ON public.order_items;

-- INSERT: si el caller acaba de crear la order matching, debe poder
-- insertar items. Validamos que la order asociada cumpla las mismas
-- reglas que el INSERT de orders.
CREATE POLICY "order_items_insert_with_order"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          o.user_id IS NULL
          OR o.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('admin', 'vendedor', 'gestor_inventario')
          )
        )
    )
  );

-- SELECT: el dueño de la order ve sus items
CREATE POLICY "order_items_select_owner"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- SELECT: admins/equipo ven todos los items
CREATE POLICY "order_items_select_admin"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'vendedor', 'gestor_inventario')
    )
  );
