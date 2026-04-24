import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

const SEDES = [
  { name: "C.C. Monterrey – Local 206", area: "El Poblado, Medellín" },
  { name: "C.C. Monterrey – Locales 098/099", area: "El Poblado, Medellín" },
  { name: "Super Centro de la Moda – Local 118", area: "Itagüí" },
  { name: "Pasaje Roberesco – Local 105", area: "Centro, Medellín" },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-5 md:px-12 py-10 md:py-16">

        {/* Top: brand + CTA */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <div className="flex items-center gap-2.5">
            <Image
              src="/prophone-profile-pic.jpg"
              alt="Prophone Medellín"
              width={38}
              height={38}
              className="rounded-full object-cover"
            />
            <span className="font-bold text-neutral-900 text-base">Prophone</span>
          </div>
          <a
            href="https://wa.me/573148941200"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#CC0000] text-white px-4 py-2 rounded-full text-xs font-semibold"
          >
            <Phone size={12} />
            WhatsApp
          </a>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/prophone-profile-pic.jpg"
                alt="Prophone Medellín"
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Prophone Medellín
              </h3>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-5">
              Los precios más baratos en iPhone de Medellín. Garantía oficial,
              crédito disponible y envíos a toda Colombia.
            </p>
            <div className="flex flex-col gap-2 mb-5">
              <a
                href="https://wa.me/573148941200"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Phone size={14} className="text-[#CC0000]" />
                +57 314 894 12 00
              </a>
            </div>
            <a
              href="https://www.instagram.com/prophone_medellin/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-600 hover:text-[#CC0000] transition-colors font-medium"
            >
              @prophone_medellin
            </a>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-4">Productos</h4>
            <ul className="space-y-2">
              {["iPhone", "iPad", "Apple Watch", "MacBook", "Accesorios"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/catalogo?cat=${item.toLowerCase().replace(" ", "")}`}
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-900 mb-4">Nuestras Sedes</h4>
            <ul className="space-y-3">
              {SEDES.map((sede) => (
                <li key={sede.name} className="flex items-start gap-2">
                  <MapPin size={13} className="text-[#CC0000] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-neutral-700 block leading-snug">{sede.name}</span>
                    <span className="text-xs text-neutral-500">{sede.area}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile: compact links + sedes */}
        <div className="md:hidden">
          {/* Quick links */}
          <div className="flex flex-wrap gap-3 mb-6">
            {["iPhone", "iPad", "Watch", "MacBook", "Accesorios"].map((item) => (
              <Link
                key={item}
                href={`/catalogo?cat=${item.toLowerCase().replace(" ", "")}`}
                className="text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-full"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Sedes compact */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {SEDES.map((sede) => (
              <div key={sede.name} className="flex items-start gap-1.5 bg-white rounded-xl p-3 border border-neutral-100">
                <MapPin size={12} className="text-[#CC0000] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-neutral-800 leading-tight">{sede.name}</p>
                  <p className="text-[10px] text-neutral-500">{sede.area}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-neutral-400 mb-2">
            Lun–Sáb 10am–7:30pm · Dom y festivos 11am–5pm
          </p>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Prophone Medellín. Todos los derechos reservados.
          </p>
          <div className="flex gap-5">
            {["Privacidad", "Términos", "Garantía", "Soporte"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
