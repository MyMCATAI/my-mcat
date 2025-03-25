import { useState, useEffect } from 'react';
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

// Type for tracking request state
type RequestState = {
  loading: boolean;
  error: Error | null;
  success: boolean;
};

// Initial request state
const initialRequestState: RequestState = {
  loading: false,
  error: null,
  success: false,
};

export function useOnboardingInfo() {
  const [onboardingInfo, setOnboardingInfo] = useState<OnboardingInfo | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(ONBOARDING_STEPS.NAME);
  const router = useRouter();
  const { setOnboardingComplete, onboardingComplete, userInfo, refreshUserInfo } = useUser();
  
  // Request states for all operations
  const [fetchState, setFetchState] = useState<RequestState>({...initialRequestState});
  const [updateState, setUpdateState] = useState<RequestState>({...initialRequestState});
  const [nameSubmitState, setNameSubmitState] = useState<RequestState>({...initialRequestState});
  const [collegeSubmitState, setCollegeSubmitState] = useState<RequestState>({...initialRequestState});
  const [academicsSubmitState, setAcademicsSubmitState] = useState<RequestState>({...initialRequestState});
  const [goalsSubmitState, setGoalsSubmitState] = useState<RequestState>({...initialRequestState});
  const [kalypsoCompleteState, setKalypsoCompleteState] = useState<RequestState>({...initialRequestState});
  const [referralCompleteState, setReferralCompleteState] = useState<RequestState>({...initialRequestState});

  // Reset a request state
  const resetRequestState = (stateSetter: React.Dispatch<React.SetStateAction<RequestState>>) => {
    stateSetter({...initialRequestState});
  };

  // Fetch initial onboarding info
  useEffect(() => {
    const fetchOnboardingInfo = async () => {
      try {
        // Set loading state
        setFetchState({ loading: true, error: null, success: false });
        
        // If we already know onboarding is complete from Zustand store, redirect immediately
        if (onboardingComplete) {
          if (isMobileButNotIpad()) {
            router.push('/redirect');
          } else {
            router.push('/home');
          }
          setFetchState({ loading: false, error: null, success: true });
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
          setFetchState({ loading: false, error: null, success: true });
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
        
        // Update request state to success
        setFetchState({ loading: false, error: null, success: true });
      } catch (error) {
        console.error('Error fetching onboarding info:', error);
        // Set error state
        setFetchState({ 
          loading: false, 
          error: error instanceof Error ? error : new Error('Unknown error fetching onboarding info'),
          success: false
        });
      }
    };

    fetchOnboardingInfo();
  }, [router, onboardingComplete, setOnboardingComplete]);

  // Update onboarding info in the database
  const updateOnboardingInfo = async (updates: Partial<OnboardingInfo>) => {
    try {
      // Set loading state
      setUpdateState({ loading: true, error: null, success: false });
      
      const response = await fetch('/api/user-info/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update onboarding info');

      const updatedInfo = await response.json();

      // Update local state
      setOnboardingInfo(updatedInfo);
      if (updates.currentStep && isValidStep(updates.currentStep)) {
        setCurrentStep(updates.currentStep);
      }
      
      // Set success state
      setUpdateState({ loading: false, error: null, success: true });

      return updatedInfo;
    } catch (error) {
      console.error('[updateOnboardingInfo] Error:', error);
      // Set error state
      setUpdateState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error updating onboarding info'),
        success: false
      });
      throw error;
    }
  };

  const handleNameSubmit = async (firstName: string) => {
    try {
      // Set loading state
      setNameSubmitState({ loading: true, error: null, success: false });
      
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
      
      // Set success state
      setNameSubmitState({ loading: false, error: null, success: true });
    } catch (error) {
      console.error("Error saving name:", error);
      toast.error("Failed to save your information");
      // Set error state
      setNameSubmitState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error saving name'),
        success: false
      });
    }
  };

  const handleCollegeSubmit = async (data: {
    college: string;
    isNonTraditional: boolean;
    isCanadian: boolean;
  }) => {
    try {
      // Set loading state
      setCollegeSubmitState({ loading: true, error: null, success: false });
      
      await updateOnboardingInfo({
        ...data,
        currentStep: ONBOARDING_STEPS.ACADEMICS as OnboardingStep,
      });
      
      // Set success state
      setCollegeSubmitState({ loading: false, error: null, success: true });
    } catch (error) {
      console.error("Error saving college info:", error);
      toast.error("Failed to save your information");
      // Set error state
      setCollegeSubmitState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error saving college info'),
        success: false
      });
    }
  };

  const handleAcademicsSubmit = async (data: {
    gpa: number | null;
    currentMcatScore: number | null;
    hasNotTakenMCAT: boolean;
    mcatAttemptNumber: string;
  }) => {
    try {
      // Set loading state
      setAcademicsSubmitState({ loading: true, error: null, success: false });
      
      await updateOnboardingInfo({
        ...data,
        currentStep: ONBOARDING_STEPS.GOALS as OnboardingStep,
      });
      
      // Set success state
      setAcademicsSubmitState({ loading: false, error: null, success: true });
    } catch (error) {
      console.error("Error saving academic info:", error);
      toast.error("Failed to save your information");
      // Set error state
      setAcademicsSubmitState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error saving academic info'),
        success: false
      });
    }
  };

  const handleGoalsSubmit = async (data: {
    targetScore: number;
    targetMedSchool: string;
  }) => {
    try {
      // Set loading state
      setGoalsSubmitState({ loading: true, error: null, success: false });
      
      // Update database first - REMOVED setting onboardingComplete here
      await updateOnboardingInfo({
        ...data,
        currentStep: ONBOARDING_STEPS.KALYPSO_DIALOGUE as OnboardingStep,
      });

      // Continue to the next step without setting onboardingComplete
      // Now redirect happens in the component based on current step
      
      // Set success state
      setGoalsSubmitState({ loading: false, error: null, success: true });
    } catch (error) {
      console.error("[handleGoalsSubmit] Error:", error);
      toast.error("Failed to save your information");
      // Set error state
      setGoalsSubmitState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error saving goals'),
        success: false
      });
    }
  };

  const handleKalypsoComplete = async () => {
    try {
      // Set loading state
      setKalypsoCompleteState({ loading: true, error: null, success: false });
      
      await updateOnboardingInfo({
        currentStep: ONBOARDING_STEPS.REFERRAL as OnboardingStep,
      });
      
      // Set success state
      setKalypsoCompleteState({ loading: false, error: null, success: true });
    } catch (error) {
      console.error("Error completing Kalypso dialogue:", error);
      toast.error("Failed to proceed to next step");
      // Set error state
      setKalypsoCompleteState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error completing Kalypso dialogue'),
        success: false
      });
    }
  };

  const handleReferralComplete = async (skipReferral: boolean = false) => {
    try {
      // Set loading state
      setReferralCompleteState({ loading: true, error: null, success: false });
      
      console.log('[DEBUG][handleReferralComplete] Starting onboarding completion process');
      
      // First, validate that we have all required data
      if (!onboardingInfo) {
        const error = new Error("Cannot complete onboarding: No onboarding info exists");
        console.error(error.message);
        toast.error("Missing profile information. Please try again.");
        setReferralCompleteState({ 
          loading: false, 
          error: error,
          success: false
        });
        return false;
      }
      
      // Validate that target score exists and is valid
      if (!onboardingInfo.targetScore || onboardingInfo.targetScore <= 0) {
        const error = new Error("Cannot complete onboarding: Invalid target score");
        console.error(`${error.message}: ${onboardingInfo.targetScore}`);
        toast.error("Please set a valid target score before completing onboarding.");
        setReferralCompleteState({ 
          loading: false, 
          error: error,
          success: false
        });
        return false;
      }
      
      // Check other critical fields
      if (!onboardingInfo.firstName || !onboardingInfo.college) {
        const error = new Error("Cannot complete onboarding: Missing required personal information");
        console.error(error.message);
        toast.error("Please complete all required steps before continuing.");
        setReferralCompleteState({ 
          loading: false, 
          error: error,
          success: false
        });
        return false;
      }
      
      // Now update with complete flag
      console.log('[DEBUG][handleReferralComplete] Updating database with onboardingComplete: true');
      const updatedInfo = await updateOnboardingInfo({
        currentStep: ONBOARDING_STEPS.UNLOCK as OnboardingStep,
        onboardingComplete: true,
      });

      // Verify update was successful
      if (!updatedInfo?.onboardingComplete) {
        const error = new Error("[handleReferralComplete] Update successful but onboardingComplete not set");
        console.error(error.message);
        toast.error("There was a problem completing your profile. Please try again.");
        setReferralCompleteState({ 
          loading: false, 
          error: error,
          success: false
        });
        return false;
      }
      
      console.log('[DEBUG][handleReferralComplete] Database update successful, onboardingComplete set to:', updatedInfo.onboardingComplete);
      
      // If all was successful, update the local state
      setOnboardingComplete(true);
      console.log('[DEBUG][handleReferralComplete] Local state updated with setOnboardingComplete(true)');
      
      // IMPROVEMENT: Add a full refreshUserInfo call to ensure complete synchronization
      console.log('[DEBUG][handleReferralComplete] Performing full refreshUserInfo() for complete synchronization');
      try {
        await refreshUserInfo();
        console.log('[DEBUG][handleReferralComplete] refreshUserInfo() completed successfully');
      } catch (refreshError) {
        console.error('[DEBUG][handleReferralComplete] Error during refreshUserInfo():', refreshError);
        // We continue with the redirect even if refresh fails, as the database update was successful
      }
      
      // Redirect based on device
      console.log('[DEBUG][handleReferralComplete] Redirecting to:', isMobileButNotIpad() ? '/redirect' : '/home');
      if (isMobileButNotIpad()) {
        router.push('/redirect');
      } else {
        router.push('/home');
      }
      
      // Set success state
      setReferralCompleteState({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      console.error("[handleReferralComplete] Error:", error);
      toast.error("Failed to complete your profile setup");
      // Set error state
      setReferralCompleteState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error completing onboarding'),
        success: false
      });
      return false;
    }
  };

  // Function to check if any request is currently loading
  const isLoading = (): boolean => {
    return fetchState.loading || 
           updateState.loading || 
           nameSubmitState.loading || 
           collegeSubmitState.loading || 
           academicsSubmitState.loading || 
           goalsSubmitState.loading || 
           kalypsoCompleteState.loading || 
           referralCompleteState.loading;
  };

  return {
    onboardingInfo,
    updateOnboardingInfo,
    currentStep,
    handleNameSubmit,
    handleCollegeSubmit,
    handleAcademicsSubmit,
    handleGoalsSubmit,
    handleKalypsoComplete,
    handleReferralComplete,
    ONBOARDING_STEPS,
    // Request states
    isLoading: isLoading(),
    fetchState,
    updateState,
    nameSubmitState,
    collegeSubmitState,
    academicsSubmitState,
    goalsSubmitState,
    kalypsoCompleteState,
    referralCompleteState,
    // Utility
    resetRequestState
  };
} 