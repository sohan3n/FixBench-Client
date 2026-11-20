import type { Metadata } from "next";
import { TechnicianServicesClient } from "@/components/technician/TechnicianServicesClient";

export const metadata: Metadata = {
  title: "My Services",
  description:
    "View, edit, delete, and toggle availability for your FixBench repair service listings.",
};

export default function TechnicianMyServicesPage() {
  return <TechnicianServicesClient />;
}