export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-10 space-y-3">
        <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-72 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Uniform 6-Card Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-44 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="h-6 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}