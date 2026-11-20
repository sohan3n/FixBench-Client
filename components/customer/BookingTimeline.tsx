"use client";

import { Ban, Check, Clock, XCircle } from "lucide-react";
import type {
  BookingJobStatus,
  BookingPaymentStatus,
  BookingStatusHistoryEntry,
} from "@/lib/customer-types";

interface BookingTimelineProps {
  status: BookingJobStatus;
  paymentStatus: BookingPaymentStatus;
  statusHistory: BookingStatusHistoryEntry[];
}

const PIPELINE_STEPS: { key: BookingJobStatus; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const STATUS_ORDER: Record<BookingJobStatus, number> = {
  requested: 0,
  accepted: 1,
  "in-progress": 2,
  completed: 3,
  rejected: -1,
  cancelled: -1,
};

function formatShortTimestamp(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BookingTimeline({
  status,
  paymentStatus,
  statusHistory,
}: BookingTimelineProps) {
  const historyMap = new Map<string, string>();
  for (const entry of statusHistory || []) {
    if (entry?.status && entry?.changedAt) {
      historyMap.set(entry.status, entry.changedAt);
    }
  }

  if (status === "cancelled" || status === "rejected") {
    const terminalTime = formatShortTimestamp(historyMap.get(status));
    const isCancelled = status === "cancelled";

    return (
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-xs ${
          isCancelled
            ? "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300"
            : "border-rose-200 bg-rose-50/70 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        }`}
      >
        <div className="flex items-center gap-2 font-semibold">
          {isCancelled ? (
            <Ban className="h-4 w-4 shrink-0 text-slate-500" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>
            {isCancelled
              ? "Request cancelled by customer"
              : "Request declined by technician"}
          </span>
        </div>
        {terminalTime && (
          <span className="shrink-0 font-mono text-[11px] opacity-80">
            {terminalTime}
          </span>
        )}
      </div>
    );
  }

  const currentRank = STATUS_ORDER[status] ?? 0;
  const isPaid = paymentStatus === "paid";

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {PIPELINE_STEPS.map((step, index) => {
          const reached = currentRank >= index;
          const timeLabel = formatShortTimestamp(historyMap.get(step.key));

          return (
            <div key={step.key} className="flex items-start gap-2">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  reached
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
                }`}
              >
                {reached ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold ${
                    reached
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
                <p className="truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {timeLabel || (reached ? "Done" : "Pending")}
                </p>
              </div>
            </div>
          );
        })}

        {/* Final Step 5: Payment Settled */}
        <div className="flex items-start gap-2">
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
              isPaid
                ? "bg-emerald-600 text-white"
                : "border border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            {isPaid ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          </span>
          <div className="min-w-0">
            <p
              className={`text-xs font-semibold ${
                isPaid
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              Paid
            </p>
            <p className="truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {isPaid ? "Settled" : "After repair"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}