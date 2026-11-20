"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Loader2,
  MapPin,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type { AdminServiceItem } from "@/lib/admin-types";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const APPROVAL_TABS: {
  label: string;
  value: "pending" | "all" | "approved" | "rejected";
}[] = [
  { label: "Pending Queue", value: "pending" },
  { label: "All Services", value: "all" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export function AdminServicesClient() {
  const [services, setServices] = useState<AdminServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<
    "pending" | "all" | "approved" | "rejected"
  >("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchAdminServices() {
      try {
        // Fetch all services (sorted Pending-first by backend) so tab counts stay accurate
        const res = await apiAuthFetch<{ services: AdminServiceItem[] }>(
          "/api/admin/services?status=all"
        );
        if (!active) return;
        setServices(Array.isArray(res.services) ? res.services : []);
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load service moderation queue."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchAdminServices();
    return () => {
      active = false;
    };
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      if (statusTab !== "all" && service.approvalStatus !== statusTab) {
        return false;
      }
      if (searchTerm.trim().length > 0) {
        const q = searchTerm.trim().toLowerCase();
        return (
          service.title.toLowerCase().includes(q) ||
          service.category.toLowerCase().includes(q) ||
          service.technicianName.toLowerCase().includes(q) ||
          service.technicianEmail.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [services, statusTab, searchTerm]);

  async function handleModeration(
    serviceId: string,
    approvalStatus: "approved" | "rejected"
  ) {
    try {
      setActingId(serviceId);
      const res = await apiAuthFetch<{
        message: string;
        service: AdminServiceItem;
      }>(`/api/admin/services/${serviceId}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ approvalStatus }),
      });

      setServices((prev) =>
        prev.map((item) =>
          item._id === serviceId
            ? { ...item, approvalStatus: res.service.approvalStatus }
            : item
        )
      );
      toast.success(
        res.message ||
          (approvalStatus === "approved"
            ? "Service approved and is now live!"
            : "Service rejected.")
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update service approval status."
      );
    } finally {
      setActingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-40 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Service Approval Queue
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Review technician service submissions before they go live on the public repair directory.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {APPROVAL_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? services.length
                : services.filter((s) => s.approvalStatus === tab.value).length;
            const active = statusTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusTab(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service or technician..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Moderation Cards */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <ClipboardCheck className="h-8 w-8 text-slate-400" />
          <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
            No services in this view
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
            {statusTab === "pending"
              ? "There are currently no pending services awaiting admin moderation."
              : "Try switching approval tabs or clearing your search query."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredServices.map((service) => {
            const isBusy = actingId === service._id;

            return (
              <div
                key={service._id}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-24 w-full shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-800 sm:w-32"
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

                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {service.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Technician:{" "}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {service.technicianName}
                        </strong>{" "}
                        ({service.technicianEmail})
                      </span>
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
                    </div>
                  </div>
                </div>

                {/* Approve / Reject Controls */}
                <div className="flex shrink-0 flex-wrap items-center gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800 lg:border-t-0 lg:pt-0">
                  {service.approvalStatus !== "approved" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleModeration(service._id, "approved")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      <span>Approve</span>
                    </button>
                  )}

                  {service.approvalStatus !== "rejected" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleModeration(service._id, "rejected")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-950"
                    >
                      {isBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}