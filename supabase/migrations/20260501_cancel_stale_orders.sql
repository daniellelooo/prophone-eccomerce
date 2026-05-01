-- RPC para auto-cancelar órdenes web pending viejas (>30 min sin pago aprobado).
-- Llamada desde /api/cron/cancel-stale-orders cada 15 min via Vercel Cron.
-- El trigger trg_restore_stock_on_cancel se encarga de restaurar el stock.

CREATE OR REPLACE FUNCTION public.cancel_stale_pending_orders(
  p_minutes int DEFAULT 30
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count int;
BEGIN
  WITH cancelled AS (
    UPDATE public.orders
    SET status = 'cancelled'
    WHERE status = 'pending'
      AND created_at < now() - (p_minutes || ' minutes')::interval
      AND (payment_provider IS NULL OR payment_provider = 'wompi')
      AND payment_provider <> 'local'
      AND (payment_status IS NULL OR payment_status NOT IN ('approved'))
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM cancelled;

  RETURN v_count;
END $$;

GRANT EXECUTE ON FUNCTION public.cancel_stale_pending_orders(int)
  TO authenticated;
