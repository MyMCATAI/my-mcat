import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface SubscriptionManagementButtonProps {
  isGoldMember?: boolean;
  className?: string;
}

export function SubscriptionManagementButton({ 
  isGoldMember = false,
  className = ""
}: SubscriptionManagementButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stripe");
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isGoldMember) return null;

  return (
    <div className={`flex items-center ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="relative group"
            >
              <div className="absolute"></div>
              <div className="relative flex items-center justify-center w-12 h-12 bg-black rounded-full overflow-hidden">
                <Image
                  src="/gleamingcoin.gif"
                  alt="Gold Subscription"
                  fill
                  sizes="48px"
                  className="transform group-hover:scale-110 transition duration-200 scale-[1.9]"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Manage Gold Subscription</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <style jsx global>{`
        .gold-member-button {
          position: relative;
        }
        .gold-member-button::before {
          content: '';
          position: absolute;
          inset: -4px;
          background: linear-gradient(45deg, #FFD700, #FFA500);
          border-radius: 50%;
          z-index: -1;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .gold-member-button:hover::before {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
} 