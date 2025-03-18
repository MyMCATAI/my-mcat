import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserInfo } from '@/types/user';
import { OnboardingInfo } from '@/types';

//========================= Helpers ===============================
// Helper function to check if a date is within 14 days of now
const isWithin14Days = (date: Date): boolean => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 14;
};

//========================= Types ===============================
interface UserProfile {
  userId?: string;
  firstName?: string;
  bio?: string;
  coins?: number;
  patientsCount?: number;
  profilePhoto?: string;
  studyPreferences?: {
    dailyGoal?: number;
    reminderTime?: string;
  };
  interfaceSettings?: {
    darkMode?: boolean;
    fontSize?: string;
  };
  tutorialProgress?: {
    currentStep?: number;
    completedRoutes?: string[];
  };
  completedSteps?: string[];
  onboardingComplete?: boolean;
  lastVisitedRoute?: string;
}

interface UserState {
  // Version tracking
  version: number;
  isHydrated: boolean;
  
  // Profile state
  profile: UserProfile | null;
  profileLoading: boolean;
  isProfileComplete: boolean;
  completedSteps: string[];
  studyPreferences: {
    dailyGoal: number;
    reminderTime: string;
  };
  interfaceSettings: {
    darkMode: boolean;
    fontSize: string;
  };
  tutorialProgress: {
    currentStep: number;
    completedRoutes: string[];
  };
  onboardingComplete: boolean;
  lastVisitedRoute: string;
  
  // User info state
  userInfo: UserInfo | null;
  isSubscribed: boolean;
  
  // Stats state
  coins: number;
  statsLoading: boolean;
  error: string | null;
}

interface UserActions {
  // Profile actions
  updateProfile: (updates: any) => Promise<void>;
  setCompletedSteps: (steps: string[]) => void;
  addCompletedStep: (step: string) => void;
  
  // Preferences actions
  updateStudyPreferences: (preferences: Partial<UserState['studyPreferences']>) => void;
  updateInterfaceSettings: (settings: Partial<UserState['interfaceSettings']>) => void;
  updateTutorialProgress: (progress: Partial<UserState['tutorialProgress']>) => void;
  
  // Onboarding actions
  setOnboardingComplete: (completed: boolean) => void;
  setLastVisitedRoute: (route: string) => void;
  
  // User info actions
  refreshUserInfo: () => Promise<void>;
  setIsSubscribed: (status: boolean) => void;
  
  // Stats actions
  updateCoins: (amount: number) => Promise<void>;
  updateCoinsDisplay: (newAmount: number) => void;
}

//========================= Store Creation ===============================
export const useUserStore = create<UserState & UserActions>()(
  devtools((set, get) => ({
    // Version tracking
    version: 1,
    isHydrated: false,
    
    // Profile state
    profile: null,
    profileLoading: true,
    isProfileComplete: false,
    completedSteps: [],
    studyPreferences: {
      dailyGoal: 30,
      reminderTime: '09:00'
    },
    interfaceSettings: {
      darkMode: false,
      fontSize: 'medium'
    },
    tutorialProgress: {
      currentStep: 0,
      completedRoutes: []
    },
    onboardingComplete: false,
    lastVisitedRoute: '/',
    
    // User info state
    userInfo: null,
    isSubscribed: false,
    
    // Stats state
    coins: 0,
    statsLoading: false,
    error: null,
    
    // Profile actions
    updateProfile: async (updates) => {
      try {
        // Get the current profile and email/userId for the API call
        const userInfo = get().userInfo;
        
        if (!userInfo || (!userInfo.email && !userInfo.userId)) {
          console.error('Cannot update profile: No user email or ID available');
          return;
        }
        
        // Validate updates
        const currentProfile = get().profile;
        const updatedProfile = { ...currentProfile, ...updates };
        const validation = validateProfile(updatedProfile);
        
        if (!validation.isValid) {
          console.error('Invalid profile updates:', validation.errors);
          set({
            error: validation.errors.join('. '),
            profileLoading: false
          });
          return;
        }
        
        // Determine which query param to use
        const queryParam = userInfo.email 
          ? `email=${encodeURIComponent(userInfo.email)}`
          : `userId=${userInfo.userId}`;
        
        set({ profileLoading: true, error: null });
        
        // Send update to API
        const response = await fetch(`/api/user-info/profile?${queryParam}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update profile');
        }
        
        const updatedProfileFromServer = await response.json();
        
        // Update local state with server response
        set({
          profile: updatedProfileFromServer,
          profileLoading: false,
          error: null,
          ...(updatedProfileFromServer.completedSteps && { completedSteps: updatedProfileFromServer.completedSteps }),
          ...(updatedProfileFromServer.studyPreferences && { studyPreferences: updatedProfileFromServer.studyPreferences }),
          ...(updatedProfileFromServer.interfaceSettings && { interfaceSettings: updatedProfileFromServer.interfaceSettings }),
          ...(updatedProfileFromServer.tutorialProgress && { tutorialProgress: updatedProfileFromServer.tutorialProgress }),
          ...(updatedProfileFromServer.onboardingComplete !== undefined && { onboardingComplete: updatedProfileFromServer.onboardingComplete }),
          ...(updatedProfileFromServer.lastVisitedRoute && { lastVisitedRoute: updatedProfileFromServer.lastVisitedRoute }),
          isProfileComplete: isProfileComplete(updatedProfileFromServer)
        });
      } catch (error) {
        console.error('Failed to update profile:', error);
        set({
          profileLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update profile'
        });
      }
    },
    
    setCompletedSteps: (steps) => {
      set({ completedSteps: steps });
      set({ isProfileComplete: steps.length >= 3 });
      
      // Also update the profile object for consistency
      const profile = get().profile;
      if (profile) {
        set({ profile: { ...profile, completedSteps: steps } });
      }
      
      // Persist to backend if possible
      get().updateProfile({ completedSteps: steps });
    },
    
    addCompletedStep: (step) => {
      const currentSteps = get().completedSteps;
      if (!currentSteps.includes(step)) {
        const newSteps = [...currentSteps, step];
        set({ completedSteps: newSteps });
        set({ isProfileComplete: newSteps.length >= 3 });
        
        // Also update the profile object for consistency
        const profile = get().profile;
        if (profile) {
          set({ profile: { ...profile, completedSteps: newSteps } });
        }
        
        // Persist to backend if possible
        get().updateProfile({ completedSteps: newSteps });
      }
    },
    
    updateStudyPreferences: (preferences) => {
      const currentPreferences = get().studyPreferences;
      const updatedPreferences = { ...currentPreferences, ...preferences };
      set({ studyPreferences: updatedPreferences });
      
      // Also update the profile object for consistency
      const profile = get().profile;
      if (profile) {
        set({ profile: { ...profile, studyPreferences: updatedPreferences } });
      }
      
      // Persist to backend if possible
      get().updateProfile({ studyPreferences: updatedPreferences });
    },
    
    updateInterfaceSettings: (settings) => {
      const currentSettings = get().interfaceSettings;
      const updatedSettings = { ...currentSettings, ...settings };
      set({ interfaceSettings: updatedSettings });
      
      // Also update the profile object for consistency
      const profile = get().profile;
      if (profile) {
        set({ profile: { ...profile, interfaceSettings: updatedSettings } });
      }
      
      // Persist to backend if possible
      get().updateProfile({ interfaceSettings: updatedSettings });
    },
    
    updateTutorialProgress: (progress) => {
      const currentProgress = get().tutorialProgress;
      const updatedProgress = { ...currentProgress, ...progress };
      set({ tutorialProgress: updatedProgress });
      
      // Also update the profile object for consistency
      const profile = get().profile;
      if (profile) {
        set({ profile: { ...profile, tutorialProgress: updatedProgress } });
      }
      
      // Persist to backend if possible
      get().updateProfile({ tutorialProgress: updatedProgress });
    },
    
    setOnboardingComplete: (completed) => {
      set({ onboardingComplete: completed });
      
      // Also update the profile object for consistency
      const profile = get().profile;
      if (profile) {
        set({ profile: { ...profile, onboardingComplete: completed } });
      }
      
      // Persist to backend if possible
      get().updateProfile({ onboardingComplete: completed });
    },
    
    setLastVisitedRoute: (route) => {
      set({ lastVisitedRoute: route });
      
      // Also update the profile object for consistency
      const profile = get().profile;
      if (profile) {
        set({ profile: { ...profile, lastVisitedRoute: route } });
      }
      
      // Persist to backend if possible
      get().updateProfile({ lastVisitedRoute: route });
    },
    
    refreshUserInfo: async () => {
      try {
        // Only set loading if not already loading
        const currentState = get();
        if (!currentState.statsLoading && !currentState.profileLoading) {
          set({ statsLoading: true, profileLoading: true, error: null });
        }

        // Add loading timeout
        const loadingTimeout = setTimeout(() => {
          const state = get();
          if (state.statsLoading || state.profileLoading) {
            set({ 
              statsLoading: false,
              profileLoading: false,
              error: 'Loading timeout - please try again'
            });
          }
        }, 10000);

        // Batch all fetch requests together
        const [userInfoResponse, profileResponse] = await Promise.all([
          fetch('/api/user-info'),
          fetch('/api/user-info/profile')
        ]);

        clearTimeout(loadingTimeout);

        if (!userInfoResponse.ok) throw new Error('Failed to fetch user info');
        const userInfo = await userInfoResponse.json();
        
        // Check if user is in 14-day free trial period
        const isNewUserTrial = userInfo.createdAt ? isWithin14Days(new Date(userInfo.createdAt)) : false;

        // Prepare single state update with only changed values
        const updates: Partial<UserState> = {
          userInfo,
          statsLoading: false,
          profileLoading: false,
          error: null,
          isHydrated: true,
          version: CURRENT_VERSION
        };

        // Only update coins if changed
        if (userInfo.score !== get().coins) {
          updates.coins = userInfo.score || 0;
        }

        // Match main branch behavior by including trial subscriptions
        // Also include users in their 14-day trial period
        const newSubStatus = 
          userInfo.subscriptionType === 'gold' || 
          userInfo.subscriptionType === 'premium' ||
          userInfo.subscriptionType?.startsWith('Gold') ||
          userInfo.subscriptionType?.includes('_Trial') || 
          isNewUserTrial || 
          false;
          
        if (newSubStatus !== get().isSubscribed) {
          updates.isSubscribed = newSubStatus;
        }

        // IMPORTANT: Check onboarding status from userInfo.onboardingInfo
        if (userInfo.onboardingInfo && typeof userInfo.onboardingInfo === 'object') {
          // Check if targetScore exists (main branch logic)
          const targetScore = userInfo.onboardingInfo.targetScore;
          const isOnboardingComplete = targetScore !== undefined && 
                                targetScore !== null && 
                                targetScore > 0;
          
          // Set onboardingComplete based on targetScore criteria to match main branch
          if (isOnboardingComplete !== get().onboardingComplete) {
            // Apply this update immediately and separately from the batch update
            set({ onboardingComplete: isOnboardingComplete });
            
            // Remove from batch updates to avoid overwriting
            delete updates.onboardingComplete;
            
            // Sync with database if there's a mismatch
            const dbOnboardingComplete = userInfo.onboardingInfo.onboardingComplete === true;
            if (dbOnboardingComplete !== isOnboardingComplete) {
              // Queue an update to sync the database value
              setTimeout(() => {
                get().updateProfile({ onboardingComplete: isOnboardingComplete });
              }, 0);
            }
          }
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const currentProfile = get().profile;
          
          // Only update profile fields that have changed
          if (JSON.stringify(currentProfile) !== JSON.stringify(profileData)) {
            Object.assign(updates, {
              profile: profileData,
              completedSteps: profileData.completedSteps || [],
              studyPreferences: profileData.studyPreferences || {
                dailyGoal: 30,
                reminderTime: '09:00'
              },
              interfaceSettings: profileData.interfaceSettings || {
                darkMode: false,
                fontSize: 'medium'
              },
              tutorialProgress: profileData.tutorialProgress || {
                currentStep: 0,
                completedRoutes: []
              },
              lastVisitedRoute: profileData.lastVisitedRoute || '/',
              isProfileComplete: (profileData.completedSteps || []).length >= 3
            });
          }
        }

        // Apply all updates in a single state update
        set(updates);

      } catch (error) {
        console.error('Error in refreshUserInfo:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to refresh user info',
          statsLoading: false,
          profileLoading: false,
          isHydrated: false
        });
      }
    },
    
    setIsSubscribed: (status) => {
      set({ isSubscribed: status });
    },
    
    updateCoins: async (amount) => {
      try {
        const response = await fetch('/api/user/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });
        
        if (!response.ok) throw new Error('Failed to update coins');
        
        await get().refreshUserInfo();
      } catch (error) {
        console.error('Failed to update coins:', error);
      }
    },
    
    updateCoinsDisplay: (newAmount) => {
      set({ coins: newAmount });
    }
  }))
);

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  invalidFields: string[];
  errors: string[];
}

// Constants for validation
const ONBOARDING_STEPS = {
  NAME: 1,
  COLLEGE: 2,
  ACADEMICS: 3,
  GOALS: 4,
  KALYPSO_DIALOGUE: 5,
  REFERRAL: 6,
  UNLOCK: 7
} as const;

const REQUIRED_STEPS = 3; // Minimum number of steps required for profile completion

type OnboardingStep = typeof ONBOARDING_STEPS[keyof typeof ONBOARDING_STEPS];

interface StepDependency {
  step: OnboardingStep;
  requires: OnboardingStep[];
  validates: (info: OnboardingInfo) => boolean;
}

// Update validation logic to match main branch fields
const STEP_DEPENDENCIES = {
  [ONBOARDING_STEPS.NAME]: {
    validates: (info: OnboardingInfo) => !!info.firstName
  },
  [ONBOARDING_STEPS.COLLEGE]: {
    validates: (info: OnboardingInfo) => !!info.college && typeof info.isNonTraditional === 'boolean' && typeof info.isCanadian === 'boolean'
  },
  [ONBOARDING_STEPS.ACADEMICS]: {
    validates: (info: OnboardingInfo) => (!!info.gpa || info.gpa === 0) && (!!info.currentMcatScore || info.hasNotTakenMCAT) && !!info.mcatAttemptNumber
  },
  [ONBOARDING_STEPS.GOALS]: {
    validates: (info: OnboardingInfo) => !!info.targetScore && !!info.targetMedSchool
  },
  [ONBOARDING_STEPS.KALYPSO_DIALOGUE]: {
    validates: (info: OnboardingInfo) => true // No validation needed for dialogue
  },
  [ONBOARDING_STEPS.REFERRAL]: {
    validates: (info: OnboardingInfo) => true // Optional referral email
  },
  [ONBOARDING_STEPS.UNLOCK]: {
    validates: (info: OnboardingInfo) => info.onboardingComplete
  }
};

// Cache for onboarding completion status
let cachedOnboardingStatus: { userId: string; isComplete: boolean } | null = null;

// Validation function for onboarding state
const validateOnboardingState = (userInfo: UserInfo, profile: UserProfile | null): boolean => {
  // Check if we have all required data
  if (!userInfo || !userInfo.onboardingInfo || !profile) {
    return false;
  }

  const { currentStep } = userInfo.onboardingInfo;
  
  // Check if all steps are completed
  const hasCompletedAllSteps = (currentStep ?? 0) >= ONBOARDING_STEPS.UNLOCK;
  if (!hasCompletedAllSteps) return false;
  
  // Validate all step dependencies
  for (const stepNum of Object.values(ONBOARDING_STEPS)) {
    const dependency = STEP_DEPENDENCIES[stepNum];
    const defaultOnboardingInfo: OnboardingInfo = {
      currentStep: userInfo.onboardingInfo.currentStep ?? 0,
      onboardingComplete: userInfo.onboardingInfo.onboardingComplete ?? false,
      firstName: userInfo.onboardingInfo.firstName ?? null,
      college: userInfo.onboardingInfo.college ?? null,
      isNonTraditional: userInfo.onboardingInfo.isNonTraditional ?? null,
      isCanadian: userInfo.onboardingInfo.isCanadian ?? null,
      gpa: userInfo.onboardingInfo.gpa ?? null,
      currentMcatScore: userInfo.onboardingInfo.currentMcatScore ?? null,
      hasNotTakenMCAT: userInfo.onboardingInfo.hasNotTakenMCAT ?? null,
      mcatAttemptNumber: userInfo.onboardingInfo.mcatAttemptNumber ?? null,
      targetMedSchool: userInfo.onboardingInfo.targetMedSchool ?? null,
      targetScore: userInfo.onboardingInfo.targetScore ?? null,
      referralEmail: userInfo.onboardingInfo.referralEmail ?? null
    };
    if (!dependency.validates(defaultOnboardingInfo)) {
      return false;
    }
  }

  // Check profile completion
  const hasValidProfile = isProfileComplete(profile);

  return hasValidProfile;
};

// Async onboarding completion check with caching
const isOnboardingComplete = async (userId: string): Promise<boolean> => {
  // Check cache first
  if (cachedOnboardingStatus?.userId === userId) {
    return cachedOnboardingStatus.isComplete;
  }
  
  try {
    // Fetch latest user info
    const response = await fetch('/api/user-info');
    if (!response.ok) throw new Error('Failed to fetch user info');
    
    const userInfo = await response.json();
    const profileResponse = await fetch('/api/user-info/profile');
    const profile = profileResponse.ok ? await profileResponse.json() : null;
    
    // Determine completion status
    const isComplete = validateOnboardingState(userInfo, profile);
    
    // Update cache
    cachedOnboardingStatus = { userId, isComplete };
    
    return isComplete;
  } catch (error) {
    console.error('Error checking onboarding completion:', error);
    return false;
  }
};

// Profile validation functions
const validateProfile = (profile: UserProfile): ValidationResult => {
  const missingFields: string[] = [];
  const invalidFields: string[] = [];
  
  // Check required fields
  if (!profile.firstName) missingFields.push('firstName');
  if (!profile.completedSteps || profile.completedSteps.length < REQUIRED_STEPS) {
    missingFields.push('completedSteps');
  }
  
  // Validate field types and values
  if (profile.coins !== undefined && (typeof profile.coins !== 'number' || profile.coins < 0)) {
    invalidFields.push('coins');
  }
  
  // Validate study preferences
  if (profile.studyPreferences) {
    const { dailyGoal, reminderTime } = profile.studyPreferences;
    if (dailyGoal !== undefined && (typeof dailyGoal !== 'number' || dailyGoal < 0)) {
      invalidFields.push('studyPreferences.dailyGoal');
    }
    if (reminderTime && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(reminderTime)) {
      invalidFields.push('studyPreferences.reminderTime');
    }
  }
  
  // Validate interface settings
  if (profile.interfaceSettings) {
    const { fontSize } = profile.interfaceSettings;
    if (fontSize && !['small', 'medium', 'large'].includes(fontSize)) {
      invalidFields.push('interfaceSettings.fontSize');
    }
  }
  
  // Generate validation errors
  const errors = generateValidationErrors(missingFields, invalidFields);
  
  return {
    isValid: missingFields.length === 0 && invalidFields.length === 0,
    missingFields,
    invalidFields,
    errors
  };
};

const generateValidationErrors = (missing: string[], invalid: string[]): string[] => {
  const errors: string[] = [];
  if (missing.length > 0) {
    errors.push(`Missing required fields: ${missing.join(', ')}`);
  }
  if (invalid.length > 0) {
    errors.push(`Invalid values for fields: ${invalid.join(', ')}`);
  }
  return errors;
};

const isProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  
  const validation = validateProfile(profile);
  if (!validation.isValid) return false;
  
  return (
    !!profile.firstName &&
    (profile.completedSteps?.length ?? 0) >= REQUIRED_STEPS
  );
};

// State update utility with optimistic updates and rollback
const updateState = async (
  set: (state: Partial<UserState> | ((state: UserState) => Partial<UserState>)) => void,
  get: () => UserState,
  updates: Partial<UserState>,
  options: { sync?: boolean } = {}
) => {
  try {
    // Store previous state for rollback
    const previousState = get();
    
    // Optimistically update local state
    set((state) => ({
      ...state,
      ...updates,
      error: null
    }));

    // If sync is requested, update database
    if (options.sync) {
      try {
        const response = await fetch('/api/user-info', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });

        if (!response.ok) {
          throw new Error('Failed to sync with database');
        }

        // Update local state with server response
        const serverState = await response.json();
        set((state) => ({
          ...state,
          ...serverState
        }));
      } catch (error) {
        // Rollback on sync failure
        console.error('Sync failed, rolling back:', error);
        set(previousState);
        throw error;
      }
    }
  } catch (error) {
    set((state) => ({
      ...state,
      error: error instanceof Error ? error.message : 'Update failed'
    }));
    throw error;
  }
};

// Constants for state management
const CURRENT_VERSION = 1;

const initialState: UserState = {
  // Version tracking
  version: CURRENT_VERSION,
  isHydrated: false,
  
  // Profile state
  profile: null,
  profileLoading: true,
  isProfileComplete: false,
  completedSteps: [],
  studyPreferences: {
    dailyGoal: 30,
    reminderTime: '09:00'
  },
  interfaceSettings: {
    darkMode: false,
    fontSize: 'medium'
  },
  tutorialProgress: {
    currentStep: 0,
    completedRoutes: []
  },
  onboardingComplete: false,
  lastVisitedRoute: '/',
  
  // User info state
  userInfo: null,
  isSubscribed: false,
  
  // Stats state
  coins: 0,
  statsLoading: false,
  error: null
};

// Hydration check utility
const isStateHydrated = (state: UserState): boolean => {
  return state.isHydrated && state.version === CURRENT_VERSION;
};

// State reset utility
const resetState = (): UserState => ({
  ...initialState,
  version: CURRENT_VERSION
});
