-- Seed default para los textos editables del landing.
-- Permite que el admin edite título grande del hero, CTAs y todos los
-- títulos/accents/subtítulos de cada sección del home desde
-- /admin/configuracion → "Textos del landing".
--
-- Idempotente: ON CONFLICT DO NOTHING. El frontend hace fallback al
-- DEFAULT_SITE_CONFIG.landingTexts si la fila falta.

INSERT INTO public.site_config (key, value) VALUES
  (
    'landing_texts',
    '{
      "heroLine1": "Los precios",
      "heroLine2": "más bajos",
      "heroLine3Accent": "en iPhone.",
      "heroDescription": "Sin intermediarios. Garantía oficial Apple. Crédito con Banco de Bogotá. El reseller número 1 de Medellín.",
      "heroCtaPrimary": "Comprar ahora",
      "heroCtaSecondary": "Hablar con asesor",
      "ecosystemTitle": "El ecosistema Apple,",
      "ecosystemAccent": "a precio reseller.",
      "priceCommandTitle": "El precio",
      "priceCommandAccent": "manda",
      "priceCommandSubtitle": "Sin intermediarios. Sin maquillaje.",
      "featuredTitle": "Los que se llevan",
      "featuredAccent": "todos",
      "featuredSubtitle": "Equipos con garantía oficial Apple",
      "whyProphoneTitle": "Lo que nos hace",
      "whyProphoneAccent": "Prophone",
      "giftsTitle": "Tres regalos.",
      "giftsAccent": "Cero costo extra.",
      "giftsSubtitle": "Solo en compras de contado",
      "reviewsTitle": "Lo que dicen quienes ya compraron.",
      "finalCtaTitle": "Tu nuevo iPhone",
      "finalCtaAccent": "te espera",
      "finalCtaDescription": "Más de 200K seguidores ya escogieron Prophone. ¿Listo para sumarte?"
    }'::jsonb
  )
ON CONFLICT (key) DO NOTHING;
