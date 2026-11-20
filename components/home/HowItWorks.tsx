import {
  CalendarCheck,
  CreditCard,
  Search,
  Wrench,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Find a Service",
    description:
      "Search by device issue or filter across 7 repair categories to compare verified technicians and starting rates.",
    icon: Search,
  },
  {
    step: "02",
    title: "Send a Request",
    description:
      "Pick your preferred date, enter your address and problem details, and submit a repair booking in seconds.",
    icon: CalendarCheck,
  },
  {
    step: "03",
    title: "Technician Fixes It",
    description:
      "Track live progress as your technician accepts, diagnoses, repairs your item, and confirms the final bill.",
    icon: Wrench,
  },
  {
    step: "04",
    title: "Pay After Completion",
    description:
      "Complete payment securely via Stripe Checkout only after your repair is marked completed, then leave a rating.",
    icon: CreditCard,
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Simple &amp; Transparent Workflow
        </span>
        <h2 className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          How FixBench Works
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Every booking follows a strict four-stage pipeline so you stay informed from request to final receipt.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {WORKFLOW_STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-sm font-bold text-slate-300 dark:text-slate-700">
                  STEP {item.step}
                </span>
              </div>

              <h3 className="mt-5 font-heading text-lg font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}