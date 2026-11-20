import { BadgeCheck, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Nusrat Jahan",
    role: "Customer · Dhaka",
    serviceTag: "Split AC Cooling & Gas Recharge",
    initials: "NJ",
    quote:
      "I loved that I didn't have to pay upfront. The technician diagnosed the leak at my apartment, updated the job status live, and I paid the exact agreed amount via Stripe once the AC was blowing cold again.",
  },
  {
    name: "Tanvir Ahmed",
    role: "Verified Pro Technician · Laptop & PC",
    serviceTag: "MacBook & Ultrabook Bench Repair",
    initials: "TA",
    quote:
      "Upgrading to Verified Pro let me list all my laptop repair specialties in one place. Having clear status stages and instant Stripe payment records makes managing customer jobs effortless.",
  },
  {
    name: "Rafiqul Islam",
    role: "Customer · Chittagong",
    serviceTag: "Smartphone OLED Display Replacement",
    initials: "RI",
    quote:
      "Booked a shop drop-off repair in two minutes. The technician finished ahead of schedule, marked the job completed, and my digital receipt appeared right inside my dashboard.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Community Feedback
        </span>
        <h2 className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Trusted by Customers &amp; Technicians
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Real experiences from people getting devices fixed and specialists growing their repair businesses.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <article
            key={item.name}
            className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {item.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.role}
                  </p>
                </div>
              </div>
              <p className="mt-2.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                Service: {item.serviceTag}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}