import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminOverviewClient } from "@/components/admin/AdminOverviewClient";

export const metadata: Metadata = {
  title: "Admin Overview",
  description:
    "Platform-wide KPIs, user role breakdown, pending service moderation queue, and Stripe revenue analytics.",
};

export default async function AdminOverviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard%2Fadmin");
  }

  return <AdminOverviewClient adminName={session.user.name || "Admin"} />;
}