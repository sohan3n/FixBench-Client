"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  Play,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type {
  TechnicianBooking,
  TechnicianJobStatus,
} from "@/lib/technician-types";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CompleteJobModal } from "./CompleteJobModal";
import { RejectRequestModal } from "./RejectRequestModal";

const REQUEST_FILTER_TABS: {
  label: string;
  value: "all" | TechnicianJobStatus;
}[] = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export function TechnicianRequestsClient() {
  const [bookings, setBookings] = useState<TechnicianBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | TechnicianJobStatus>(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<TechnicianBooking | null>(
    null
  );
  const [completeTarget, setCompleteTarget] =
    useState<TechnicianBooking | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchAssignedRequests() {
      try {
        const res = await apiAuthFetch<{ bookings: TechnicianBooking[] }>(
          "/api/bookings/technician"
        );
        if (!active) return;
        setBookings(Array.isArray(res.bookings) ? res.bookings : []);
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load incoming repair requests."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchAssignedRequests();
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
        return (
          booking.serviceTitle.toLowerCase().includes(q) ||
          booking.customerName.toLowerCase().includes(q) ||
          booking.address.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [bookings, activeTab, searchTerm]);

  async function transitionBookingStatus(
    bookingId: string,
    status: "accepted" | "rejected" | "in-progress" | "completed",
    finalAmount?: number
  ) {
    try {
      setUpdatingId(bookingId);

      const payload: { status: string; finalAmount?: number } = { status };
      if (status === "completed" && typeof finalAmount === "number") {
        payload.finalAmount = finalAmount;
      }

      const res = await apiAuthFetch<{
        message: string;
        booking: TechnicianBooking;
      }>(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? res.booking : item))
      );

      toast.success(res.message || `Job status updated to '${status}'`);
      setRejectTarget(null);
      setCompleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update job status."
      );
    } finally {
      setUpdatingId(null);
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
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Manage Customer Requests
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Review incoming repair requests, advance active jobs through your bench pipeline, and submit final repair bills.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {REQUEST_FILTER_TABS.map((tab) => {
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
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
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
            placeholder="Search customer, service, address..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
            No matching requests found
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            {bookings.length === 0
              ? "You haven't received any customer repair bookings yet."
              : "Try switching status filter tabs or clearing your search query."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const isBusy = updatingId === booking._id;
            const displayAmount =
              booking.status === "completed"
                ? Number(booking.finalAmount || booking.basePrice)
                : Number(booking.basePrice);

            return (
              <div
                key={booking._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  {/* Left: Customer & Issue Details */}
                  <div className="min-w-0 space-y-2">
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

                    <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">
                      {booking.serviceTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <span>
                        Customer:{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {booking.customerName}
                        </strong>
                      </span>
                      <a
                        href={`tel:${booking.customerPhone}`}
                        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {booking.customerPhone}
                      </a>
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

                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Reported Issue:{" "}
                      </span>
                      {booking.problemDescription}
                    </div>
                  </div>

                  {/* Right: Amount & Strict Unidirectional State Controls */}
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

                    {/* State 1: requested -> Accept | Reject */}
                    {booking.status === "requested" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            transitionBookingStatus(booking._id, "accepted")
                          }
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:opacity-60"
                        >
                          {isBusy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>Accept</span>
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => setRejectTarget(booking)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {/* State 2: accepted -> Start Work (in-progress) */}
                    {booking.status === "accepted" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          transitionBookingStatus(booking._id, "in-progress")
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs transition-colors hover:bg-amber-400 disabled:opacity-60"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-slate-950" />
                        )}
                        <span>Start Work</span>
                      </button>
                    )}

                    {/* State 3: in-progress -> Mark Completed (opens Final Amount Modal) */}
                    {booking.status === "in-progress" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setCompleteTarget(booking)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Display Customer Review if Paid & Rated */}
                {typeof booking.rating === "number" && (
                  <div className="mt-4 flex flex-col gap-1 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-2.5 text-xs dark:border-amber-900/50 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
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
                      Customer Feedback
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <RejectRequestModal
        booking={rejectTarget}
        isSubmitting={updatingId !== null}
        onClose={() => updatingId === null && setRejectTarget(null)}
        onConfirmReject={(bookingId) =>
          transitionBookingStatus(bookingId, "rejected")
        }
      />

      <CompleteJobModal
        booking={completeTarget}
        isSubmitting={updatingId !== null}
        onClose={() => updatingId === null && setCompleteTarget(null)}
        onConfirmComplete={(bookingId, finalAmount) =>
          transitionBookingStatus(bookingId, "completed", finalAmount)
        }
      />
    </div>
  );
}