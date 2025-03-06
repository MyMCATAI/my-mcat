"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from 'next/image';
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useUserActivity } from '@/hooks/useUserActivity';
import 'plyr/dist/plyr.css';
import dynamic from 'next/dynamic';
import VideoStep from "@/components/mobile/VideoStep";
import MissionStep from "@/components/mobile/MissionStep";
import OptionsStep from "@/components/mobile/options/OptionsStep";
import { ProductType } from "@/types";

// Dynamically import Plyr with no SSR
const Plyr = dynamic(() => import('plyr-react'), { 
  ssr: false,
  loading: () => <div className="w-full aspect-video bg-black/50 animate-pulse rounded-lg"></div>
});

// Constants
type PricingPeriod = 'monthly' | 'biannual' | 'annual';
type Step = 'video' | 'mission' | 'options';

const PITCH_VIDEO_URL = "thbssEpeK9Y"; // YouTube video ID

interface CustomVideoProps {
  src: string;
  poster?: string;
  options?: Plyr.Options;
}

const CustomVideo = ({ src, poster, options = {} }: CustomVideoProps) => {
  const defaultOptions: Plyr.Options = {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'fullscreen'
    ],
    ratio: '16:9',
    fullscreen: { enabled: true, fallback: true, iosNative: true },
    ...options
  };

  const source: { type: 'video'; sources: { src: string; type: string; }[]; poster?: string } = {
    type: 'video',
    sources: [{ src, type: 'video/mp4' }],
    poster
  };

  return (
    <div className="w-full aspect-video relative">
      <Plyr source={source} options={defaultOptions} />
    </div>
  );
};

export default function PitchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('video');
  const { isGold } = useSubscriptionStatus();
  const { user } = useUser();
  const { startActivity } = useUserActivity();
  const [pricingPeriod, setPricingPeriod] = useState<PricingPeriod>('biannual');
  const [selectedOptions, setSelectedOptions] = useState({
    software: true,
    class: false,
    tutors: false
  });
  const [isSpecialStatus, setIsSpecialStatus] = useState(true);
  const [isShortVideo, setIsShortVideo] = useState(true);

  // Add audio effect when modal opens
  useEffect(() => {
    if (user?.id) {
      // Track modal open activity
      startActivity({
        type: "offer_page_view",
        location: "Offer",
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [user]);

  const handlePricingPeriodChange = (period: PricingPeriod) => {
    setPricingPeriod(period);
  };
  
  const handleSpecialStatusChange = (status: boolean) => {
    setIsSpecialStatus(status);
  };

  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);

      if (isGold) {
        // Manage existing subscription
        const response = await axios.get("/api/stripe");
        window.location.href = response.data.url;
        return;
      }

      const userId = user?.id;

      if(userId){
        await startActivity({
          type: 'offer_page_purchase_click',
          location: "Offer",
          metadata: {
            timestamp: new Date().toISOString(),
            pricingPeriod: pricingPeriod,
            isSpecialStatus: isSpecialStatus
          }
        });
      }
      if (!userId) {
        // If not authenticated, redirect to sign-up with return URL
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/sign-up?redirect_url=${returnUrl}`;
        return;
      }

      // Map pricing period to the correct product type
      const priceType = pricingPeriod === 'monthly' ? ProductType.MD_GOLD :
                       pricingPeriod === 'annual' ? ProductType.MD_GOLD_ANNUAL :
                       ProductType.MD_GOLD_BIANNUAL;

      const response = await axios.post("/api/stripe/checkout", {
        priceType: priceType,
        isSpecialStatus: isSpecialStatus
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initiate purchase");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = async () => {
      const userId  = user?.id
      if(userId){
        await startActivity({
          type: 'offer_page_platinum_apply_click',
          location: "Offer",
          metadata: {
            timestamp: new Date().toISOString()
          }
        });
      }
      window.open('https://tally.so/r/mBAgq7', '_blank')
  };

  const scores = [
    { score: "525", name: "Cynthia", image: "/scores/525.png" },
    { score: "523", name: "Barbara", image: "/scores/523.png" },
    { score: "519", name: "Trinity", image: "/scores/519.png" },
    { score: "516", name: "Kevin", image: "/scores/516.png" },
    { score: "520", name: "Sahaj", image: "/scores/520.png" },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 'video':
        return <VideoStep onNext={() => setCurrentStep('mission')} />;
      case 'mission':
        return <MissionStep onNext={() => setCurrentStep('options')} />;
      case 'options':
    return (
          <OptionsStep
            isGold={isGold || false}
            user={user}
            handleUpgradeClick={handleUpgradeClick}
            handleApplyClick={handleApplyClick}
            pricingPeriod={pricingPeriod}
            setPricingPeriod={handlePricingPeriodChange}
            isSpecialStatus={isSpecialStatus}
            setIsSpecialStatus={handleSpecialStatusChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[url('/ShiningStars.png')] bg-cover bg-center bg-no-repeat">
      <div className="relative pt-20 pb-32 overflow-hidden">  
        {/* Enhanced background overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40 backdrop-blur-sm" />
        
        {/* Animated background effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl animate-drift"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl animate-drift-slow"></div>
        </div>
        
        {/* Profile Button with enhanced styling */}
        <div className="absolute right-8 top-8 z-10">
          <div className="p-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl">
            <UserButton />
          </div>
        </div>

        <div className="relative px-6 mx-auto max-w-7xl z-10">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-8 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm
      hover:bg-black/40 transition-all duration-300 transform hover:scale-[1.02]">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  );
}