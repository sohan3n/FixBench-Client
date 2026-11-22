import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { getRoleDashboardPath } from "@/lib/auth-redirect";

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(await headers());

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard%2Fcustomer");
  }

  const role = (session.user as { role?: string }).role || "customer";
  if (role !== "customer") {
    redirect(getRoleDashboardPath(role));
  }

  return <>{children}</>;
}