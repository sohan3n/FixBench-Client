"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Pencil,
  PlusCircle,
  Star,
  Trash2,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type {
  TechnicianService,
  TechnicianServiceQuota,
} from "@/lib/technician-types";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EditServiceModal } from "./EditServiceModal";
import { DeleteServiceModal } from "./DeleteServiceModal";

export function TechnicianServicesClient() {
  const [services, setServices] = useState<TechnicianService[]>([]);
  const [quota, setQuota] = useState<TechnicianServiceQuota | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<TechnicianService | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<TechnicianService | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchMyServices() {
      try {
        const res = await apiAuthFetch<{
          services: TechnicianService[];
          quota: TechnicianServiceQuota;
        }>("/api/services/my");

        if (!active) return;
        setServices(Array.isArray(res.services) ? res.services : []);
        if (res.quota) setQuota(res.quota);
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load your services."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchMyServices();
    return () => {
      active = false;
    };
  }, []);

  async function handleToggleAvailability(service: TechnicianService) {
    const nextValue = !service.isAvailable;
    try {
      setTogglingId(service._id);
      const res = await apiAuthFetch<{
        message: string;
        service: TechnicianService;
      }>(`/api/services/${service._id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: nextValue }),
      });

      setServices((prev) =>
        prev.map((item) =>
          item._id === service._id
            ? { ...item, isAvailable: res.service.isAvailable }
            : item
        )
      );
      toast.success(
        res.message ||
          `Service marked as ${nextValue ? "available" : "unavailable"}`
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to toggle service availability."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSaveEdit(
    serviceId: string,
    updates: {
      title: string;
      category: string;
      description: string;
      image: string;
      basePrice: number;
      estimatedDuration: string;
      serviceMode: string;
      serviceArea: string;
    }
  ) {
    try {
      setIsSavingEdit(true);
      const res = await apiAuthFetch<{
        message: string;
        service: TechnicianService;
      }>(`/api/services/${serviceId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      setServices((prev) =>
        prev.map((item) =>
          item._id === serviceId ? { ...item, ...res.service } : item
        )
      );
      toast.success(
        res.message || "Service updated and queued for admin re-approval."
      );
      setEditTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update service."
      );
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleConfirmDelete(serviceId: string) {
    try {
      setIsDeleting(true);
      const res = await apiAuthFetch<{ message: string }>(
        `/api/services/${serviceId}`,
        { method: "DELETE" }
      );

      setServices((prev) => prev.filter((item) => item._id !== serviceId));
      setQuota((prev) => {
        if (!prev) return prev;
        const nextCount = Math.max(0, prev.currentCount - 1);
        return {
          ...prev,
          currentCount: nextCount,
          canAddService:
            prev.plan === "pro" ||
            (prev.maxAllowed !== null && nextCount < prev.maxAllowed),
        };
      });

      toast.success(res.message || "Service deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete service."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-36 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Repair Services
            </h2>
            {quota && (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-0.5 font-mono text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {quota.plan === "pro"
                  ? `${services.length} Listed (Unlimited Pro)`
                  : `${services.length} / ${quota.maxAllowed ?? 3} Free Slots`}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Toggle service availability, update pricing or descriptions, and monitor admin approval status.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add a Service</span>
        </Link>
      </div>

      {/* Empty State */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Wrench className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
            No services listed yet
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            Publish your first repair or home-appliance service to start receiving bookings from customers.
          </p>
          <Link
            href="/dashboard/technician/add-service"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create First Service</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service._id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center"
            >
              {/* Left: Thumbnail & Metadata */}
              <div className="flex items-start gap-4">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-20 w-24 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-800"
                />

                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {service.category}
                    </span>
                    <StatusBadge
                      status={service.approvalStatus}
                      category="approval"
                    />
                    <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:text-slate-400">
                      {service.serviceMode}
                    </span>
                  </div>

                  <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white sm:text-lg">
                    {service.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      ${Number(service.basePrice).toFixed(2)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {service.estimatedDuration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {service.serviceArea}
                    </span>
                    {typeof service.reviewCount === "number" &&
                      service.reviewCount > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {service.averageRating} ({service.reviewCount})
                        </span>
                      )}
                  </div>
                </div>
              </div>

              {/* Right: Availability Switch + Edit & Delete Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 lg:justify-end lg:border-t-0 lg:pt-0">
                {/* Availability Toggle */}
                <button
                  type="button"
                  disabled={togglingId === service._id}
                  onClick={() => handleToggleAvailability(service)}
                  aria-pressed={service.isAvailable}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                    service.isAvailable
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      service.isAvailable ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  <span>
                    {service.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTarget(service)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(service)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-950"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditServiceModal
        service={editTarget}
        isSubmitting={isSavingEdit}
        onClose={() => !isSavingEdit && setEditTarget(null)}
        onSave={handleSaveEdit}
      />

      <DeleteServiceModal
        service={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}