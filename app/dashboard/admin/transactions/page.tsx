import type { Metadata } from "next";
import { AdminTransactionsClient } from "@/components/admin/AdminTransactionsClient";

export const metadata: Metadata = {
  title: "Platform Transactions",
  description:
    "View total platform revenue and audit every Stripe transaction across FixBench.",
};

export default function AdminTransactionsPage() {
  return <AdminTransactionsClient />;
}