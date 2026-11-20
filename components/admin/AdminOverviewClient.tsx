"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Receipt,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type {
  AdminMonthlyStat,
  AdminPlatformStats,
  AdminServiceItem,
} from "@/lib/admin-types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  BarBreakdownChart,
  DistributionProgressCard,
} from "@/components/dashboard/DashboardCharts";

interface AdminOverviewClientProps {
  adminName: string;
}

export function AdminOverviewClient({ adminName }: AdminOverviewClientProps) {
  const [stats, setStats] = useState<AdminPlatformStats>({
    totalUsers: 0,
    totalTechnicians: 0,
    totalCustomers: 0,
    pendingServices: 0,
    totalServices: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState<AdminMonthlyStat[]>([]);
  const [pendingQueue, setPendingQueue] = useState<AdminServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAdminOverview() {
      try {
        const [statsRes, pendingServicesRes] = await Promise.all([
          apiAuthFetch<{
            stats: AdminPlatformStats;
            monthlyStats: AdminMonthlyStat[];
          }>("/api/admin/stats"),
          apiAuthFetch<{ services: AdminServiceItem[] }>(
            "/api/admin/services?status=pending"
          ),
        ]);

        if (!active) return;
        if (statsRes.stats) setStats(statsRes.stats);
        setMonthlyStats(
          Array.isArray(statsRes.monthlyStats) ? statsRes.monthlyStats : []
        );
        setPendingQueue(
          Array.isArray(pendingServicesRes.services)
            ? pendingServicesRes.services.slice(0, 5)
            : []
        );
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load platform analytics."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadAdminOverview();
    return () => {
      active = false;
    };
  }, []);

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

  const adminCount = Math.max(
    0,
    stats.totalUsers - stats.totalCustomers - stats.totalTechnicians
  );

  const revenueChartData = monthlyStats.map((item) => ({
    label: item.month,
    value: item.revenue,
    formattedValue: `$${item.revenue.toFixed(0)}`,
  }));

  return (
    <div className="space-y-8">
      {/* Admin Control Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Platform Operations</span>
          </div>
          <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome, {adminName}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Monitor platform growth, moderate technician service submissions, manage user roles, and audit Stripe revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/admin/services"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <ClipboardCheck className="h-4 w-4" />
            <span>Review Queue ({stats.pendingServices})</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle={`${stats.totalCustomers} customers · ${adminCount} admin`}
          icon={Users}
          accent="blue"
        />
        <StatsCard
          title="Total Technicians"
          value={stats.totalTechnicians}
          subtitle={`${stats.totalServices} total services listed`}
          icon={Wrench}
          accent="teal"
        />
        <StatsCard
          title="Pending Services"
          value={stats.pendingServices}
          subtitle="Awaiting moderation approval"
          icon={ClipboardCheck}
          accent="amber"
        />
        <StatsCard
          title="Platform Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          subtitle={`Across ${stats.totalBookings} total bookings`}
          icon={DollarSign}
          accent="emerald"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DistributionProgressCard
          title="Registered User Role Breakdown"
          subtitle="Distribution across customers, verified technicians, and administrators"
          rows={[
            {
              label: "Customers",
              count: stats.totalCustomers,
              colorClass: "bg-blue-600 dark:bg-blue-500",
            },
            {
              label: "Technicians",
              count: stats.totalTechnicians,
              colorClass: "bg-teal-600 dark:bg-teal-500",
            },
            {
              label: "Administrators",
              count: adminCount,
              colorClass: "bg-amber-500",
            },
          ]}
        />

        <BarBreakdownChart
          title="Monthly Stripe Revenue"
          subtitle="Settled customer repair bills & Verified Pro upgrades"
          data={revenueChartData}
          barColorClass="bg-emerald-600 dark:bg-emerald-500"
          emptyMessage="Completed Stripe transactions will appear here."
        />
      </div>

      {/* Pending Service Approvals Preview + Quick Admin Links */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Pending Queue (2 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
                Pending Service Approvals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Newest technician listings waiting to go live on the public directory
              </p>
            </div>

            <Link
              href="/dashboard/admin/services"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              <span>Open Moderation Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
                All caught up!
              </h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
                There are zero pending service submissions waiting for review right now.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
              {pendingQueue.map((service) => (
                <div
                  key={service._id}
                  className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-12 w-16 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-800"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {service.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {service.category} &middot; by{" "}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {service.technicianName}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      ${Number(service.basePrice).toFixed(2)}
                    </span>
                    <StatusBadge
                      status={service.approvalStatus}
                      category="approval"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Navigation Card (1 col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
            Admin Shortcuts
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Jump directly into core platform controls
          </p>

          <div className="mt-5 space-y-3">
            <Link
              href="/dashboard/admin/users"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Manage Users
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Promote or update account roles
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/admin/bookings"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-teal-300 hover:bg-teal-50/40 dark:border-slate-800 dark:hover:border-teal-800 dark:hover:bg-teal-950/20"
            >
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    All Platform Bookings
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Monitor active &amp; completed repairs
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/admin/transactions"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-slate-800 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
            >
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Transactions &amp; Revenue
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Audit Stripe payments &amp; Pro upgrades
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}