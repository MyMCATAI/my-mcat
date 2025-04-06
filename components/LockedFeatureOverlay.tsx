"use client";

import { useState, useCallback } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useUser } from "@/store/selectors";
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { UnlockDialog } from "@/components/unlock-dialog";
import { NAVIGATION_ITEMS, FEATURE_UNLOCK } from "@/components/navigation/HoverSidebar";

interface LockedFeatureOverlayProps {
  featureId: FEATURE_UNLOCK;
}

const LockedFeatureOverlay = ({ featureId }: LockedFeatureOverlayProps) => {
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const { coins } = useUser();
  const { isFeatureUnlocked } = useFeatureUnlock();

  // Find the navigation item that matches the featureId
  const featureItem = NAVIGATION_ITEMS.find(item => item.id === featureId);
  
  // If feature is already unlocked or the feature doesn't exist, don't render the overlay
  if (isFeatureUnlocked(featureId) || !featureItem) {
    return null;
  }

  // Handle unlock dialog open
  const handleUnlock = () => {
    setUnlockDialogOpen(true);
  };

  // Handle successful unlock
  const handleUnlockSuccess = (itemId: string) => {
    // The dialog will close itself, and the parent component will re-render
    // when the feature is unlocked due to the isFeatureUnlocked hook
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[--theme-mainbox-color]/90 backdrop-blur-sm z-50 rounded-lg overflow-hidden">
      <div className="flex flex-col items-center p-8 max-w-md text-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 blur animate-pulse"></div>
          <div className="relative bg-[--theme-leaguecard-color] p-4 rounded-full">
            <Lock className="w-16 h-16 text-[--theme-doctorsoffice-accent]" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[--theme-text-color]">
          {featureItem.name} is Locked
        </h2>
        
        <p className="text-[--theme-text-color] opacity-80">
          {featureItem.description || `Unlock ${featureItem.name} to access this feature.`}
        </p>

        {featureItem.photo && (
          <div className="relative w-60 h-40 rounded-xl overflow-hidden border-2 border-[--theme-doctorsoffice-accent] shadow-lg">
            <Image
              src={featureItem.photo}
              alt={featureItem.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-6 bg-[--theme-leaguecard-color] px-5 py-3 rounded-xl shadow-inner">
          <span className="font-semibold">Cost:</span>
          <div className="flex items-center bg-[--theme-doctorsoffice-accent]/20 rounded-lg px-3 py-1">
            <span className="text-xl font-bold">{featureItem.unlockCost}</span>
            <Image 
              src="/coin.png" 
              alt="coins" 
              width={28} 
              height={28} 
              className="ml-1" 
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm">
          <span>Your balance:</span>
          <div className="flex items-center font-bold">
            <span>{coins}</span>
            <Image 
              src="/coin.png" 
              alt="coins" 
              width={18} 
              height={18} 
              className="ml-1" 
            />
          </div>
        </div>

        <Button 
          onClick={handleUnlock}
          className="w-full max-w-xs mt-4 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color] py-6"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Unlock Now</span>
          </div>
        </Button>
      </div>

      {/* UnlockDialog component */}
      <UnlockDialog 
        isOpen={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        item={featureItem}
        userCoins={coins}
        onSuccess={handleUnlockSuccess}
      />
    </div>
  );
};

export default LockedFeatureOverlay; 