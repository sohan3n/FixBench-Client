import Link from "next/link";
import { ArrowLeft, Search, Wrench } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[72vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      {/* Custom Repair & Tools Illustration */}
      <div className="relative mb-6 flex h-36 w-36 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <svg
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
          className="h-24 w-24"
        >
          <rect
            x="16"
            y="84"
            width="88"
            height="10"
            rx="5"
            className="fill-slate-800 dark:fill-slate-700"
          />
          <rect
            x="24"
            y="80"
            width="72"
            height="4"
            rx="2"
            className="fill-teal-500"
          />
          <path
            d="M78 26a18 18 0 0 0-23.6 21.8L31.5 70.7a6 6 0 1 0 8.5 8.5l22.9-22.9A18 18 0 0 0 84.7 32.7l-9.6 9.6-7.8-2-2-7.8 9.6-9.6c1 .9 2.1 2 3.1 3.1Z"
            className="fill-blue-600 dark:fill-blue-500"
          />
          <circle cx="88" cy="64" r="6" className="fill-amber-500" />
        </svg>
        <span className="absolute -bottom-3 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <Wrench className="h-3.5 w-3.5" />
          ERROR 404
        </span>
      </div>

      <h1 className="font-heading text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        This workbench is empty
      </h1>
      <p className="mt-3 max-w-md text-base text-slate-600 dark:text-slate-400">
        The repair page or service listing you are looking for may have been
        moved, removed, or is currently unavailable.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Search className="h-4 w-4" />
          Browse Services
        </Link>
      </div>
    </section>
  );
}