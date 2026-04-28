-- 20260428_profiles_admin_read.sql
--
-- Permite que los usuarios admin (profiles.is_admin = true) lean todos los
-- perfiles. Necesario para la página /admin/clientes.
--
-- Implementación:
--   No se puede hacer un EXISTS dentro de una policy de SELECT en la misma
--   tabla — provoca recursión infinita y todas las queries devuelven 500.
--   La solución es encapsular el chequeo en una función SECURITY DEFINER
--   que ignora RLS al consultar profiles.

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

DROP POLICY IF EXISTS profiles_admin_read_all ON public.profiles;

CREATE POLICY profiles_admin_read_all ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());
