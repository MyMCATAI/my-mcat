import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useUser } from "@/store/selectors";
import { UserInfo, Referral } from "@/types/user";
import { isWithin14Days } from "@/lib/utils";

interface UseUserInfoReturn {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: Error | null;
  updateScore: (amount: number) => Promise<void>;
  updateNotificationPreference: (preference: boolean) => Promise<void>;
  updateUserProfile: (data: {
    firstName?: string;
    bio?: string;
  }) => Promise<void>;
  incrementScore: () => Promise<void>;
  decrementScore: () => Promise<void>;
  refetch: () => Promise<void>;
  referrals: Referral[];
  isLoadingReferrals: boolean;
  fetchReferrals: () => Promise<void>;
  createReferral: (data: {
    friendEmail: string;
  }) => Promise<void>;
  checkHasReferrals: () => Promise<boolean>;
  unlockGame: () => Promise<void>;
  createNewUser: (data: { firstName: string; bio?: string }) => Promise<UserInfo>;
  isSubscribed: boolean;
  hasSeenIntroVideo: boolean;
  setHasSeenIntroVideo: (hasSeenVideo: boolean) => Promise<void>;
}

export const useUserInfo = (): UseUserInfoReturn => {
  const { user, isSignedIn, isLoaded } = useClerkUser();
  const { 
    userInfo,
    isSubscribed,
    setIsSubscribed,
    refreshUserInfo,
    setHasSeenIntroVideo
  } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const perfTrackingRef = useRef({
    fetchStartTime: 0,
    lastRefreshTime: 0,
    fetchCount: 0
  });
  
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // Get hasSeenIntroVideo from userInfo.onboardingInfo
  const hasSeenIntroVideo = useMemo(() => {
    const value = userInfo?.onboardingInfo?.hasSeenIntroVideo || false;
    // Only log if the value changes from the previous render
    return value;
  }, [userInfo]);

  // Debounced fetch function to prevent multiple rapid refreshes
  const debouncedFetchUserInfo = useCallback(async () => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set a new timeout
    fetchTimeoutRef.current = setTimeout(async () => {
      if (!isSignedIn) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Track performance
        perfTrackingRef.current.fetchStartTime = Date.now();
        perfTrackingRef.current.fetchCount++;
        console.log(`[useUserInfo] Starting debounced fetch #${perfTrackingRef.current.fetchCount}`);
        
        // Refresh user info in store
        await refreshUserInfo();
        
        // Log performance
        const fetchTime = Date.now() - perfTrackingRef.current.fetchStartTime;
        console.log(`[useUserInfo] Debounced fetch completed in ${fetchTime}ms`);
        
        // Track time since last refresh
        const timeSinceLastRefresh = perfTrackingRef.current.lastRefreshTime ? 
          Date.now() - perfTrackingRef.current.lastRefreshTime : null;
        if (timeSinceLastRefresh) {
          console.log(`[useUserInfo] Time since last refresh: ${timeSinceLastRefresh}ms`);
        }
        perfTrackingRef.current.lastRefreshTime = Date.now();
        
      } catch (error) {
        console.error('[useUserInfo] Failed to fetch user info:', error);
      } finally {
        setIsLoading(false);
      }
      
      fetchTimeoutRef.current = null;
    }, 300); // 300ms debounce
  }, [isSignedIn, refreshUserInfo]);

  const fetchUserInfo = useCallback(async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Track performance
      const fetchStartTime = Date.now();
      console.log('[useUserInfo] Starting initial fetch');
      
      // Refresh user info in store
      await refreshUserInfo();
      
      console.log(`[useUserInfo] Initial fetch completed in ${Date.now() - fetchStartTime}ms`);
      perfTrackingRef.current.lastRefreshTime = Date.now();
      
    } catch (error) {
      console.error('[useUserInfo] Failed to fetch user info:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, refreshUserInfo]);

  useEffect(() => {
    if (user?.id && !hasInitialized.current) {
      console.log('[useUserInfo] Initializing with user ID:', user.id);
      hasInitialized.current = true;
      const initializeStartTime = Date.now();
      
      fetchUserInfo().then(() => {
        console.log(`[useUserInfo] Initialization completed in ${Date.now() - initializeStartTime}ms`);
      });
    }
  }, [user?.id, fetchUserInfo]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Check if user is in 14-day trial period directly from userInfo
  const isNewUserTrial = userInfo?.createdAt ? isWithin14Days(new Date(userInfo.createdAt)) : false;

  const updateScore = useCallback(async (amount: number) => {
    try {
      const response = await fetch('/api/user/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) throw new Error();

      // Use debounced refresh
      debouncedFetchUserInfo();

    } catch (error) {
      console.error('Failed to update score:', error);
      toast.error('Failed to update score');
    }
  }, [debouncedFetchUserInfo]);

  const updateNotificationPreference = useCallback(
    async (preference: boolean) => {
      try {
        const response = await fetch("/api/user-info", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationPreference: preference }),
        });

        if (!response.ok) {
          throw new Error("Failed to update notification preference");
        }

        const data = await response.json();
        debouncedFetchUserInfo();
      } catch (err) {
        toast.error("Failed to update notification preferences");
        throw err;
      }
    },
    [debouncedFetchUserInfo]
  );

  const updateUserProfile = useCallback(
    async (data: { firstName?: string; bio?: string }) => {
      try {
        const response = await fetch("/api/user-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update user profile");
        }

        const updatedData = await response.json();
        debouncedFetchUserInfo();
      } catch (err) {
        toast.error("Failed to update profile");
        throw err;
      }
    },
    [debouncedFetchUserInfo]
  );

  const incrementScore = useCallback(async () => {
    try {
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incrementScore: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to increment score");
      }

      const data = await response.json();
      debouncedFetchUserInfo();
    } catch (err) {
      toast.error("Failed to increment score");
      throw err;
    }
  }, [debouncedFetchUserInfo]);

  const decrementScore = useCallback(async () => {
    try {
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decrementScore: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to decrement score");
      }

      const data = await response.json();
      debouncedFetchUserInfo();
    } catch (err) {
      toast.error("Failed to decrement score");
      throw err;
    }
  }, [debouncedFetchUserInfo]);

  const fetchReferrals = useCallback(async () => {
    try {
      const response = await fetch("/api/referrals");
      if (!response.ok) throw new Error("Failed to fetch referrals");
      const data = await response.json();
      debouncedFetchUserInfo();
    } catch (err) {
      toast.error("Failed to load referrals");
      throw err;
    }
  }, [debouncedFetchUserInfo]);

  const createReferral = useCallback(async (data: { friendEmail: string }) => {
    try {
      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create referral");
      }

      const newReferral = await response.json();
      debouncedFetchUserInfo();

      toast.success("Referral sent successfully");
    } catch (err) {
      toast.error("Failed to create referral");
      throw err;
    }
  }, [debouncedFetchUserInfo]);

  const checkHasReferrals = useCallback(async () => {
    try {
      const response = await fetch("/api/referrals?checkExistence=true");
      if (!response.ok) {
        throw new Error("Failed to check referrals");
      }

      const data = await response.json();
      return data.exists;
    } catch (err) {
      console.error("Failed to check referrals:", err);
      return false;
    }
  }, []);

  const unlockGame = useCallback(async () => {
    try {
      const response = await fetch('/api/user-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unlockGame: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unlock game');
      }

      const data = await response.json();
      debouncedFetchUserInfo();

      toast.success('Welcome to the Anki Clinic!');
    } catch (err) {
      toast.error('Failed to unlock the Anki Clinic');
      throw err;
    }
  }, [debouncedFetchUserInfo]);

  const createNewUser = useCallback(async (data: { firstName: string; bio?: string }) => {
    try {
      const response = await fetch("/api/user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const newUserInfo = await response.json();
      debouncedFetchUserInfo();
      return newUserInfo;
    } catch (err) {
      toast.error("Failed to create user profile");
      throw err;
    }
  }, [debouncedFetchUserInfo]);

  return {
    userInfo,
    isLoading,
    error: null,
    updateScore,
    updateNotificationPreference,
    updateUserProfile,
    incrementScore,
    decrementScore,
    refetch: fetchUserInfo,
    referrals,
    isLoadingReferrals: false,
    fetchReferrals,
    createReferral,
    checkHasReferrals,
    unlockGame,
    createNewUser,
    isSubscribed: !!userInfo?.hasPaid || isNewUserTrial,
    hasSeenIntroVideo,
    setHasSeenIntroVideo
  };
};

