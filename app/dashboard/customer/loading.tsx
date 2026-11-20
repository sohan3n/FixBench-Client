export default function CustomerOverviewLoading() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
      </div>
    </div>
  );
}