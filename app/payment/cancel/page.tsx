import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, RotateCcw, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Cancelled",
  description: "Your Stripe Checkout payment was cancelled. No charges were made.",
};

interface PaymentCancelPageProps {
  searchParams: Promise<{
    plan?: string;
    booking_id?: string;
  }>;
}

export default async function PaymentCancelPage({
  searchParams,
}: PaymentCancelPageProps) {
  const params = await searchParams;
  const isProPlan = params.plan === "pro";

  const retryHref = isProPlan
    ? "/dashboard/technician"
    : "/dashboard/customer/bookings";
  const retryLabel = isProPlan
    ? "Back to Technician Dashboard"
    : "Return to My Bookings";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400">
          <XCircle className="h-9 w-9" />
        </div>

        <h1 className="mt-5 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Payment Cancelled
        </h1>

        <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          You exited Stripe Checkout before completing payment. No charges were made to your card, and your{" "}
          {isProPlan ? "account plan" : "booking status"} remains unchanged.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={retryHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{retryLabel}</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}