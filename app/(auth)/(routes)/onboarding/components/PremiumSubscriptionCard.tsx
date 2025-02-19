import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const premiumFeatures = {
  title: "MD Platinum Class.",
  price: "$3000",
  image: "/MDPremium.png",
  fullDescription: "For students who want to be VIP members of the best MCAT class that money can buy.",
  features: [
    "36 hours of MCAT instruction",
    "Tutor and instructor combined",
    "Peer-based learning groups",
    "Curriculum designed by medical educators",
    "Full acesss to our software suite",
    "Direct access to the founders"
  ]
};

export function PremiumSubscriptionCard({ context }: { context: 'onboarding' | 'offer' }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectPremium = async () => {
    try {
      setIsLoading(true);
      if (context === 'onboarding') {
        router.push('/offer');
      } else {
        window.open('https://tally.so/r/mBAgq7', '_blank');
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process your application. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={handleSelectPremium}
      className="relative h-full group transform transition-all duration-200 hover:scale-[1.02] cursor-pointer"
    >
      {/* Premium Badge */}
      <div className="absolute -top-3 -right-3 bg-white text-zinc-900
        px-3 py-1 rounded-full text-sm font-bold shadow-lg transform rotate-12 z-10">
        Premium
      </div>

      <div className="rounded-xl transition-all duration-300
        bg-gradient-to-br from-[#1a1a3e] via-[#1a1a34] to-[#1a1a2a]
        hover:shadow-lg hover:shadow-blue-400/20 h-full"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex flex-col items-center h-full p-4">
          <div className="flex flex-col items-center space-y-4 w-full mb-auto">
            <Image
              src={premiumFeatures.image}
              alt={premiumFeatures.title}
              width={100}
              height={100}
              className="rounded-lg object-contain scale-110 transition-transform duration-300 group-hover:scale-125"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            />

            <h3 className="text-lg font-bold text-white text-center">
              {premiumFeatures.title}
            </h3>
            
            <p className="text-sm text-white text-center">
              {premiumFeatures.fullDescription}
            </p>

            <div className="w-full space-y-3">
              <div className="border-t border-sky-200/20 pt-4">
                <h4 className="font-semibold text-white mb-2">
                  Premium Features:
                </h4>
                <ul className="space-y-2">
                  {premiumFeatures.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-center text-white text-sm"
                      style={{ 
                        animation: `shimmer 1.5s infinite linear`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <svg 
                        className="w-4 h-4 mr-2 text-zinc-400 flex-shrink-0" 
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
            <p className="text-2xl font-bold text-white mb-[50px]">
              {premiumFeatures.price}
            </p>

            <div
              className="w-full h-10 px-4 rounded-full font-medium shadow-md 
                transition-all duration-300
                bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600
                flex items-center justify-center
                disabled:opacity-50 transform hover:scale-105"
              role="button"
              aria-disabled={isLoading}
            >
              {isLoading ? "Loading..." : context === 'offer' ? "Apply for the Class" : "Learn More"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 