import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface PurchaseButtonProps {
  text?: string;
  className?: string;
  tooltipText?: string;
  children?: React.ReactNode;
}

export function PurchaseButton({ 
  text = "Purchase Coins", 
  className = "bg-blue-500 hover:bg-blue-600 text-white",
  tooltipText = "Purchase additional coins to access more features",
  children
}: PurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/stripe/checkout");
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initiate purchase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const content = children || (
    <Button 
      onClick={handlePurchase}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Loading..." : text}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children ? (
            <button 
              onClick={handlePurchase}
              disabled={isLoading}
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
  );
}