export default function AdminDatosPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
          Datos (JSON)
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Importar/exportar catálogo y configuración como JSON — puente al
          backend futuro. Disponible en C3.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
        <p className="text-sm font-semibold text-neutral-700 mb-1">
          Próximamente
        </p>
        <p className="text-xs text-neutral-400">
          Esta sección se construye en la fase C3 del roadmap.
        </p>
      </div>
    </div>
  );
}
