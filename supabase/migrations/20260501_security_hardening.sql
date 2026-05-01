-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SECURITY HARDENING — sesión del 2026-05-01
--
-- Cierra los siguientes vectores encontrados en el audit:
--   1. Privilege escalation: cualquier cliente podía hacerse admin con
--      UPDATE profiles SET role='admin' (policy profiles_self_write).
--   2. Cualquier authenticated podía crear/editar/borrar productos,
--      variantes, sedes y site_config (policies con qual=true).
--   3. apply_payment_event era callable por anon — un atacante podía
--      marcar órdenes como aprobadas sin pagar.
--   4. cancel_stale_pending_orders también callable por todos.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ─── Helpers de role ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_current_user_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin','vendedor','gestor_inventario')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_inventory_manager()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin','gestor_inventario')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_inventory_manager() TO authenticated;

-- ─── Trigger anti-escalación ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'No puedes cambiar tu propio rol';
    END IF;
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
      RAISE EXCEPTION 'No puedes cambiar tu propio is_admin';
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id THEN
      RAISE EXCEPTION 'No puedes cambiar el id del profile';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();

-- ─── PROFILES: admin puede gestionar a cualquier profile ─────────

DROP POLICY IF EXISTS "profiles_admin_update_any" ON public.profiles;
CREATE POLICY "profiles_admin_update_any"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
CREATE POLICY "profiles_admin_delete"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

-- ─── PRODUCTS / VARIANTS / PRODUCT_IMAGES: solo staff inventario ──

DROP POLICY IF EXISTS "products_admin_write" ON public.products;
DROP POLICY IF EXISTS "products_admin_update" ON public.products;
DROP POLICY IF EXISTS "products_admin_delete" ON public.products;

CREATE POLICY "products_staff_insert" ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.is_current_user_inventory_manager());
CREATE POLICY "products_staff_update" ON public.products FOR UPDATE TO authenticated
  USING (public.is_current_user_inventory_manager())
  WITH CHECK (public.is_current_user_inventory_manager());
CREATE POLICY "products_admin_delete" ON public.products FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "variants_admin_write" ON public.variants;
CREATE POLICY "variants_staff_insert" ON public.variants FOR INSERT TO authenticated
  WITH CHECK (public.is_current_user_inventory_manager());
CREATE POLICY "variants_staff_update" ON public.variants FOR UPDATE TO authenticated
  USING (public.is_current_user_inventory_manager())
  WITH CHECK (public.is_current_user_inventory_manager());
CREATE POLICY "variants_admin_delete" ON public.variants FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_write" ON public.product_images;
DROP POLICY IF EXISTS "product_images_staff_write" ON public.product_images;

CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "product_images_staff_insert" ON public.product_images FOR INSERT
  TO authenticated WITH CHECK (public.is_current_user_inventory_manager());
CREATE POLICY "product_images_staff_update" ON public.product_images FOR UPDATE
  TO authenticated
  USING (public.is_current_user_inventory_manager())
  WITH CHECK (public.is_current_user_inventory_manager());
CREATE POLICY "product_images_staff_delete" ON public.product_images FOR DELETE
  TO authenticated USING (public.is_current_user_inventory_manager());

-- ─── SEDES + SITE_CONFIG: solo admin ──────────────────────────────

DROP POLICY IF EXISTS "sedes_admin_write" ON public.sedes;
CREATE POLICY "sedes_admin_insert" ON public.sedes FOR INSERT TO authenticated
  WITH CHECK (public.is_current_user_admin());
CREATE POLICY "sedes_admin_update" ON public.sedes FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());
CREATE POLICY "sedes_admin_delete" ON public.sedes FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "site_config_admin_write" ON public.site_config;
CREATE POLICY "site_config_admin_insert" ON public.site_config FOR INSERT TO authenticated
  WITH CHECK (public.is_current_user_admin());
CREATE POLICY "site_config_admin_update" ON public.site_config FOR UPDATE TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());
CREATE POLICY "site_config_admin_delete" ON public.site_config FOR DELETE TO authenticated
  USING (public.is_current_user_admin());

-- ─── RPC LOCKDOWN: revoca acceso público a funciones sensibles ───

REVOKE EXECUTE ON FUNCTION public.apply_payment_event(text, text, text, text, timestamptz, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_payment_event(text, text, text, text, timestamptz, text)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.cancel_stale_pending_orders(int)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_stale_pending_orders(int)
  TO service_role;

REVOKE EXECUTE ON FUNCTION public.register_local_sale(text, integer, text)
  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.undo_local_sale(uuid)
  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_variant_stock(text, integer)
  FROM PUBLIC, anon;
