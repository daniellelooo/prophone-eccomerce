-- Agrega campo stock_quantity a variants.
-- Inicializa desde in_stock: true → 1 unidad, false → 0.
-- in_stock se mantiene por compatibilidad; el checkout valida stock_quantity.

ALTER TABLE variants ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 1;

UPDATE variants SET stock_quantity = CASE WHEN in_stock THEN 1 ELSE 0 END
  WHERE stock_quantity = 1; -- solo toca los que tienen el default sin modificar

-- Índice para consultas de checkout (buscar SKUs específicos)
CREATE INDEX IF NOT EXISTS variants_sku_stock_idx ON variants (sku, stock_quantity);
