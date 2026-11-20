import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export const metadata: Metadata = {
  title: "Manage Users",
  description:
    "Manage FixBench customer, technician, and administrator accounts and roles.",
};

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard%2Fadmin%2Fusers");
  }

  return <AdminUsersClient currentAdminEmail={session.user.email || ""} />;
}