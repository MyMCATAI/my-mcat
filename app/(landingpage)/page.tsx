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

// Second fold - load tutors section with high priority
const TutorSlider = dynamic(
  () => import("@/components/landingpage/TutorSlider"),
  {
    ssr: true,
    loading: () => <div className="h-[600px] bg-[#12233c]" />
  }
);

// Third fold - load when approaching viewport
const ProductWrapper = dynamic(
  () => import("@/components/landingpage/ProductWrapper"),
  {
    loading: () => <div className="h-screen bg-[#12233c]" />,
    ssr: false
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
    <div className="w-full bg-[#12233c] relative">
      {/* First fold - load immediately */}
      <Suspense fallback={<div className="h-screen bg-[#171234]" />}>
        <LandingHero />
      </Suspense>

      {/* Second fold - Tutor section */}
      <div className="relative z-10">
        <Suspense fallback={<div className="h-[600px] bg-[#12233c]" />}>
          <TutorSlider />
        </Suspense>
      </div>

      {/* Third fold - Product section */}
      <div className="relative z-10">
        <Suspense fallback={<div className="h-screen bg-[#12233c]" />}>
          <ProductWrapper />
        </Suspense>
      </div>

      {/* Rest of the content */}
      <div id="mission" className="relative z-20">
        <Suspense fallback={<div className="h-screen bg-[#12233c]" />}>
          <Mission />
        </Suspense>
      </div>

      {/* Below fold content */}
      <div className="relative z-10 mt-[-100px] pt-[100px] bg-[#12233c]">
        <Suspense fallback={<div className="min-h-screen bg-[#12233c]" />}>
          <CheckListing />
          <Faqs />      
        </Suspense>
      </div>
    </div>
  );
};

export default LandingPage; 