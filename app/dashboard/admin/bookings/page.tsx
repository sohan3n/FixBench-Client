import type { Metadata } from "next";
import { AdminBookingsClient } from "@/components/admin/AdminBookingsClient";

export const metadata: Metadata = {
  title: "All Platform Bookings",
  description:
    "Monitor all repair service bookings across customers and technicians on FixBench.",
};

export default function AdminBookingsPage() {
  return <AdminBookingsClient />;
}