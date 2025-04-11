"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/purchase-button";
import Image from "next/image";
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Sparkles, Unlock, Lock } from "lucide-react";

interface NavigationItem {
  id: string;
  name: string;
  tab: string;
  unlockCost?: number;
  description?: string;
  photo?: string;
}

interface UnlockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: NavigationItem | null;
  userCoins: number;
  onSuccess?: (itemId: string) => void;
  skipRedirect?: boolean;
}

export const UnlockDialog = ({
  isOpen,
  onOpenChange,
  item,
  userCoins,
  onSuccess,
  skipRedirect = false
}: UnlockDialogProps) => {
  // Feature unlock hook
  const { isUnlocking, unlockFeature } = useFeatureUnlock();
  const [showUnlockEffect, setShowUnlockEffect] = useState(false);
  
  useEffect(() => {
    // Reset effects when dialog opens/closes
    if (!isOpen) {
      setShowUnlockEffect(false);
    }
  }, [isOpen]);

  const handleUnlock = async () => {
    if (!item || !item.unlockCost) return;
    
    // Show unlock effect first
    setShowUnlockEffect(true);
    
    // Delay to show animation
    setTimeout(async () => {
      // Use the hook to handle unlocking
      const success = await unlockFeature(item.id, item.unlockCost!, item.name);
      
      if (success) {
        // Show an exciting toast message
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
            max-w-md w-full bg-[--theme-doctorsoffice-accent]/90 
            shadow-lg rounded-lg pointer-events-auto flex`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    {item.name} Unlocked!
                  </p>
                  <p className="mt-1 text-sm text-white/90">
                    You now have access to new features and content.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex border-l border-white/20"
            >
              <div className="flex items-center justify-center w-10">
                <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          </div>
        ), {
          duration: 5000,
          position: 'top-right'
        });
        
        // Close the dialog after animation
        setTimeout(() => {
          onOpenChange(false);
          
          // Call onSuccess callback if provided
          if (onSuccess) {
            // If skipRedirect is true, we want to preserve the current page context
            // by marking the item as having the skipRedirect flag
            onSuccess(skipRedirect ? `${item.id}:skipRedirect` : item.id);
          }
        }, 1500);
      } else {
        // If unlock failed, hide the effect
        setShowUnlockEffect(false);
      }
    }, 800);
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isUnlocking) onOpenChange(open);
    }}>
      <DialogContent className="bg-[--theme-mainbox-color] text-[--theme-text-color] border-[--theme-border-color] max-w-md overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold relative">
            <span className="relative z-10">Unlock {item.name}</span>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-16 bg-[--theme-doctorsoffice-accent] rounded-full"></div>
          </DialogTitle>
        </DialogHeader>
        
        <div className={`relative flex flex-col items-center gap-4 py-4 transition-all duration-500 ${showUnlockEffect ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
          {item.photo && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-48 h-40 rounded-xl overflow-hidden border-2 border-[--theme-doctorsoffice-accent] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-b from-[--theme-leaguecard-color] to-[--theme-doctorsoffice-accent]/10"
            >
              <div className="w-full h-full p-1">
                <Image 
                  src={item.photo} 
                  alt={item.name}
                  width={192}
                  height={160}
                  className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                />
              </div>
            </motion.div>
          )}
          
          <p className="text-center text-sm px-4 leading-relaxed">{item.description}</p>
          
          <div className="flex items-center justify-center gap-3 mt-3 bg-[--theme-leaguecard-color] px-5 py-3 rounded-xl shadow-inner w-full max-w-[250px]">
            <span className="font-semibold">Cost:</span>
            <div className="flex items-center bg-[--theme-doctorsoffice-accent]/20 rounded-lg px-3 py-1 hover:bg-[--theme-doctorsoffice-accent]/30 transition-colors">
              <span className="text-xl font-bold">{item.unlockCost}</span>
              <Image 
                src="/coin.png" 
                alt="coins" 
                width={28} 
                height={28} 
                className="ml-1 transform hover:rotate-12 transition-transform"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm mt-1">
            <span>Your balance:</span>
            <div className="flex items-center font-bold">
              <span>{userCoins}</span>
              <Image 
                src="/coin.png" 
                alt="coins" 
                width={18} 
                height={18} 
                className="ml-1"
              />
            </div>
          </div>
        </div>
        
        {/* Unlock effect overlay */}
        {showUnlockEffect && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-sm">
            <div className="relative">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 1] }}
                transition={{ duration: 1.5, times: [0, 0.6, 1] }}
                className="text-[--theme-doctorsoffice-accent]"
              >
                <Unlock className="w-24 h-24" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0.2, 1.5, 2], 
                  x: [-20, 20, -20, 20, 0],
                  y: [-20, 20, -20, 20, 0],
                }}
                transition={{ duration: 1.5, times: [0, 0.5, 1], delay: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-36 h-36 text-yellow-400" />
              </motion.div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-4 mt-4">
          {userCoins >= (item.unlockCost || 0) ? (
            <Button 
              className={`
                relative overflow-hidden group
                ${!showUnlockEffect ? 'bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color]' : 'bg-green-500'}
                text-[--theme-text-color] 
                py-7 rounded-xl transform hover:scale-[1.02] transition-all duration-300
                hover:shadow-lg
              `}
              onClick={handleUnlock}
              disabled={isUnlocking || showUnlockEffect}
            >
              {showUnlockEffect ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pulse text-lg">Unlocking...</span>
                </span>
              ) : isUnlocking ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 rounded-full border-3 border-white border-t-transparent animate-spin" />
                  <span className="text-lg">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Unlock className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  <span className="text-lg font-medium">Unlock for {item.unlockCost} coins</span>
                </div>
              )}
              
              {/* Button shine effect */}
              {!showUnlockEffect && !isUnlocking && (
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              )}
            </Button>
          ) : (
            <PurchaseButton 
              text="Get More Coins" 
              userCoinCount={userCoins}
              className="py-6 rounded-xl transform hover:scale-[1.02] transition-all duration-300 font-medium text-lg hover:shadow-lg"
            />
          )}
          
          <Button 
            variant="outline" 
            onClick={() => !isUnlocking && !showUnlockEffect && onOpenChange(false)}
            className={`
              border-[--theme-border-color] text-[--theme-text-color]
              py-3 rounded-lg transform hover:scale-[1.02] transition-all
              bg-transparent hover:bg-[--theme-border-color]/20
              ${(isUnlocking || showUnlockEffect) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            disabled={isUnlocking || showUnlockEffect}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 