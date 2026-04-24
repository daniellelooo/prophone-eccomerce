const TICKER_ITEMS = [
  "Reseller Apple · Medellín, Colombia",
  "iPhone 14 128GB — $2.200.000",
  "iPad A16 128GB — $1.420.000",
  "iPhone 16 — $4.200.000",
  "iPhone 16 Pro — $5.290.000",
  "Garantía oficial Apple 1 año",
  "Envío gratis a toda Colombia",
  "Crédito con Banco de Bogotá",
];

const SEPARATOR = "·";

export default function PriceTicker() {
  const content = TICKER_ITEMS.join(`   ${SEPARATOR}   `);
  const doubled = `${content}   ${SEPARATOR}   ${content}   ${SEPARATOR}   `;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-8 bg-[#CC0000] flex items-center overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee text-white text-xs font-semibold tracking-wide select-none">
        <span className="pr-8">{doubled}</span>
        <span className="pr-8" aria-hidden>{doubled}</span>
      </div>
    </div>
  );
}
