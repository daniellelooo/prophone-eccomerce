/**
 * Genera el SQL de seed (productos + variantes + imágenes) leyendo los
 * defaults de src/lib/products.ts. Imprime a stdout para que el output
 * pueda aplicarse vía Supabase MCP `execute_sql` o `apply_migration`.
 *
 * Uso: npx tsx scripts/generate-seed-sql.ts > /tmp/seed.sql
 */

import { products, getImageUrl } from "../src/lib/products";

const esc = (s: string) => s.replace(/'/g, "''");
const json = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
const txt = (v: string | undefined | null) =>
  v === undefined || v === null || v === "" ? "null" : `'${esc(v)}'`;
const bool = (v: boolean | undefined) => (v ? "true" : "false");

console.log("-- AUTO-GENERATED — NO EDITAR A MANO");
console.log("-- Fuente: src/lib/products.ts");
console.log("");

console.log("delete from public.product_images;");
console.log("delete from public.variants;");
console.log("delete from public.products;");
console.log("");

// Products
console.log("insert into public.products (id, slug, name, category, family, description, short_description, image, is_featured, is_new, badge, colors, features, sort_order) values");
const productRows = products.map((p, i) => {
  return `(
    ${txt(p.id)}, ${txt(p.slug)}, ${txt(p.name)}, ${txt(p.category)}, ${txt(p.family)},
    ${txt(p.description)}, ${txt(p.shortDescription)}, ${txt(p.image)},
    ${bool(p.isFeatured)}, ${bool(p.isNew)}, ${txt(p.badge)},
    ${json(p.colors)}, ${json(p.features)}, ${i}
  )`;
});
console.log(productRows.join(",\n") + ";");
console.log("");

// Variants
const variantRows: string[] = [];
products.forEach((p) => {
  p.variants.forEach((v, vi) => {
    variantRows.push(
      `(${txt(v.sku)}, ${txt(p.id)}, ${txt(v.storage)}, ${txt(v.ram)}, ${txt(v.size)}, ${txt(v.color)}, ${txt(v.condition)}, ${v.price}, ${bool(v.inStock)}, ${txt(v.notes)}, ${vi})`
    );
  });
});
console.log("insert into public.variants (sku, product_id, storage, ram, size, color, condition, price_cop, in_stock, notes, sort_order) values");
console.log(variantRows.join(",\n") + ";");
console.log("");

// Product images
const imageRows: string[] = [];
products.forEach((p) => {
  p.images.forEach((img, i) => {
    imageRows.push(`(${txt(p.id)}, ${txt(getImageUrl(img))}, ${i})`);
  });
});
if (imageRows.length > 0) {
  console.log(
    "insert into public.product_images (product_id, url, position) values"
  );
  console.log(imageRows.join(",\n") + ";");
}
