export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-square mb-3 bg-neutral-200/70 rounded-2xl" />
      <div className="h-3.5 bg-neutral-200/70 rounded-full w-3/4 mb-2" />
      <div className="h-3 bg-neutral-200/50 rounded-full w-1/2 mb-4" />
      <div className="flex items-center justify-between mt-auto">
        <div className="h-4 bg-neutral-200/70 rounded-full w-1/3" />
        <div className="h-7 bg-neutral-200/50 rounded-full w-20" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-12">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
