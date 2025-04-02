"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductType } from "@/types";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserInfo } from "@/hooks/useUserInfo";
import { cn } from "@/lib/utils";

interface PurchaseButtonProps {
  text?: string;
  className?: string;
  tooltipText?: string;
  children?: React.ReactNode;
  autoOpen?: boolean;
  userCoinCount?: number;
}

export function PurchaseButton({ 
  text = "Purchase Coins", 
  className = "bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color]",
  tooltipText = "Purchase additional coins to access more features",
  children,
  autoOpen = false,
  userCoinCount = 1
}: PurchaseButtonProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
  const { isLoading } = useUserInfo();
  const router = useRouter();

  useEffect(() => {
    setIsModalOpen(autoOpen);
  }, [autoOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open && userCoinCount > 0) {
      setIsModalOpen(false);
    } else if (open) {
      setIsModalOpen(true);
    }
  };

  const handlePurchase = async (productType: ProductType) => {
    try {
      setLoadingStates(prev => ({ ...prev, [productType]: true }));
      
      if (productType === "anki_game") {
        // Check if we're already on the ankiclinic page
        const currentPath = window.location.pathname;
        if (currentPath.includes('ankiclinic')) {
          console.log("Already on Anki Clinic, closing dialog");
          setIsModalOpen(false);
        } else {
          console.log("Redirecting to Anki Clinic");
          router.push('/ankiclinic');
        }
        return;
      }

      console.log("Initiating checkout for product type:", productType);
      const response = await axios.post("/api/stripe/checkout", {
        priceType: productType
      });
      console.log("Checkout response:", response.data);
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error("Error during purchase:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      toast.error("Failed to initiate purchase. Please try again.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [productType]: false }));
    }
  };

  const pricingOptions = [
    {
      title: "Earn StudyCoins",
      price: "Play Daily",
      description: "Earn free coins by playing our Anki flashcard game and studying consistently. Master concepts while earning rewards for your hard work and dedication.",
      image: "/kalypso/kalypotesting.png",
      productType: "anki_game" as any
    },
    {
      title: "10 StudyCoins",
      price: "$4.99",
      description: "One-time purchase of 10 coins. Use them to unlock premium features, AI-powered analytics, and Kalypso AI assistance. Perfect for focused study sessions.",
      image: "/10coins.png",
      productType: ProductType.COINS_10
    },
    {
      title: "25 StudyCoins",
      price: "$9.99",
      description: "One-time purchase of 25 coins. Best value for coins. Get extended access to advanced analytics, detailed AI feedback, and comprehensive feature access.",
      image: "/50coins.png",
      productType: ProductType.COINS_50
    },
  ];

  const content = children || (
    <Button 
      onClick={() => setIsModalOpen(true)}
      disabled={loadingStates[ProductType.COINS_10]}
      className={className}
    >
      {loadingStates[ProductType.COINS_10] ? "Loading..." : text}
    </Button>
  );

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children ? (
              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={loadingStates[ProductType.COINS_10]}
                className={cn("hover:opacity-80 transition-opacity disabled:opacity-50 w-full", className)}
                data-state={isModalOpen ? "open" : "closed"}
              >
                {content}
              </button>
            ) : (
              content
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog 
        open={isModalOpen} 
        onOpenChange={handleOpenChange}
      >
        <DialogContent 
          className="max-w-4xl bg-[--theme-mainbox-color] backdrop-blur-sm bg-opacity-95 text-[--theme-text-color] border border-transparent z-[102] rounded-xl p-6 shadow-xl"
          onPointerDownOutside={(e) => {
            if (userCoinCount === 0) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (userCoinCount === 0) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center mb-8 text-[--theme-text-color] relative">
              <span className="text-[--theme-text-color]">
                Get StudyCoins
              </span>
              <div className="absolute h-1 w-20 bg-[--theme-doctorsoffice-accent] rounded-full bottom-0 left-1/2 transform -translate-x-1/2 mt-2"></div>
            </DialogTitle>
            <p className="text-center text-[--theme-text-color]/70 -mt-4 mb-4">Choose how you want to get coins for premium features</p>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
            {pricingOptions.map((option, index) => (
              <button 
                key={index}
                onClick={() => handlePurchase(option.productType)}
                disabled={loadingStates[option.productType] || (option.productType !== "anki_game" && isLoading)}
                className={`rounded-xl p-6 flex flex-col items-center space-y-4 transition-all duration-300 relative h-full w-full text-left
                  ${option.productType === "anki_game"
                    ? 'bg-[--theme-leaguecard-color] border-2 border-green-300/50 hover:border-green-300 hover:scale-[1.02]'
                    : option.productType === ProductType.COINS_50
                      ? 'bg-[--theme-leaguecard-color] border-2 border-purple-300/50 hover:border-purple-300 hover:scale-[1.05] md:scale-[1.03] z-10'
                      : 'bg-[--theme-leaguecard-color] border-2 border-transparent hover:border-blue-300/50 hover:scale-[1.01]'}
                  ${loadingStates[option.productType] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ 
                  boxShadow: option.productType === "anki_game"
                    ? '0 0 15px rgba(134, 239, 172, 0.25)'
                    : option.productType === ProductType.COINS_50
                      ? '0 0 15px rgba(167, 139, 250, 0.3)'
                      : 'var(--theme-button-boxShadow)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = option.productType === "anki_game"
                    ? '0 0 20px rgba(134, 239, 172, 0.35)'
                    : option.productType === ProductType.COINS_50
                      ? '0 0 20px rgba(167, 139, 250, 0.4)'
                      : '0 0 15px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = option.productType === "anki_game"
                    ? '0 0 15px rgba(134, 239, 172, 0.25)'
                    : option.productType === ProductType.COINS_50
                      ? '0 0 15px rgba(167, 139, 250, 0.3)'
                      : 'var(--theme-button-boxShadow)';
                }}
              >
                {option.productType === "anki_game" && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md transform rotate-6 z-[103]">
                    Free
                  </div>
                )}
                {option.productType === ProductType.COINS_50 && (
                  <div className="absolute -top-3 -right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md transform rotate-6 z-[103]">
                    Best Value
                  </div>
                )}
                <div className={`relative w-[130px] h-[130px] mb-4 rounded-full overflow-hidden 
                  ${option.productType === "anki_game" 
                    ? 'bg-gradient-to-b from-green-100 to-white p-1'
                    : option.productType === ProductType.COINS_50
                      ? 'bg-gradient-to-b from-purple-100 to-white p-1'
                      : 'bg-gradient-to-b from-blue-100 to-white p-1'}`}>
                  <Image
                    src={option.image}
                    alt={option.title}
                    width={120}
                    height={120}
                    className="rounded-full object-cover h-full w-full pointer-events-none transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <h3 className={`text-xl font-bold pointer-events-none transition-colors
                  ${option.productType === "anki_game" 
                    ? 'text-green-600'
                    : option.productType === ProductType.COINS_50
                      ? 'text-purple-600'
                      : 'text-[--theme-text-color]'}`}>
                  {option.title}
                </h3>
                <p className={`text-2xl font-bold pointer-events-none
                  ${option.productType === "anki_game" 
                    ? 'text-green-500'
                    : option.productType === ProductType.COINS_50
                      ? 'text-purple-500'
                      : 'text-[--theme-text-color]'}`}>
                  {option.price}
                </p>
                <p className="text-sm text-[--theme-text-color] text-center flex-grow pointer-events-none">
                  {option.description}
                </p>
                <div 
                  className={`w-full mt-auto px-4 py-3 rounded-lg text-center font-medium text-white pointer-events-none transition-all duration-300
                    ${option.productType === "anki_game"
                      ? 'bg-green-500 shadow-md shadow-green-500/10'
                      : option.productType === ProductType.COINS_50
                        ? 'bg-purple-500 shadow-md shadow-purple-500/10'
                        : 'bg-blue-500 shadow-md shadow-blue-500/10'}`}
                >
                  {loadingStates[option.productType] 
                    ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )
                    : option.productType === "anki_game" 
                      ? (
                        <div className="flex items-center justify-center">
                          <span>Play Now</span>
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      ) 
                      : (
                        <div className="flex items-center justify-center">
                          <span>Purchase</span>
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}