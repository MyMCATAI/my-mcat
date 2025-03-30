"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useUserActivity } from '@/hooks/useUserActivity';
import OptionsStep from "@/components/pricing/options/OptionsStep";
import { ProductType } from "@/types";

// Constants
type PricingPeriod = 'monthly' | 'biannual' | 'annual';

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { isGold } = useSubscriptionStatus();
  const { user } = useUser();
  const { startActivity } = useUserActivity();
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Track page view
  useEffect(() => {
    if (user?.id) {
      startActivity({
        type: "offer_page_view",
        location: "Offer",
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [user]);

  const handlePackageSelect = (packageType: 'basic' | 'standard' | 'premium') => {
    setSelectedPackage(packageType);
  };

  const openCalendarModal = async () => {
    try {
      const userId = user?.id;

      if(userId){
        await startActivity({
          type: 'consultation_booking_click',
          location: "Offer",
          metadata: {
            timestamp: new Date().toISOString(),
          }
        });
      }
      
      if (!userId) {
        // If not authenticated, redirect to sign-up with return URL
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/sign-up?redirect_url=${returnUrl}`;
        return;
      }

      setShowCalendarModal(true);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to open booking calendar");
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
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {'The Cyborg Upgrade'}
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
              For those who need extra help, we offer tutors that are linked to our software.
            </p>
            
            {/* Consultation Button - Moved to the top */}
            <button
              onClick={openCalendarModal}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-bold text-lg
                hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300
                shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
            >
              Book Free Tutoring Consultation
            </button>
          </div>
          
          {/* Introduction Video */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="relative aspect-video overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm z-0"></div>
              <video 
                className="relative z-10 w-full h-full object-cover rounded-2xl"
                controls
                poster="/video-thumbnail.jpg"
              >
                <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/testimonials.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl z-0"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl z-0"></div>
              
              {/* Video border overlay */}
              <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none z-20"></div>
            </div>
            <p className="text-white/60 text-center mt-4 text-sm">See how our tutoring can transform your learning experience</p>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic Package */}
            <PricingCard
              title="Basic"
              hours={12}
              price={3500}
              accentColor="blue"
              features={[
                {
                  title: "Adaptive Study Schedule",
                  description: "Study schedule that syncs with all resources.",
                },
                {
                  title: "Adaptive Tutoring Suite",
                  description: "All the content you need curated for you based on weaknesses.",
                },
                {
                  title: "Test Taking Suite",
                  description: "Review your FLs in one place and know when your next one is.",
                },
                {
                  title: "Comprehensive Anki Game",
                  description: "4000+ flashcards and multiple choice questions",
                },
                {
                  title: "Video Integration",
                  description: "Thousands of integrated educational videos",
                }
              ]}
              isSelected={selectedPackage === 'basic'}
              onSelect={() => handlePackageSelect('basic')}
            />
            
            {/* Standard Package */}
            <PricingCard
              title="Standard"
              hours={24}
              price={6000}
              accentColor="amber"
              features={[
                {
                  title: "Adaptive Study Schedule",
                  description: "Study schedule that syncs with all resources.",
                },
                {
                  title: "Adaptive Tutoring Suite",
                  description: "All the content you need curated for you based on weaknesses.",
                },
                {
                  title: "Test Taking Suite",
                  description: "Review your FLs in one place and know when your next one is.",
                },
                {
                  title: "NVIDIA-tier algorithms",
                  description: "Most advanced Kalypso with AAMC logic and voice-activation.",
                },
                {
                  title: "Weekly Progress Reports",
                  description: "Detailed analysis of your performance and improvement areas.",
                }
              ]}
              isSelected={selectedPackage === 'standard'}
              isPopular={true}
              onSelect={() => handlePackageSelect('standard')}
            />
            
            {/* Premium Package */}
            <PricingCard
              title="Premium"
              hours={40}
              price={9000}
              accentColor="purple"
              features={[
                {
                  title: "40 Hours of PBL-Based Instruction",
                  description: "Teach you like medical schools teach medicine.",
                },
                {
                  title: "Instructor + Tutor Combo",
                  description: "Meet an instructor once a week and a tutor twice a week.",
                },
                {
                  title: "An AAMC Curriculum",
                  description: "We use AAMC guidelines and FLs to design your course.",
                },
                {
                  title: "Full Software Integration",
                  description: "Software is seamlessly integrated into your course.",
                },
                {
                  title: "NVIDIA-tier algorithms",
                  description: "Most advanced Kalypso with AAMC logic and voice-activation.",
                }
              ]}
              isSelected={selectedPackage === 'premium'}
              onSelect={() => handlePackageSelect('premium')}
            />
          </div>
        </div>
      </div>
      
      {/* Calendar Modal */}
      {showCalendarModal && (
        <CalendarModal onClose={() => setShowCalendarModal(false)} />
      )}
    </div>
  );
}

interface PricingCardProps {
  title: string;
  hours: number;
  price: number;
  features: {
    title: string;
    description: string;
  }[];
  accentColor: 'blue' | 'amber' | 'purple';
  isSelected?: boolean;
  isPopular?: boolean;
  onSelect: () => void;
}

function PricingCard({ 
  title, 
  hours, 
  price, 
  features, 
  accentColor, 
  isSelected = false, 
  isPopular = false, 
  onSelect 
}: PricingCardProps) {
  const getGradient = () => {
    switch (accentColor) {
      case 'blue':
        return {
          border: 'border-blue-400/20 hover:border-blue-400/40',
          gradientFrom: 'from-blue-500',
          gradientTo: 'to-blue-600',
          textColor: 'text-blue-400',
          shadow: 'shadow-[0_0_50px_rgba(59,130,246,0.1)] hover:shadow-[0_0_50px_rgba(59,130,246,0.2)]',
          bg: 'bg-gradient-to-br from-black/30 via-black/20 to-black/10'
        };
      case 'amber':
        return {
          border: 'border-amber-400/20 hover:border-amber-400/40',
          gradientFrom: 'from-amber-500',
          gradientTo: 'to-yellow-400',
          textColor: 'text-amber-400',
          shadow: 'shadow-[0_0_50px_rgba(251,191,36,0.1)] hover:shadow-[0_0_50px_rgba(251,191,36,0.2)]',
          bg: 'bg-gradient-to-br from-black/30 via-black/20 to-black/10'
        };
      case 'purple':
        return {
          border: 'border-purple-400/20 hover:border-purple-400/40',
          gradientFrom: 'from-purple-500',
          gradientTo: 'to-pink-500',
          textColor: 'text-purple-400',
          shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.1)] hover:shadow-[0_0_50px_rgba(168,85,247,0.2)]',
          bg: 'bg-gradient-to-br from-black/30 via-black/20 to-black/10'
        };
      default:
        return {
          border: 'border-white/10 hover:border-white/20',
          gradientFrom: 'from-blue-500',
          gradientTo: 'to-purple-500',
          textColor: 'text-blue-400',
          shadow: '',
          bg: 'bg-black/20'
        };
    }
  };

  const gradient = getGradient();

  return (
    <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-max px-4 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-full text-sm z-10">
          Most Popular
        </div>
      )}
      
      <div 
        className={`rounded-3xl ${gradient.bg} backdrop-blur-xl overflow-hidden h-full
          ${gradient.border} transition-colors duration-300 ${gradient.shadow}`}
      >
        {/* Title Banner */}
        <div className={`bg-gradient-to-r ${gradient.gradientFrom}/20 via-transparent ${gradient.gradientTo}/20 p-6 text-center border-b ${accentColor === 'amber' ? 'border-amber-400/20' : accentColor === 'purple' ? 'border-purple-400/20' : 'border-blue-400/20'}`}>
          <div className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradient.gradientFrom} ${gradient.gradientTo}`}>
            {title} Package
          </div>
          <p className="text-white/60 text-sm mt-1">
            ${(price / hours).toFixed(2)}/hour - {hours} hours total
          </p>
        </div>
        
        <div className="p-8 flex flex-col h-[calc(100%-120px)]">
          {/* Price */}
          <div className="mb-8 text-center">
            <div className="text-4xl font-bold text-white mb-2">
              ${price.toLocaleString()}
            </div>
            <p className="text-white/60 text-sm">For {hours} hours of tutoring</p>
          </div>
          
          {/* Features */}
          <div className="space-y-4 mb-8 flex-grow">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`w-5 h-5 mt-1 ${gradient.textColor} flex-shrink-0`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-medium">{feature.title}</h4>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Selection Button */}
          <button 
            onClick={onSelect}
            className={`w-full py-3 rounded-xl font-medium text-center transition-all duration-300 mt-auto
              ${isSelected 
                ? `bg-gradient-to-r ${gradient.gradientFrom} ${gradient.gradientTo} ${accentColor === 'amber' ? 'text-black' : 'text-white'} transform hover:scale-[1.02]`
                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
          >
            {isSelected ? 'Selected' : 'Select Package'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Calendar modal component with updated styling
interface CalendarModalProps {
  onClose: () => void;
}

function CalendarModal({ onClose }: CalendarModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if the backdrop itself was clicked
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick} // Add click handler to the backdrop
    >
      <div className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Schedule Your Free Consultation</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Calendar iframe */}
        <div className="h-[600px] w-full bg-white">
          <iframe 
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3hMOL4oJtFVHit6w6WyM2EuvBFRPoG59w6a-T0rU14-PWTIPMVRDlOx3PrYoVMpNYOVo4UhVXk?gv=true" 
            style={{ border: 0 }} 
            width="100%" 
            height="100%" 
            frameBorder="0"
          ></iframe>
        </div>
      </div>
    </div>
  );
}