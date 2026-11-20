"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  Plus,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type { CustomerBooking, CustomerPayment } from "@/lib/customer-types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  BarBreakdownChart,
  DistributionProgressCard,
} from "@/components/dashboard/DashboardCharts";

interface CustomerOverviewClientProps {
  customerName: string;
}

export function CustomerOverviewClient({
  customerName,
}: CustomerOverviewClientProps) {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCustomerDashboardData() {
      try {
        const [bookingsRes, paymentsRes] = await Promise.all([
          apiAuthFetch<{ bookings: CustomerBooking[] }>("/api/bookings/my"),
          apiAuthFetch<{ payments: CustomerPayment[] }>("/api/payments/my"),
        ]);

        if (!active) return;
        setBookings(
          Array.isArray(bookingsRes.bookings) ? bookingsRes.bookings : []
        );
        setPayments(
          Array.isArray(paymentsRes.payments) ? paymentsRes.payments : []
        );
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load dashboard overview."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadCustomerDashboardData();
    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-32 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        </div>
      </div>
    );
  }

  const totalRequests = bookings.length;
  const activeJobs = bookings.filter((b) =>
    ["requested", "accepted", "in-progress"].includes(b.status)
  ).length;
  const completedJobs = bookings.filter((b) => b.status === "completed").length;
  const unpaidCompletedCount = bookings.filter(
    (b) => b.status === "completed" && b.paymentStatus === "unpaid"
  ).length;
  const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Status distribution rows for Progress Card
  const requestedCount = bookings.filter((b) => b.status === "requested").length;
  const activeWorkCount = bookings.filter((b) =>
    ["accepted", "in-progress"].includes(b.status)
  ).length;
  const closedCount = bookings.filter((b) =>
    ["cancelled", "rejected"].includes(b.status)
  ).length;

  // Spending by category bar chart data
  const spendByCategory = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.paymentStatus === "paid") {
      const cat = booking.category || "General";
      spendByCategory.set(
        cat,
        (spendByCategory.get(cat) || 0) + Number(booking.finalAmount || 0)
      );
    }
  }

  const categoryChartData = Array.from(spendByCategory.entries())
    .slice(0, 6)
    .map(([label, value]) => ({
      label,
      value,
      formattedValue: `$${value.toFixed(0)}`,
    }));

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {customerName}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track your active repair requests, settle completed jobs securely, and review verified technicians.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Book New Repair</span>
        </Link>
      </div>

      {/* Action Alert if Completed Jobs Await Payment */}
      {unpaidCompletedCount > 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 dark:border-amber-800/70 dark:bg-amber-950/40 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 text-sm text-amber-900 dark:text-amber-200">
            <CreditCard className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              You have{" "}
              <strong>
                {unpaidCompletedCount} completed{" "}
                {unpaidCompletedCount === 1 ? "repair" : "repairs"}
              </strong>{" "}
              ready for Stripe checkout payment.
            </span>
          </div>
          <Link
            href="/dashboard/customer/bookings?status=completed"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-700"
          >
            <span>Review &amp; Pay</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Requests"
          value={totalRequests}
          subtitle="All repair bookings submitted"
          icon={ClipboardList}
          accent="blue"
        />
        <StatsCard
          title="Active Jobs"
          value={activeJobs}
          subtitle="Requested, accepted, or in progress"
          icon={Clock}
          accent="amber"
        />
        <StatsCard
          title="Completed Jobs"
          value={completedJobs}
          subtitle="Finished by verified technicians"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatsCard
          title="Total Paid"
          value={`$${totalSpent.toFixed(2)}`}
          subtitle={`${payments.length} settled Stripe ${
            payments.length === 1 ? "receipt" : "receipts"
          }`}
          icon={CreditCard}
          accent="teal"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DistributionProgressCard
          title="Booking Status Distribution"
          subtitle="Breakdown of your repair requests by current pipeline stage"
          rows={[
            {
              label: "Awaiting Acceptance (Requested)",
              count: requestedCount,
              colorClass: "bg-blue-600 dark:bg-blue-500",
            },
            {
              label: "Accepted & In Progress",
              count: activeWorkCount,
              colorClass: "bg-amber-500",
            },
            {
              label: "Completed Repairs",
              count: completedJobs,
              colorClass: "bg-emerald-600 dark:bg-emerald-500",
            },
            {
              label: "Cancelled / Declined",
              count: closedCount,
              colorClass: "bg-slate-400 dark:bg-slate-600",
            },
          ]}
        />

        <BarBreakdownChart
          title="Repair Spending by Category"
          subtitle="Paid repair totals grouped by appliance or device type"
          data={categoryChartData}
          barColorClass="bg-teal-600 dark:bg-teal-500"
          emptyMessage="Complete and pay for your first repair to see spending analytics."
        />
      </div>

      {/* Recent Bookings Snapshot */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
              Recent Repair Bookings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest 5 requests submitted from your account
            </p>
          </div>

          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            <span>View All Bookings</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Wrench className="h-6 w-6" />
            </div>
            <h4 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
              No repair requests yet
            </h4>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Browse verified technicians for smartphones, laptops, and home appliances to book your first repair.
            </p>
            <Link
              href="/services"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <CalendarCheck className="h-4 w-4" />
              <span>Explore Repair Services</span>
            </Link>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-3 pr-4">Service</th>
                  <th className="pb-3 pr-4">Technician</th>
                  <th className="pb-3 pr-4">Preferred Date</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Job Status</th>
                  <th className="pb-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 pr-4">
                      <Link
                        href={`/services/${booking.serviceId}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                      >
                        {booking.serviceTitle}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {booking.category}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-700 dark:text-slate-300">
                      {booking.technicianName}
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {new Date(booking.preferredDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="py-3.5 pr-4 font-mono font-bold text-slate-900 dark:text-white">
                      ${Number(booking.finalAmount || booking.basePrice).toFixed(2)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <StatusBadge status={booking.status} category="job" />
                    </td>
                    <td className="py-3.5">
                      <StatusBadge
                        status={booking.paymentStatus}
                        category="payment"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}