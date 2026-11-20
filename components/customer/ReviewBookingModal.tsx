"use client";

import { useState } from "react";
import { Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import type { CustomerBooking } from "@/lib/customer-types";

interface ReviewBookingModalProps {
  booking: CustomerBooking | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmitReview: (
    bookingId: string,
    rating: number,
    review: string
  ) => Promise<void>;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export function ReviewBookingModal({
  booking,
  isSubmitting,
  onClose,
  onSubmitReview,
}: ReviewBookingModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  if (!booking) return null;

  const activeStar = hoveredRating || rating;

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!booking) return;

    const trimmed = review.trim();
    if (trimmed.length < 3) {
      toast.error("Please write at least 3 characters for your review.");
      return;
    }

    await onSubmitReview(booking._id, rating, trimmed);
    setRating(5);
    setReview("");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-booking-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3
              id="review-booking-title"
              className="font-heading text-lg font-extrabold text-slate-900 dark:text-white"
            >
              Rate &amp; Review Repair
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {booking.serviceTitle} by {booking.technicianName}
            </p>
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

        {/* Interactive 1-5 Star Picker */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const filled = starValue <= activeStar;
              return (
                <button
                  key={starValue}
                  type="button"
                  disabled={isSubmitting}
                  onMouseEnter={() => setHoveredRating(starValue)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(starValue)}
                  aria-label={`Rate ${starValue} out of 5 stars`}
                  className="rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      filled
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            {activeStar} / 5 &mdash; {RATING_LABELS[activeStar]}
          </p>
        </div>

        {/* Written Review */}
        <div className="mt-4">
          <label
            htmlFor="customer-review-text"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Your Experience *
          </label>
          <textarea
            id="customer-review-text"
            rows={4}
            required
            minLength={3}
            maxLength={500}
            disabled={isSubmitting}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share how the repair went, punctuality, and service quality..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">
            {review.trim().length} / 500
          </p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? "Submitting..." : "Submit Review"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}