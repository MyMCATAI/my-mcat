"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GoldSubscriptionCard } from "@/app/(auth)/(routes)/onboarding/components/GoldSubscriptionCard";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import axios from "axios";
import { toast } from "react-hot-toast";

interface UpgradeToGoldButtonProps {
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function UpgradeToGoldButton({
  variant = "default",
  size = "default",
  className = "",
  children
}: UpgradeToGoldButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isGold } = useSubscriptionStatus();

  const handleClick = async () => {
    if (isGold) {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/stripe");
        window.location.href = response.data.url;
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load subscription management. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          ${className}
          relative group overflow-hidden
          ${isGold 
            ? 'bg-gradient-to-r from-sky-400 via-blue-400 to-sky-400 text-[--theme-text-color]' 
            : variant === "default" 
              ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-900" 
              : ""
          }
          ${variant === "secondary" && !isGold ? "bg-[--theme-leaguecard-color]" : ""}
          ${variant === "outline" && !isGold ? "border-2 border-amber-500/50" : ""}
          ${size === "default" ? "px-4 py-2" : ""}
          ${size === "sm" ? "px-3 py-1 text-sm" : ""}
          ${size === "lg" ? "px-6 py-3 text-lg" : ""}
          rounded-lg transition-all duration-300
          transform hover:scale-[1.02]
          font-semibold
          ${isGold 
            ? 'shadow-[0_0_20px_rgba(186,230,253,0.4)] hover:shadow-[0_0_30px_rgba(186,230,253,0.5)]'
            : 'shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[25deg] -translate-x-32 group-hover:transition-transform group-hover:duration-1000 group-hover:translate-x-[500%]" />
        
        {/* Border glow */}
        <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${
          isGold 
            ? 'from-sky-400/0 via-sky-400/50 to-sky-400/0'
            : 'from-amber-400/0 via-amber-400/50 to-amber-400/0'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Content */}
        <div className="relative flex items-center justify-center gap-2">
          {/* Icon */}
          {isGold ? (
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ) : (
            <svg 
              className="w-5 h-5" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
            >
              <path 
                d="M3 8l3.5 9h11L21 8l-4.5 3-4.5-6-4.5 6L3 8z" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span>
            {isLoading 
              ? "Loading..." 
              : isGold 
                ? "Manage Subscription" 
                : children || "Upgrade to Gold"
            }
          </span>
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-4xl p-8 rounded-lg"
          style={{
            backgroundColor: "var(--theme-mainbox-color)",
            color: "var(--theme-text-color)",
            borderColor: "var(--theme-border-color)",
            borderWidth: "1px",
            borderStyle: "solid"
          }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent pointer-events-none rounded-lg" />
          
          {/* Top decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          
          <div className="relative">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-amber-400/50" />
                <h2 className="text-2xl font-bold" style={{ color: "var(--theme-text-color)" }}>
                  Upgrade to <span className="text-amber-500">Gold</span>
                </h2>
                <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-amber-400/50" />
              </div>
              <p style={{ color: "var(--theme-text-color)", opacity: 0.8 }}>
                Unlock premium features and accelerate your MCAT preparation
              </p>
            </div>
            
            {/* Subscription card */}
            <div className="transform hover:scale-[1.01] transition-transform duration-300">
              <GoldSubscriptionCard />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 