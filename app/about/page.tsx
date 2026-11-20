import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Lock,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About FixBench",
  description:
    "Learn how FixBench connects device owners with admin-verified technicians through transparent repair tracking and post-completion Stripe payments.",
};

const CORE_VALUES = [
  {
    title: "Admin-Moderated Marketplace",
    description:
      "Technicians submit repair listings that go through admin approval before becoming publicly visible, keeping service quality and pricing clear.",
    icon: ShieldCheck,
  },
  {
    title: "Post-Completion Payment Protection",
    description:
      "Customers never pay before work is finished. Payment opens only after the technician completes the repair and logs the final amount.",
    icon: CreditCard,
  },
  {
    title: "Role-Based Accountability",
    description:
      "Dedicated dashboards for Customers, Technicians, and Admins ensure every status transition, receipt, and review is auditable.",
    icon: Lock,
  },
];

const FAQS = [
  {
    question: "When do I pay for a repair on FixBench?",
    answer:
      "You only pay after the technician accepts your request, completes the repair, and marks the job as Completed with the final bill amount. At that point, the 'Pay Now' button unlocks in your Customer Dashboard.",
  },
  {
    question: "Can I cancel a repair request after submitting it?",
    answer:
      "Yes. You can cancel any booking while its status is still 'Requested' before a technician accepts the job.",
  },
  {
    question: "How do technicians list services on FixBench?",
    answer:
      "Technicians can sign up for free and publish up to 2 service listings (subject to Admin approval), or upgrade to the Verified Pro plan for unlimited service listings and a Verified Pro badge.",
  },
  {
    question: "What happens if an admin suspends or rejects a listing?",
    answer:
      "Only listings with 'Approved' status and active availability appear on the public Services page, ensuring customers only book vetted services.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="border-b border-slate-200/80 bg-white py-16 dark:border-slate-800/80 dark:bg-slate-900/50 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Wrench className="h-3.5 w-3.5" />
            About FixBench
          </span>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Bringing Trust &amp; Clarity to Every Device Repair
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            FixBench is a verified repair and home-appliance service marketplace built so customers know who is fixing their devices, track every stage live, and pay securely only after completion.
          </p>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CORE_VALUES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 font-heading text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technician Tiers Comparison */}
      <section className="border-y border-slate-200/80 bg-slate-100/60 py-16 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              Built for Both Independent &amp; Pro Technicians
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Start listing at zero cost or unlock unlimited capacity with Verified Pro.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Free Plan */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Starter Tier
              </span>
              <h3 className="mt-1 font-heading text-xl font-extrabold text-slate-900 dark:text-white">
                Free Technician Account
              </h3>
              <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-white">
                $0 <span className="font-sans text-xs font-normal text-slate-500">/ forever</span>
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                  <span>Up to 2 active service listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                  <span>Full 4-stage job status pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                  <span>Verified post-payment customer ratings</span>
                </li>
              </ul>
            </div>

            {/* Verified Pro Plan */}
            <div className="flex flex-col rounded-2xl border-2 border-blue-600 bg-white p-7 shadow-sm dark:border-blue-500 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Pro
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  One-Time Upgrade
                </span>
              </div>
              <h3 className="mt-1 font-heading text-xl font-extrabold text-slate-900 dark:text-white">
                Verified Pro Technician
              </h3>
              <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-white">
                $19.99{" "}
                <span className="font-sans text-xs font-normal text-slate-500">
                  via Stripe Checkout
                </span>
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>Unlimited service listings across all 7 categories</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>Verified Pro badge displayed on all service cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>Priority visibility in featured technician search</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 text-center">
          <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-8 space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <span>Explore Repair Services</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Create an Account
          </Link>
        </div>
      </section>
    </div>
  );
}