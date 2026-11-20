import type { LucideIcon } from "lucide-react";

export type StatsAccent = "blue" | "teal" | "amber" | "emerald" | "indigo";

const ACCENT_CLASSES: Record<StatsAccent, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: StatsAccent;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "blue",
}: StatsCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 font-mono text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ACCENT_CLASSES[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {subtitle && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}