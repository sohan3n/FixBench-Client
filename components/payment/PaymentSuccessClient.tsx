"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Receipt,
} from "lucide-react";
import { apiAuthFetch } from "@/lib/api-client";

interface VerifiedPaymentRecord {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: string;
  paidAt: string;
}

interface VerifyPaymentResponse {
  message: string;
  paymentType: "booking" | "pro_plan";
  alreadyProcessed: boolean;
  payment: VerifiedPaymentRecord;
}

export function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id")?.trim() || "";

  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyPaymentResponse | null>(null);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      if (!sessionId) {
        if (active) {
          setErrorMessage("Missing Stripe Checkout session ID in the URL.");
          setIsVerifying(false);
        }
        return;
      }

      try {
        const res = await apiAuthFetch<VerifyPaymentResponse>(
          `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`
        );

        if (!active) return;
        setResult(res);
      } catch (err) {
        if (active) {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Unable to verify your Stripe payment session."
          );
        }
      } finally {
        if (active) setIsVerifying(false);
      }
    }

    verifySession();
    return () => {
      active = false;
    };
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
          Verifying Your Payment...
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Confirming your transaction with Stripe and updating your FixBench account.
        </p>
      </div>
    );
  }

  if (errorMessage || !result) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm dark:border-rose-900/60 dark:bg-slate-900 sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
          Payment Verification Failed
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {errorMessage || "We could not confirm this payment session."}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span>Go to My Bookings</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isProPlan = result.paymentType === "pro_plan";
  const { payment } = result;

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-emerald-200/80 bg-white p-8 shadow-sm dark:border-emerald-900/60 dark:bg-slate-900 sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
          {isProPlan ? (
            <BadgeCheck className="h-9 w-9" />
          ) : (
            <CheckCircle2 className="h-9 w-9" />
          )}
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
          <Receipt className="h-3.5 w-3.5" />
          <span>Stripe Payment Confirmed</span>
        </span>

        <h1 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {isProPlan ? "Welcome to Verified Pro!" : "Repair Payment Successful!"}
        </h1>

        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          {isProPlan
            ? "Your technician account now includes unlimited service listings and the Verified Pro badge across FixBench."
            : "Your repair bill has been settled. You can now rate and review your technician from My Bookings."}
        </p>
      </div>

      {/* Receipt Summary */}
      <div className="mt-7 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Item</span>
          <span className="text-right font-bold text-slate-900 dark:text-white">
            {payment.serviceTitle}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Amount Paid</span>
          <span className="font-mono text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            ${Number(payment.amount || 0).toFixed(2)}{" "}
            {(payment.currency || "usd").toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">
            Transaction ID
          </span>
          <span className="truncate font-mono text-xs text-slate-700 dark:text-slate-300">
            {payment.transactionId}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">Paid On</span>
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {payment.paidAt
              ? new Date(payment.paidAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Just now"}
          </span>
        </div>
      </div>

      {/* Next Step CTA */}
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        {isProPlan ? (
          <Link
            href="/dashboard/technician"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <span>Return to Technician Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/dashboard/customer/bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <span>Back to My Bookings</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}