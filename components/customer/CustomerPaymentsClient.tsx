"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Receipt,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type { CustomerPayment } from "@/lib/customer-types";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { printInvoice } from "@/lib/invoice";

export function CustomerPaymentsClient() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchPayments() {
      try {
        const res = await apiAuthFetch<{ payments: CustomerPayment[] }>(
          "/api/payments/my"
        );
        if (!active) return;
        setPayments(Array.isArray(res.payments) ? res.payments : []);
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load payment history."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchPayments();
    return () => {
      active = false;
    };
  }, []);

  async function handleCopyTransactionId(txId: string) {
    try {
      await navigator.clipboard.writeText(txId);
      setCopiedId(txId);
      toast.success("Transaction ID copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Unable to copy transaction ID");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const averageBill =
    payments.length > 0 ? totalPaid / payments.length : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Payment History
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Verified Stripe payment receipts for all completed FixBench repair services.
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="Total Spent"
          value={`$${totalPaid.toFixed(2)}`}
          subtitle="Settled via Stripe Checkout"
          icon={DollarSign}
          accent="emerald"
        />
        <StatsCard
          title="Paid Receipts"
          value={payments.length}
          subtitle="Completed repair transactions"
          icon={Receipt}
          accent="blue"
        />
        <StatsCard
          title="Average Repair Cost"
          value={`$${averageBill.toFixed(2)}`}
          subtitle="Mean amount per completed job"
          icon={CreditCard}
          accent="teal"
        />
      </div>

      {/* Transactions Ledger */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Receipt className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
            No payment receipts yet
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            Once a technician finishes your repair and you complete payment via Stripe Checkout, your transaction receipt will appear here.
          </p>
          <Link
            href="/dashboard/customer/bookings"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Wrench className="h-4 w-4" />
            <span>Check My Bookings</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="pb-3 pr-4">Service</th>
                  <th className="pb-3 pr-4">Technician</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Transaction ID</th>
                  <th className="pb-3 pr-4">Payment Date</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-4 pr-4 font-semibold text-slate-900 dark:text-white">
                      {payment.serviceTitle}
                    </td>
                    <td className="py-4 pr-4 text-slate-700 dark:text-slate-300">
                      {payment.technicianName}
                    </td>
                    <td className="py-4 pr-4 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      ${Number(payment.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-4 pr-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyTransactionId(payment.transactionId)
                        }
                        title="Click to copy full Transaction ID"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                      >
                        <span className="max-w-[160px] truncate">
                          {payment.transactionId}
                        </span>
                        {copiedId === payment.transactionId ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {new Date(payment.paidAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-4">
                      <StatusBadge
                        status={payment.paymentStatus}
                        category="payment"
                      />
                    </td>
                    <td className="py-4">
                      <button
                        type="button"
                        onClick={() =>
                          printInvoice({
                            serviceTitle: payment.serviceTitle,
                            technicianName: payment.technicianName,
                            customerName: payment.customerName,
                            customerEmail: payment.customerEmail,
                            amount: payment.amount,
                            currency: payment.currency,
                            transactionId: payment.transactionId,
                            paidAt: payment.paidAt,
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {payments.map((payment) => (
              <div
                key={payment._id}
                className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {payment.serviceTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Technician: {payment.technicianName}
                    </p>
                  </div>
                  <StatusBadge
                    status={payment.paymentStatus}
                    category="payment"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${Number(payment.amount || 0).toFixed(2)}
                  </span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {new Date(payment.paidAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyTransactionId(payment.transactionId)
                    }
                    className="inline-flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  >
                    <span className="truncate">{payment.transactionId}</span>
                    <Copy className="ml-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    printInvoice({
                      serviceTitle: payment.serviceTitle,
                      technicianName: payment.technicianName,
                      customerName: payment.customerName,
                      customerEmail: payment.customerEmail,
                      amount: payment.amount,
                      currency: payment.currency,
                      transactionId: payment.transactionId,
                      paidAt: payment.paidAt,
                    })
                  }
                  className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Invoice</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}