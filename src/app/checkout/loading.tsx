export default function CheckoutLoading() {
  return (
    <div className="pt-24 min-h-screen bg-[#F5F5F7] px-6 pb-24">
      <div className="max-w-6xl mx-auto animate-pulse">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-3 w-16 bg-neutral-200/70 rounded-full" />
          <div className="h-3 w-3 bg-neutral-200/50 rounded-full" />
          <div className="h-3 w-28 bg-neutral-200/70 rounded-full" />
          <div className="h-3 w-3 bg-neutral-200/50 rounded-full" />
          <div className="h-3 w-32 bg-neutral-200/50 rounded-full" />
        </div>
        <div className="h-10 w-56 bg-neutral-200/70 rounded-full mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-sm space-y-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-neutral-200/70 rounded-full" />
                  <div className="h-11 w-full bg-neutral-200/50 rounded-xl" />
                </div>
              ))}
              <div className="h-12 w-full bg-neutral-200/70 rounded-2xl" />
            </div>
          </div>

          <aside>
            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div className="h-4 w-32 bg-neutral-200/70 rounded-full" />
              <div className="flex gap-3 items-center">
                <div className="w-14 h-14 bg-neutral-200/70 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-neutral-200/70 rounded-full" />
                  <div className="h-3 w-1/2 bg-neutral-200/50 rounded-full" />
                </div>
              </div>
              <div className="h-px bg-neutral-100" />
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-neutral-200/70 rounded-full" />
                <div className="h-4 w-20 bg-neutral-200/70 rounded-full" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
