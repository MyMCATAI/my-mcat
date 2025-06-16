//components/FeatureUnlockWithPurchase.tsx
"use client";

import { useState } from "react";
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { PurchaseButton } from "@/components/purchase-button";
import { useUser } from "@/store/selectors";

interface FeatureUnlockWithPurchaseProps {
  featureId: string;
  cost: number;
  name: string;
  navigateTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  children: (unlockFeature: () => Promise<void>) => React.ReactNode;
}

export const FeatureUnlockWithPurchase = ({
  featureId,
  cost,
  name,
  navigateTo,
  onSuccess,
  onError,
  children
}: FeatureUnlockWithPurchaseProps) => {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const { unlockFeature } = useFeatureUnlock();
  const { userInfo } = useUser();

  const handleUnlock = async () => {
    try {
      const result = await unlockFeature(featureId, cost, name, navigateTo, false);
      
      if (result.success) {
        onSuccess?.();
      } else if (result.type === 'insufficient_coins') {
        setShowPurchaseDialog(true);
      } else {
        onError?.(result.error || 'Unknown error');
      }
    } catch (error) {
      onError?.('Failed to unlock feature');
    }
  };

  return (
    <>
      {children(handleUnlock)}
      
      {/* Purchase Dialog for insufficient coins */}
      <PurchaseButton
        autoOpen={showPurchaseDialog}
        userCoinCount={userInfo?.score || 0}
      />
    </>
  );
};