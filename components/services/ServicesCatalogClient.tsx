"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  SERVICE_CATEGORIES,
  SERVICE_MODES,
  SORT_OPTIONS,
  type PaginationMeta,
} from "@/lib/service-constants";

import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Wrench,
  X,
} from "lucide-react";
import {
  ServiceCard,
  type PublicServiceItem,
} from "@/components/services/ServiceCard";


interface ServicesCatalogClientProps {
  services: PublicServiceItem[];
  pagination: PaginationMeta;
  initialSearch: string;
  initialCategory: string;
  initialServiceMode: string;
  initialSort: string;
}

export function ServicesCatalogClient({
  services,
  pagination,
  initialSearch,
  initialCategory,
  initialServiceMode,
  initialSort,
}: ServicesCatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(initialSearch);

  // Keep input synced when navigating back/forward or clicking navbar/home links
  useEffect(() => {
    setSearchInput(initialSearch);
  }, [initialSearch]);

  function updateQueryParams(
    updates: Record<string, string | null>,
    resetPage = true
  ) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "All" || (key === "sort" && value === "newest")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    if (resetPage) {
      params.delete("page");
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateQueryParams({ search: searchInput.trim() || null }, true);
  }

  function handleClearSearch() {
    setSearchInput("");
    updateQueryParams({ search: null }, true);
  }

  function handleResetAll() {
    setSearchInput("");
    router.push(pathname);
  }

  function handlePageChange(targetPage: number) {
    if (
      targetPage < 1 ||
      targetPage > pagination.totalPages ||
      targetPage === pagination.page
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (targetPage === 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  const hasActiveFilters =
    Boolean(initialSearch) ||
    Boolean(initialCategory) ||
    Boolean(initialServiceMode) ||
    initialSort !== "newest";

  const rangeStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.limit,
    pagination.total
  );

  // Build compact page number array (e.g. [1, '...', 4, 5, 6, '...', 10])
  const pageNumbers: (number | "ellipsis")[] = [];
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (
      i === 1 ||
      i === pagination.totalPages ||
      Math.abs(i - pagination.page) <= 1
    ) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== "ellipsis") {
      pageNumbers.push("ellipsis");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Filter & Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 lg:col-span-5"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by service title or category..."
                aria-label="Search repair services"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-950"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {/* Category Dropdown */}
          <div className="lg:col-span-3">
            <label htmlFor="filter-category" className="sr-only">
              Category
            </label>
            <select
              id="filter-category"
              value={initialCategory || "All"}
              onChange={(e) =>
                updateQueryParams({ category: e.target.value }, true)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="All">All Categories</option>
              {SERVICE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Service Mode Dropdown */}
          <div className="lg:col-span-2">
            <label htmlFor="filter-mode" className="sr-only">
              Service Mode
            </label>
            <select
              id="filter-mode"
              value={initialServiceMode || "All"}
              onChange={(e) =>
                updateQueryParams({ serviceMode: e.target.value }, true)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="All">All Modes</option>
              {SERVICE_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="lg:col-span-2">
            <label htmlFor="filter-sort" className="sr-only">
              Sort By
            </label>
            <select
              id="filter-sort"
              value={initialSort}
              onChange={(e) =>
                updateQueryParams({ sort: e.target.value }, true)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Bar & Active Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 text-xs dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>
              Showing{" "}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {rangeStart}–{rangeEnd}
              </strong>{" "}
              of{" "}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {pagination.total}
              </strong>{" "}
              verified repair {pagination.total === 1 ? "service" : "services"}
            </span>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {initialSearch && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Search: &ldquo;{initialSearch}&rdquo;
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Remove search filter"
                    className="hover:text-blue-900 dark:hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {initialCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {initialCategory}
                  <button
                    type="button"
                    onClick={() => updateQueryParams({ category: null }, true)}
                    aria-label="Remove category filter"
                    className="hover:text-blue-900 dark:hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {initialServiceMode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 font-medium text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                  {initialServiceMode}
                  <button
                    type="button"
                    onClick={() =>
                      updateQueryParams({ serviceMode: null }, true)
                    }
                    aria-label="Remove service mode filter"
                    className="hover:text-teal-900 dark:hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
              >
                <RotateCcw className="h-3 w-3" />
                Reset All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid or Empty State */}
      {services.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Wrench className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-heading text-lg font-bold text-slate-900 dark:text-white">
            No matching repair services found
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {hasActiveFilters
              ? "Try clearing your active search or category filters to see all available verified repair listings."
              : "No approved repair services are listed right now. Check back shortly as technicians publish new benches."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAll}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All Filters
            </button>
          )}
        </div>
      )}

      {/* Server-Side Pagination Controls */}
      {pagination.totalPages > 1 && (
        <nav
          aria-label="Services Pagination"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {pageNumbers.map((item, idx) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-sm text-slate-400"
              >
                &hellip;
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => handlePageChange(item)}
                aria-current={item === pagination.page ? "page" : undefined}
                className={`h-10 min-w-10 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  item === pagination.page
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}