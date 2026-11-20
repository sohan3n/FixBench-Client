import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  CreditCard,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import { RepairRequestModal } from "@/components/services/RepairRequestModal";

interface ServiceDetailsResponse {
  service: {
    _id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    basePrice: number;
    estimatedDuration: string;
    serviceMode: string;
    serviceArea: string;
    technicianName: string;
    technicianEmail: string;
    approvalStatus: string;
    isAvailable: boolean;
    averageRating: number;
    reviewCount: number;
  };
  technician: {
    name: string;
    email: string;
    image: string;
    area: string;
    bio: string;
    plan: "free" | "pro";
  };
  reviews: {
    _id: string;
    customerName: string;
    rating: number;
    review: string;
    createdAt: string;
  }[];
}

interface ServiceDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function fetchServiceDetails(
  id: string
): Promise<ServiceDetailsResponse | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !id) {
    return null;
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/services/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ServiceDetailsResponse;
    if (
      !data?.service ||
      data.service.approvalStatus !== "approved" ||
      data.service.isAvailable !== true
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: ServiceDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchServiceDetails(id);

  if (!data) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: data.service.title,
    description: data.service.description.slice(0, 155),
  };
}

export default async function ServiceDetailsPage({
  params,
}: ServiceDetailsPageProps) {
  const { id } = await params;
  const data = await fetchServiceDetails(id);

  if (!data) {
    notFound();
  }

  const { service, technician, reviews } = data;
  const isHomeVisit =
    service.serviceMode.trim().toLowerCase() !== "shop drop-off";
  const formattedPrice = Number.isInteger(service.basePrice)
    ? `$${service.basePrice}`
    : `$${service.basePrice.toFixed(2)}`;

  const techInitials = (technician.name || "T")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Services</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Main Content (8 Columns) */}
        <div className="space-y-8 lg:col-span-8">
          {/* Hero Service Image & Header Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-800 sm:h-80 md:h-96">
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-950/80 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                  {service.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    isHomeVisit
                      ? "bg-teal-600 text-white"
                      : "bg-amber-500 text-slate-950"
                  }`}
                >
                  {isHomeVisit ? (
                    <MapPin className="h-3.5 w-3.5" />
                  ) : (
                    <Store className="h-3.5 w-3.5" />
                  )}
                  {service.serviceMode}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {service.reviewCount > 0 ? (
                    <>
                      <strong className="text-slate-900 dark:text-white">
                        {service.averageRating.toFixed(1)}
                      </strong>{" "}
                      ({service.reviewCount}{" "}
                      {service.reviewCount === 1 ? "review" : "reviews"})
                    </>
                  ) : (
                    "New Verified Listing"
                  )}
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  {service.estimatedDuration}
                </span>
                <span>&bull;</span>
                <span className="inline-flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  {service.serviceArea}
                </span>
              </div>

              <h1 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {service.title}
              </h1>

              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                  Service Overview &amp; What&apos;s Included
                </h2>
                <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          {/* Verified Post-Payment Customer Reviews */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                Verified Customer Reviews ({service.reviewCount})
              </h2>
              {service.reviewCount > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{service.averageRating.toFixed(1)} / 5.0</span>
                </div>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="mt-6 space-y-4">
                {reviews.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.customerName}
                      </p>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < item.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {item.review && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {item.review}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                No customer reviews yet. Verified reviews appear automatically after a completed repair is paid and rated.
              </p>
            )}
          </section>
        </div>

        {/* Right Sticky Sidebar (4 Columns) */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Booking & Price Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Starting Price
              </span>
              <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white">
                {formattedPrice}
              </span>
            </div>

            <div className="mt-5 space-y-3 border-y border-slate-100 py-4 text-sm dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Service Mode
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {service.serviceMode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Est. Duration
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {service.estimatedDuration}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Coverage Area
                </span>
                <span className="max-w-[180px] truncate font-semibold text-slate-900 dark:text-white">
                  {service.serviceArea}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <RepairRequestModal
                serviceId={service._id}
                serviceTitle={service.title}
                basePrice={service.basePrice}
                serviceMode={service.serviceMode}
                technicianEmail={service.technicianEmail}
              />
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-400">
              <CreditCard className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
              <span>
                Pay only after your technician completes the repair and confirms the final amount.
              </span>
            </div>
          </div>

          {/* Technician Summary Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Assigned Technician</span>
            </div>

            <div className="mt-4 flex items-center gap-3.5">
              {technician.image ? (
                <img
                  src={technician.image}
                  alt={technician.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {techInitials}
                </span>
              )}

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate font-heading text-base font-bold text-slate-900 dark:text-white">
                    {technician.name}
                  </p>
                  {technician.plan === "pro" && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                      <BadgeCheck className="h-3 w-3" />
                      Verified Pro
                    </span>
                  )}
                </div>
                {technician.area && (
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    Based in {technician.area}
                  </p>
                )}
              </div>
            </div>

            {technician.bio && (
              <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {technician.bio}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}