export interface ChartBarDatum {
  label: string;
  value: number;
  formattedValue?: string;
}

interface BarBreakdownChartProps {
  title: string;
  subtitle?: string;
  data: ChartBarDatum[];
  barColorClass?: string;
  emptyMessage?: string;
}

export function BarBreakdownChart({
  title,
  subtitle,
  data,
  barColorClass = "bg-blue-600 dark:bg-blue-500",
  emptyMessage = "No activity data recorded yet.",
}: BarBreakdownChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {data.length === 0 || maxVal === 0 ? (
        <div className="mt-6 flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-6 flex flex-1 items-end gap-3 pt-4">
          {data.map((item) => {
            const heightPct = Math.max(
              8,
              Math.round((item.value / maxVal) * 100)
            );
            return (
              <div
                key={item.label}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {item.formattedValue ?? item.value}
                </span>
                <div className="flex h-36 w-full items-end justify-center rounded-xl bg-slate-100/80 p-1.5 dark:bg-slate-950/70">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[36px] rounded-lg transition-all duration-300 ${barColorClass}`}
                  />
                </div>
                <span className="line-clamp-1 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface ProgressRowDatum {
  label: string;
  count: number;
  colorClass?: string;
}

interface DistributionProgressCardProps {
  title: string;
  subtitle?: string;
  rows: ProgressRowDatum[];
}

export function DistributionProgressCard({
  title,
  subtitle,
  rows,
}: DistributionProgressCardProps) {
  const totalCount = rows.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((row) => {
          const pct =
            totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0;

          return (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {row.label}
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  {row.count} ({pct}%)
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    row.colorClass || "bg-blue-600 dark:bg-blue-500"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}