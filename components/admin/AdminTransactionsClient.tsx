"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  DollarSign,
  Receipt,
  Search,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type { AdminPaymentItem } from "@/lib/admin-types";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export function AdminTransactionsClient() {
  const [payments, setPayments] = useState<AdminPaymentItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
      try {
        const res = await apiAuthFetch<{
          payments: AdminPaymentItem[];
          totalRevenue: number;
        }>("/api/admin/payments");

        if (!active) return;
        setPayments(Array.isArray(res.payments) ? res.payments : []);
        setTotalRevenue(Number(res.totalRevenue || 0));
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load Stripe transactions."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadTransactions();
    return () => {
      active = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return payments;
    const q = searchTerm.trim().toLowerCase();
    return payments.filter((p) => {
      return (
        (p.serviceTitle || "").toLowerCase().includes(q) ||
        (p.customerName || "").toLowerCase().includes(q) ||
        (p.customerEmail || "").toLowerCase().includes(q) ||
        (p.technicianName || "").toLowerCase().includes(q) ||
        (p.technicianEmail || "").toLowerCase().includes(q) ||
        (p.stripePaymentIntentId || "").toLowerCase().includes(q)
      );
    });
  }, [payments, searchTerm]);

  const repairRevenue = payments
    .filter((p) => p.type !== "pro_upgrade" && p.paymentStatus === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const proUpgradeRevenue = payments
    .filter((p) => p.type === "pro_upgrade" && p.paymentStatus === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Platform Transactions &amp; Revenue
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Verified Stripe payment ledger across customer repair bills and technician Verified Pro upgrades.
        </p>
      </div>

      {/* Total Platform Revenue Summary Hero Card */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-white to-blue-50/70 p-6 shadow-xs dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-blue-950/20 md:grid-cols-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Total Platform Revenue
            </p>
            <p className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {payments.length} settled Stripe{" "}
              {payments.length === 1 ? "transaction" : "transactions"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 border-t border-slate-200/70 pt-4 dark:border-slate-800 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Repair Job Settlements
            </p>
            <p className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
              ${repairRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 border-t border-slate-200/70 pt-4 dark:border-slate-800 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Verified Pro Upgrades
            </p>
            <p className="font-mono text-xl font-extrabold text-slate-900 dark:text-white">
              ${proUpgradeRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Showing {filteredPayments.length} of {payments.length} transactions
        </p>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payer, service, pi_..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Transactions Table */}
      {filteredPayments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <Receipt className="h-8 w-8 text-slate-400" />
          <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
            No Stripe transactions found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Completed customer repair payments and Pro technician upgrades will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <th className="px-5 py-3.5">Service / Item</th>
                  <th className="px-5 py-3.5">Payer</th>
                  <th className="px-5 py-3.5">Technician</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Stripe Payment ID</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((payment) => {
                  const isProUpgrade = payment.type === "pro_upgrade";
                  const payerName = isProUpgrade
                    ? payment.technicianName || "Technician"
                    : payment.customerName || "Customer";
                  const payerEmail = isProUpgrade
                    ? payment.technicianEmail || ""
                    : payment.customerEmail || "";

                  return (
                    <tr
                      key={payment._id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {isProUpgrade
                              ? "Verified Pro Plan Upgrade"
                              : payment.serviceTitle || "Repair Service"}
                          </span>
                          {isProUpgrade && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Pro
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {payerName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {payerEmail}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {payment.technicianName || "—"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {payment.technicianEmail || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${Number(payment.amount || 0).toFixed(2)}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {payment.stripePaymentIntentId ||
                          payment.stripeSessionId ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <StatusBadge
                          status={payment.paymentStatus || "paid"}
                          category="payment"
                        />
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