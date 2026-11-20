import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TechnicianOverviewClient } from "@/components/technician/TechnicianOverviewClient";

export const metadata: Metadata = {
  title: "Technician Overview",
  description:
    "Manage your FixBench repair services, track customer requests, view earnings, and manage your Verified Pro membership.",
};

export default async function TechnicianOverviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard%2Ftechnician");
  }

  return (
    <TechnicianOverviewClient
      technicianName={session.user.name || "Technician"}
    />
  );
}