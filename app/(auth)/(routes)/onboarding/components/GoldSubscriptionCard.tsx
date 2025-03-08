import Image from "next/image";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ProductType } from "@/types";
import { useState, useEffect } from "react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useRouter } from "next/navigation";

const goldFeatures = {
  title: "MD Gold Course",
  price: "$150 / month",
  description: "When you're ready to take the MCAT more seriously, try our self-paced adaptive MCAT course",
  image: "/MD_Premium_Pro.png",
  features: [
    "Daily CARS Suite",
    "Adaptive Tutoring Suite",
    "Study Schedule Optimizer",
    "Testing Suite",
    "Analytics",
    "Discord Tutoring Channel"
  ]
};

export function GoldSubscriptionCard({ context }: { context: 'onboarding' | 'offer' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [isTrialEligible, setIsTrialEligible] = useState(true);
  const { isGold, isTrialing, isCanceled } = useSubscriptionStatus();
  const router = useRouter();

  useEffect(() => {
    if (context === 'onboarding') {
      checkTrialEligibility();
    }
  }, [context]);

  const checkTrialEligibility = async () => {
    try {
      const response = await axios.get('/api/subscription/check-trial-eligibility');
      setIsTrialEligible(response.data.isEligible);
      
      if (!response.data.isEligible) {
        console.log("User not eligible for trial:", response.data.reason);
      }
    } catch (error) {
      console.error("Error checking trial eligibility:", error);
      // Default to eligible if we can't check
      setIsTrialEligible(true);
    }
  };

  const handleStartTrial = async () => {
    try {
      setLocalLoading(true);
      // Check eligibility first
      const response = await axios.get('/api/subscription/check-trial-eligibility');
      if (!response.data.isEligible) {
        toast.error("You're not eligible for a free trial at this time");
        setIsTrialEligible(false);
        return;
      }
      
      // Start the trial
      const trialResponse = await axios.post('/api/subscription/start-trial');
      if (trialResponse.data.success) {
        toast.success("Your 14-day free trial has started!");
        router.push('/examcalendar');
      } else {
        toast.error("Failed to start trial. Please try again.");
      }
    } catch (error) {
      console.error("Error starting trial:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      setIsLoading(true);

      if (isGold) {
        // Manage existing subscription
        const response = await axios.get("/api/stripe");
        window.location.href = response.data.url;
        return
      }
      
      if (context === 'onboarding') {
        // Show the pricing page with more options
        router.push('/pricing');
      } else {
        // Direct checkout for gold
        const response = await axios.post("/api/stripe/checkout", {
          productType: "gold"
        });
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load page. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`relative h-full group transform transition-all duration-200 hover:scale-[1.02] cursor-pointer
        ${isGold ? 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-amber-400/10 before:via-yellow-400/5 before:to-amber-400/10 before:rounded-lg border-2 border-amber-300' : ''}`}
    >
      {/* Gold Badge */}
      <div className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-sm font-bold shadow-lg transform rotate-12 z-10
        ${isGold 
          ? 'bg-amber-400 text-amber-950'
          : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950'}`}
      >
        {isGold ? 'Active' : 'Gold'}
      </div>

      <div className={`rounded-xl transition-all duration-300
        ${isGold 
          ? 'bg-gradient-to-br from-[#1a1a2e] via-[#1a1a24] to-[#1a1a1a] hover:shadow-lg hover:shadow-amber-400/20'
          : 'bg-gradient-to-br from-[#1a1a2e] via-[#1a1a24] to-[#1a1a1a] hover:shadow-lg hover:shadow-amber-400/20'}`}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-amber-400/0 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex flex-col items-center h-full p-4">
          <div className="flex flex-col items-center space-y-4 w-full mb-auto">
            <Image
              src={goldFeatures.image}
              alt={goldFeatures.title}
              width={100}
              height={100}
              className={`rounded-lg object-contain transition-transform duration-300
                ${isGold ? 'scale-110' : 'group-hover:scale-125'}`}
              style={{ animation: 'float 3s ease-in-out infinite' }}
            />

            <h3 className={`text-lg font-bold text-center
              ${isGold ? 'text-[--theme-text-color]' : 'text-white'}`}
            >
              {goldFeatures.title}
            </h3>
            
            <p className={`text-sm text-center
              ${isGold ? 'text-[--theme-text-color]' : 'text-white'}`}
            >
              {isGold 
                ? "You have full access to all Gold features and benefits" 
                : goldFeatures.description}
            </p>

            <div className="w-full space-y-3">
              <div className={`border-t pt-4
                ${isGold ? 'border-amber-200/20' : 'border-amber-200/20'}`}
              >
                <h4 className={`font-semibold mb-2
                  ${isGold ? 'text-[--theme-text-color]' : 'text-white'}`}
                >
                  Gold Features:
                </h4>
                <ul className="space-y-2">
                  {goldFeatures.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className={`flex items-center text-sm
                        ${isGold ? 'text-[--theme-text-color]' : 'text-white'}`}
                      style={{ 
                        animation: `shimmer 1.5s infinite linear`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <svg 
                        className={`w-4 h-4 mr-2 flex-shrink-0
                          ${isGold ? 'text-zinc-400' : 'text-zinc-400'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="1.5" 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center">
            {/* Only show price if not Gold */}
            {!isGold && (
              <p className="text-2xl font-bold mb-4 mt-4 text-white">
                {goldFeatures.price}
              </p>
            )}
            
            {/* Active subscription message */}
            {isGold && (
              <div className="w-full bg-gradient-to-r from-amber-500/30 to-yellow-500/30 p-3 rounded-lg mb-4 mt-4">
                <p className="text-center text-amber-200 font-medium">
                  Your Gold subscription is active!
                </p>
              </div>
            )}

            {/* Trial button - Only show if eligible */}
            {isTrialEligible && !isGold && !isTrialing && !isCanceled && context === 'onboarding' && (
              <div className="space-y-2 mb-4 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartTrial();
                  }}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold 
                    transition-all duration-300
                    hover:from-blue-400 hover:to-blue-700
                    hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]
                    hover:scale-[1.02] hover:-translate-y-0.5
                    active:scale-[0.98] active:shadow-[0_0_15px_rgba(59,130,246,0.4)]
                    before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full 
                    before:bg-gradient-to-r before:from-transparent before:via-blue-200/10 before:to-transparent
                    before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
                  disabled={localLoading}
                >
                  {localLoading ? 'Processing...' : 'Start 14-Day Free Trial'}
                </button>
                <p className="text-center text-slate-400 text-xs">No credit card required</p>
              </div>
            )}

            {/* Message when not eligible */}
            {!isTrialEligible && !isGold && !isTrialing && context === 'onboarding' && (
              <p className="text-center text-slate-400 text-xs mb-4">
                You&apos;ve already used your free trial opportunity
              </p>
            )}

            <div
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
              className={`w-full h-10 px-4 rounded-full font-medium shadow-lg 
                transition-all duration-300 flex items-center justify-center
                ${isGold 
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-500 hover:to-yellow-600' 
                  : 'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:from-green-500 hover:to-blue-600'}
                transform hover:scale-105`}
              role="button"
              aria-disabled={isLoading}
            >
              {isLoading 
                ? "Loading..." 
                : isGold 
                  ? "Manage Subscription"
                  : context === 'offer' 
                    ? "Upgrade to Gold" 
                    : "Learn More"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 