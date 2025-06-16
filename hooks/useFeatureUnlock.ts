import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useUser } from "@/store/selectors";
import { useRouter } from "next/navigation";
import { FEATURE_UNLOCK } from "@/components/navigation/HoverSidebar";

// Union type to support both string and enum values for backward compatibility
type FeatureId = FEATURE_UNLOCK | string;

interface UnlockResult {
  success: boolean;
  error?: string;
  required?: number;
  type?: 'insufficient_coins' | 'server_error' | 'unknown';
}

interface UseFeatureUnlockResult {
  isUnlocking: boolean;
  unlockFeature: (featureId: FeatureId, cost: number, name: string, navigateTo?: string, showPurchaseDialog?: boolean) => Promise<UnlockResult>;
  isFeatureUnlocked: (featureId: FeatureId) => boolean;
}

export const useFeatureUnlock = (): UseFeatureUnlockResult => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { userInfo, refreshUserInfo } = useUser();
  const router = useRouter();
  
  // Parse the unlocks from userInfo
  const userUnlocks = userInfo?.unlocks 
    ? (typeof userInfo.unlocks === 'string' ? JSON.parse(userInfo.unlocks) : userInfo.unlocks) 
    : [];
  
  // Check if a feature is unlocked
  const isFeatureUnlocked = useCallback((featureId: FeatureId) => {
    // AnkiClinic check removed - general check below handles it
    return Array.isArray(userUnlocks) && userUnlocks.includes(featureId);
  }, [userUnlocks]);
  
  // Unlock a feature by ID and cost
  const unlockFeature = useCallback(async (
    featureId: FeatureId, 
    cost: number, 
    name: string,
    navigateTo?: string,
    showPurchaseDialog: boolean = true
  ): Promise<UnlockResult> => {
    if (isFeatureUnlocked(featureId)) {
      toast.success(`${name} is already unlocked!`);
      return { success: true };
    }
    
    try {
      setIsUnlocking(true);
      
      const response = await fetch('/api/user-info/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureId,
          cost
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === "Insufficient coins") {
          if (!showPurchaseDialog) {
            toast.error(`You need ${errorData.required} coins to unlock this feature.`);
          }
          return { 
            success: false, 
            error: errorData.error,
            required: errorData.required,
            type: 'insufficient_coins'
          };
        } else {
          const errorMessage = `Failed to unlock: ${errorData.error || 'Unknown error'}`;
          toast.error(errorMessage);
          return { 
            success: false, 
            error: errorMessage,
            type: 'server_error'
          };
        }
      }
      
      const data = await response.json();
      
      // Refresh user info to update coins and unlocks
      await refreshUserInfo();
      
      // Show success message
      toast.success(`${name} unlocked successfully!`);
      
      // Navigate if a target is provided
      if (navigateTo) {
        router.push(navigateTo);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error unlocking feature:', error);
      const errorMessage = 'Failed to unlock feature. Please try again.';
      toast.error(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        type: 'unknown'
      };
    } finally {
      setIsUnlocking(false);
    }
  }, [isFeatureUnlocked, refreshUserInfo, router]);
  
  return {
    isUnlocking,
    unlockFeature,
    isFeatureUnlocked
  };
}; 