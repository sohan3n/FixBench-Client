"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Ban,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader2,
  MapPin,
  Search,
  Star,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type {
  BookingJobStatus,
  CustomerBooking,
} from "@/lib/customer-types";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { BookingTimeline } from "./BookingTimeline";
import { CancelBookingModal } from "./CancelBookingModal";
import { ReviewBookingModal } from "./ReviewBookingModal";

const FILTER_TABS: { label: string; value: "all" | BookingJobStatus }[] = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Rejected", value: "rejected" },
];

export function CustomerBookingsClient() {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"all" | BookingJobStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTimelineIds, setExpandedTimelineIds] = useState<Set<string>>(
    new Set()
  );

  // Modal & Mutation States
  const [cancelTarget, setCancelTarget] = useState<CustomerBooking | null>(
    null
  );
  const [isCancelling, setIsCancelling] = useState(false);

  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  const [reviewTarget, setReviewTarget] = useState<CustomerBooking | null>(
    null
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchBookings() {
      try {
        const res = await apiAuthFetch<{ bookings: CustomerBooking[] }>(
          "/api/bookings/my"
        );
        if (!active) return;
        const list = Array.isArray(res.bookings) ? res.bookings : [];
        setBookings(list);
        // Auto-expand timeline for the first active/recent booking
        if (list.length > 0) {
          setExpandedTimelineIds(new Set([list[0]._id]));
        }
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load your bookings."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchBookings();
    return () => {
      active = false;
    };
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (activeTab !== "all" && booking.status !== activeTab) {
        return false;
      }

      if (searchTerm.trim().length > 0) {
        const q = searchTerm.trim().toLowerCase();
        const matchesService = booking.serviceTitle.toLowerCase().includes(q);
        const matchesTech = booking.technicianName.toLowerCase().includes(q);
        const matchesCat = booking.category.toLowerCase().includes(q);
        return matchesService || matchesTech || matchesCat;
      }

      return true;
    });
  }, [bookings, activeTab, searchTerm]);

  function toggleTimeline(bookingId: string) {
    setExpandedTimelineIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookingId)) {
        next.delete(bookingId);
      } else {
        next.add(bookingId);
      }
      return next;
    });
  }

  async function handleConfirmCancel(bookingId: string) {
    try {
      setIsCancelling(true);
      const res = await apiAuthFetch<{
        message: string;
        booking: CustomerBooking;
      }>(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      setBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? res.booking : item))
      );
      toast.success(res.message || "Booking cancelled.");
      setCancelTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to cancel booking."
      );
    } finally {
      setIsCancelling(false);
    }
  }

  async function handlePayNow(bookingId: string) {
    try {
      setPayingBookingId(bookingId);
      const res = await apiAuthFetch<{ url?: string }>(
        "/api/payments/create-checkout-session",
        {
          method: "POST",
          body: JSON.stringify({ bookingId }),
        }
      );

      if (!res.url) {
        throw new Error("Stripe Checkout URL was not returned.");
      }

      window.location.href = res.url;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Unable to start Stripe Checkout right now."
      );
      setPayingBookingId(null);
    }
  }

  async function handleSubmitReview(
    bookingId: string,
    rating: number,
    review: string
  ) {
    try {
      setIsSubmittingReview(true);
      const res = await apiAuthFetch<{
        message: string;
        booking: CustomerBooking;
      }>(`/api/bookings/${bookingId}/review`, {
        method: "PATCH",
        body: JSON.stringify({ rating, review }),
      });

      setBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? res.booking : item))
      );
      toast.success(res.message || "Review submitted!");
      setReviewTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit review."
      );
    } finally {
      setIsSubmittingReview(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-44 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Repair Bookings
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track repair status updates, cancel pending requests, pay for completed jobs, and leave technician reviews.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
        >
          <Wrench className="h-4 w-4" />
          <span>Browse Services</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? bookings.length
                : bookings.filter((b) => b.status === tab.value).length;
            const active = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service or technician..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
            No matching bookings found
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            {bookings.length === 0
              ? "You haven't requested any repairs yet. Browse verified technicians to get started."
              : "Try switching status tabs or clearing your search query."}
          </p>
          {bookings.length === 0 && (
            <Link
              href="/services"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <span>Explore Services</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const canCancel = booking.status === "requested";
            const canPayNow =
              booking.status === "completed" &&
              booking.paymentStatus === "unpaid";
            const canLeaveReview =
              booking.status === "completed" &&
              booking.paymentStatus === "paid" &&
              typeof booking.rating !== "number";
            const hasReviewed = typeof booking.rating === "number";
            const isTimelineExpanded = expandedTimelineIds.has(booking._id);

            const displayAmount =
              booking.status === "completed"
                ? Number(booking.finalAmount || booking.basePrice)
                : Number(booking.basePrice);

            return (
              <div
                key={booking._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  {/* Left: Service Thumbnail & Details */}
                  <div className="flex items-start gap-4">
                    {booking.serviceImage ? (
                      <img
                        src={booking.serviceImage}
                        alt={booking.serviceTitle}
                        className="h-16 w-16 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-800 sm:h-20 sm:w-20"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 sm:h-20 sm:w-20">
                        <Wrench className="h-7 w-7" />
                      </div>
                    )}

                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {booking.category}
                        </span>
                        <StatusBadge status={booking.status} category="job" />
                        <StatusBadge
                          status={booking.paymentStatus}
                          category="payment"
                        />
                      </div>

                      <Link
                        href={`/services/${booking.serviceId}`}
                        className="block font-heading text-base font-extrabold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 sm:text-lg"
                      >
                        {booking.serviceTitle}
                      </Link>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <span>
                          Technician:{" "}
                          <strong className="text-slate-800 dark:text-slate-200">
                            {booking.technicianName}
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(booking.preferredDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {booking.address}
                        </span>
                      </div>

                      <p className="line-clamp-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                        Issue: {booking.problemDescription}
                      </p>
                    </div>
                  </div>

                  {/* Right: Price & Conditional Action Buttons */}
                  <div className="flex flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    <div className="lg:text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {booking.status === "completed"
                          ? "Final Bill"
                          : "Starting Quote"}
                      </p>
                      <p className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
                        ${displayAmount.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Cancel button ONLY when status === 'requested' */}
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-950"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}

                      {/* Pay Now button ONLY when status === 'completed' && paymentStatus === 'unpaid' */}
                      {canPayNow && (
                        <button
                          type="button"
                          disabled={payingBookingId === booking._id}
                          onClick={() => handlePayNow(booking._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {payingBookingId === booking._id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {payingBookingId === booking._id
                              ? "Redirecting..."
                              : "Pay Now"}
                          </span>
                        </button>
                      )}

                      {/* Leave a Review button ONLY after paymentStatus === 'paid' */}
                      {canLeaveReview && (
                        <button
                          type="button"
                          onClick={() => setReviewTarget(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:bg-amber-400"
                        >
                          <Star className="h-3.5 w-3.5 fill-slate-950" />
                          <span>Leave a Review</span>
                        </button>
                      )}

                      {/* Timeline Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleTimeline(booking._id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <span>Timeline</span>
                        {isTimelineExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submitted Customer Review Display */}
                {hasReviewed && (
                  <div className="mt-4 flex flex-col gap-1 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-xs dark:border-amber-900/50 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-300">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {booking.rating} / 5
                      </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        &ldquo;{booking.review}&rdquo;
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700/80 dark:text-amber-400/80">
                      Your Verified Review
                    </span>
                  </div>
                )}

                {/* Visual Repair Status Timeline */}
                {isTimelineExpanded && (
                  <div className="mt-4">
                    <BookingTimeline
                      status={booking.status}
                      paymentStatus={booking.paymentStatus}
                      statusHistory={booking.statusHistory}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Cancelling 'requested' Bookings */}
      <CancelBookingModal
        booking={cancelTarget}
        isSubmitting={isCancelling}
        onClose={() => !isCancelling && setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
      />

      {/* Rating & Review Modal for Paid Bookings */}
      <ReviewBookingModal
        booking={reviewTarget}
        isSubmitting={isSubmittingReview}
        onClose={() => !isSubmittingReview && setReviewTarget(null)}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
}