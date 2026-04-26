export default function ProductLoading() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 animate-pulse">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-10">
          <div className="h-3 w-12 bg-neutral-200/70 rounded-full" />
          <div className="h-3 w-3 bg-neutral-200/50 rounded-full" />
          <div className="h-3 w-16 bg-neutral-200/70 rounded-full" />
          <div className="h-3 w-3 bg-neutral-200/50 rounded-full" />
          <div className="h-3 w-32 bg-neutral-200/70 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Galería */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-200/70 rounded-3xl" />
            <div className="hidden md:flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-neutral-200/50 rounded-2xl shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-7 py-4">
            <div>
              <div className="h-3 w-20 bg-neutral-200/70 rounded-full mb-3" />
              <div className="h-9 w-3/4 bg-neutral-200/70 rounded-full mb-3" />
              <div className="h-4 w-full bg-neutral-200/50 rounded-full mb-2" />
              <div className="h-4 w-5/6 bg-neutral-200/50 rounded-full" />
            </div>

            <div>
              <div className="h-8 w-40 bg-neutral-200/70 rounded-full mb-2" />
              <div className="h-3 w-32 bg-neutral-200/50 rounded-full" />
            </div>

            <div>
              <div className="h-3 w-24 bg-neutral-200/70 rounded-full mb-3" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-24 bg-neutral-200/50 rounded-xl"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="h-3 w-32 bg-neutral-200/70 rounded-full mb-3" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-neutral-200/50 rounded-full"
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 h-14 bg-neutral-200/70 rounded-2xl" />
              <div className="flex-1 h-14 bg-neutral-200/50 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
