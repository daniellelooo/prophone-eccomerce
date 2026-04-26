import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

export default function CatalogoLoading() {
  return (
    <>
      <section className="pt-28 pb-6 px-5 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-10 md:h-16 bg-neutral-200/70 rounded-full w-48 md:w-64 mb-3" />
          <div className="h-4 bg-neutral-200/50 rounded-full w-72 md:w-96" />
        </div>
      </section>

      <section className="sticky top-[96px] z-30 bg-white/90 backdrop-blur-xl border-b border-neutral-100 px-5 md:px-12 py-3">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 animate-pulse">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`cat-${i}`}
                className="h-7 bg-neutral-200/70 rounded-full w-20 shrink-0"
              />
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`cond-${i}`}
                className="h-6 bg-neutral-200/50 rounded-full w-16 shrink-0"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-neutral-200/70 rounded-full flex-1" />
            <div className="h-8 bg-neutral-200/70 rounded-full w-28 shrink-0" />
          </div>
        </div>
      </section>

      <section className="py-8 px-5 md:px-12 bg-[#F5F5F7] min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <div className="h-3 bg-neutral-200/50 rounded-full w-24 mb-5 animate-pulse" />
          <ProductGridSkeleton count={8} />
        </div>
      </section>
    </>
  );
}
