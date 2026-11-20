"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  image: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "verified-repairs",
    badge: "Admin-Approved Technicians · Pay After Repair",
    title: "Broken Device? Get It Fixed by Verified Technicians",
    subtitle:
      "Compare upfront starting prices, track every repair step live, and pay securely via Stripe only after your device is restored.",
    image:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1800&q=80",
  },
  {
    id: "home-appliances",
    badge: "Doorstep Diagnostics · AC, Fridge & Washing Machine",
    title: "Fast Home Visits for Essential Home Appliances",
    subtitle:
      "Schedule certified appliance specialists directly to your doorstep with transparent final billing before checkout.",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1800&q=80",
  },
  {
    id: "electronics-lab",
    badge: "Smartphones · Laptops & PC · Smart TVs",
    title: "Precision Diagnostics for Phones, Laptops & Electronics",
    subtitle:
      "Choose between convenient home visits or dedicated bench drop-off repairs backed by real customer ratings.",
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1800&q=80",
  },
];

export function HeroSwiper() {
  const router = useRouter();
  const swiperRef = useRef<SwiperInstance | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/services?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/services");
    }
  }

  return (
    <section
      aria-label="Featured FixBench Highlights"
      className="relative w-full overflow-hidden bg-slate-950"
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        loop={true}
        speed={650}
        autoplay={{
          delay: 5500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          el: ".fixbench-hero-pagination",
        }}
        className="w-full"
      >
        {HERO_SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative flex min-h-[540px] w-full items-center py-16 sm:min-h-[580px] lg:min-h-[620px]">
              {/* Background Image + High-Contrast Gradient Overlay */}
              <img
                src={slide.image}
                alt={slide.title}
                loading={index === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/60" />

              {/* Slide Content */}
              <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3.5 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
                    <span>{slide.badge}</span>
                  </div>

                  <h1 className="mt-5 font-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                    {slide.title}
                  </h1>

                  <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                    {slide.subtitle}
                  </p>

                  {/* Working Search Box -> /services?search=... */}
                  <form
                    onSubmit={handleSearchSubmit}
                    className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center"
                  >
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search repair (e.g. iPhone screen, AC gas, Laptop)..."
                        aria-label="Search repair services"
                        className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-11 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <span>Find Repair</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>

                  {/* Dual Role Quick CTAs */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/75 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-slate-500 hover:bg-slate-800"
                    >
                      <span>Explore All Services</span>
                    </Link>
                    <Link
                      href="/sign-up?role=technician"
                      className="inline-flex items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-2.5 text-sm font-semibold text-teal-300 transition-colors hover:bg-teal-500/20"
                    >
                      <Wrench className="h-4 w-4" />
                      <span>Join as Technician</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Desktop-Only Prev / Next Arrows (Hidden on Mobile < 768px) */}
      <button
        type="button"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/65 text-white backdrop-blur-xs transition-colors hover:border-blue-400 hover:bg-blue-600 md:flex lg:left-6"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/65 text-white backdrop-blur-xs transition-colors hover:border-blue-400 hover:bg-blue-600 md:flex lg:right-6"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Pagination Dots (Shown on Mobile & Desktop) */}
      <div className="fixbench-hero-pagination absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2 [&_.swiper-pagination-bullet-active]:!w-7 [&_.swiper-pagination-bullet-active]:!rounded-full [&_.swiper-pagination-bullet-active]:!bg-blue-500 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:cursor-pointer [&_.swiper-pagination-bullet]:bg-white/45 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all" />
    </section>
  );
}