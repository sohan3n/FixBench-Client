// import type { Metadata } from "next";
// import { ShieldCheck } from "lucide-react";
// import type { Metadata } from "next";
// import { ShieldCheck } from "lucide-react";
// import { ServicesCatalogClient } from "@/components/services/ServicesCatalogClient";
// import {
//   SERVICE_CATEGORIES,
//   SERVICE_MODES,
//   type PaginationMeta,
// } from "@/lib/service-constants";
// import type { PublicServiceItem } from "@/components/services/ServiceCard";


import type { Metadata } from "next"
import { ShieldCheck } from "lucide-react"
import { ServicesCatalogClient } from "@/components/services/ServicesCatalogClient"
import {
  SERVICE_CATEGORIES,
  SERVICE_MODES,
  type PaginationMeta,
} from "@/lib/service-constants"
import type { PublicServiceItem } from "@/components/services/ServiceCard"

export const metadata: Metadata = {
  title: "Browse Repair Services",
  description:
    "Search and filter admin-verified smartphone, laptop, AC, refrigerator, TV, washing machine, and electrical repair services on FixBench.",
}

interface ServicesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getSingleParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() || ""
  }
  return typeof value === "string" ? value.trim() : ""
}

async function fetchPublicServices(query: {
  search: string
  category: string
  serviceMode: string
  sort: string
  page: number
}): Promise<{
  services: PublicServiceItem[]
  pagination: PaginationMeta
}> {
  const fallbackPagination: PaginationMeta = {
    total: 0,
    page: query.page,
    limit: 9,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    return { services: [], pagination: fallbackPagination }
  }

  const params = new URLSearchParams()
  if (query.search) params.set("search", query.search)
  if (query.category) params.set("category", query.category)
  if (query.serviceMode) params.set("serviceMode", query.serviceMode)
  if (query.sort && query.sort !== "newest") params.set("sort", query.sort)
  if (query.page > 1) params.set("page", String(query.page))
  params.set("limit", "9")

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/services?${params.toString()}`,
      { cache: "no-store" }
    )

    if (!response.ok) {
      return { services: [], pagination: fallbackPagination }
    }

    const data = (await response.json()) as {
      services?: PublicServiceItem[]
      pagination?: PaginationMeta
    }

    return {
      services: Array.isArray(data.services) ? data.services : [],
      pagination: data.pagination ?? fallbackPagination,
    }
  } catch {
    return { services: [], pagination: fallbackPagination }
  }
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const resolved = await searchParams

  const search = getSingleParam(resolved.search)

  const rawCategory = getSingleParam(resolved.category)
  const category = (SERVICE_CATEGORIES as readonly string[]).includes(
    rawCategory
  )
    ? rawCategory
    : ""

  const rawMode = getSingleParam(resolved.serviceMode)
  const serviceMode = (SERVICE_MODES as readonly string[]).includes(rawMode)
    ? rawMode
    : ""

  const rawSort = getSingleParam(resolved.sort)
  const sort =
    rawSort === "price_asc" || rawSort === "price_desc" ? rawSort : "newest"

  const parsedPage = Number.parseInt(getSingleParam(resolved.page) || "1", 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

  const { services, pagination } = await fetchPublicServices({
    search,
    category,
    serviceMode,
    sort,
    page,
  })

  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <section className="border-b border-slate-200/80 bg-white py-10 dark:border-slate-800/80 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin-Approved Repair Bench
          </div>
          <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Browse Verified Repair Services
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-400">
            Filter by device category, home visit or shop drop-off, and starting
            price. Pay securely via Stripe only after your repair is completed.
          </p>
        </div>
      </section>

      {/* Interactive Catalog */}
      <ServicesCatalogClient
        services={services}
        pagination={pagination}
        initialSearch={search}
        initialCategory={category}
        initialServiceMode={serviceMode}
        initialSort={sort}
      />
    </div>
  )
}
