import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getRoleDashboardPath,
  sanitizeCallbackUrl,
} from "@/lib/auth-redirect";
import { SignUpForm } from "@/components/auth/SignUpForm";
import type { SignupRole } from "@/components/auth/RoleSelectorCards";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your FixBench account as a Customer or Technician to book and manage verified repair services.",
};

interface SignUpPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    redirect(getRoleDashboardPath(role));
  }

  const resolvedParams = await searchParams;
  const rawCallback = Array.isArray(resolvedParams.callbackUrl)
    ? resolvedParams.callbackUrl[0]
    : resolvedParams.callbackUrl ||
      (Array.isArray(resolvedParams.redirect)
        ? resolvedParams.redirect[0]
        : resolvedParams.redirect);

  const rawRole = Array.isArray(resolvedParams.role)
    ? resolvedParams.role[0]
    : resolvedParams.role;

  const defaultRole: SignupRole =
    rawRole === "technician" ? "technician" : "customer";

  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
    process.env.GOOGLE_CLIENT_ID !== "your_google_client_id";

  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6">
      <SignUpForm
        defaultRole={defaultRole}
        callbackUrl={sanitizeCallbackUrl(rawCallback)}
        googleEnabled={googleEnabled}
      />
    </section>
  );
}