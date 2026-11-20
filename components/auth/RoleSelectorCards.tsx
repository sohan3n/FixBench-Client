"use client";

import { CheckCircle2, UserCheck, Wrench } from "lucide-react";

export type SignupRole = "customer" | "technician";

interface RoleSelectorCardsProps {
  value: SignupRole;
  onChange: (role: SignupRole) => void;
  disabled?: boolean;
}

const ROLE_OPTIONS: {
  value: SignupRole;
  title: string;
  subtitle: string;
  icon: typeof UserCheck;
}[] = [
  {
    value: "customer",
    title: "Customer",
    subtitle: "Book & track verified repairs",
    icon: UserCheck,
  },
  {
    value: "technician",
    title: "Technician",
    subtitle: "List services & manage jobs",
    icon: Wrench,
  },
];

export function RoleSelectorCards({
  value,
  onChange,
  disabled = false,
}: RoleSelectorCardsProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
        I want to join FixBench as a
      </label>
      <div
        role="radiogroup"
        aria-label="Account role"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? "border-blue-600 bg-blue-50/70 shadow-sm dark:border-blue-500 dark:bg-blue-950/40"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {selected && (
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>

              <span className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white">
                {option.title}
              </span>
              <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {option.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}