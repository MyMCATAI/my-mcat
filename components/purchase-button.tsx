import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductType } from "@/types";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

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
      const response = await axios.post("/api/stripe/checkout", {
        priceType: productType
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initiate purchase. Please try again.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [productType]: false }));
    }
  };

  const pricingOptions = [
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
    }
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
                className="hover:opacity-80 transition-opacity disabled:opacity-50"
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
          className="max-w-4xl bg-[--theme-mainbox-color] text-[--theme-text-color] border border-transparent z-[102]"
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
            <DialogTitle className="text-2xl font-bold text-center mb-4 text-[--theme-text-color]">
              Purchase Coins
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {pricingOptions.map((option, index) => (
              <button 
                key={index}
                onClick={() => handlePurchase(option.productType)}
                disabled={loadingStates[option.productType]}
                className={`rounded-lg p-6 flex flex-col items-center space-y-4 transition-all relative h-full w-full text-left
                  bg-[--theme-leaguecard-color]
                  ${loadingStates[option.productType] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ 
                  boxShadow: 'var(--theme-button-boxShadow)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--theme-button-boxShadow-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--theme-button-boxShadow)';
                }}
              >
                <Image
                  src={option.image}
                  alt={option.title}
                  width={120}
                  height={120}
                  className="mb-4 rounded-lg object-contain h-[120px] w-[120px] pointer-events-none"
                />
                <h3 className="text-l font-bold text-[--theme-text-color] pointer-events-none">{option.title}</h3>
                <p className="text-2xl font-bold text-[--theme-text-color] pointer-events-none">{option.price}</p>
                <p className="text-sm text-[--theme-text-color] text-center flex-grow pointer-events-none">{option.description}</p>
                <div 
                  className="w-full mt-auto px-4 py-2 rounded-md text-center font-medium text-[--theme-text-color] pointer-events-none bg-[--theme-doctorsoffice-accent]"
                >
                  {loadingStates[option.productType] ? "Loading..." : "Purchase"}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}