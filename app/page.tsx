import { HeroSwiper } from "@/components/home/HeroSwiper";
import { PopularCategories } from "@/components/home/PopularCategories";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustHighlights } from "@/components/home/TrustHighlights";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { DualRoleCta } from "@/components/home/DualRoleCta";
import type { PublicServiceItem } from "@/components/services/ServiceCard";

async function getFeaturedServices(): Promise<PublicServiceItem[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return [];
  }

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/+$/, "")}/api/services?sort=newest&limit=6`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      services?: PublicServiceItem[];
    };

    return Array.isArray(data.services) ? data.services : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredServices = await getFeaturedServices();

  return (
    <div className="flex flex-col">
      {/* Section 1: Hero Swiper with Search & CTAs */}
      <HeroSwiper />

      {/* Section 2: Popular Categories (7 Exact Schema Categories) */}
      <PopularCategories />

      {/* Section 3: Featured Services (6 Newest Approved Listings) */}
      <FeaturedServices services={featuredServices} />

      {/* Section 4: How FixBench Works (4-Step Pipeline) */}
      <HowItWorks />

      {/* Section 5: Why Choose FixBench & Trust Metrics */}
      <TrustHighlights />

      {/* Section 6: Customer & Technician Testimonials */}
      <TestimonialsSection />

      {/* Section 7: Dual-Role Conversion CTA */}
      <DualRoleCta />
    </div>
  );
}