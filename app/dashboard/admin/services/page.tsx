import type { Metadata } from "next";
import { AdminServicesClient } from "@/components/admin/AdminServicesClient";

export const metadata: Metadata = {
  title: "Service Approval Queue",
  description:
    "Review and approve or reject technician repair service listings on FixBench.",
};

export default function AdminServicesPage() {
  return <AdminServicesClient />;
}