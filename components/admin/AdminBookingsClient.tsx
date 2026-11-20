"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, Search } from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type { AdminBookingItem } from "@/lib/admin-types";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const BOOKING_STATUS_TABS: {
  label: string;
  value: "all" | AdminBookingItem["status"];
}[] = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export function AdminBookingsClient() {
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "all" | AdminBookingItem["status"]
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPlatformBookings() {
      try {
        const res = await apiAuthFetch<{ bookings: AdminBookingItem[] }>(
          "/api/admin/bookings"
        );
        if (!active) return;
        setBookings(Array.isArray(res.bookings) ? res.bookings : []);
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load platform bookings."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadPlatformBookings();
    return () => {
      active = false;
    };
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim().length > 0) {
        const q = searchTerm.trim().toLowerCase();
        return (
          b.serviceTitle.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerEmail.toLowerCase().includes(q) ||
          b.technicianName.toLowerCase().includes(q) ||
          b.technicianEmail.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookings, statusFilter, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          All Platform Bookings
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Read-only oversight of every customer booking, assigned technician, job lifecycle stage, and billing status.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {BOOKING_STATUS_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? bookings.length
                : bookings.filter((b) => b.status === tab.value).length;
            const active = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
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
            placeholder="Search service, customer, tech..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Read-Only Table */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <Briefcase className="h-8 w-8 text-slate-400" />
          <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
            No bookings match this filter
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try switching status tabs or clearing your search input.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Technician</th>
                  <th className="px-5 py-3.5">Preferred Date</th>
                  <th className="px-5 py-3.5">Job Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBookings.map((booking) => {
                  const amount =
                    booking.status === "completed"
                      ? Number(booking.finalAmount || booking.basePrice)
                      : Number(booking.basePrice);

                  return (
                    <tr
                      key={booking._id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {booking.serviceTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {booking.category}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {booking.customerName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {booking.customerEmail}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {booking.technicianName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {booking.technicianEmail}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {new Date(booking.preferredDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={booking.status} category="job" />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={booking.paymentStatus}
                          category="payment"
                        />
                      </td>

                      <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}