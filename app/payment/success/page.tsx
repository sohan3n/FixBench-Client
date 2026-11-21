import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { PaymentSuccessClient } from "@/components/payment/PaymentSuccessClient";

export const metadata: Metadata = {
  title: "Payment Successful",
  description: "Stripe Checkout payment confirmation for FixBench.",
};

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 dark:bg-slate-950">
      <Suspense
        fallback={
          <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Loading payment receipt...
            </p>
          </div>
        }
      >
        <PaymentSuccessClient />
      </Suspense>
    </main>
  );
}