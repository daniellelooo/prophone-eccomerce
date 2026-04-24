import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] px-6">
      <div className="text-center">
        <p className="text-8xl font-bold text-neutral-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">
          Página no encontrada
        </h1>
        <p className="text-neutral-500 mb-8">
          El producto o página que buscas no existe.
        </p>
        <Link
          href="/catalogo"
          className="bg-[#0071E3] text-white px-8 py-3 rounded-full font-medium hover:bg-[#0051a2] transition-colors inline-block"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  );
}
