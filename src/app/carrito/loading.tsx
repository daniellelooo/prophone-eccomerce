export default function CarritoLoading() {
  return (
    <div className="pt-24 min-h-screen bg-[#F5F5F7] px-6 pb-24">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="h-3 w-36 bg-neutral-200/70 rounded-full mb-10" />
        <div className="h-9 w-48 bg-neutral-200/70 rounded-full mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 flex gap-5 items-center shadow-sm"
              >
                <div className="w-24 h-24 bg-neutral-200/70 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-neutral-200/70 rounded-full" />
                  <div className="h-3 w-1/3 bg-neutral-200/50 rounded-full" />
                  <div className="h-5 w-1/2 bg-neutral-200/70 rounded-full mt-3" />
                </div>
                <div className="w-24 h-8 bg-neutral-200/50 rounded-full" />
              </div>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div className="h-4 w-32 bg-neutral-200/70 rounded-full" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-neutral-200/50 rounded-full" />
                <div className="h-3 w-3/4 bg-neutral-200/50 rounded-full" />
              </div>
              <div className="h-px bg-neutral-100" />
              <div className="flex justify-between">
                <div className="h-4 w-12 bg-neutral-200/70 rounded-full" />
                <div className="h-5 w-24 bg-neutral-200/70 rounded-full" />
              </div>
              <div className="h-12 bg-neutral-200/70 rounded-2xl" />
              <div className="h-12 bg-neutral-200/50 rounded-2xl" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
