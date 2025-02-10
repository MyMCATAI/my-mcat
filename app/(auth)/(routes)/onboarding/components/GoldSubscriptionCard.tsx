import Image from "next/image";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ProductType } from "@/types";
import { useState } from "react";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useRouter } from "next/navigation";

const goldFeatures = {
  title: "MD Gold Plan",
  price: "$149.99 / month",
  description: "Unlock comprehensive MCAT preparation with advanced AI tools, daily practice materials, and personalized analytics to maximize your success.",
  image: "/MD_Premium_Pro.png",
  features: [
    "Daily CARS passages with detailed explanations",
    "AI-curated study content based on your performance",
    "Complete access to full-length practice tests",
    "Advanced performance analytics and insights",
    "Personalized study schedule optimization",
  ]
};

export function GoldSubscriptionCard() {
  const [isLoading, setIsLoading] = useState(false);
  const { isGold } = useSubscriptionStatus();
  const router = useRouter();

  const handleAction = async () => {
    try {
      setIsLoading(true);
      
      if (isGold) {
        // Manage existing subscription
        const response = await axios.get("/api/stripe");
        window.location.href = response.data.url;
      } else {
        // Redirect to pitch page instead of direct checkout
        router.push('/pitch');
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(isGold ? "Failed to load subscription management. Please try again." : "Failed to initiate purchase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={handleAction}
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
          ? 'bg-gradient-to-br from-[--theme-mainbox-color] to-[--theme-mainbox-color] hover:shadow-lg hover:shadow-amber-400/20'
          : 'bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-900 hover:shadow-lg hover:shadow-amber-400/20'}`}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 
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
              {goldFeatures.description}
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
                        className={`w-5 h-5 mr-2 flex-shrink-0
                          ${isGold ? 'text-amber-500' : 'text-amber-300'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
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
            <p className={`text-2xl font-bold mb-[50px] mt-[50px]
              ${isGold ? 'text-[--theme-text-color]' : 'text-white'}`}
            >
              {goldFeatures.price}
            </p>

            <div
              className={`w-full h-10 px-4 rounded-md font-medium shadow-sm 
                transition-all duration-300 flex items-center justify-center
                disabled:opacity-50
                ${isGold 
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-amber-950 group-hover:opacity-90'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-amber-950 group-hover:opacity-90'}`}
              role="button"
              aria-disabled={isLoading}
            >
              {isLoading ? "Loading..." : isGold ? "Manage Subscription" : "Choose Gold Plan"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 