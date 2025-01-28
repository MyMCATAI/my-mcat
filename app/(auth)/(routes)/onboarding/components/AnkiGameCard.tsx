import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const gameFeatures = {
  title: "Start with the Doctor's Office",
  description: "Jump into our gamified learning experience. Learn MCAT concepts while treating patients in our virtual doctor's office.",
  image: "/kalypsotalk.gif",
  features: [
    "Engaging medical scenarios",
    "Learn while having fun",
    "Track your progress",
    "Compete on leaderboards",
    "Build daily study habits",
    "Free forever"
  ]
};

export function AnkiGameCard() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectFree = async () => {
    setIsLoading(true);
    try {
      router.push('/doctorsoffice');
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to activate free access. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={handleSelectFree}
      className="relative h-full group transform transition-all duration-200 hover:scale-[1.02] cursor-pointer"
    >
      {/* Free Badge
      <div className="absolute -top-3 -right-3 bg-emerald-400 text-emerald-950 
        px-3 py-1 rounded-full text-sm font-bold shadow-lg transform rotate-12 z-10">
        Free
      </div> */}

      <div className="rounded-xl transition-all duration-300
        bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-900
        hover:shadow-lg hover:shadow-emerald-400/20 h-full"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex flex-col items-center h-full p-4">
          <div className="flex flex-col items-center space-y-4 w-full mb-auto">
            <Image
              src={gameFeatures.image}
              alt={gameFeatures.title}
              width={100}
              height={100}
              className="rounded-lg object-contain scale-110 transition-transform duration-300 group-hover:scale-125"
              style={{ animation: 'float 3s ease-in-out infinite' }}
            />

            <h3 className="text-lg font-bold text-white text-center">
              {gameFeatures.title}
            </h3>
            
            <p className="text-sm text-white text-center">
              {gameFeatures.description}
            </p>

            <div className="w-full space-y-3">
              <div className="border-t border-emerald-200/20 pt-4">
                <h4 className="font-semibold text-white mb-2">
                  Game Features:
                </h4>
                <ul className="space-y-2">
                  {gameFeatures.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-center text-white text-sm"
                      style={{ 
                        animation: `shimmer 1.5s infinite linear`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <svg 
                        className="w-5 h-5 mr-2 text-emerald-300 flex-shrink-0" 
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
              {"Free"}
            </p>

            <div
              className="w-full h-10 px-4 rounded-md font-medium shadow-sm 
                transition-all duration-300
                bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 
                text-white group-hover:opacity-90 flex items-center justify-center
                text-xl disabled:opacity-50"
              role="button"
              aria-disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Start Playing Now"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 