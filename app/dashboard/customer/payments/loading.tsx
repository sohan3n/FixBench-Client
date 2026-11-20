export default function CustomerPaymentsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
    </div>
  );
}