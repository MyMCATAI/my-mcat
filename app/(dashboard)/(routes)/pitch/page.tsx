"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

// Constants
const PITCH_VIDEO_URL = "cVu8x22mSPA"; // YouTube video ID
enum ProductType {
  MD_GOLD = 'md_gold'
}

export default function PitchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stripe/checkout", {
        priceType: ProductType.MD_GOLD
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initiate purchase");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[--theme-mainbox-color] to-[--theme-leaguecard-color]">
      <div className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        {/* Back Button - Moved outside main container */}
        <button
          onClick={() => router.back()}
          className="absolute left-8 top-0 flex items-center gap-2 px-4 py-2 text-[--theme-text-color] 
            hover:bg-[--theme-hover-color] rounded-lg transition-all duration-300"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Return to Dashboard
        </button>

        <div className="relative px-6 mx-auto max-w-7xl">
          <h1 className="text-center text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-500 mb-6">
            Systemize Your MCAT Prep
          </h1>
          
          {/* Video Section */}
          <div className="mt-12 mb-16">
            <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.15)]">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${PITCH_VIDEO_URL}`}
                title="MCAT Preparation System"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              title="Adaptive Learning"
              description="AI-powered system that adapts to your performance and learning style"
              icon="🧠"
            />
            <FeatureCard
              title="Spaced Repetition"
              description="Scientifically proven method to optimize your memory retention"
              icon="⏱️"
            />
            <FeatureCard
              title="Performance Analytics"
              description="Detailed insights into your progress and areas for improvement"
              icon="📊"
            />
            <FeatureCard
              title="Personalized Content"
              description="Custom-tailored content based on your weak areas"
              icon="🎯"
            />
          </div>

          {/* CTA Section */}
          <div className="mt-16 flex justify-center">
            <button
              onClick={handleUpgradeClick}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-amber-900
                bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full
                shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)]
                transform hover:scale-105 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[25deg] -translate-x-32 
                group-hover:transition-transform group-hover:duration-1000 group-hover:translate-x-[500%]" />
              
              <span className="relative z-10">
                {isLoading ? "Loading..." : "Upgrade to Gold"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-8 rounded-2xl bg-[--theme-leaguecard-color]/50 border border-[--theme-border-color] backdrop-blur-sm
      hover:bg-[--theme-leaguecard-color]/70 transition-all duration-300 transform hover:scale-[1.02]">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[--theme-text-color] mb-3">{title}</h3>
      <p className="text-[--theme-text-color] opacity-80">{description}</p>
    </div>
  );
}