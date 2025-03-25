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
/**
 * Options for batch updating profile properties
 */
interface BatchUpdateOptions {
  showToast?: boolean;
  rollbackOnError?: boolean;
}

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
  lastVisitedRoute?: string;
}

interface UserState {
  // Version tracking
  version: number;
  
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
  
  // Batch update function
  batchUpdateProfile: (updates: Partial<UserProfile & { onboardingInfo?: Partial<OnboardingInfo> }>, options?: BatchUpdateOptions) => Promise<UserProfile | null>;
}

//========================= Store Creation ===============================
export const useUserStore = create<UserState & UserActions>()(
  devtools((set, get) => ({
    // Version tracking
    version: 1,
    
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
      console.log('[DEBUG][userSlice] setCompletedSteps called with', steps.length, 'steps');
      
      // Use the new batch update function instead of multiple set calls
      get().batchUpdateProfile({ completedSteps: steps });
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
      console.log('[DEBUG][userSlice] setOnboardingComplete called with value:', completed);
      
      // Get the current userInfo state
      const { userInfo } = get();
      
      if (!userInfo) {
        console.error('Cannot set onboardingComplete: No user info available');
        return;
      }
      
      // Create a typed version of onboardingInfo to ensure all required fields are present
      const currentOnboardingInfo = userInfo.onboardingInfo || {
        currentStep: 0,
        onboardingComplete: false,
        firstName: null,
        college: null,
        isNonTraditional: null,
        isCanadian: null,
        gpa: null,
        currentMcatScore: null,
        hasNotTakenMCAT: null,
        mcatAttemptNumber: null,
        targetMedSchool: null,
        targetScore: null,
        referralEmail: null
      };
      
      // Create updated userInfo with the new onboardingComplete value
      const updatedUserInfo = {
        ...userInfo,
        onboardingInfo: {
          ...currentOnboardingInfo,
          onboardingComplete: completed
        }
      };
      
      // Store original state for potential rollback
      const originalState = {
        userInfo: userInfo
      };
      
      console.log('[DEBUG][userSlice] Updating local state with onboardingComplete:', completed);
      
      // Update only the userInfo property in a single atomic operation
      set({ userInfo: updatedUserInfo });
      
      // Persist to backend with error handling and rollback capability
      (async () => {
        try {
          console.log('[DEBUG][userSlice] Persisting onboardingComplete to backend');
          const response = await fetch('/api/user-info/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              onboardingInfo: updatedUserInfo.onboardingInfo 
            })
          });
          
          if (!response.ok) {
            throw new Error(`Backend update failed: ${response.status} ${response.statusText}`);
          }
          
          const responseData = await response.json();
          console.log('[DEBUG][userSlice] Backend update successful:', responseData);
        } catch (error) {
          console.error('[DEBUG][userSlice] Error updating onboardingComplete on backend:', error);
          // Roll back to original state if backend update fails
          console.log('[DEBUG][userSlice] Rolling back to original state');
          set({ userInfo: originalState.userInfo });
          // Show error to user
          // We'd ideally use a toast here, but to avoid circular dependencies
          // just log to console for now
        }
      })();
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
        // Set detailed loading states
        set({ 
          profileLoading: true, 
          statsLoading: true, 
          error: null 
        });
        
        // Track fetch start time for performance monitoring
        const fetchStartTime = performance.now();
        
        // Batch all fetch requests together
        const [userInfoResponse, profileResponse] = await Promise.all([
          fetch('/api/user-info'),
          fetch('/api/user-info/profile')
        ]);

        // Handle failed user info response
        if (!userInfoResponse.ok) {
          throw new Error(`Failed to fetch user info: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
        }

        const userInfo = await userInfoResponse.json();
        
        // Check if user is in 14-day free trial period
        const isNewUserTrial = userInfo.createdAt ? isWithin14Days(new Date(userInfo.createdAt)) : false;

        // Prepare atomic state update with only changed values
        const updates: Partial<UserState> = {
          userInfo,
          error: null,
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

        // Handle profile data if available
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
        } else {
          console.warn(`[UserStore] Profile fetch failed: ${profileResponse.status} ${profileResponse.statusText}`);
        }
        
        // Check if we're about to set onboardingComplete at root level (bug prevention)
        if ('onboardingComplete' in updates) {
          // @ts-ignore - Intentionally modifying object to prevent a bug
          delete updates.onboardingComplete;
        }
        
        // Complete the loading states
        updates.statsLoading = false;
        updates.profileLoading = false;
        
        // Finally, apply all updates in a single atomic state update
        set(updates);
        
        return userInfo;
      } catch (error) {
        console.error('[UserStore] Error in refreshUserInfo:', error);
        
        // Set detailed error state
        set({ 
          error: error instanceof Error ? error.message : 'Failed to refresh user info',
          statsLoading: false,
          profileLoading: false
        });
        
        // Re-throw to allow handling by callers
        throw error;
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
    },

    /**
     * Batch update multiple profile properties in a single operation
     * @param updates Object containing all properties to update
     * @param options Optional settings for the update operation
     */
    batchUpdateProfile: async (
      updates: Partial<UserProfile & { onboardingInfo?: Partial<OnboardingInfo> }>, 
      options: BatchUpdateOptions = { showToast: true, rollbackOnError: true }
    ): Promise<UserProfile | null> => {
      console.log('[DEBUG][userSlice] batchUpdateProfile called with updates:', Object.keys(updates));
      
      // Get current state for potential rollback
      const currentState = {
        profile: get().profile,
        completedSteps: get().completedSteps,
        studyPreferences: get().studyPreferences,
        interfaceSettings: get().interfaceSettings,
        tutorialProgress: get().tutorialProgress,
        lastVisitedRoute: get().lastVisitedRoute,
        userInfo: get().userInfo
      };
      
      try {
        // First update local state
        const updatedState: Partial<UserState> = {};
        
        // Process completedSteps updates
        if (updates.completedSteps) {
          updatedState.completedSteps = updates.completedSteps;
          updatedState.isProfileComplete = updates.completedSteps.length >= 3;
          
          // Also update in profile if it exists
          if (currentState.profile) {
            updatedState.profile = { 
              ...currentState.profile, 
              completedSteps: updates.completedSteps 
            };
          }
        }
        
        // Process studyPreferences updates
        if (updates.studyPreferences) {
          updatedState.studyPreferences = { 
            ...currentState.studyPreferences, 
            ...updates.studyPreferences 
          };
          
          // Also update in profile if it exists
          if (currentState.profile) {
            updatedState.profile = { 
              ...updatedState.profile || currentState.profile, 
              studyPreferences: updatedState.studyPreferences 
            };
          }
        }
        
        // Process interfaceSettings updates
        if (updates.interfaceSettings) {
          updatedState.interfaceSettings = { 
            ...currentState.interfaceSettings, 
            ...updates.interfaceSettings 
          };
          
          // Also update in profile if it exists
          if (currentState.profile) {
            updatedState.profile = { 
              ...updatedState.profile || currentState.profile, 
              interfaceSettings: updatedState.interfaceSettings 
            };
          }
        }
        
        // Process tutorialProgress updates
        if (updates.tutorialProgress) {
          updatedState.tutorialProgress = { 
            ...currentState.tutorialProgress, 
            ...updates.tutorialProgress 
          };
          
          // Also update in profile if it exists
          if (currentState.profile) {
            updatedState.profile = { 
              ...updatedState.profile || currentState.profile, 
              tutorialProgress: updatedState.tutorialProgress 
            };
          }
        }
        
        // Process lastVisitedRoute updates
        if (updates.lastVisitedRoute) {
          updatedState.lastVisitedRoute = updates.lastVisitedRoute;
          
          // Also update in profile if it exists
          if (currentState.profile) {
            updatedState.profile = { 
              ...updatedState.profile || currentState.profile, 
              lastVisitedRoute: updates.lastVisitedRoute 
            };
          }
        }
        
        // Process onboardingInfo updates
        if (updates.onboardingInfo && currentState.userInfo) {
          const existingOnboardingInfo = currentState.userInfo.onboardingInfo || {
            currentStep: 0,
            onboardingComplete: false,
            firstName: null,
            college: null,
            isNonTraditional: null,
            isCanadian: null,
            gpa: null,
            currentMcatScore: null,
            hasNotTakenMCAT: null,
            mcatAttemptNumber: null,
            targetMedSchool: null,
            targetScore: null,
            referralEmail: null
          };
          
          updatedState.userInfo = {
            ...currentState.userInfo,
            onboardingInfo: {
              ...existingOnboardingInfo,
              ...updates.onboardingInfo
            }
          };
        }
        
        console.log('[DEBUG][userSlice] Applying batch updates to local state:', Object.keys(updatedState));
        
        // Apply all updates in a single atomic operation
        set(updatedState);
        
        // Then persist to backend
        console.log('[DEBUG][userSlice] Persisting batch updates to backend');
        const response = await fetch('/api/user-info/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
          throw new Error(`Backend update failed: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('[DEBUG][userSlice] Backend batch update successful:', responseData);
        
        return responseData;
      } catch (error) {
        console.error('[DEBUG][userSlice] Error in batchUpdateProfile:', error);
        
        // Roll back to original state if specified
        if (options.rollbackOnError) {
          console.log('[DEBUG][userSlice] Rolling back to original state');
          set(currentState);
        }
        
        // Return the error to allow callers to handle it
        throw error;
      }
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

// Constants for state management
const CURRENT_VERSION = 1;
