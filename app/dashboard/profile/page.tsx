import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { AppUserRole } from "@/lib/auth-redirect";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = {
  title: "My Profile",
  description:
    "Manage your FixBench account details, avatar photo, contact number, service area, and bio.",
};

export default async function DashboardProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard%2Fprofile");
  }

  const user = session.user as {
    name?: string;
    email?: string;
    image?: string | null;
    role?: string;
    plan?: string;
    phone?: string;
    area?: string;
    bio?: string;
  };

  const role: AppUserRole =
    user.role === "admin" || user.role === "technician"
      ? user.role
      : "customer";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account &amp; Profile Settings
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Keep your display name, profile photo, phone number, and service area up to date across FixBench.
        </p>
      </div>

      <ProfileForm
        initialProfile={{
          name: user.name || "",
          email: user.email || "",
          image: user.image || "",
          role,
          plan: user.plan || "free",
          phone: user.phone || "",
          area: user.area || "",
          bio: user.bio || "",
        }}
      />
    </div>
  );
}