"use client";

import { Check, Circle } from "lucide-react";

export interface PasswordRuleResult {
  id: string;
  label: string;
  passed: boolean;
}

export function evaluatePasswordRules(password: string): PasswordRuleResult[] {
  return [
    {
      id: "min-length",
      label: "At least 6 characters",
      passed: password.length >= 6,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter (A–Z)",
      passed: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter (a–z)",
      passed: /[a-z]/.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return evaluatePasswordRules(password).every((rule) => rule.passed);
}

interface PasswordStrengthRulesProps {
  password: string;
  showErrors?: boolean;
}

export function PasswordStrengthRules({
  password,
  showErrors = false,
}: PasswordStrengthRulesProps) {
  const rules = evaluatePasswordRules(password);
  const hasTyped = password.length > 0;

  return (
    <ul
      aria-live="polite"
      className="mt-2.5 space-y-1.5 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-900/70"
    >
      {rules.map((rule) => {
        const failed = !rule.passed && (hasTyped || showErrors);

        return (
          <li
            key={rule.id}
            className={`flex items-center gap-2 transition-colors ${
              rule.passed
                ? "font-medium text-emerald-700 dark:text-emerald-400"
                : failed
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {rule.passed ? (
              <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0 opacity-70" />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}