import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

export default function BuscarLoading() {
  return (
    <>
      <section className="pt-28 pb-6 px-5 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-9 md:h-12 bg-neutral-200/70 rounded-full w-56 md:w-80 mb-3" />
          <div className="h-4 bg-neutral-200/50 rounded-full w-48 mb-6" />
          <div className="h-12 bg-neutral-200/70 rounded-2xl max-w-2xl" />
        </div>
      </section>
      <section className="py-8 px-5 md:px-12 bg-[#F5F5F7] min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <ProductGridSkeleton count={8} />
        </div>
      </section>
    </>
  );
}
