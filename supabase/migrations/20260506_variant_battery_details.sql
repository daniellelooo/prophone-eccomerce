-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VARIANTES DE EXHIBICIÓN — campos físicos por unidad
-- 2026-05-06
--
-- Cada equipo de exhibición es una unidad física distinta con su propia
-- batería y observaciones de estado. Estos dos campos se aplican sólo
-- a variantes con condition='exhibicion' (legacy: 'as-is', 'open-box').
-- Para "nuevo" / "preventa" quedan NULL.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE public.variants
  ADD COLUMN IF NOT EXISTS battery_health smallint
    CHECK (battery_health IS NULL OR (battery_health >= 0 AND battery_health <= 100));

ALTER TABLE public.variants
  ADD COLUMN IF NOT EXISTS condition_details text;

COMMENT ON COLUMN public.variants.battery_health IS
  'Salud de batería (0-100%). Sólo aplica a equipos de exhibición.';

COMMENT ON COLUMN public.variants.condition_details IS
  'Detalles del estado físico (rayones, accesorios, observaciones).';
