export default function CustomerBookingsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-14 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-44 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900"
        />
      ))}
    </div>
  );
}