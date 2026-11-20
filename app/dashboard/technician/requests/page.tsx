import type { Metadata } from "next";
import { TechnicianRequestsClient } from "@/components/technician/TechnicianRequestsClient";

export const metadata: Metadata = {
  title: "Manage Requests",
  description:
    "Accept or reject incoming customer repair requests and update active job progress through completion.",
};

export default function TechnicianRequestsPage() {
  return <TechnicianRequestsClient />;
}