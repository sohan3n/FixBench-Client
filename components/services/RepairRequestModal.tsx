"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface RepairRequestModalProps {
  serviceId: string;
  serviceTitle: string;
  basePrice: number;
  serviceMode: string;
  technicianEmail: string;
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function RepairRequestModal({
  serviceId,
  serviceTitle,
  basePrice,
  serviceMode,
  technicianEmail,
}: RepairRequestModalProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problemDescription, setProblemDescription] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        role?: string;
        phone?: string;
        area?: string;
      }
    | undefined;

  const role = user?.role || "customer";
  const isCustomer = Boolean(user) && role === "customer";
  const isSelfService =
    Boolean(user?.email) &&
    user!.email!.toLowerCase() === technicianEmail.toLowerCase();

  // Pre-fill saved profile phone/area when opening modal
  useEffect(() => {
    if (isOpen && user) {
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!address && user.area) setAddress(user.area);
      if (!preferredDate) setPreferredDate(getTodayDateString());
    }
  }, [isOpen, user]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting]);

  function handleOpenRequest() {
    if (!user) {
      const callbackUrl = encodeURIComponent(`/services/${serviceId}`);
      router.push(`/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!isCustomer) {
      return;
    }

    setSubmitted(false);
    setServerError(null);
    setBookingSuccess(false);
    setIsOpen(true);
  }

  const trimmedPhone = customerPhone.trim();
  const trimmedAddress = address.trim();
  const trimmedDescription = problemDescription.trim();
  const todayStr = getTodayDateString();

  const phoneError =
    submitted && trimmedPhone.length < 6
      ? "Please enter a valid phone number (at least 6 digits)."
      : null;

  const addressError =
    submitted && trimmedAddress.length < 5
      ? "Please enter a service address (at least 5 characters)."
      : null;

  const dateError =
    submitted && (!preferredDate || preferredDate < todayStr)
      ? "Please choose today or a future date."
      : null;

  const descriptionError =
    submitted && trimmedDescription.length < 20
      ? `Please describe the issue in at least 20 characters (${trimmedDescription.length}/20).`
      : null;

  async function fetchAuthToken(): Promise<string | null> {
    try {
      const res = await fetch("/api/auth/token", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) return null;
      const payload = (await res.json()) as { token?: string };
      return typeof payload.token === "string" ? payload.token : null;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);

    if (
      trimmedPhone.length < 6 ||
      trimmedAddress.length < 5 ||
      !preferredDate ||
      preferredDate < todayStr ||
      trimmedDescription.length < 20
    ) {
      toast.error("Please complete all required fields before submitting.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      setServerError("Server API URL is not configured.");
      return;
    }

    try {
      setIsSubmitting(true);

      const token = await fetchAuthToken();
      if (!token) {
        setServerError("Your session expired. Please sign in again.");
        toast.error("Your session expired. Please sign in again.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(
        `${apiUrl.replace(/\/+$/, "")}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceId,
            customerPhone: trimmedPhone,
            address: trimmedAddress,
            preferredDate,
            problemDescription: trimmedDescription,
          }),
        }
      );

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message =
          data.message || "Could not submit your repair request.";
        setServerError(message);
        toast.error(message);
        setIsSubmitting(false);
        return;
      }

      setBookingSuccess(true);
      setIsSubmitting(false);
      toast.success("Repair request submitted successfully!");
    } catch {
      const fallback = "Network error while submitting your repair request.";
      setServerError(fallback);
      toast.error(fallback);
      setIsSubmitting(false);
    }
  }

  if (isPending) {
    return (
      <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    );
  }

  return (
    <>
      {/* Role-Restricted CTA Trigger */}
      {!user ? (
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleOpenRequest}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Wrench className="h-4 w-4" />
            <span>Sign In to Request Repair</span>
          </button>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            You&apos;ll be returned right back to this service after signing in.
          </p>
        </div>
      ) : !isCustomer || isSelfService ? (
        <div className="space-y-2.5">
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-3.5 text-sm font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-500"
          >
            <Lock className="h-4 w-4" />
            <span>Request Repair</span>
          </button>
          <p
            role="status"
            className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-center text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
          >
            Only customers can request a repair.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpenRequest}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Wrench className="h-4 w-4" />
          <span>Request Repair</span>
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="repair-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
        >
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isSubmitting && setIsOpen(false)}
              aria-label="Close modal"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            {bookingSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="mt-4 font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
                  Repair Request Submitted!
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Your booking for{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {serviceTitle}
                  </strong>{" "}
                  is now in <strong>Requested</strong> status. You will only pay
                  after the technician completes the repair.
                </p>

                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                  <Link
                    href="/dashboard/customer/bookings"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <span>Go to My Bookings</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {serviceMode} · Starts at ${basePrice}
                  </span>
                  <h2
                    id="repair-modal-title"
                    className="mt-1 pr-6 font-heading text-xl font-extrabold text-slate-900 dark:text-white"
                  >
                    Request Repair: {serviceTitle}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    No payment is charged now. Pay securely after your repair is marked completed.
                  </p>
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="mt-5 space-y-4"
                >
                  {/* Read-Only Name & Email */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Customer Name
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          readOnly
                          value={user?.name || ""}
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                        Account Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          readOnly
                          value={user?.email || ""}
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & Preferred Date */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="req-phone"
                        className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Contact Phone *
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="req-phone"
                          type="tel"
                          required
                          disabled={isSubmitting}
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+880 1XXX-XXXXXX"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      {phoneError && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                          {phoneError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="req-date"
                        className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Preferred Date *
                      </label>
                      <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="req-date"
                          type="date"
                          required
                          min={todayStr}
                          disabled={isSubmitting}
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      {dateError && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                          {dateError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="req-address"
                      className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      Service / Pickup Address *
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="req-address"
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House/Flat, Road, Area, City"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    {addressError && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {addressError}
                      </p>
                    )}
                  </div>

                  {/* Problem Description */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label
                        htmlFor="req-description"
                        className="text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        Problem Description *
                      </label>
                      <span
                        className={`text-[11px] font-medium ${
                          trimmedDescription.length >= 20
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {trimmedDescription.length}/20 min chars
                      </span>
                    </div>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <textarea
                        id="req-description"
                        rows={4}
                        required
                        disabled={isSubmitting}
                        value={problemDescription}
                        onChange={(e) => setProblemDescription(e.target.value)}
                        placeholder="Describe the device model, symptoms, error codes, or parts affected..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    {descriptionError && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {descriptionError}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <span>
                        {isSubmitting
                          ? "Submitting..."
                          : "Submit Repair Request"}
                      </span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}