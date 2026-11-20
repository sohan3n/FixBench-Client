"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getRoleDashboardPath } from "@/lib/auth-redirect";
import { BrandLogo } from "@/components/BrandLogo";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface SignInFormProps {
  callbackUrl?: string | null;
  googleEnabled?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm({
  callbackUrl = null,
  googleEnabled = false,
}: SignInFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const trimmedEmail = email.trim().toLowerCase();

  const emailError =
    submitted && !EMAIL_REGEX.test(trimmedEmail)
      ? "Please enter a valid email address."
      : null;

  const passwordError =
    submitted && password.length === 0 ? "Please enter your password." : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);

    if (!EMAIL_REGEX.test(trimmedEmail) || password.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await authClient.signIn.email({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const message =
          error.message || "Invalid email or password. Please try again.";
        setServerError(message);
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      // Resolve user role from sign-in response or fresh session
      let userRole = (data?.user as { role?: string } | undefined)?.role;
      if (!userRole) {
        const sessionRes = await authClient.getSession();
        userRole = (
          sessionRes?.data?.user as { role?: string } | undefined
        )?.role;
      }

      toast.success("Signed in successfully.");
      router.refresh();
      router.push(callbackUrl || getRoleDashboardPath(userRole));
    } catch {
      const fallback = "Unable to sign in right now. Please try again.";
      setServerError(fallback);
      toast.error(fallback);
      setIsSubmitting(false);
    }
  }

  const signUpHref = callbackUrl
    ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/sign-up";

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <BrandLogo variant="navbar" />
        <h1 className="mt-5 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome back to FixBench
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Sign in to manage your repair bookings, services, and payments.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="signin-email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
          {emailError && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {emailError}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signin-password"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {passwordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <GoogleSignInButton
            callbackURL={callbackUrl || "/dashboard"}
            disabled={isSubmitting}
          />
        </>
      )}

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        New to FixBench?{" "}
        <Link
          href={signUpHref}
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}