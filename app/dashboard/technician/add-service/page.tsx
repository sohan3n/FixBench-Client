import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AddServiceForm } from "@/components/technician/AddServiceForm";

export const metadata: Metadata = {
  title: "Add a Service",
  description:
    "Publish a new repair or appliance service listing on FixBench with photo upload and instant admin moderation queue.",
};

export default async function AddServicePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=%2Fdashboard%2Ftechnician%2Fadd-service");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Publish a New Repair Service
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Provide clear pricing, estimated duration, coverage area, and a cover photo. Your listing goes live upon admin approval.
        </p>
      </div>

      <AddServiceForm
        technicianName={session.user.name || "Technician"}
        technicianEmail={session.user.email || ""}
      />
    </div>
  );
}