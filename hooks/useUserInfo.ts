import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

interface UserInfo {
  unlocks?: string[];
  userId: string;
  bio: string;
  firstName: string;
  apiCount: number;
  score: number;
  clinicRooms: string;
  hasPaid: boolean;
  subscriptionType: string;
  diagnosticScores: {
    total: string;
    cp: string;
    cars: string;
    bb: string;
    ps: string;
  };
  notificationPreference?: boolean;
}

interface Referral {
  id: string;
  userId: string;
  referrerName: string;
  referrerEmail: string;
  friendEmail: string;
  friendUserId: string;
  createdAt: Date;
  joinedAt: Date | null;
}

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
    referrerName?: string;
    referrerEmail?: string;
    friendEmail: string;
  }) => Promise<void>;
  checkHasReferrals: () => Promise<boolean>;
  unlockGame: () => Promise<void>;
}

const CLINIC_COST = 10;

export function useUserInfo(): UseUserInfoReturn {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);

  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/user-info");

      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch user info")
      );
      toast.error("Failed to load user information");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const updateScore = useCallback(async (amount: number) => {
    try {
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to update score");
      }

      const data = await response.json();
      setUserInfo((prev) => (prev ? { ...prev, score: data.score } : null));
    } catch (err) {
      toast.error("Failed to update score");
      throw err;
    }
  }, []);

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
        setUserInfo((prev) =>
          prev
            ? { ...prev, notificationPreference: data.notificationPreference }
            : null
        );
      } catch (err) {
        toast.error("Failed to update notification preferences");
        throw err;
      }
    },
    []
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
        setUserInfo((prev) => (prev ? { ...prev, ...updatedData } : null));
      } catch (err) {
        toast.error("Failed to update profile");
        throw err;
      }
    },
    []
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
      setUserInfo((prev) => (prev ? { ...prev, score: data.score } : null));
    } catch (err) {
      toast.error("Failed to increment score");
      throw err;
    }
  }, []);

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
      setUserInfo((prev) => (prev ? { ...prev, score: data.score } : null));
    } catch (err) {
      toast.error("Failed to decrement score");
      throw err;
    }
  }, []);

  const fetchReferrals = useCallback(async () => {
    try {
      setIsLoadingReferrals(true);
      const response = await fetch("/api/referrals");

      if (!response.ok) {
        throw new Error("Failed to fetch referrals");
      }

      const data = await response.json();
      setReferrals(data);
    } catch (err) {
      toast.error("Failed to load referrals");
      throw err;
    } finally {
      setIsLoadingReferrals(false);
    }
  }, []);

  const createReferral = useCallback(
    async (data: {
      referrerName?: string;
      referrerEmail?: string;
      friendEmail: string;
    }) => {
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
        setReferrals((prev) => [newReferral, ...prev]);
        toast.success("Referral created successfully");
      } catch (err) {
        toast.error("Failed to create referral");
        throw err;
      }
    },
    []
  );

  // Fetch referrals on mount
  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

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
          decrementScore: CLINIC_COST
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unlock game');
      }

      const data = await response.json();
      setUserInfo(prev => prev ? { ...prev, unlocks: [...(prev.unlocks || []), 'game'] } : null);
      toast.success('Welcome to the Anki Clinic!');
    } catch (err) {
      toast.error('Failed to unlock the Anki Clinic');
      throw err;
    }
  }, []);

  return {
    userInfo,
    isLoading,
    error,
    updateScore,
    updateNotificationPreference,
    updateUserProfile,
    incrementScore,
    decrementScore,
    refetch: fetchUserInfo,
    referrals,
    isLoadingReferrals,
    fetchReferrals,
    createReferral,
    checkHasReferrals,
    unlockGame,
  };
}
