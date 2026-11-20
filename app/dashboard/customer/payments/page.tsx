import type { Metadata } from "next";
import { CustomerPaymentsClient } from "@/components/customer/CustomerPaymentsClient";

export const metadata: Metadata = {
  title: "Payment History",
  description:
    "View your FixBench Stripe payment receipts, transaction IDs, and completed repair invoices.",
};

export default function CustomerPaymentsPage() {
  return <CustomerPaymentsClient />;
}