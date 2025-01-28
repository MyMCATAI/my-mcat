"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useUserActivity } from "@/hooks/useUserActivity";

interface SubscriptionButtonProps {
  text?: string;
  className?: string;
  tooltipText?: string;
  children?: React.ReactNode;
  variant?: 'icon' | 'traditional';
}

const premiumFeatures = {
  title: "Enough talk. Get your target score.",
  price: "$2,999.99",
  fullDescription: "The MD Premium Class is a small class of students dedicated to improving their MCAT scores, backed by the latest research on medical education. From us, you can expect nothing less than the best. We expect that of you as well.",
  image: "/MDPremium.png",
  features: [
    "36 hours of expert instruction on MCAT strategy",
    "Research-backed curriculum designed by medical educators",
    "Both an instructor and a tutor for personalized feedback",
    "Access to our private discord server for rapid question-answering",
    "Access to a daily study channel to co-learn with your classmates",
    "Better score guarantee contract than any competitor in the market",
    "Lifetime access to all MyMCAT content and features",
  ]
};

// Add new object for subscription management content
const subscriptionManagement = {
  title: "Manage MD Premium",
  description: "Thank you for being a premium member! You can manage your subscription settings below.",
  features: [
    "View billing history",
    "Update payment method",
    "Change subscription plan",
    "Cancel subscription"
  ]
};

export function SubscriptionButton({
  text = "Apply for MD Premium",
  className,
  tooltipText = "Apply for MD Premium",
  children,
  variant = 'icon'
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPremium, isCanceled, currentPeriodEnd, isLoading: isCheckingStatus } = useSubscriptionStatus();
  const { startActivity } = useUserActivity();

  // Add audio effect when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const audio = new Audio('/short-choir.mp3');
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(error => {
        console.log("Audio playback failed:", error);
      });
      
      // Track modal open activity
      startActivity({
        type: "premium_modal_open",
        location: "subscription_button",
        metadata: {
          isPremium,
          isCanceled
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // Handle new subscription purchase
  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      
      // Track premium application click
      await startActivity({
        type: "premium_application_click",
        location: "subscription_button",
        metadata: {
          isPremium,
          isCanceled
        }
      });
      
      // Open Tally form in new window
      window.open('https://tally.so/r/mBAgq7', '_blank');
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to open application form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle managing existing subscription
  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      // Open Tally form in new window
      window.open('https://tally.so/r/mBAgq7', '_blank');
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to open application form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking subscription status
  if (isCheckingStatus) {
    return <Button disabled className={variant === 'traditional' ? "w-full" : className}>Loading...</Button>;
  }

  // Show manage subscription button for premium users
  if (isPremium) {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                variant="outline"
                className="border-sky-400 text-sky-400 hover:text-white hover:bg-sky-400 h-9 px-4"
              >
                {isLoading ? "Loading..." : (
                  isCanceled 
                    ? `Premium ends ${currentPeriodEnd?.toLocaleDateString()}` 
                    : "Manage Premium"
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isCanceled
                  ? "Your premium subscription will end soon. Click to reactivate."
                  : "Manage your premium subscription"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Dialog 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen}
        >
          <DialogContent 
            className="max-w-2xl bg-transparent text-[--theme-text-color] border border-transparent z-[102] overflow-visible"
          >
            <div className="p-6">
              <div 
                className="rounded-lg p-6 flex flex-col items-center space-y-6 transition-all relative overflow-visible
                  bg-gradient-to-br from-sky-100 via-white to-sky-50
                  w-[90vw] max-w-[35rem] max-h-[90vh]
                  md:w-[80vw] lg:w-[60vw]"
                style={{
                  boxShadow: `
                    0 0 40px rgba(255, 255, 255, 0.6),
                    0 0 80px rgba(255, 255, 255, 0.4)
                  `,
                  background: `
                    linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.95) 0%,
                      rgba(224, 242, 254, 0.9) 50%,
                      rgba(255, 255, 255, 0.95) 100%
                    ),
                    radial-gradient(
                      circle at 50% 0,
                      rgba(255, 255, 255, 0.8) 0%,
                      transparent 70%
                    )
                  `
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `
                    0 0 60px rgba(255, 255, 255, 0.8),
                    0 0 100px rgba(255, 255, 255, 0.6)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `
                    0 0 40px rgba(255, 255, 255, 0.6),
                    0 0 80px rgba(255, 255, 255, 0.4)
                  `;
                }}
              >
                <div className="absolute -top-3 -right-3 bg-sky-400 text-[--theme-text-color] px-3 py-1 rounded-full text-sm font-bold shadow-lg transform rotate-12">
                  Premium
                </div>
                <Image
                  src={premiumFeatures.image}
                  alt={premiumFeatures.title}
                  width={150}
                  height={150}
                  className="rounded-lg object-contain h-[150px] w-[150px] scale-110 transition-transform duration-300"
                />

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white">
                    {isCanceled ? "Subscription Ending Soon" : "Active Premium Subscription"}
                  </h3>
                  {currentPeriodEnd && (
                    <p className="text-white">
                      {isCanceled 
                        ? `Your subscription will end on ${currentPeriodEnd.toLocaleDateString()}`
                        : `Next billing date: ${currentPeriodEnd.toLocaleDateString()}`
                      }
                    </p>
                  )}
                </div>

                <p className="text-sm text-white text-center">{subscriptionManagement.description}</p>

                <div className="w-full sace-y-3">
                  <div className="border-t border-white/20 pt-4">
                    <h4 className="font-semibold text-white mb-2">Subscription Management Options:</h4>
                    <ul className="space-y-2">
                      {subscriptionManagement.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-white">
                          <svg className="w-5 h-5 mr-2 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  className={`w-full h-9 px-4 rounded-md font-medium shadow-sm transition-all duration-300 
                    bg-gradient-to-r from-sky-400 via-blue-400 to-sky-400 text-white hover:opacity-90`}
                  style={{
                    boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {isLoading ? "Loading..." : (isCanceled ? "Reactivate Subscription" : "Manage in Stripe Portal")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Show get premium button for non-premium users
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {variant === 'traditional' ? (
              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                className="w-full h-10 px-6 font-medium shadow-md transition-all duration-300 
                  bg-[--theme-button-color] text-[--theme-text-color] hover:opacity-90
                  rounded-md"
              >
                {isLoading ? "Loading..." : "Apply for the Class"}
              </Button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                className={className || "group w-20 h-20 p-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] shadow-md rounded-full transition flex flex-col items-center justify-center gap-1"}
              >
                <Image
                  src="/MDPremium.png"
                  alt="MD Premium"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xs font-medium">Premium</span>
              </button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      >
        <DialogContent 
          className="max-w-2xl bg-transparent text-[--theme-text-color] border border-transparent z-[102] overflow-visible"
        >
          <div className="p-2 sm:p-4 md:p-6 overflow-visible">
            <div 
              className="rounded-lg p-4 sm:p-6 flex flex-col items-center transition-all relative
                bg-gradient-to-br from-sky-950 via-blue-900 to-sky-900
                w-full max-h-[85vh]
                sm:max-w-[35rem]"
              style={{
                boxShadow: '0 0 20px rgba(186, 230, 253, 0.3)',
                background: `
                  linear-gradient(135deg, 
                    rgba(12, 74, 110, 0.95) 0%,
                    rgba(3, 105, 161, 0.9) 100%
                  )
                `,
                animation: 'heavenlyGlow 2s ease-in-out infinite alternate'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(186, 230, 253, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(186, 230, 253, 0.3)';
              }}
            >
              <div className="absolute -top-3 -right-3 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] px-3 py-1 rounded-full text-sm font-bold shadow-lg transform rotate-12 z-[103]">
                Premium
              </div>
              <div className="w-full h-full overflow-y-auto">
                <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                  <Image
                    src={premiumFeatures.image}
                    alt={premiumFeatures.title}
                    width={150}
                    height={150}
                    className="rounded-lg object-contain h-[100px] w-[100px] sm:h-[150px] sm:w-[150px] scale-110 transition-transform duration-300"
                    style={{ animation: 'float 3s ease-in-out infinite' }}
                  />

                  <h3 className="text-lg sm:text-xl font-bold text-white">{premiumFeatures.title}</h3>
                  <p className="text-xs sm:text-sm text-white text-center">{premiumFeatures.fullDescription}</p>

                  <div className="w-full space-y-2 sm:space-y-3">
                    <div className="border-t border-sky-200/20 pt-3 sm:pt-4">
                      <h4 className="font-semibold text-white mb-2">Meow Distinction Features:</h4>
                      <ul className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                        {premiumFeatures.features.map((feature, index) => (
                          <li 
                            key={index} 
                            className="flex items-center text-white"
                            style={{ 
                              animation: `shimmer 1.5s infinite linear`,
                              animationDelay: `${index * 0.1}s`,
                              backgroundSize: '40rem 100%'
                            }}
                          >
                            <svg 
                              className="w-5 h-5 mr-2 text-sky-300" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              style={{ animation: 'pulse 2s ease-in-out infinite' }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p 
                    className="text-2xl sm:text-3xl font-bold text-white"
                    style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                  >
                    {premiumFeatures.price}
                  </p>

                  <div className="w-full pt-1">
                    <Button
                      onClick={handleSubscribe}
                      disabled={isLoading}
                      className="w-full h-9 sm:h-10 px-4 rounded-md font-medium shadow-sm transition-all duration-300 
                        bg-gradient-to-r from-sky-400 via-blue-400 to-sky-400 text-white hover:opacity-90"
                    >
                      {isLoading ? "Loading..." : "Apply for MD Premium"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

<style jsx global>{`
  @keyframes heavenlyGlow {
    from {
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
    }
    to {
      box-shadow: 0 0 40px rgba(255, 255, 255, 0.6);
    }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes shimmer {
    0% { background-position: -20rem 0; }
    100% { background-position: 20rem 0; }
  }
`}</style>