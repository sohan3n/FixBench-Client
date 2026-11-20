"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  PlusCircle,
  Sparkles,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type {
  TechnicianBooking,
  TechnicianService,
  TechnicianServiceQuota,
} from "@/lib/technician-types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  BarBreakdownChart,
  DistributionProgressCard,
} from "@/components/dashboard/DashboardCharts";

interface TechnicianOverviewClientProps {
  technicianName: string;
}

export function TechnicianOverviewClient({
  technicianName,
}: TechnicianOverviewClientProps) {
  const [services, setServices] = useState<TechnicianService[]>([]);
  const [quota, setQuota] = useState<TechnicianServiceQuota>({
    plan: "free",
    currentCount: 0,
    maxAllowed: 3,
    canAddService: true,
  });
  const [bookings, setBookings] = useState<TechnicianBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgradingPro, setIsUpgradingPro] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTechnicianDashboard() {
      try {
        const [servicesRes, bookingsRes] = await Promise.all([
          apiAuthFetch<{
            services: TechnicianService[];
            quota: TechnicianServiceQuota;
          }>("/api/services/my"),
          apiAuthFetch<{ bookings: TechnicianBooking[] }>(
            "/api/bookings/technician"
          ),
        ]);

        if (!active) return;
        setServices(
          Array.isArray(servicesRes.services) ? servicesRes.services : []
        );
        if (servicesRes.quota) {
          setQuota(servicesRes.quota);
        }
        setBookings(
          Array.isArray(bookingsRes.bookings) ? bookingsRes.bookings : []
        );
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load technician overview."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadTechnicianDashboard();
    return () => {
      active = false;
    };
  }, []);

  async function handleUpgradeToPro() {
    try {
      setIsUpgradingPro(true);
      const res = await apiAuthFetch<{ url?: string }>(
        "/api/payments/pro-checkout",
        {
          method: "POST",
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
          : "Unable to initiate Verified Pro upgrade."
      );
      setIsUpgradingPro(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
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

  const totalServices = services.length;
  const approvedServices = services.filter(
    (s) => s.approvalStatus === "approved"
  ).length;
  const pendingServices = services.filter(
    (s) => s.approvalStatus === "pending"
  ).length;
  const rejectedServices = services.filter(
    (s) => s.approvalStatus === "rejected"
  ).length;

  const pendingRequests = bookings.filter(
    (b) => b.status === "requested"
  ).length;
  const activeJobs = bookings.filter((b) =>
    ["accepted", "in-progress"].includes(b.status)
  ).length;
  const completedPaidBookings = bookings.filter(
    (b) => b.status === "completed" && b.paymentStatus === "paid"
  );
  const totalEarned = completedPaidBookings.reduce(
    (sum, b) => sum + Number(b.finalAmount || 0),
    0
  );

  // Earnings grouped by category
  const earningsByCategory = new Map<string, number>();
  for (const booking of completedPaidBookings) {
    const cat = booking.category || "General";
    earningsByCategory.set(
      cat,
      (earningsByCategory.get(cat) || 0) + Number(booking.finalAmount || 0)
    );
  }

  const categoryEarningsData = Array.from(earningsByCategory.entries())
    .slice(0, 6)
    .map(([label, value]) => ({
      label,
      value,
      formattedValue: `$${value.toFixed(0)}`,
    }));

  const recentRequests = bookings.slice(0, 5);
  const isPro = quota.plan === "pro";

  return (
    <div className="space-y-8">
      {/* Welcome & Quick CTA */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {technicianName}
            </h2>
            {isPro && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase text-amber-900 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified Pro
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage your repair service listings, respond to incoming customer requests, and track settled earnings.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add a Service</span>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Services"
          value={totalServices}
          subtitle={
            isPro
              ? "Unlimited Pro plan listings"
              : `${totalServices} of ${quota.maxAllowed ?? 3} Free slots used`
          }
          icon={Wrench}
          accent="blue"
        />
        <StatsCard
          title="Approved Services"
          value={approvedServices}
          subtitle={`${pendingServices} awaiting admin review`}
          icon={CheckCircle2}
          accent="teal"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle={`${activeJobs} accepted or in progress`}
          icon={Clock}
          accent="amber"
        />
        <StatsCard
          title="Settled Earnings"
          value={`$${totalEarned.toFixed(2)}`}
          subtitle={`${completedPaidBookings.length} paid ${
            completedPaidBookings.length === 1 ? "repair" : "repairs"
          }`}
          icon={DollarSign}
          accent="emerald"
        />
      </div>

      {/* Verified Pro Plan Banner (Optional Feature 1) */}
      <div
        className={`rounded-2xl border p-6 shadow-xs ${
          isPro
            ? "border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-white to-teal-50/70 dark:border-amber-800/70 dark:from-amber-950/30 dark:via-slate-900 dark:to-teal-950/20"
            : "border-blue-200/80 bg-gradient-to-r from-blue-50/90 via-white to-teal-50/70 dark:border-blue-900/60 dark:from-blue-950/30 dark:via-slate-900 dark:to-teal-950/20"
        }`}
      >
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isPro ? "Active Membership" : "Technician Membership"}</span>
            </div>

            <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
              {isPro
                ? "You are a FixBench Verified Pro Technician"
                : "Upgrade to Verified Pro — Unlock Unlimited Listings"}
            </h3>

            <p className="max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
              {isPro
                ? "Your Verified Pro badge is displayed on your technician profile and public service cards, and you can publish unlimited repair services."
                : `Free accounts can publish up to ${
                    quota.maxAllowed ?? 3
                  } services (${quota.currentCount}/${
                    quota.maxAllowed ?? 3
                  } used). Upgrade once for $19.99 to unlock unlimited service listings and earn the Verified Pro trust badge.`}
            </p>
          </div>

          {!isPro && (
            <button
              type="button"
              disabled={isUpgradingPro}
              onClick={handleUpgradeToPro}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-slate-950 shadow-sm transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpgradingPro ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BadgeCheck className="h-4 w-4" />
              )}
              <span>
                {isUpgradingPro
                  ? "Redirecting to Stripe..."
                  : "Upgrade to Pro ($19.99)"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DistributionProgressCard
          title="Service Listing Approval Status"
          subtitle="Moderation status across your submitted repair services"
          rows={[
            {
              label: "Approved & Live",
              count: approvedServices,
              colorClass: "bg-emerald-600 dark:bg-emerald-500",
            },
            {
              label: "Pending Admin Approval",
              count: pendingServices,
              colorClass: "bg-amber-500",
            },
            {
              label: "Rejected",
              count: rejectedServices,
              colorClass: "bg-rose-600 dark:bg-rose-500",
            },
          ]}
        />

        <BarBreakdownChart
          title="Paid Earnings by Category"
          subtitle="Completed & paid repair revenue grouped by category"
          data={categoryEarningsData}
          barColorClass="bg-blue-600 dark:bg-blue-500"
          emptyMessage="Complete your first customer repair to see category revenue."
        />
      </div>

      {/* Recent Incoming Customer Requests */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
              Recent Incoming Requests
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest 5 repair requests assigned to your bench
            </p>
          </div>

          <Link
            href="/dashboard/technician/requests"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            <span>Manage All Requests</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <h4 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
              No customer requests yet
            </h4>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Once your services are approved by an admin, customer booking requests will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-3 pr-4">Service</th>
                  <th className="pb-3 pr-4">Customer</th>
                  <th className="pb-3 pr-4">Preferred Date</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Job Status</th>
                  <th className="pb-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRequests.map((booking) => (
                  <tr
                    key={booking._id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 pr-4 font-semibold text-slate-900 dark:text-white">
                      {booking.serviceTitle}
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {booking.customerPhone}
                      </p>
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