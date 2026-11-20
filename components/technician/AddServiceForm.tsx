"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Tag,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import { uploadImageToImgbb } from "@/lib/imgbb";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/service-constants";
import type { TechnicianServiceQuota } from "@/lib/technician-types";

interface AddServiceFormProps {
  technicianName: string;
  technicianEmail: string;
}

export function AddServiceForm({
  technicianName,
  technicianEmail,
}: AddServiceFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [quota, setQuota] = useState<TechnicianServiceQuota | null>(null);
  const [isUpgradingPro, setIsUpgradingPro] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(SERVICE_CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [serviceMode, setServiceMode] = useState<string>(SERVICE_MODES[0]);
  const [serviceArea, setServiceArea] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkQuota() {
      try {
        const res = await apiAuthFetch<{ quota?: TechnicianServiceQuota }>(
          "/api/services/my"
        );
        if (active && res.quota) {
          setQuota(res.quota);
        }
      } catch {
        // Backend enforces quota on POST as well
      }
    }

    checkQuota();
    return () => {
      active = false;
    };
  }, []);

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const uploadedUrl = await uploadImageToImgbb(file);
      setImageUrl(uploadedUrl);
      toast.success("Service photo uploaded!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload service photo."
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleUpgradeToPro() {
    try {
      setIsUpgradingPro(true);
      const res = await apiAuthFetch<{ url?: string }>(
        "/api/payments/pro-checkout",
        { method: "POST" }
      );
      if (!res.url) {
        throw new Error("Stripe Checkout URL was not returned.");
      }
      window.location.href = res.url;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to initiate Verified Pro upgrade."
      );
      setIsUpgradingPro(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (title.trim().length < 3) {
      toast.error("Service title must be at least 3 characters long.");
      return;
    }

    if (description.trim().length < 15) {
      toast.error("Please enter a detailed description (at least 15 characters).");
      return;
    }

    const parsedPrice = Number(basePrice);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Base price must be greater than $0.");
      return;
    }

    if (!estimatedDuration.trim()) {
      toast.error("Please enter an estimated repair duration.");
      return;
    }

    if (serviceArea.trim().length < 2) {
      toast.error("Please enter your covered city or service area.");
      return;
    }

    if (!imageUrl) {
      toast.error("Please upload a cover photo for your repair service.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await apiAuthFetch<{ message?: string }>("/api/services", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
          image: imageUrl,
          basePrice: parsedPrice,
          estimatedDuration: estimatedDuration.trim(),
          serviceMode,
          serviceArea: serviceArea.trim(),
        }),
      });

      toast.success(
        res.message ||
          "Service submitted! It will go live once an admin approves it."
      );
      router.push("/dashboard/technician/my-services");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create service."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const limitReached = quota !== null && !quota.canAddService;

  return (
    <div className="space-y-6">
      {/* Free Plan Quota Alert */}
      {limitReached && (
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/90 p-5 dark:border-amber-800 dark:bg-amber-950/50 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-heading text-sm font-extrabold text-amber-950 dark:text-amber-200">
                Free Plan Service Limit Reached ({quota.currentCount}/
                {quota.maxAllowed})
              </h3>
              <p className="mt-0.5 text-xs text-amber-900/90 dark:text-amber-300/90">
                Upgrade to Verified Pro ($19.99 one-time) to list unlimited repair services and earn the Verified Pro badge.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isUpgradingPro}
            onClick={handleUpgradeToPro}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-xs hover:bg-amber-400 disabled:opacity-60"
          >
            {isUpgradingPro ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BadgeCheck className="h-4 w-4" />
            )}
            <span>
              {isUpgradingPro ? "Redirecting..." : "Upgrade to Pro ($19.99)"}
            </span>
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Service Title */}
          <div className="sm:col-span-2">
            <label
              htmlFor="service-title"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Service Title *
            </label>
            <div className="relative">
              <Wrench className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="service-title"
                type="text"
                required
                disabled={isSubmitting || limitReached}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. iPhone & Android Screen Replacement (Original OLED)"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="service-category"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Repair Category *
            </label>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                id="service-category"
                disabled={isSubmitting || limitReached}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Base Starting Price */}
          <div>
            <label
              htmlFor="service-price"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Base Starting Price (USD) *
            </label>
            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="service-price"
                type="number"
                step="0.01"
                min="1"
                required
                disabled={isSubmitting || limitReached}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="45.00"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 font-mono text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Estimated Duration */}
          <div>
            <label
              htmlFor="service-duration"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Estimated Duration *
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="service-duration"
                type="text"
                required
                disabled={isSubmitting || limitReached}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 1–2 hours"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Service Mode */}
          <div>
            <label
              htmlFor="service-mode"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Service Mode *
            </label>
            <select
              id="service-mode"
              disabled={isSubmitting || limitReached}
              value={serviceMode}
              onChange={(e) => setServiceMode(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            >
              {SERVICE_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Service Area */}
          <div className="sm:col-span-2">
            <label
              htmlFor="service-area"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Covered City / Service Area *
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="service-area"
                type="text"
                required
                disabled={isSubmitting || limitReached}
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Dhanmondi, Uttara & Mirpur, Dhaka"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div className="sm:col-span-2">
            <label
              htmlFor="service-description"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
            >
              Service Description &amp; What&apos;s Included *
            </label>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <textarea
                id="service-description"
                rows={4}
                required
                minLength={15}
                disabled={isSubmitting || limitReached}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe diagnostics, spare parts warranty, supported brands/models, and what the base price covers..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* ImgBB Cover Image File Upload */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Service Cover Photo (ImgBB Upload) *
            </label>

            {imageUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <img
                  src={imageUrl}
                  alt="Uploaded service preview"
                  className="h-56 w-full object-cover"
                />
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                  <span className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Image uploaded and ready
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingImage || isSubmitting}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      disabled={isUploadingImage || isSubmitting}
                      onClick={() => setImageUrl("")}
                      aria-label="Remove image"
                      className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                disabled={isUploadingImage || isSubmitting || limitReached}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center transition-colors hover:border-blue-500 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Uploading photo to ImgBB...
                    </p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Click to upload a service photo
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      JPG, PNG, or WebP &middot; Max 5 MB
                    </p>
                  </>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageFileChange}
              className="hidden"
            />
          </div>

          {/* Read-Only Session Identity Fields */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Technician Name (Read-Only)
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                readOnly
                value={technicianName}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Technician Email (Read-Only)
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                readOnly
                value={technicianEmail}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Footer Note & Submit */}
        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            New services start in <strong>Pending</strong> status and appear publicly after Admin approval.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage || limitReached}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>
              {isSubmitting ? "Publishing Service..." : "Submit for Approval"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}