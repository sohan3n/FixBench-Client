"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Star,
  Store,
  Wrench,
} from "lucide-react";

export interface PublicServiceItem {
  _id: string;
  title: string;
  category: string;
  description?: string;
  basePrice: number;
  serviceMode?: string;
  image?: string;
  technicianName: string;
  technicianEmail?: string;
  technicianPlan?: string;
  ratingAverage?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  approvalStatus?: string;
}

function formatServiceMode(mode?: string): {
  label: string;
  isHomeVisit: boolean;
} {
  const normalized = (mode || "").trim().toLowerCase();
  if (normalized === "shop" || normalized === "shop drop-off") {
    return { label: "Shop Drop-off", isHomeVisit: false };
  }
  return { label: "Home Visit", isHomeVisit: true };
}

function formatPrice(price: number): string {
  const numeric = Number(price) || 0;
  return Number.isInteger(numeric)
    ? `$${numeric}`
    : `$${numeric.toFixed(2)}`;
}

interface ServiceCardProps {
  service: PublicServiceItem;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const modeInfo = formatServiceMode(service.serviceMode);
  const ratingAvg = Number(service.ratingAverage) || 0;
  const reviewCount = Number(service.reviewCount) || 0;
  const isProTech = service.technicianPlan === "pro";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800">
      {/* 1. Uniform Image Container */}
      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
        {service.image && !imgFailed ? (
          <img
            src={service.image}
            alt={service.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-blue-600/15 via-teal-500/10 to-slate-200/40 dark:from-blue-950 dark:via-slate-900 dark:to-slate-800">
            <Wrench className="h-9 w-9 text-blue-600/70 dark:text-blue-400/70" />
            <span className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {service.category}
            </span>
          </div>
        )}

        {/* 3. Category Badge */}
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
          {service.category}
        </span>

        {/* 4. Service Mode Badge */}
        <span
          className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-xs ${
            modeInfo.isHomeVisit
              ? "bg-teal-600 text-white"
              : "bg-amber-500 text-slate-950"
          }`}
        >
          {modeInfo.isHomeVisit ? (
            <MapPin className="h-3 w-3" />
          ) : (
            <Store className="h-3 w-3" />
          )}
          {modeInfo.label}
        </span>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* 2. Title */}
        <h3 className="line-clamp-1 font-heading text-lg font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {service.title}
        </h3>

        {/* 6. Technician Name & Rating */}
        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-medium">
              by {service.technicianName || "Verified Technician"}
            </span>
            {isProTech && (
              <span
                title="Verified Pro Technician"
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
              >
                <BadgeCheck className="h-3 w-3" />
                Pro
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 font-medium">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {reviewCount > 0 ? (
              <span>
                {ratingAvg.toFixed(1)}{" "}
                <span className="text-slate-400">({reviewCount})</span>
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">New</span>
            )}
          </div>
        </div>

        {/* Bottom Price & Action Pinned via mt-auto */}
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
            <div>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Starts at
              </span>
              {/* 5. Starting Price */}
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                {formatPrice(service.basePrice)}
              </span>
            </div>

            {/* 7. View Details CTA */}
            <Link
              href={`/services/${service._id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}