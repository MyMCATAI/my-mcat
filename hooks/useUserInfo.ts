import { OnboardingInfo } from "@/types";
import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

export interface UserInfo {
  unlocks?: string[];
  userId: string;
  bio: string;
  firstName: string;
  apiCount: number;
  score: number;
  streak: number;
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
  notificationPreference?: string;
  onboardingInfo?: OnboardingInfo;
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
    friendEmail: string;
  }) => Promise<void>;
  checkHasReferrals: () => Promise<boolean>;
  unlockGame: () => Promise<void>;
  createNewUser: (data: { firstName: string; bio?: string }) => Promise<UserInfo>;
  isSubscribed: boolean;
}

// Helper function to check if onboarding is complete
function isOnboardingComplete(onboardingInfo?: OnboardingInfo): boolean {
  if (!onboardingInfo) return false;

  // Only check for targetScore
  const targetScore = onboardingInfo.targetScore;
  return targetScore !== undefined && targetScore !== null && targetScore > 0;
}

// Helper function to check if a path is accessible based on subscription
function canAccessPath(subscriptionType: string | undefined, currentPath: string): boolean {
  // System paths that are always accessible
  const systemPaths = ['/api', '/auth'];
  if (systemPaths.some(path => currentPath.startsWith(path))) {
    return true;
  }

  // Paths accessible to all users
  const unrestrictedPaths = ['/onboarding', '/offer','/doctorsoffice', '/preferences'];
  if (unrestrictedPaths.some(path => currentPath.startsWith(path))) {
    return true;
  }

  // All other paths require gold or premium subscription
  return subscriptionType === 'gold' || subscriptionType === 'premium';
}

// Helper function to determine if and where to redirect
async function checkRedirectPath(userInfo: UserInfo | null, currentPath: string): Promise<string | null> {
  // Don't redirect if already on redirect page
  if (currentPath === '/redirect') return null;

  // Don't redirect to onboarding if we're already there
  if (currentPath.startsWith('/onboarding') || currentPath.startsWith('/offer')) return null;

  // No user info -> onboarding
  if (!userInfo) return '/onboarding';

  // Incomplete onboarding -> onboarding
  if (!isOnboardingComplete(userInfo.onboardingInfo)) return '/onboarding';

  // Check subscription-based access
  if (!canAccessPath(userInfo.subscriptionType, currentPath)) {
    return '/doctorsoffice';
  }

  // Only exempt paths from study plan check
  const studyPlanExemptPaths = ['/examcalendar', '/api', '/auth', '/onboarding', '/redirect'];
  const shouldCheckStudyPlan = !studyPlanExemptPaths.some(path => currentPath.startsWith(path));

  // Subscribed users -> check study plan (unless on exempt path)
  if (shouldCheckStudyPlan && (userInfo.subscriptionType === 'gold' || userInfo.subscriptionType === 'premium')) {
    try {
      const studyPlanResponse = await fetch('/api/study-plan');
      if (!studyPlanResponse.ok) {
        throw new Error('Failed to fetch study plan');
      }
      const studyPlanData = await studyPlanResponse.json();

      if (!studyPlanData.studyPlan) return '/examcalendar';
    } catch (error) {
      console.error('Error fetching study plan:', error);
    }
  }

  return null;
}

// Helper function to handle redirect checks and navigation
async function handleRedirect(userInfo: UserInfo | null): Promise<boolean> {
  const redirectPath = await checkRedirectPath(userInfo, window.location.pathname);
  if (redirectPath) {
    window.location.href = redirectPath;
    return true;
  }
  return false;
}

// Helper function to check if user has a subscription
function checkSubscription(userInfo: UserInfo | null): boolean {
  if (!userInfo) return false;
  return (userInfo.subscriptionType === 'gold' || userInfo.subscriptionType === 'premium');
}

export function useUserInfo(): UseUserInfoReturn {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);

  // Add computed property for subscription status
  const isSubscribed = checkSubscription(userInfo); // note this just checks if the userInfo subscriptiontype is "gold" or "premium", we dont actually check if there is a stripe subscription record
  const fetchUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user-info");

      // Handle non-existent user case
      if (response.status === 404 || response.status === 500) {
        if (await handleRedirect(null)) return;
        setUserInfo(null);
        return;
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error("Failed to fetch user info");
      }

      // Handle successful response
      const data = await response.json();
      setUserInfo(data);
      await handleRedirect(data);

    } catch (err) {
      console.error("Error fetching user info:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch user info"));
      if (err instanceof Error && !err.message.includes('404')) {
        toast.error("Failed to load user information");
      }
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
        toast.success("Referral sent successfully");
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
          // decrementScore: CLINIC_COST
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
      setUserInfo(newUserInfo);
      return newUserInfo;
    } catch (err) {
      toast.error("Failed to create user profile");
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
    createNewUser,
    isSubscribed,
  };
}

