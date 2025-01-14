"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductType } from "@/types";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface SubscriptionButtonProps {
  text?: string;
  className?: string;
  tooltipText?: string;
  children?: React.ReactNode;
}

const premiumFeatures = {
  title: "MD Premium",
  price: "$2,999.00 / 3 months",
  description: "No more saying you will do it and then not doing. We have a once-a-week class and personalized mentoring in our class. You'll be in a community of premeds striving for one goal: be a better you. And we'll guarantee a 10 point increase from your first FL, AAMC, with no fine-print on it. You've seen our software. Come see our classes.  Perfect for dedicated MCAT prep.",
  image: "/MDPremium.png",
  features: [
    "Personal tutoring",
    "Unlimited AI-powered analytics",
    "No rate limits for all features",
    "Priority support access",
    "Exclusive premium content",
    "10 free coins per day"
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
  text = "Get Premium",
  className = "bg-gradient-to-r from-indigo-400 to-purple-400 text-white font-medium hover:opacity-90 h-9 px-4 shadow-sm",
  tooltipText = "Join MD Premium",
  children
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPremium, isCanceled, currentPeriodEnd, isLoading: isCheckingStatus } = useSubscriptionStatus();

  // Handle new subscription purchase
  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stripe/checkout", {
        priceType: ProductType.MD_PREMIUM
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initiate subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle managing existing subscription
  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe");
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to open subscription management. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking subscription status
  if (isCheckingStatus) {
    return <Button disabled className={className}>Loading...</Button>;
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
                className="border-[--theme-doctorsoffice-accent] text-[--theme-doctorsoffice-accent] h-9 px-4"
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
            className="max-w-2xl bg-[--theme-mainbox-color] text-[--theme-text-color] border border-transparent z-[102]"
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-4 text-[--theme-text-color]">
                {subscriptionManagement.title}
              </DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <div 
                className="rounded-lg p-6 flex flex-col items-center space-y-6 transition-all relative
                  bg-gradient-to-br from-[--theme-gradient-start] via-[--theme-gradient-end] to-[--theme-doctorsoffice-accent]
                  shadow-xl shadow-[--theme-doctorsoffice-accent]/30"
              >
                <Image
                  src={premiumFeatures.image}
                  alt={premiumFeatures.title}
                  width={150}
                  height={150}
                  className="rounded-lg object-contain h-[150px] w-[150px] scale-110 transition-transform duration-300"
                />

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-[--theme-text-color]">
                    {isCanceled ? "Subscription Ending Soon" : "Active Premium Subscription"}
                  </h3>
                  {currentPeriodEnd && (
                    <p className="text-[--theme-text-color]">
                      {isCanceled 
                        ? `Your subscription will end on ${currentPeriodEnd.toLocaleDateString()}`
                        : `Next billing date: ${currentPeriodEnd.toLocaleDateString()}`
                      }
                    </p>
                  )}
                </div>

                <p className="text-sm text-[--theme-text-color] text-center">{subscriptionManagement.description}</p>

                <div className="w-full space-y-3">
                  <div className="border-t border-[--theme-text-color]/20 pt-4">
                    <h4 className="font-semibold text-[--theme-text-color] mb-2">Subscription Management Options:</h4>
                    <ul className="space-y-2">
                      {subscriptionManagement.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-[--theme-text-color]">
                          <svg className="w-5 h-5 mr-2 text-[--theme-text-color]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    bg-gradient-to-r from-indigo-400 to-purple-400 text-white hover:opacity-90`}
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
            {children ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                className="hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {children}
              </button>
            ) : (
              <Button 
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                variant="outline"
                className="border-indigo-400 text-indigo-500 hover:bg-indigo-50 h-9 px-4"
              >
                {isLoading ? "Loading..." : text}
              </Button>
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
          className="max-w-2xl bg-[--theme-mainbox-color] text-[--theme-text-color] border border-transparent z-[102]"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4 text-[--theme-text-color]">
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div 
              className="rounded-lg p-6 flex flex-col items-center space-y-6 transition-all relative
                bg-gradient-to-br from-[--theme-gradient-start] via-[--theme-gradient-end] to-[--theme-doctorsoffice-accent]
                shadow-xl shadow-[--theme-doctorsoffice-accent]/30"
            >
              <div className="absolute -top-3 -right-3 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] px-3 py-1 rounded-full text-sm font-bold shadow-lg transform rotate-12">
                Premium
              </div>

              <Image
                src={premiumFeatures.image}
                alt={premiumFeatures.title}
                width={150}
                height={150}
                className="rounded-lg object-contain h-[150px] w-[150px] scale-110 transition-transform duration-300"
              />

              <h3 className="text-xl font-bold text-[--theme-text-color]">{premiumFeatures.title}</h3>
              <p className="text-3xl font-bold text-[--theme-text-color]">{premiumFeatures.price}</p>
              <p className="text-sm text-[--theme-text-color] text-center">{premiumFeatures.description}</p>

              <div className="w-full space-y-3">
                <div className="border-t border-[--theme-text-color]/20 pt-4">
                  <h4 className="font-semibold text-[--theme-text-color] mb-2">Premium Features:</h4>
                  <ul className="space-y-2">
                    {premiumFeatures.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[--theme-text-color]">
                        <svg className="w-5 h-5 mr-2 text-[--theme-text-color]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`w-full h-9 px-4 rounded-md font-medium shadow-sm transition-all duration-300 
                  bg-gradient-to-r from-indigo-400 to-purple-400 text-white hover:opacity-90`}
              >
                {isLoading ? "Loading..." : "Join MD Premium"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}