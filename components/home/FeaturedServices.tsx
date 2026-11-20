import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import {
  ServiceCard,
  type PublicServiceItem,
} from "@/components/services/ServiceCard";

interface FeaturedServicesProps {
  services: PublicServiceItem[];
}

export function FeaturedServices({ services }: FeaturedServicesProps) {
  return (
    <section className="border-y border-slate-200/80 bg-slate-100/60 py-16 dark:border-slate-800/80 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Admin-Verified Listings
            </span>
            <h2 className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Featured Repair Services
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Recently approved services from vetted technicians ready for home visits or shop drop-off.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>Explore All Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {services.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Wrench className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
              Verified Repair Services Coming Soon
            </h3>
            <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Our technicians are setting up their approved repair benches. Browse the service catalog or register as a technician to publish the first listing.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/services"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Browse Services Catalog
              </Link>
              <Link
                href="/sign-up?role=technician"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Join as Technician
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}