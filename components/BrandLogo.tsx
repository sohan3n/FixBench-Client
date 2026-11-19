import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "navbar" | "footer";
}

export function BrandLogo({ variant = "navbar" }: BrandLogoProps) {
  const isFooter = variant === "footer";

  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
    >
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-200 group-hover:scale-105">
        <Image
          src="/fixbench-logo.png"
          alt="FixBench Logo"
          fill
          sizes="36px"
          className="object-cover"
          priority={variant === "navbar"}
        />
      </div>
      <span
        className={`font-heading text-xl font-extrabold tracking-tight ${
          isFooter
            ? "text-white"
            : "text-slate-900 dark:text-white"
        }`}
      >
        Fix<span className="text-blue-600 dark:text-blue-400">Bench</span>
      </span>
    </Link>
  );
}