"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, DollarSign, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { TechnicianBooking } from "@/lib/technician-types";

interface CompleteJobModalProps {
  booking: TechnicianBooking | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirmComplete: (bookingId: string, finalAmount: number) => Promise<void>;
}

export function CompleteJobModal({
  booking,
  isSubmitting,
  onClose,
  onConfirmComplete,
}: CompleteJobModalProps) {
  const [finalAmount, setFinalAmount] = useState("");

  useEffect(() => {
    if (booking) {
      setFinalAmount(String(booking.basePrice || ""));
    }
  }, [booking]);

  if (!booking) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!booking) return;

    const parsed = Number(finalAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Please enter a valid final amount greater than $0.");
      return;
    }

    await onConfirmComplete(booking._id, parsed);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-job-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              id="complete-job-title"
              className="font-heading text-lg font-extrabold text-slate-900 dark:text-white"
            >
              Mark Repair Completed
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Confirm final repair bill so the customer can pay via Stripe.
            </p>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950/70">
          <p className="font-bold text-slate-900 dark:text-white">
            {booking.serviceTitle}
          </p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Customer: {booking.customerName} &middot; Base Quote: $
            {Number(booking.basePrice).toFixed(2)}
          </p>
        </div>

        <div className="mt-4">
          <label
            htmlFor="final-repair-amount"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Final Billable Amount (USD) *
          </label>
          <div className="relative">
            <DollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="final-repair-amount"
              type="number"
              step="0.01"
              min="0.50"
              required
              disabled={isSubmitting}
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 font-mono text-base font-bold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            Pre-filled with your starting quote. Adjust if replacement parts were added.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>{isSubmitting ? "Completing..." : "Complete & Send Bill"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}