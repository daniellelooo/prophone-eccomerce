-- Seed defaults para los nuevos bloques editables de la landing.
-- - featured_offers: tiles del bento "El precio manda"
-- - category_showcase_overrides: imágenes de override del ecosistema Apple
--
-- La tabla site_config es key/value (value: jsonb), por lo que estos campos
-- no requieren cambios de schema. Solo insertamos defaults si no existen
-- todavía. El frontend hace fallback a estos mismos defaults si la fila falta.

INSERT INTO public.site_config (key, value) VALUES
  (
    'featured_offers',
    '[
      {
        "id": "iphone-16",
        "badge": "Nuevo · Sellado",
        "badgeStyle": "primary",
        "title": "iPhone 16. Recién llegado.",
        "subtitle": "128 GB · 1 año de garantía oficial Apple. El nuevo iPhone, al precio Prophone.",
        "image": "/IPHONE16.jpeg",
        "price": 2950000,
        "href": "/catalogo"
      },
      {
        "id": "ipad-a16",
        "badge": "El más accesible",
        "badgeStyle": "dark",
        "title": "iPad A16",
        "subtitle": "Chip A16 · 10.9\"",
        "image": "/IPADA16.png",
        "price": 1420000,
        "href": "/catalogo"
      },
      {
        "id": "iphone-14",
        "badge": "Mega descuento",
        "badgeStyle": "primary",
        "title": "iPhone 14",
        "subtitle": "Exhibición · 128 GB",
        "image": "/IPHONE14.jpeg",
        "price": 1400000,
        "href": "/catalogo"
      }
    ]'::jsonb
  ),
  (
    'category_showcase_overrides',
    '{
      "iphone": "",
      "macbook": "",
      "ipad": "",
      "watch": "",
      "accesorios": ""
    }'::jsonb
  )
ON CONFLICT (key) DO NOTHING;
