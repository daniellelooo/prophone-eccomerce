-- Políticas RLS finales para orders y order_items
--
-- Modelo de privacidad:
--   - Guest: puede crear órdenes con user_id IS NULL (checkout invitado)
--   - Cliente autenticado: crea órdenes con su propio user_id, lee solo las suyas
--   - Admin / gestor_inventario: leen y actualizan TODAS las órdenes
--   - Vendedor: solo lee y actualiza SUS propias ventas (seller_id = auth.uid())
--   - Solo admin puede borrar
--
-- Esta migración es idempotente: limpia cualquier policy previa y aplica
-- el set canónico.

-- ─── ORDERS ──────────────────────────────────────────────────────────

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Limpiar policies existentes (incluye las redundantes históricas)
DROP POLICY IF EXISTS "orders_guest_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_self_insert" ON public.orders;
DROP POLICY IF EXISTS "orders_guest_read_by_number" ON public.orders;
DROP POLICY IF EXISTS "orders_self_read" ON public.orders;
DROP POLICY IF EXISTS "orders_admin_update" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_guest_or_owner" ON public.orders;
DROP POLICY IF EXISTS "orders_select_owner" ON public.orders;
DROP POLICY IF EXISTS "orders_select_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_seller_read" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_seller_update" ON public.orders;
DROP POLICY IF EXISTS "orders_delete_admin" ON public.orders;

-- INSERT: guest (user_id null), dueño autenticado, o staff (admin/vendedor/gestor)
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

-- SELECT: dueño
CREATE POLICY "orders_select_owner"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- SELECT: admin + gestor (NO vendedor — vendedor solo ve sus propias ventas)
CREATE POLICY "orders_select_admin"
  ON public.orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'gestor_inventario')
    )
  );

-- SELECT: vendedor solo sus propias ventas
CREATE POLICY "orders_seller_read"
  ON public.orders
  FOR SELECT
  USING (seller_id = auth.uid());

-- UPDATE: admin + gestor pueden actualizar todo
CREATE POLICY "orders_update_admin"
  ON public.orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'gestor_inventario')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'gestor_inventario')
    )
  );

-- UPDATE: vendedor solo sus propias ventas
CREATE POLICY "orders_seller_update"
  ON public.orders
  FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

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

DROP POLICY IF EXISTS "order_items_guest_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_self_insert" ON public.order_items;
DROP POLICY IF EXISTS "order_items_via_order" ON public.order_items;
DROP POLICY IF EXISTS "order_items_insert_with_order" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_owner" ON public.order_items;
DROP POLICY IF EXISTS "order_items_select_admin" ON public.order_items;
DROP POLICY IF EXISTS "order_items_seller_read" ON public.order_items;

-- INSERT: validado contra la order asociada (mismas reglas que orders)
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

-- SELECT: dueño de la order
CREATE POLICY "order_items_select_owner"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
    )
  );

-- SELECT: admin + gestor
CREATE POLICY "order_items_select_admin"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'gestor_inventario')
    )
  );

-- SELECT: vendedor solo items de sus propias ventas
CREATE POLICY "order_items_seller_read"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.seller_id = auth.uid()
    )
  );
