import { useState, useEffect } from 'react';
import axios from 'axios';

interface SubscriptionStatus {
  status: 'none' | 'active' | 'trialing' | 'canceled' | 'past_due';
  subscription: {
    productName: 'MDPremium' | 'MDGold';
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export function useSubscriptionStatus() {
  const [data, setData] = useState<{
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
          setData({
            status: response.data,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setData({
            status: { status: 'none', subscription: null },
            isLoading: false,
            error: 'Failed to check subscription status'
          });
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only runs once on mount

  const isPremium = data.status?.subscription?.productName === 'MDPremium' && 
    (data.status.status === 'active' || data.status.status === 'trialing');

  const isGold = data.status?.subscription?.productName === 'MDGold' && 
    (data.status.status === 'active' || data.status.status === 'trialing');

  return {
    isLoading: data.isLoading,
    error: data.error,
    isPremium,
    isGold,
    isCanceled: data.status?.subscription?.cancelAtPeriodEnd ?? false,
    currentPeriodEnd: data.status?.subscription?.currentPeriodEnd 
      ? new Date(data.status.subscription.currentPeriodEnd)
      : null,
    isActive: isPremium || isGold,
  };
} 