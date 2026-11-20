import Link from "next/link";
import {
  Disc,
  Laptop,
  Smartphone,
  Snowflake,
  Tv,
  Wind,
  Zap,
} from "lucide-react";

const REPAIR_CATEGORIES = [
  {
    name: "Smartphone",
    description: "Screens, batteries & charging ports",
    icon: Smartphone,
  },
  {
    name: "Laptop & PC",
    description: "Motherboard, SSD, thermal & OS repair",
    icon: Laptop,
  },
  {
    name: "AC",
    description: "Cooling issues, gas refill & servicing",
    icon: Wind,
  },
  {
    name: "Refrigerator",
    description: "Compressor, thermostat & seal fixes",
    icon: Snowflake,
  },
  {
    name: "TV",
    description: "LED backlight, panel & power boards",
    icon: Tv,
  },
  {
    name: "Washing Machine",
    description: "Drain pumps, drum motors & sensors",
    icon: Disc,
  },
  {
    name: "Electrical",
    description: "Wiring, breakers, inverters & fixtures",
    icon: Zap,
  },
];

export function PopularCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Browse by Specialty
          </span>
          <h2 className="mt-1.5 font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Popular Repair Categories
          </h2>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Select a device category to filter verified technicians and upfront pricing.
          </p>
        </div>

        <Link
          href="/services"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View all categories &rarr;
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
        {REPAIR_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.name}
              href={`/services?category=${encodeURIComponent(category.name)}`}
              className="group flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/60 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3.5 font-heading text-sm font-bold text-slate-900 dark:text-white">
                {category.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}