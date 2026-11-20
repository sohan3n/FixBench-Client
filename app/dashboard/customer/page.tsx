import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CustomerOverviewClient } from "@/components/customer/CustomerOverviewClient";

export const metadata: Metadata = {
  title: "Customer Overview",
  description:
    "View your FixBench repair summary, active requests, spending analytics, and recent bookings.",
};

export default async function CustomerOverviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard%2Fcustomer");
  }

  return (
    <CustomerOverviewClient
      customerName={session.user.name || "Customer"}
    />
  );
}