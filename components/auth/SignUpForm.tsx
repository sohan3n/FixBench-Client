"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getRoleDashboardPath } from "@/lib/auth-redirect";
import { BrandLogo } from "@/components/BrandLogo";
import { RoleSelectorCards, type SignupRole } from "./RoleSelectorCards";
import {
  isPasswordValid,
  PasswordStrengthRules,
} from "./PasswordStrengthRules";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface SignUpFormProps {
  defaultRole?: SignupRole;
  callbackUrl?: string | null;
  googleEnabled?: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpForm({
  defaultRole = "customer",
  callbackUrl = null,
  googleEnabled = false,
}: SignUpFormProps) {
  const router = useRouter();

  const [role, setRole] = useState<SignupRole>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  const nameError =
    submitted && trimmedName.length < 2
      ? "Please enter your full name (at least 2 characters)."
      : null;

  const emailError =
    submitted && !EMAIL_REGEX.test(trimmedEmail)
      ? "Please enter a valid email address."
      : null;

  const passwordValid = isPasswordValid(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);

    if (
      trimmedName.length < 2 ||
      !EMAIL_REGEX.test(trimmedEmail) ||
      !passwordValid
    ) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await authClient.signUp.email({
        name: trimmedName,
        email: trimmedEmail,
        password,
        role,
      });

      if (error) {
        const message =
          error.message || "Unable to create your account. Please try again.";
        setServerError(message);
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Account created! Welcome to FixBench.");
      router.refresh();
      router.push(callbackUrl || getRoleDashboardPath(role));
    } catch {
      const fallback = "Something went wrong while creating your account.";
      setServerError(fallback);
      toast.error(fallback);
      setIsSubmitting(false);
    }
  }

  const signInHref = callbackUrl
    ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/sign-in";

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <BrandLogo variant="navbar" />
        <h1 className="mt-5 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create your FixBench account
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Book trusted repairs or offer your technical skills on FixBench.
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
        {/* Role Selection Cards */}
        <RoleSelectorCards
          value={role}
          onChange={setRole}
          disabled={isSubmitting}
        />

        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              disabled={isSubmitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tariqul Islam"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
          {nameError && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
              {nameError}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-email"
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

        {/* Password + Live Rules */}
        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
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

          <PasswordStrengthRules password={password} showErrors={submitted} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>
            {isSubmitting
              ? "Creating account..."
              : `Create ${role === "technician" ? "Technician" : "Customer"} Account`}
          </span>
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
        Already have an account?{" "}
        <Link
          href={signInHref}
          className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}