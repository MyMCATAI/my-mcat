import { useState, useEffect } from 'react';
import { OnboardingInfo } from '@/types';
import { toast } from 'react-hot-toast';

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

  // Fetch initial onboarding info
  useEffect(() => {
    const fetchOnboardingInfo = async () => {
      try {
        const response = await fetch('/api/user-info/onboarding');
        if (!response.ok) throw new Error('Failed to fetch onboarding info');
        
        const data = await response.json();
        setOnboardingInfo(data);
        
        // If we have currentStep in data, use that
        if (data?.currentStep && isValidStep(data.currentStep)) {
          setCurrentStep(data.currentStep);
        } else if (data?.firstName) {
          // If we have firstName but no currentStep, start at college step
          setCurrentStep(ONBOARDING_STEPS.COLLEGE);
        }
        // Otherwise stay at NAME step (default state)
      } catch (error) {
        console.error('Error fetching onboarding info:', error);
      }
    };

    fetchOnboardingInfo();
  }, []);

  const updateOnboardingInfo = async (updates: Partial<OnboardingInfo>) => {
    try {
      const response = await fetch('/api/user-info/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update onboarding info');

      const updatedInfo = await response.json();
      setOnboardingInfo(updatedInfo);
      if (updates.currentStep && isValidStep(updates.currentStep)) {
        setCurrentStep(updates.currentStep);
      }
    } catch (error) {
      console.error('Error updating onboarding info:', error);
      throw error;
    }
  };

  const handleNameSubmit = async (firstName: string) => {
    try {
      // Create initial user info
      const response = await fetch("/api/user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName }),
      });

      if (!response.ok) throw new Error("Failed to create user info");

      // Update onboarding info
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
      await updateOnboardingInfo({
        ...data,
        currentStep: ONBOARDING_STEPS.KALYPSO_DIALOGUE as OnboardingStep,
      });
    } catch (error) {
      console.error("Error saving goals:", error);
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
      await updateOnboardingInfo({
        currentStep: ONBOARDING_STEPS.UNLOCK as OnboardingStep,
        onboardingComplete: true,
      });
    } catch (error) {
      console.error("Error completing referral step:", error);
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