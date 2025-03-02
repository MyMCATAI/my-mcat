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

// Dynamically import Plyr with no SSR
const Plyr = dynamic(() => import('plyr-react'), { 
  ssr: false,
  loading: () => <div className="w-full aspect-video bg-black/50 animate-pulse rounded-lg"></div>
});

// Constants
const PITCH_VIDEO_URL = "thbssEpeK9Y"; // YouTube video ID
enum ProductType {
  MD_GOLD = 'md_gold',
  MD_GOLD_ANNUAL = 'md_gold_annual',
  MD_GOLD_BIANNUAL = 'md_gold_biannual'
}

type PricingPeriod = 'monthly' | 'biannual' | 'annual';
type Step = 'video' | 'mission' | 'options';

interface TeamMember {
  name: string;
  role: string;
  university: string;
  image: string;
}

const allTeam: TeamMember[] = [
  {
    name: "Immanuel C",
    role: "Tutor",
    university: "Yale",
    image: "/tutors/ChasB.png",
  },
  {
    name: "Ethan K",
    role: "Tutor",
    university: "UPenn",
    image: "/tutors/EthanK.png",
  },
  {
    name: "Prynce K",
    role: "MCAT Director",
    university: "Rice",
    image: "/tutors/PrynceK.png",
  },
  {
    name: "Vivian Z",
    role: "Instructor",
    university: "MS1",
    image: "/tutors/VivianZ.png",
  },
  {
    name: "Ali N",
    role: "Tutor",
    university: "Stanford",
    image: "/tutors/AliN.png",
  },
  {
    name: "Lauren N",
    role: "Instructor",
    university: "UCLA",
    image: "/tutors/LauraN.png",
  },
  {
    name: "Dennis C",
    role: "Senior Engineer",
    university: "UCLA",
    image: "/tutors/DennisC.png",
  },
  {
    name: "Esther C",
    role: "Data Scientist",
    university: "Berkeley",
    image: "/tutors/EstherC.png",
  },
  {
    name: "Sophie L",
    role: "Game Developer",
    university: "UIUC",
    image: "/tutors/SophieL.png",
  },
  {
    name: "Josh W",
    role: "Engineer",
    university: "Queen's University",
    image: "/tutors/JoshW.png",
  },
  {
    name: "Armaan A",
    role: "Engineer",
    university: "UH",
    image: "/tutors/ArmaanA.png",
  },
];

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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { isGold } = useSubscriptionStatus();
  const { user } = useUser();
  const { startActivity } = useUserActivity();
  const [pricingPeriod, setPricingPeriod] = useState<PricingPeriod>('annual');
  const [selectedOptions, setSelectedOptions] = useState({
    software: true,
    class: false,
    tutors: false
  });
  const [isSpecialStatus, setIsSpecialStatus] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTeam, setActiveTeam] = useState('mcat');
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

  const handleUpgradeClick = async () => {
    try {
      setIsLoading(true);

      if (isGold) {
        // Manage existing subscription
        const response = await axios.get("/api/stripe");
        window.location.href = response.data.url;
        return;
      }

      const userId  = user?.id

      if(userId){
        await startActivity({
          type: 'offer_page_purchase_click',
          location: "Offer",
          metadata: {
            timestamp: new Date().toISOString()
          }
        });
      }
      if (!userId) {
        // If not authenticated, redirect to sign-up with return URL
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/sign-up?redirect_url=${returnUrl}`;
        return;
      }

      const response = await axios.post("/api/stripe/checkout", {
        priceType: pricingPeriod === 'monthly' ? ProductType.MD_GOLD :
                   pricingPeriod === 'annual' ? ProductType.MD_GOLD_ANNUAL :
                   ProductType.MD_GOLD_BIANNUAL
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 8 >= allTeam.length ? 0 : prev + 8));
  };

  const prevSlide = () => {
    const teamLength = activeTeam === 'mcat' ? allTeam.length : 0;
    setCurrentIndex((prev) => (prev - 2 < 0 ? teamLength - 2 : prev - 2));
  };

  // Helper function to get monthly price equivalent
  const getMonthlyPrice = (period: PricingPeriod) => {
    switch (period) {
      case 'monthly':
        return 150;
      case 'biannual':
        return 133;  // 800/6
      case 'annual':
        return 100;  // 1200/12
    }
  };

  // Helper function to get total price
  const getTotalPrice = (period: PricingPeriod) => {
    switch (period) {
      case 'monthly':
        return 200;
      case 'biannual':
        return 800;
      case 'annual':
        return 1200;
    }
  };

  // Modify the toggle buttons to handle multiple selections
  const toggleOption = (option: 'software' | 'class' | 'tutors') => {
    setSelectedOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const renderInterestToggle = () => (
    <div className="mt-12 mb-8 max-w-4xl mx-auto">
      <div className="relative p-8 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 
        border border-white/20 backdrop-blur-lg shadow-[0_0_30px_rgba(59,130,246,0.2)] overflow-hidden">
        
        {/* Animated background effects */}
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl animate-pulse" 
          style={{ animationDelay: '1s' }}></div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text 
            bg-gradient-to-r from-blue-400 via-white to-purple-400 mb-8">
            What are you interested in?
          </h3>
          
          {/* Toggle Buttons with Icons */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <button 
              onClick={() => toggleOption('software')}
              className={`flex items-center gap-3 px-8 py-5 rounded-xl font-medium text-lg transition-all duration-500 ${
                selectedOptions.software 
                  ? 'bg-gradient-to-r from-blue-600/90 to-blue-400/90 text-white shadow-[0_0_20px_rgba(0,123,255,0.6)] transform scale-105 hover:scale-110' 
                  : 'bg-black/30 text-white/80 hover:bg-black/40 border border-white/10 hover:border-white/30 hover:scale-105'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Software
            </button>
            <button 
              onClick={() => toggleOption('class')}
              className={`flex items-center gap-3 px-8 py-5 rounded-xl font-medium text-lg transition-all duration-500 ${
                selectedOptions.class 
                  ? 'bg-gradient-to-r from-purple-600/90 to-pink-400/90 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] transform scale-105 hover:scale-110' 
                  : 'bg-black/30 text-white/80 hover:bg-black/40 border border-white/10 hover:border-white/30 hover:scale-105'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Class
            </button>
            <button 
              onClick={() => toggleOption('tutors')}
              className={`flex items-center gap-3 px-8 py-5 rounded-xl font-medium text-lg transition-all duration-500 ${
                selectedOptions.tutors 
                  ? 'bg-gradient-to-r from-green-600/90 to-emerald-400/90 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] transform scale-105 hover:scale-110' 
                  : 'bg-black/30 text-white/80 hover:bg-black/40 border border-white/10 hover:border-white/30 hover:scale-105'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Tutors
            </button>
          </div>
          
          {/* Custom Futuristic Checkbox */}
          <div className="flex items-center justify-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSpecialStatus}
                  onChange={(e) => setIsSpecialStatus(e.target.checked)}
                />
                <div className={`w-12 h-6 rounded-full transition-all duration-500 border ${
                  isSpecialStatus 
                    ? 'bg-gradient-to-r from-green-400 to-blue-500 border-blue-300' 
                    : 'bg-gray-800 border-gray-600 group-hover:bg-gray-700'
                }`}>
                </div>
                <div className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-all duration-500 ${
                  isSpecialStatus ? 'transform translate-x-6 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''
                }`}>
                </div>
              </div>
              <span className="text-white text-lg">{`I'm FAP/Retaker/Nontrad`}</span>
            </label>
          </div>
          
          {/* Message about subsidized tuition */}
          {isSpecialStatus && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 backdrop-blur-md animate-fadeIn">
              <p className="text-white/90 text-center leading-relaxed">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {`MyMCAT.ai's team is committed to developing the doctors that the world needs. Thus, we subsidize tuition for FAP recipients (free) as well as retakers and nontrads (30% off).`}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVideoStep = () => {
    return (
      <div className="text-center space-y-8">
        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 mb-4 animate-gradient-x">
            DONT SMOKE PASSIVES
          </h1>
          <div className="absolute -inset-1 blur-xl bg-gradient-to-r from-blue-500/20 via-white/20 to-blue-500/20 -z-10"></div>
        </div>
        <p className="text-xl md:text-2xl text-white/90 tracking-wide font-light">
          {isShortVideo ? "One-minute overview of our software" : "Watch our 4-minute short film to see what kills MCAT scores"}
        </p>
        
        {/* Video Section with enhanced styling */}
        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)] 
          bg-gradient-to-br from-black/60 to-black/40 border border-white/20 backdrop-blur-xl relative group
          transform transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CustomVideo
            src={isShortVideo 
              ? "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MyMCAT+Software+Alone-VEED.mp4"
              : "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MobileVid.mp4"
            }
            poster={isShortVideo ? undefined : "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/DSP.png"}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
          <button
            onClick={() => setIsShortVideo(!isShortVideo)}
            className={`group relative px-8 py-4 rounded-xl font-medium text-lg text-white overflow-hidden
              ${isShortVideo 
                ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90'
                : 'bg-gradient-to-r from-blue-500/90 to-blue-700/90'
              }
              transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative">
              {isShortVideo ? "Watch our 4-min short film instead" : "Show me the software demo"}
            </span>
          </button>
          <button
            onClick={() => setCurrentStep('mission')}
            className="group relative px-8 py-4 rounded-xl font-medium text-lg text-white overflow-hidden
              bg-gradient-to-r from-gray-500/90 to-gray-700/90 hover:from-green-500 hover:to-blue-500
              transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative">Next</span>
          </button>
        </div>
      </div>
    );
  };

  const renderMissionStep = () => (
    <div className="text-center space-y-12">
      <div className="relative">
        <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
          from-blue-400 via-white to-blue-400 mb-4 animate-gradient-x">
          Our mission is to create the doctors patients deserve.
        </h2>
        <div className="absolute -inset-1 blur-xl bg-gradient-to-r from-blue-500/20 via-white/20 to-blue-500/20 -z-10"></div>
      </div>
      
      {/* Mission Video Section with enhanced styling */}
      <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden 
        bg-gradient-to-br from-black/60 to-black/40 border border-white/20 backdrop-blur-xl 
        relative group transform transition-all duration-500 hover:scale-[1.02]
        shadow-[0_0_50px_rgba(59,130,246,0.2)]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CustomVideo
          src="https://my-mcat.s3.us-east-2.amazonaws.com/public/MyMCAT+Mission.mp4"
        />
      </div>

      {/* Special Message with enhanced styling */}
      <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-black/60 to-black/40 
        border border-white/20 backdrop-blur-xl relative group
        transform transition-all duration-500 hover:scale-[1.01]
        shadow-[0_0_30px_rgba(59,130,246,0.1)]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
        <p className="relative text-white/90 text-xl leading-relaxed font-light">
          {`We're searching for doctors to help build a better world and subsidize tuition for FAP, retakers, and nontrads.`} 
          Join our community on Discord to discover other students to study with and find tutors.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
        <a 
          href="https://discord.gg/KPtDGJfK8t" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-lg text-white overflow-hidden
            bg-[#5865F2] hover:bg-[#4752C4] transition-all duration-500 transform hover:scale-105 
            hover:shadow-[0_0_30px_rgba(88,101,242,0.3)] flex items-center justify-center gap-3"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <svg className="w-6 h-6 transition-transform group-hover:scale-110 duration-500" width="71" height="55" viewBox="0 0 71 55" fill="none">
            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
          </svg>
          <span className="relative">Join our MCAT Studyverse</span>
        </a>
        <button
          onClick={() => setCurrentStep('options')}
          className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-lg text-white overflow-hidden
            bg-gradient-to-r from-gray-600 to-gray-700 hover:from-green-500 hover:to-blue-500
            transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative">See prices and discounts</span>
        </button>
      </div>
    </div>
  );

  const renderOptionsStep = () => (
    <div className="mt-12 mb-8 max-w-4xl mx-auto">
      {renderInterestToggle()}
      
      {selectedOptions.software && (
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text 
            bg-gradient-to-r from-blue-500 via-white to-blue-500 mb-2">
            Software Testimonials
          </h2>
          <p className="text-white/80 mb-6">
            <a 
              href="https://discord.gg/KPtDGJfK8t" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Join Discord to Read More Testimonials
            </a>
          </p>

          {/* Video Section */}
          <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.15)] mb-12">
            <CustomVideo
              src="https://my-mcat.s3.us-east-2.amazonaws.com/public/MyMCATaiSoftwareTestimonials.mp4"
            />
          </div>

          {/* MD Gold Feature Section - with conditional banner */}
          <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-[#1a1a2e] via-[#1a1a24] to-[#1a1a1a] 
            border border-amber-200/20 backdrop-blur-sm mb-16 transform hover:scale-[1.01] transition-all duration-300
            shadow-[0_0_30px_rgba(255,215,0,0.1)] hover:shadow-[0_0_50px_rgba(255,215,0,0.2)] group relative">
            
            {/* Special deal banner for special status */}
            {isSpecialStatus && (
              <div className="absolute -top-6 -left-4 md:-left-8 z-10 max-w-[280px] md:max-w-[320px]">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-300 text-black font-bold py-3 px-4 rounded-lg mt-10
                  shadow-lg text-center text-sm md:text-base animate-pulse transform -rotate-6 border-2 border-amber-600/30">
                  $300 OFF FOR RETAKERS/NONTRADS! FREE FOR FAP! MESSAGE PRYNCE ON DISCORD!
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Left side - Logo */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative w-48 h-48">
                  <img
                    src="/MD_Premium_Pro.png"
                    alt="MD Gold"
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                    style={{ animation: 'float 3s ease-in-out infinite' }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    MD Gold Course
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-white/90">
                      ${getMonthlyPrice(pricingPeriod)} / month
                    </p>
                    {pricingPeriod !== 'monthly' && (
                      <p className="text-sm text-white/70">
                        ${getTotalPrice(pricingPeriod)} billed {pricingPeriod === 'annual' ? 'yearly' : 'every 6 months'}
                      </p>
                    )}
                    {pricingPeriod === 'monthly' && (
                      <p className="text-sm text-white/70">
                        Students generally study for 3 months.
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <div className="bg-black/30 rounded-full p-1 flex items-center gap-0.5">
                        <button 
                          onClick={() => setPricingPeriod('monthly')}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            pricingPeriod === 'monthly' 
                              ? 'bg-blue-500 text-white' 
                              : 'text-white/60 hover:text-white/80'
                          }`}
                        >
                          Monthly
                        </button>
                        <button 
                          onClick={() => setPricingPeriod('biannual')}
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                            pricingPeriod === 'biannual' 
                              ? 'bg-blue-500 text-white' 
                              : 'text-white/60 hover:text-white/80'
                          }`}
                        >
                          6 Months
                        </button>
                        <button 
                          onClick={() => setPricingPeriod('annual')}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                            pricingPeriod === 'annual' 
                              ? 'bg-blue-500 text-white' 
                              : 'text-white/60 hover:text-white/80'
                          }`}
                        >
                          Annual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="w-full md:w-2/3 space-y-6">
                <div className="space-y-4">
                  <p className="text-white/90 text-lg leading-relaxed">
                    Master the MCAT on your own terms with our{" "}
                    <a 
                      href="https://www.mymcat.ai/blog/weakness-finding-algorithm" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-yellow-300 transition-colors"
                    >
                      adaptive MCAT course
                    </a>
                    {" "}that figures out when and what to study.
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Review exams excellently</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">All content in one place</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">CARS Practice with Kalypso</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Adaptive study schedule</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Accountablility checks</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Priority support</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-amber-200/20 pt-6 mt-6">
                  <p className="text-white/90 text-lg leading-relaxed">
                    {user ? (
                      "For the cost of a single tutoring session a month, we allow you 24/7 access to software that tutors you."
                    ) : (
                      "For the cost of a single tutoring session a month, we allow you 24/7 access to software that tutors you."
                    )}
                  </p>
                </div>
                

                <button
                  onClick={handleUpgradeClick}
                  disabled={isLoading}
                  className="w-full h-12 mt-6 px-8 rounded-lg font-medium text-white
                    bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600
                    transform hover:scale-105 transition-all duration-300 shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Loading..." : 
                   isGold ? "Manage Subscription" : 
                   user ? "Join our Gold Course" : "Sign-up to join our Gold Course"}
                </button>
              </div>
            </div>
          </div>

          {/* Anki Game Card */}
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-gradient-to-br from-[#1a1a2e] via-[#1a1a24] to-[#1a1a1a] 
            border border-white/10 backdrop-blur-sm mb-16 transform hover:scale-[1.01] transition-all duration-300
            shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <h3 className="text-xl font-medium text-white/70 mb-4">
              Play our Anki game for free
            </h3>
            <a 
              href="https://mymcat.ai/ankiclinic" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-base text-white
                bg-gradient-to-r from-blue-400 to-blue-500 hover:from-green-500 hover:to-blue-600
                transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Play Now
            </a>
          </div>
        </div>
      )}

      {selectedOptions.class && (
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text 
            bg-gradient-to-r from-blue-400 via-white to-blue-400 mb-2">
            Class Testimonials
          </h2>
          <p className="text-white/80 mb-6">Summer 2024</p>
          <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-10 italic">
            These students embarked on our first class when we were in our infancy as a company, 
            and the entire cohort averaged a 14 point increase.
          </p>

          {/* Video Section */}
          <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.15)] mb-12">
            <CustomVideo
              src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/testimonials.mp4"
            />
          </div>

          {/* Results Section */}
          <div className="max-w-4xl mx-auto mb-16">
            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Top Score */}
              <div className="text-white/90">
                <p className="text-lg mb-4">Highest scorer was Emily with a 525.</p>
                <button 
                  onClick={() => setExpandedCard('525')}
                  className="transform hover:scale-105 transition-transform duration-300 
                    bg-black/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm
                    shadow-[0_0_20px_rgba(0,123,255,0.1)] hover:shadow-[0_0_30px_rgba(0,123,255,0.2)]"
                >
                  <div className="w-80 h-56 rounded-lg overflow-hidden">
                    <Image 
                      src="/scores/525.png" 
                      alt="525 MCAT Score" 
                      width={320}
                      height={224}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </button>
              </div>

              {/* Highest Increase */}
              <div className="text-white/90">
                <p className="text-lg mb-4">Our highest increase was from 487 to 519.</p>
                <button 
                  onClick={() => setExpandedCard('519')}
                  className="transform hover:scale-105 transition-transform duration-300
                    bg-black/30 p-4 rounded-xl border border-white/10 backdrop-blur-sm
                    shadow-[0_0_20px_rgba(0,123,255,0.1)] hover:shadow-[0_0_30px_rgba(0,123,255,0.2)]"
                >
                  <div className="w-80 h-56 rounded-lg overflow-hidden">
                    <Image 
                      src="/scores/519.png" 
                      alt="519 MCAT Score" 
                      width={320}
                      height={224}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* New Class Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text 
              bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 mb-2">
              Next Class: March - May
            </h2>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              {"We're looking for people who are retakers to join this class."}
            </p>

            {/* Laura's Video */}
            <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.15)] mt-8 mb-12">
              <CustomVideo
                src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/laura.mov"
              />
            </div>
          </div>

          {/* MD Platinum Feature Section - with conditional pricing */}
          <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-[#1a1a3e] via-[#1a1a34] to-[#1a1a2a] 
            border border-sky-200/20 backdrop-blur-sm mb-16 transform hover:scale-[1.01] transition-all duration-300
            shadow-[0_0_30px_rgba(0,123,255,0.1)] hover:shadow-[0_0_50px_rgba(0,123,255,0.2)] group mt-12">
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Left side - Logo */}
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative w-48 h-48">
                  <img
                    src="/MDPremium.png"
                    alt="MD Platinum"
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                    style={{ animation: 'float 3s ease-in-out infinite' }}
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MD Platinum Class
                  </h3>
                  <p className="text-xl font-bold text-white/90 mt-2">{isSpecialStatus ? '$4000' : '$5000'}</p>
                  
                  {isSpecialStatus && (
                    <p className="text-green-400 font-medium text-sm mt-1">$1000 OFF for Retakers/Nontrads!</p>
                  )}
                </div>
              </div>

              {/* Right side - Content */}
              <div className="w-full md:w-2/3 space-y-6">
                <div className="space-y-4">
                  <p className="text-white/90 text-lg leading-relaxed">
                    Join the most elite MCAT class ever created. Get taught the MCAT like medical schools teach medicine.
                  </p>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">40 hours of MCAT instruction</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Instructor + Tutor combo</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Peer-based learning groups</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Medical educator curriculum</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Full access to software suite</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-white/90">Direct access to founders</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-sky-200/20 pt-6 mt-6">
                  <p className="text-white/90 text-lg leading-relaxed">
                    Join our next class and experience the most comprehensive MCAT preparation available. 
                    Limited spots to ensure personalized attention.
                  </p>
                </div>

                <button
                  onClick={handleApplyClick}
                  className="w-full h-12 mt-6 px-8 rounded-lg font-medium text-white
                    bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                    transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Apply for the Class
                </button>
              </div>
            </div>
          </div>

          {/* Modal for expanded images */}
          {expandedCard && (
            <div 
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setExpandedCard(null)}
            >
              <div className="relative max-w-4xl max-h-[90vh] p-4">
                <img 
                  src={`/scores/${expandedCard}.png`}
                  alt={`${expandedCard} MCAT Score`}
                  className="w-full h-full object-contain"
                />
                <button 
                  onClick={() => setExpandedCard(null)}
                  className="absolute top-2 right-2 text-white/90 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedOptions.tutors && (
        <div className="mt-24 text-center">
          
          <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-[#1a1a3e] via-[#1a1a34] to-[#1a1a2a] 
            border border-emerald-200/20 backdrop-blur-sm mb-16">
            <p className="text-white/90 text-lg mb-6">
              Join our Discord community to connect with our tutors while we set up our tutoring platform.
            </p>
            
            <a 
              href="https://discord.gg/KPtDGJfK8t" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-lg text-white
                bg-[#5865F2] hover:bg-[#4752C4]
                transition-all duration-300 transform hover:scale-105"
            >
              <svg width="24" height="24" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor"/>
              </svg>
              Find Tutors on Discord
            </a>
          </div>
        </div>
      )}

      {/* New Team Section at the bottom */}
      <div className="mt-24 text-center mb-20">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text 
          bg-gradient-to-r from-blue-500 via-white to-blue-500 mb-8">
          Meet Our Team
        </h2>
        <div className="max-w-5xl mx-auto px-4 relative mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
            {allTeam.slice(currentIndex, currentIndex + 8).map((member) => (
              <div key={member.name}>
                <div className="h-64 p-4 rounded-xl bg-black/20 border border-white/10 
                  backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300
                  shadow-[0_0_20px_rgba(0,123,255,0.1)] hover:shadow-[0_0_30px_rgba(0,123,255,0.2)]
                  text-center flex flex-col items-center justify-center"
                >
                  <div className="w-20 h-20 mb-3 rounded-full overflow-hidden border border-white/10">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-medium text-white/90 mb-1">{member.name}</h3>
                  <p className="text-blue-400/80 font-medium text-sm mb-1">{member.university}</p>
                  <p className="text-white/70 text-sm">{member.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next Button - Only shown if there are more cards */}
          {allTeam.length > 8 && (
            <button
              onClick={nextSlide}
              className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 rounded-full 
                bg-black/30 text-white/90 hover:bg-black/50 transition-all
                border border-white/10 backdrop-blur-sm"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
          {currentStep === 'video' && renderVideoStep()}
          {currentStep === 'mission' && renderMissionStep()}
          {currentStep === 'options' && renderOptionsStep()}
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