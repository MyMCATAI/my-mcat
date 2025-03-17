import { useState, useEffect, useCallback } from 'react';
import { OnboardingInfo } from '@/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { isMobileButNotIpad } from '@/lib/utils';
import { useUser } from '@/store/selectors';

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const ONBOARDING_STEPS = {
  NAME: 1,
  COLLEGE: 2,
  ACADEMICS: 3,
  GOALS: 4,
  KALYPSO_DIALOGUE: 5,
  REFERRAL: 6,
  UNLOCK: 7,
} as const;

// Helper function to ensure type safety when setting the step
function isValidStep(step: number): step is OnboardingStep {
  return step >= 1 && step <= 7;
}

export function useOnboardingInfo() {
  const [onboardingInfo, setOnboardingInfo] = useState<OnboardingInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(ONBOARDING_STEPS.NAME);
  const router = useRouter();
  const { setOnboardingComplete, onboardingComplete } = useUser();

  // Fetch initial onboarding info
  useEffect(() => {
    const fetchOnboardingInfo = async () => {
      try {
        // If we already know onboarding is complete from Zustand store, redirect immediately
        if (onboardingComplete) {
          if (isMobileButNotIpad()) {
            router.push('/redirect');
          } else {
            router.push('/home');
          }
          return;
        }

        const response = await fetch('/api/user-info/onboarding');
        if (!response.ok) throw new Error('Failed to fetch onboarding info');

        const data = await response.json();

        // If onboarding is complete from API response, update store and redirect
        if (data?.onboardingComplete) {
          setOnboardingComplete(true);
          if (isMobileButNotIpad()) {
            router.push('/redirect');
          } else {
            router.push('/home');
          }
          return;
        }

        // First set the onboarding info
        setOnboardingInfo(data);

        // Then determine the correct step based on saved progress
        let targetStep: OnboardingStep = ONBOARDING_STEPS.NAME; // Default to first step

        if (data?.currentStep && isValidStep(data.currentStep)) {
          // If we have a saved step, use that
          targetStep = data.currentStep;
        } else if (data?.firstName) {
          // If we have firstName but no currentStep, they completed the name step
          targetStep = ONBOARDING_STEPS.COLLEGE as OnboardingStep;
        }

        // Set the step once we've determined the correct one
        setCurrentStep(targetStep);
      } catch (error) {
        console.error('Error fetching onboarding info:', error);
      }
    };

    fetchOnboardingInfo();
  }, [router, onboardingComplete, setOnboardingComplete]);

  const updateOnboardingInfo = async (updates: Partial<OnboardingInfo>) => {
    try {
      const response = await fetch('/api/user-info/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update onboarding info');

      const updatedInfo = await response.json();

      // Update local state
      setOnboardingInfo(updatedInfo);
      if (updates.currentStep && isValidStep(updates.currentStep)) {
        setCurrentStep(updates.currentStep);
      }

      return updatedInfo;
    } catch (error) {
      console.error('[updateOnboardingInfo] Error:', error);
      throw error;
    }
  };

  const handleNameSubmit = async (firstName: string) => {
    try {
      // Force create a new user info record
      const response = await fetch("/api/user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName }),
      });

      if (!response.ok) throw new Error("Failed to create user info");

      const data = await response.json();

      // Store referral redemption status
      localStorage.setItem('mymcat_show_redeem_referral_modal', data.referralRedeemed ? 'true' : 'false');

      // Update onboarding info with fresh data
      await updateOnboardingInfo({
        firstName,
        currentStep: ONBOARDING_STEPS.COLLEGE as OnboardingStep,
      });
    } catch (error) {
      console.error("Error saving name:", error);
      toast.error("Failed to save your information");
    }
  };

  const handleCollegeSubmit = async (data: {
    college: string;
    isNonTraditional: boolean;
    isCanadian: boolean;
  }) => {
    try {
      await updateOnboardingInfo({
        ...data,
        currentStep: ONBOARDING_STEPS.ACADEMICS as OnboardingStep,
      });
    } catch (error) {
      console.error("Error saving college info:", error);
      toast.error("Failed to save your information");
    }
  };

  const handleAcademicsSubmit = async (data: {
    gpa: number | null;
    currentMcatScore: number | null;
    hasNotTakenMCAT: boolean;
    mcatAttemptNumber: string;
  }) => {
    try {
      await updateOnboardingInfo({
        ...data,
        currentStep: ONBOARDING_STEPS.GOALS as OnboardingStep,
      });
    } catch (error) {
      console.error("Error saving academic info:", error);
      toast.error("Failed to save your information");
    }
  };

  const handleGoalsSubmit = async (data: {
    targetScore: number;
    targetMedSchool: string;
  }) => {
    try {
      // Update database first
      await updateOnboardingInfo({
        ...data,
        onboardingComplete: true
      });

      // Update Zustand store state
      setOnboardingComplete(true);

      // Now redirect
      if (isMobileButNotIpad()) {
        router.push('/redirect');
      } else {
        router.push('/home');
      }
    } catch (error) {
      console.error("[handleGoalsSubmit] Error:", error);
      toast.error("Failed to save your information");
    }
  };

  const handleKalypsoComplete = async () => {
    try {
      await updateOnboardingInfo({
        currentStep: ONBOARDING_STEPS.REFERRAL as OnboardingStep,
      });
    } catch (error) {
      console.error("Error completing Kalypso dialogue:", error);
      toast.error("Failed to proceed to next step");
    }
  };

  const handleReferralComplete = async (skipReferral: boolean = false) => {
    try {
      const updatedInfo = await updateOnboardingInfo({
        currentStep: ONBOARDING_STEPS.UNLOCK as OnboardingStep,
        onboardingComplete: true,
      });

      // Redirect immediately after successful update
      if (updatedInfo?.onboardingComplete) {
        if (isMobileButNotIpad()) {
          router.push('/redirect');
        } else {
          router.push('/home');
        }
      } else {
        console.error('[handleReferralComplete] Update successful but onboardingComplete not set');
      }
    } catch (error) {
      console.error("[handleReferralComplete] Error:", error);
      toast.error("Failed to proceed to next step");
    }
  };

  return {
    onboardingInfo,
    updateOnboardingInfo,
    currentStep,
    handleNameSubmit,
    handleCollegeSubmit,
    handleAcademicsSubmit,
    handleGoalsSubmit,
    handleReferralComplete,
    handleKalypsoComplete,
  };
} 