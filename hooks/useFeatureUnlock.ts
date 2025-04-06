import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useUser } from "@/store/selectors";
import { useRouter } from "next/navigation";
import { FEATURE_UNLOCK } from "@/components/navigation/HoverSidebar";

// Union type to support both string and enum values for backward compatibility
type FeatureId = FEATURE_UNLOCK | string;

interface UseFeatureUnlockResult {
  isUnlocking: boolean;
  unlockFeature: (featureId: FeatureId, cost: number, name: string, navigateTo?: string) => Promise<boolean>;
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
    // AnkiClinic is always unlocked
    if (featureId === FEATURE_UNLOCK.ANKICLINIC || featureId === 'ankiclinic') return true;
    
    return Array.isArray(userUnlocks) && userUnlocks.includes(featureId);
  }, [userUnlocks]);
  
  // Unlock a feature by ID and cost
  const unlockFeature = useCallback(async (
    featureId: FeatureId, 
    cost: number, 
    name: string,
    navigateTo?: string
  ): Promise<boolean> => {
    if (isFeatureUnlocked(featureId)) {
      toast.success(`${name} is already unlocked!`);
      return true;
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
          toast.error(`You need ${errorData.required} coins to unlock this feature.`);
        } else {
          toast.error(`Failed to unlock: ${errorData.error || 'Unknown error'}`);
        }
        return false;
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
      
      return true;
    } catch (error) {
      console.error('Error unlocking feature:', error);
      toast.error('Failed to unlock feature. Please try again.');
      return false;
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