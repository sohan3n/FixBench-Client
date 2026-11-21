"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Services", href: "/services" },
  { label: "How It Works", href: "/about" },
  { label: "Become a Technician", href: "/sign-up?role=technician" },
];

const REPAIR_CATEGORIES = [
  { label: "Smartphone", href: "/services?category=Smartphone" },
  { label: "Laptop & PC", href: "/services?category=Laptop%20%26%20PC" },
  { label: "AC", href: "/services?category=AC" },
  { label: "Refrigerator", href: "/services?category=Refrigerator" },
  { label: "TV", href: "/services?category=TV" },
  { label: "Washing Machine", href: "/services?category=Washing%20Machine" },
  { label: "Electrical", href: "/services?category=Electrical" },
];

export function Footer() {
  const pathname = usePathname();

  // Dashboard views use the dedicated Dashboard shell
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Socials (with modern X logo) */}
          <div className="space-y-4">
            <BrandLogo variant="footer" />
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Verified technicians for smartphones, laptops, and home appliances.
              Track every repair step live and pay securely only when the job is
              done.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {/* X (formerly Twitter) SVG Logo */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FixBench on X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-blue-500/50 hover:bg-blue-600 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Facebook SVG Logo */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FixBench on Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-blue-500/50 hover:bg-blue-600 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M13.5 22v-8.2h2.76l.41-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14c-.29-.04-1.3-.14-2.48-.14-2.45 0-4.13 1.5-4.13 4.25v2.35H7.4v3.2h2.78V22h3.32z" />
                </svg>
              </a>

              {/* LinkedIn SVG Logo */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="FixBench on LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:border-blue-500/50 hover:bg-blue-600 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-slate-400 transition-colors hover:text-teal-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Repairs */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Repairs
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {REPAIR_CATEGORIES.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-slate-400 transition-colors hover:text-teal-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>support@fixbench.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>+880 1700-123456</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>House 22, Road 4, Dhanmondi, Dhaka 1205</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>Saturday to Thursday, 9 AM – 9 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} FixBench. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-slate-200">
              How It Works
            </Link>
            <Link href="/services" className="hover:text-slate-200">
              Browse Repairs
            </Link>
            <Link href="/sign-up" className="hover:text-slate-200">
              Join FixBench
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}