"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { AppUserRole } from "@/lib/auth-redirect";
import { uploadImageToImgbb } from "@/lib/imgbb";

interface ProfileFormProps {
  initialProfile: {
    name: string;
    email: string;
    image: string;
    role: AppUserRole;
    plan: string;
    phone: string;
    area: string;
    bio: string;
  };
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(initialProfile.name);
  const [image, setImage] = useState(initialProfile.image);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [area, setArea] = useState(initialProfile.area);
  const [bio, setBio] = useState(initialProfile.bio);
  const [plan, setPlan] = useState(initialProfile.plan);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function getToken(): Promise<string | null> {
    try {
      const res = await fetch("/api/auth/token", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { token?: string };
      return typeof data.token === "string" ? data.token : null;
    } catch {
      return null;
    }
  }

  // Hydrate full MongoDB user profile fields (phone, area, bio, plan)
  useEffect(() => {
    let active = true;

    async function loadMongoProfile() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const token = await getToken();
        if (!token || !active) {
          setIsLoadingProfile(false);
          return;
        }

        const res = await fetch(
          `${apiUrl.replace(/\/+$/, "")}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok && active) {
          const data = (await res.json()) as {
            user?: {
              name?: string;
              image?: string;
              phone?: string;
              area?: string;
              bio?: string;
              plan?: string;
            };
          };

          if (data.user) {
            if (data.user.name) setName(data.user.name);
            if (typeof data.user.image === "string") setImage(data.user.image);
            if (typeof data.user.phone === "string") setPhone(data.user.phone);
            if (typeof data.user.area === "string") setArea(data.user.area);
            if (typeof data.user.bio === "string") setBio(data.user.bio);
            if (typeof data.user.plan === "string") setPlan(data.user.plan);
          }
        }
      } catch {
        // Keep session fallback values silently
      } finally {
        if (active) setIsLoadingProfile(false);
      }
    }

    loadMongoProfile();
    return () => {
      active = false;
    };
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const hostedUrl = await uploadImageToImgbb(file);
      setImage(hostedUrl);
      toast.success("Photo uploaded! Click Save Changes to apply.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload photo."
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error("Full name must be at least 2 characters long.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      toast.error("Backend API URL is not configured.");
      return;
    }

    try {
      setIsSaving(true);

      const token = await getToken();
      if (!token) {
        toast.error("Session expired. Please sign in again.");
        setIsSaving(false);
        return;
      }

      const response = await fetch(
        `${apiUrl.replace(/\/+$/, "")}/api/users/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: trimmedName,
            image: image.trim(),
            phone: phone.trim(),
            area: area.trim(),
            bio: bio.trim(),
          }),
        }
      );

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        toast.error(data.message || "Failed to update profile.");
        setIsSaving(false);
        return;
      }

      // Sync BetterAuth client session so Top Bar & Navbar update immediately
      await authClient.updateUser({
        name: trimmedName,
        image: image.trim() || undefined,
      });

      router.refresh();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Network error while saving your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = (name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8"
    >
      {/* Avatar & Identity Header */}
      <div className="flex flex-col items-start gap-5 border-b border-slate-100 pb-6 dark:border-slate-800 sm:flex-row sm:items-center">
        <div className="relative">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-20 w-20 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-extrabold text-white">
              {initials}
            </div>
          )}

          <button
            type="button"
            disabled={isUploadingImage || isSaving}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload new profile photo"
            className="absolute -bottom-2 -right-2 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-blue-600 hover:text-white disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl font-extrabold text-slate-900 dark:text-white">
              {name || "FixBench User"}
            </h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold uppercase text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {initialProfile.role}
            </span>
            {initialProfile.role === "technician" && plan === "pro" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified Pro
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click the camera icon to upload a JPG, PNG, or WebP avatar (max 5 MB).
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Read-Only Email */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Account Email (Read-Only)
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              readOnly
              value={initialProfile.email}
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400"
            />
          </div>
        </div>

        {/* Read-Only Role */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Assigned Role (Read-Only)
          </label>
          <div className="relative">
            <Shield className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              readOnly
              value={
                initialProfile.role.charAt(0).toUpperCase() +
                initialProfile.role.slice(1)
              }
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400"
            />
          </div>
        </div>

        {/* Editable Full Name */}
        <div>
          <label
            htmlFor="profile-name"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Full Name *
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="profile-name"
              type="text"
              required
              disabled={isSaving}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Editable Phone */}
        <div>
          <label
            htmlFor="profile-phone"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="profile-phone"
              type="tel"
              disabled={isSaving || isLoadingProfile}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Editable City / Service Area */}
        <div className="sm:col-span-2">
          <label
            htmlFor="profile-area"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            City / Service Area
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="profile-area"
              type="text"
              disabled={isSaving || isLoadingProfile}
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Agrabad, Chittagong or Mirpur, Dhaka"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        {/* Editable Short Bio */}
        <div className="sm:col-span-2">
          <label
            htmlFor="profile-bio"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            Short Bio &amp; Specialties
          </label>
          <div className="relative">
            <FileText className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <textarea
              id="profile-bio"
              rows={4}
              disabled={isSaving || isLoadingProfile}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your repair expertise, certifications, or preferred service notes..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Save Action */}
      <div className="mt-6 flex items-center justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
        <button
          type="submit"
          disabled={isSaving || isUploadingImage}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <span>{isSaving ? "Saving Changes..." : "Save Profile Changes"}</span>
        </button>
      </div>
    </form>
  );
}