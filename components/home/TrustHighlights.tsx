import {
  Activity,
  Award,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const TRUST_PILLARS = [
  {
    title: "Admin-Vetted Services",
    description:
      "Every service listing is reviewed and approved by FixBench moderators before appearing in public search.",
    icon: ShieldCheck,
  },
  {
    title: "Pay Only After Completion",
    description:
      "No upfront payment lock-in. Stripe Checkout unlocks only once the technician completes the repair.",
    icon: CreditCard,
  },
  {
    title: "Live Job Pipeline Tracking",
    description:
      "Follow every timestamped status transition from Requested to Accepted, In-Progress, and Completed.",
    icon: Activity,
  },
  {
    title: "Verified Pro Technicians",
    description:
      "Top specialists earn the Verified Pro badge and showcase authentic post-payment customer reviews.",
    icon: Award,
  },
];

const PLATFORM_METRICS = [
  { value: "7", label: "Specialized Repair Categories" },
  { value: "100%", label: "Post-Repair Payment Protection" },
  { value: "4-Step", label: "Live Repair Status Pipeline" },
  { value: "5.0 ★", label: "Verified Post-Payment Reviews" },
];

export function TrustHighlights() {
  return (
    <section className="border-y border-slate-200/80 bg-slate-100/60 py-16 dark:border-slate-800/80 dark:bg-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Built for Accountability
          </span>
          <h2 className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Why Choose FixBench
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Designed to protect customers from surprise charges while giving skilled technicians a trusted workspace.
          </p>
        </div>

        {/* 4 Trust Pillars */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Metrics Strip */}
        <div className="mt-10 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-4">
          {PLATFORM_METRICS.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="font-mono text-2xl font-extrabold text-blue-600 dark:text-blue-400 sm:text-3xl">
                {metric.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}