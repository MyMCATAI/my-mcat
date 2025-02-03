import { useUserInfo } from './useUserInfo';
import axios from 'axios';
import { useState, useEffect } from 'react';

interface SubscriptionStatus {
  status: 'none' | 'active' | 'trialing' | 'canceled' | 'past_due';
  subscription: {
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    subscriptionType: string;
  } | null;
}

export function useSubscriptionStatus() {
  const { userInfo, isLoading: userInfoLoading, error: userInfoError } = useUserInfo();
  const [stripeData, setStripeData] = useState<{
    status: SubscriptionStatus | null;
    isLoading: boolean;
    error: string | null;
  }>({
    status: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const response = await axios.get('/api/subscription/status');
        if (isMounted) {
          setStripeData({
            status: response.data,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setStripeData({
            status: null,
            isLoading: false,
            error: 'Failed to check subscription status'
          });
        }
      }
    };

    // Always check status regardless of userInfo.subscriptionType
    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [userInfo?.userId]); // Only depend on userId to prevent unnecessary rechecks

  const isPremium = userInfo?.subscriptionType === 'premium' && stripeData.status?.status === 'active';
  const isGold = userInfo?.subscriptionType === 'gold' && stripeData.status?.status === 'active';
  const isCanceled = stripeData.status?.subscription?.cancelAtPeriodEnd ?? false;

  return {
    isLoading: userInfoLoading || stripeData.isLoading,
    error: userInfoError?.message || stripeData.error,
    isPremium,
    isGold,
    isCanceled,
    currentPeriodEnd: stripeData.status?.subscription?.currentPeriodEnd,
    isActive: isPremium || isGold,
    stripeStatus: stripeData.status?.status || 'none'
  };
} 