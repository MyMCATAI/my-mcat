"use client";
import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// First fold - load immediately with high priority
const LandingHero = dynamic(
  () => import("@/components/landingpage/LandingHero"),
  {
    ssr: true
  }
);

// Second fold - load when approaching viewport
const ProductWrapper = dynamic(
  () => import("@/components/landingpage/ProductWrapper"),
  {
    loading: () => <div className="h-screen bg-[#12233c]" />,
    ssr: false // Client-side only since it has animations
  }
);

// Third fold and below - lazy load
const Mission = dynamic(
  () => import("@/components/landingpage/Mission"),
  {
    loading: () => <div className="h-screen bg-[#12233c]" />,
    ssr: false
  }
);

// Lower priority components
const CheckListing = dynamic(
  () => import("@/components/landingpage/CheckListing"),
  { ssr: false }
);

const Faqs = dynamic(
  () => import("@/components/landingpage/Faqs"),
  { ssr: false }
);

const LandingPage = () => {
  const router = useRouter();

  // Prevent scroll restoration on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <div className="w-full bg-[#12233c]">
      {/* First fold + Bernie Quote */}
      <Suspense fallback={<div className="h-[200vh] bg-[#171234]" />}>
        <LandingHero />
      </Suspense>

      {/* Product section */}
      <section className="relative min-h-screen">
        <Suspense fallback={<div className="min-h-screen bg-[#12233c]" />}>
          <ProductWrapper />
        </Suspense>
      </section>

      {/* Mission section */}
      <section id="mission" className="relative min-h-screen">
        <Suspense fallback={<div className="min-h-screen bg-[#12233c]" />}>
          <Mission />
        </Suspense>
      </section>

      {/* Below fold content */}
      <section className="relative bg-[#12233c]">
        <Suspense fallback={<div className="min-h-screen bg-[#12233c]" />}>
          <CheckListing />
          <Faqs />      
        </Suspense>
      </section>
    </div>
  );
};

export default LandingPage; 