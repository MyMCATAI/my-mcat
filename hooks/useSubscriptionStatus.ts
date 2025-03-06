import { useUserInfo } from './useUserInfo';
import axios from 'axios';
import { useState, useEffect } from 'react';

interface SubscriptionStatus {
  status: 'none' | 'active' | 'trialing' | 'canceled' | 'past_due';
  subscription: {
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    subscriptionType: string;
    trialEnd?: Date;
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

  // Check if user is in trial based on subscriptionType containing "_Trial"
  const hasTrialSuffix = userInfo?.subscriptionType?.includes('_Trial') || false;
  
  // Determine trial status from Stripe or from subscriptionType
  const isTrialing = stripeData.status?.status === 'trialing' || hasTrialSuffix;
  
  // Check premium status - true if subscriptionType is "Premium" or "Premium_Trial"
  const isPremium = userInfo?.subscriptionType?.startsWith('Premium') && 
    (stripeData.status?.status === 'active' || isTrialing);
  
  // Check gold status - true if subscriptionType is "Gold" or "Gold_Trial"
  const isGold = userInfo?.subscriptionType?.toLowerCase().startsWith('gold') || (stripeData.status?.status === 'active' || isTrialing) || false
  
  const isCanceled = stripeData.status?.subscription?.cancelAtPeriodEnd ?? false;

  // Calculate trial end date
  const trialEnd = stripeData.status?.subscription?.trialEnd;
  // Calculate days remaining in trial if in trial period
  const trialDaysRemaining = trialEnd ? 
    Math.max(0, Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
    null;

  return {
    isLoading: userInfoLoading || stripeData.isLoading,
    error: userInfoError?.message || stripeData.error,
    isPremium,
    isGold,
    isCanceled,
    isTrialing,
    trialEnd,
    trialDaysRemaining,
    currentPeriodEnd: stripeData.status?.subscription?.currentPeriodEnd,
    isActive: isPremium || isGold,
    stripeStatus: stripeData.status?.status || 'none',
    // Map subscription type to a status
    subscriptionStatus: isTrialing ? 'trial' : 
                        (isPremium || isGold) ? 'active' : 
                        isCanceled ? 'cancelled' : 'none'
  };
} 