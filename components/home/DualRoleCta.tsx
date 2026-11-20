import Link from "next/link";
import { ArrowRight, Search, Wrench } from "lucide-react";

export function DualRoleCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8 shadow-lg sm:p-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          {/* Customer Side */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xs sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <Search className="h-3.5 w-3.5" />
              For Device Owners
            </span>
            <h2 className="mt-4 font-heading text-2xl font-extrabold text-white sm:text-3xl">
              Ready to get your device repaired?
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-blue-100">
              Browse admin-approved repair listings, submit a booking in minutes, and pay securely only after the job is completed.
            </p>
            <div className="mt-6">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
              >
                <span>Browse Repair Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Technician Side */}
          <div className="rounded-2xl border border-teal-300/25 bg-slate-950/45 p-6 backdrop-blur-xs sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/15 px-3 py-1 text-xs font-semibold text-teal-300">
              <Wrench className="h-3.5 w-3.5" />
              For Skilled Technicians
            </span>
            <h2 className="mt-4 font-heading text-2xl font-extrabold text-white sm:text-3xl">
              Grow your repair bench on FixBench
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
              Create a free technician account to publish up to 2 approved repair services, or upgrade to Verified Pro for unlimited listings.
            </p>
            <div className="mt-6">
              <Link
                href="/sign-up?role=technician"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition-colors hover:bg-teal-400"
              >
                <span>Create Technician Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}