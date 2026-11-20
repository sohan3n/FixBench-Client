"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import type { CustomerBooking } from "@/lib/customer-types";

interface CancelBookingModalProps {
  booking: CustomerBooking | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => Promise<void>;
}

export function CancelBookingModal({
  booking,
  isSubmitting,
  onClose,
  onConfirm,
}: CancelBookingModalProps) {
  if (!booking) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="cancel-booking-title"
                className="font-heading text-lg font-extrabold text-slate-900 dark:text-white"
              >
                Cancel Repair Request?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-950/70">
          <p className="font-bold text-slate-900 dark:text-white">
            {booking.serviceTitle}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Technician: {booking.technicianName} &middot; Base Quote: $
            {booking.basePrice.toFixed(2)}
          </p>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Are you sure you want to cancel this request before{" "}
          <span className="font-semibold">{booking.technicianName}</span>{" "}
          accepts it?
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Keep Request
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm(booking._id)}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? "Cancelling..." : "Yes, Cancel Request"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}