import type { Metadata } from "next";
import { CustomerBookingsClient } from "@/components/customer/CustomerBookingsClient";

export const metadata: Metadata = {
  title: "My Bookings",
  description:
    "Track your FixBench repair requests, cancel pending jobs, pay after completion, and review technicians.",
};

export default function CustomerBookingsPage() {
  return <CustomerBookingsClient />;
}