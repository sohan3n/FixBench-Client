import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRoleDashboardPath } from "@/lib/auth-redirect";

export default async function TechnicianDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard%2Ftechnician");
  }

  const role = (session.user as { role?: string }).role || "customer";
  if (role !== "technician") {
    redirect(getRoleDashboardPath(role));
  }

  return <>{children}</>;
}