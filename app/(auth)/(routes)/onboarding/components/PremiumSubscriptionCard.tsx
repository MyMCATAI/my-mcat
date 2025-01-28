import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";

const premiumFeatures = {
  title: "MD Premium.",
  price: "$2,999.99",
  image: "/MDPremium.png",
  fullDescription: "MD Premium is a small class of students who are serious about mastering the MCAT. Successful applicants are guaranteed the best MCAT score of their life.",
  features: [
    "Unlimited access to all MyMCAT features and resources",
    "Access to our private discord server for rapid question-answering",
    "1 on 1 tutoring sessions and classes",
    "Personal guarantee on your score, or your money back",
  ]
};

export function PremiumSubscriptionCard() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPremium = async () => {
    try {
      setIsLoading(true);
      window.open('https://tally.so/r/mBAgq7', '_blank');
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
      <div className="absolute -top-3 -right-3 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] 
        px-3 py-1 rounded-full text-sm font-bold shadow-lg transform rotate-12 z-10">
        Premium
      </div>

      <div className="rounded-xl transition-all duration-300
        bg-gradient-to-br from-sky-950 via-blue-900 to-sky-900
        hover:shadow-lg hover:shadow-sky-400/20 h-full"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/10 to-sky-400/0 
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
                        className="w-5 h-5 mr-2 text-sky-300 flex-shrink-0" 
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
            <p className="text-2xl font-bold text-white mb-[50px]">
              {premiumFeatures.price}
            </p>

            <div
              className="w-full h-10 px-4 rounded-md font-medium shadow-sm 
                transition-all duration-300
                bg-gradient-to-r from-sky-400 via-blue-400 to-sky-400 
                text-white group-hover:opacity-90 flex items-center justify-center
                text-xl disabled:opacity-50"
              role="button"
              aria-disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Apply for MD Premium"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 