import { useState, useEffect } from 'react';
import { OnboardingInfo } from '@/types';
import { toast } from 'react-hot-toast';
import { isMobileButNotIpad } from '@/lib/utils';
import { useUser } from '@/store/selectors';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export const ONBOARDING_STEPS = {
  NAME: 1,          // Step 1: Get user's name
  COLLEGE: 2,       // Step 2: Collect college information
  ACADEMICS: 3,     // Step 3: Get academic details
  GOALS: 4,         // Step 4: Set target score and medical school
  COINS: 5,         // Step 5: Introduce coins system and referral - FINAL STEP
} as const;

// Helper function to ensure type safety when setting the step
function isValidStep(step: number): step is OnboardingStep {
  return step >= 1 && step <= 5;
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
  const { setOnboardingComplete, onboardingComplete, userInfo, refreshUserInfo } = useUser();
  
  // Request states for all operations
  const [fetchState, setFetchState] = useState<RequestState>({...initialRequestState});
  const [updateState, setUpdateState] = useState<RequestState>({...initialRequestState});
  const [nameSubmitState, setNameSubmitState] = useState<RequestState>({...initialRequestState});
  const [collegeSubmitState, setCollegeSubmitState] = useState<RequestState>({...initialRequestState});
  const [academicsSubmitState, setAcademicsSubmitState] = useState<RequestState>({...initialRequestState});
  const [goalsSubmitState, setGoalsSubmitState] = useState<RequestState>({...initialRequestState});
  const [coinsSubmitState, setCoinsSubmitState] = useState<RequestState>({...initialRequestState});

  // Reset a request state
  const resetRequestState = (stateSetter: React.Dispatch<React.SetStateAction<RequestState>>) => {
    stateSetter({...initialRequestState});
  };

  // Use store data instead of fetching
  useEffect(() => {
    const initializeFromStore = () => {
      try {
        setFetchState({ loading: true, error: null, success: false });
        
        if (userInfo?.onboardingInfo) {
          // Use onboarding info from store
          setOnboardingInfo(userInfo.onboardingInfo);
          
          // Determine the correct step
          let targetStep: OnboardingStep = ONBOARDING_STEPS.NAME;
          
          if (userInfo.onboardingInfo.currentStep && isValidStep(userInfo.onboardingInfo.currentStep)) {
            targetStep = userInfo.onboardingInfo.currentStep;
          } else if (userInfo.onboardingInfo.firstName) {
            targetStep = ONBOARDING_STEPS.COLLEGE as OnboardingStep;
          }
          
          setCurrentStep(targetStep);
        }
        
        setFetchState({ loading: false, error: null, success: true });
      } catch (error) {
        setFetchState({ 
          loading: false, 
          error: error instanceof Error ? error : new Error('Unknown error initializing from store'),
          success: false
        });
      }
    };

    initializeFromStore();
  }, [userInfo, onboardingComplete, setOnboardingComplete]);

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
      setNameSubmitState({ loading: true, error: null, success: false });
      
      // Force create a new user info record
      const response = await fetch("/api/user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName }),
      });

      if (!response.ok) throw new Error("Failed to create user info");

      const data = await response.json();
      
      // After successfully creating the record via POST, refresh the Zustand store
      console.log("[useOnboardingInfo] User info created, refreshing Zustand store...");
      await refreshUserInfo();
      console.log("[useOnboardingInfo] Zustand store refreshed.");

      // Store referral redemption status
      localStorage.setItem('mymcat_show_redeem_referral_modal', data.referralRedeemed ? 'true' : 'false');

      // Update onboarding info with fresh data (like currentStep)
      // This PUT call will now update the record that refreshUserInfo just fetched
      await updateOnboardingInfo({
        // firstName is already set by the POST, but including doesn't hurt
        firstName, 
        currentStep: ONBOARDING_STEPS.COLLEGE as OnboardingStep,
      });
      
      setNameSubmitState({ loading: false, error: null, success: true });
    } catch (error) {
      toast.error("Failed to save your information");
      console.error("[useOnboardingInfo] Error in handleNameSubmit:", error);
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
      
      // Update database and move to next step (COINS)
      await updateOnboardingInfo({
        ...data,
        currentStep: ONBOARDING_STEPS.COINS as OnboardingStep,
      });
      
      // Set success state
      setGoalsSubmitState({ loading: false, error: null, success: true });
    } catch (error) {
      toast.error("Failed to save your information");
      // Set error state
      setGoalsSubmitState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error saving goals'),
        success: false
      });
    }
  };

  const finalizeOnboarding = async () => {
    setCoinsSubmitState(prev => ({ ...prev, loading: true })); 
    console.log('finalizeOnboarding');
    try {
      setOnboardingComplete(true); 

      updateOnboardingInfo({
        onboardingComplete: true,
        // No need to update currentStep here, it should already be COINS
      }).catch((error) => {
        // If DB update fails, log it but don't block the user or change UI state
        console.error("Failed to update final onboarding status in DB:", error);
      });

      // Set success state for the coins step (which includes finalization)
      // Do this after initiating the final DB update
      setCoinsSubmitState({ loading: false, error: null, success: true });
      
    } catch (error) {
      // Handle errors during the state update itself
      toast.error("Failed to complete profile setup");
      console.error("Error finalizing onboarding state update:", error);
      // Set error state for coins step
      setCoinsSubmitState({ 
        loading: false, 
        error: error instanceof Error ? error : new Error('Unknown error finalizing onboarding'),
        success: false 
      });
      // Revert Zustand state if the primary action failed
      setOnboardingComplete(false); 
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
           coinsSubmitState.loading;
  };

  return {
    onboardingInfo,
    updateOnboardingInfo,
    currentStep,
    handleNameSubmit,
    handleCollegeSubmit,
    handleAcademicsSubmit,
    handleGoalsSubmit,
    finalizeOnboarding,
    ONBOARDING_STEPS,
    // Request states
    isLoading: isLoading(),
    fetchState,
    updateState,
    nameSubmitState,
    collegeSubmitState,
    academicsSubmitState,
    goalsSubmitState,
    coinsSubmitState,
    // Utility
    resetRequestState
  };
}