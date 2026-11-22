import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import type { AppUserRole } from "@/lib/auth-redirect";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(await headers());

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard");
  }

  const user = session.user as {
    name?: string;
    email?: string;
    image?: string | null;
    role?: string;
    plan?: string;
  };

  const role: AppUserRole =
    user.role === "admin" || user.role === "technician"
      ? user.role
      : "customer";

  return (
    <DashboardShell
      initialUser={{
        name: user.name || "FixBench User",
        email: user.email || "",
        image: user.image || null,
        role,
        plan: user.plan || "free",
      }}
    >
      {children}
    </DashboardShell>
  );
}