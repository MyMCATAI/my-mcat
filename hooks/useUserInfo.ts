import { useState, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useUser as useClerkUser } from "@clerk/nextjs";
import { useUser } from "@/store/selectors";
import { UserInfo, Referral } from "@/types/user";

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
}

export const useUserInfo = (): UseUserInfoReturn => {
  const { user } = useClerkUser();
  const { userInfo, refreshUserInfo } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);
  
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const fetchUserInfo = useCallback(async () => {
    try {
      await refreshUserInfo();
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      toast.error('Failed to load user info');
    } finally {
      setIsLoading(false);
    }
  }, [refreshUserInfo]);

  useEffect(() => {
    if (user?.id && !hasInitialized.current) {
      hasInitialized.current = true;
      fetchUserInfo();
    }
  }, [user?.id, fetchUserInfo]);

  const updateScore = useCallback(async (amount: number) => {
    try {
      const response = await fetch('/api/user/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) throw new Error();

      // Refresh userInfo to update all components
      await refreshUserInfo();

    } catch (error) {
      console.error('Failed to update score:', error);
      toast.error('Failed to update score');
    }
  }, [refreshUserInfo]);

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
        refreshUserInfo();
      } catch (err) {
        toast.error("Failed to update notification preferences");
        throw err;
      }
    },
    [refreshUserInfo]
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
        refreshUserInfo();
      } catch (err) {
        toast.error("Failed to update profile");
        throw err;
      }
    },
    [refreshUserInfo]
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
      refreshUserInfo();
    } catch (err) {
      toast.error("Failed to increment score");
      throw err;
    }
  }, [refreshUserInfo]);

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
      refreshUserInfo();
    } catch (err) {
      toast.error("Failed to decrement score");
      throw err;
    }
  }, [refreshUserInfo]);

  const fetchReferrals = useCallback(async () => {
    try {
      const response = await fetch("/api/referrals");
      if (!response.ok) throw new Error("Failed to fetch referrals");
      const data = await response.json();
      refreshUserInfo();
    } catch (err) {
      toast.error("Failed to load referrals");
      throw err;
    }
  }, [refreshUserInfo]);

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
      refreshUserInfo();

      toast.success("Referral sent successfully");
    } catch (err) {
      toast.error("Failed to create referral");
      throw err;
    }
  }, [refreshUserInfo]);

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
      refreshUserInfo();

      toast.success('Welcome to the Anki Clinic!');
    } catch (err) {
      toast.error('Failed to unlock the Anki Clinic');
      throw err;
    }
  }, [refreshUserInfo]);

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
      refreshUserInfo();
      return newUserInfo;
    } catch (err) {
      toast.error("Failed to create user profile");
      throw err;
    }
  }, [refreshUserInfo]);

  return {
    userInfo: userInfo as UserInfo | null,
    isLoading,
    isSubscribed: userInfo?.subscriptionType === 'gold' || userInfo?.subscriptionType === 'premium',
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
    error: null
  };
};

