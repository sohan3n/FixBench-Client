import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  getRoleDashboardPath,
  sanitizeCallbackUrl,
} from "@/lib/auth-redirect";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your FixBench account to track repair bookings, manage services, or review payments.",
};

interface SignInPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
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

  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
    process.env.GOOGLE_CLIENT_ID !== "your_google_client_id";

  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 sm:px-6">
      <SignInForm
        callbackUrl={sanitizeCallbackUrl(rawCallback)}
        googleEnabled={googleEnabled}
      />
    </section>
  );
}