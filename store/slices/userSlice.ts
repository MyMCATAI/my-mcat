import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { UserInfo } from '@/types/user';
import type { OnboardingInfo } from '../types';
import { 
  ONBOARDING_STEPS,
  DEFAULT_ONBOARDING_INFO,
  REQUIRED_STEPS 
} from '../types';
import type { 
  OnboardingStep,
  ValidationResult
} from '../types';

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
  updateProfile: (updates: Partial<UserProfile & { onboardingInfo?: Partial<OnboardingInfo> }>) => Promise<void>;
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
  setHasSeenIntroVideo: (hasSeenVideo: boolean) => Promise<void>;
  
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
    
    // User info state - this is the single source of truth
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
      
      // Use DEFAULT_ONBOARDING_INFO instead of inline object
      const currentOnboardingInfo = userInfo.onboardingInfo || { ...DEFAULT_ONBOARDING_INFO };
      
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
        console.log('[UserStore DEBUG] Starting refreshUserInfo');
        set({ 
          profileLoading: true, 
          statsLoading: true, 
          error: null 
        });
        
        console.log('[UserStore DEBUG] Making API requests for user info');
        const [userInfoResponse, profileResponse] = await Promise.all([
          fetch('/api/user-info'),
          fetch('/api/user-info/profile')
        ]);

        console.log('[UserStore DEBUG] API responses received:', {
          userInfoStatus: userInfoResponse.status,
          profileStatus: profileResponse.status
        });

        if (!userInfoResponse.ok) {
          console.error('[UserStore DEBUG] User info fetch failed:', userInfoResponse.status, userInfoResponse.statusText);
          throw new Error(`Failed to fetch user info: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
        }

        const userInfo = await userInfoResponse.json();
        console.log('[UserStore DEBUG] Received userInfo:', {
          hasOnboardingInfo: !!userInfo.onboardingInfo,
          hasSeenIntroVideo: userInfo.onboardingInfo?.hasSeenIntroVideo,
          userId: userInfo.userId,
          subscriptionType: userInfo.subscriptionType
        });
        
        const isNewUserTrial = userInfo.createdAt ? isWithin14Days(new Date(userInfo.createdAt)) : false;

        // Create clean updates object with proper typing
        const baseUpdates: Partial<UserState> = {
          error: null,
          version: CURRENT_VERSION,
          userInfo: userInfo // Always include userInfo as it's our source of truth
        };

        // Add coins if changed
        if (userInfo.score !== get().coins) {
          baseUpdates.coins = userInfo.score || 0;
        }

        // Add subscription status if changed
        const newSubStatus = 
          userInfo.subscriptionType === 'gold' || 
          userInfo.subscriptionType === 'premium' ||
          userInfo.subscriptionType?.startsWith('Gold') ||
          userInfo.subscriptionType?.includes('_Trial') || 
          isNewUserTrial || 
          false;
          
        if (newSubStatus !== get().isSubscribed) {
          baseUpdates.isSubscribed = newSubStatus;
        }

        // Handle profile updates if available
        if (profileResponse.ok) {
          console.log('[UserStore DEBUG] Processing profile response');
          const profileData = await profileResponse.json();
          console.log('[UserStore DEBUG] Profile data:', { 
            hasProfilePhoto: !!profileData.profilePhoto,
            firstName: profileData.firstName,
            completedStepsLength: profileData.completedSteps?.length
          });
          
          const currentProfile = get().profile;
          
          if (JSON.stringify(currentProfile) !== JSON.stringify(profileData)) {
            console.log('[UserStore DEBUG] Profile data changed, updating');
            Object.assign(baseUpdates, {
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
          } else {
            console.log('[UserStore DEBUG] Profile data unchanged');
          }
        } else {
          console.warn(`[UserStore DEBUG] Profile fetch failed: ${profileResponse.status} ${profileResponse.statusText}`);
        }
        
        console.log('[UserStore DEBUG] Applying updates to store:', Object.keys(baseUpdates));

        // IMPORTANT: Set profileLoading to false to ensure the spinner stops
        baseUpdates.profileLoading = false;
        baseUpdates.statsLoading = false;
        
        set(baseUpdates);
        console.log('[UserStore DEBUG] Store updates applied');
        
        return userInfo;
      } catch (error) {
        console.error('[UserStore DEBUG] Error in refreshUserInfo:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to refresh user info',
          statsLoading: false,
          profileLoading: false
        });
        throw error;
      }
    },
    
    setIsSubscribed: (status) => {
      set({ isSubscribed: status });
    },
    
    setHasSeenIntroVideo: async (hasSeenVideo: boolean) => {
      const previousState = get().userInfo;
      
      try {
        if (!previousState) {
          throw new Error('Cannot update hasSeenIntroVideo: No user info available');
        }
        
        // Ensure we have valid onboarding info with hasSeenIntroVideo as boolean
        const currentOnboardingInfo = {
          ...DEFAULT_ONBOARDING_INFO,
          ...(previousState.onboardingInfo || {}),
          // Make hasSeenIntroVideo a boolean
          hasSeenIntroVideo: !!(previousState.onboardingInfo?.hasSeenIntroVideo)
        };
        
        // Create the update with type safety
        const updatedUserInfo = {
          ...previousState,
          onboardingInfo: {
            ...currentOnboardingInfo,
            // hasSeenVideo is already a boolean because of the function parameter type
            hasSeenIntroVideo: hasSeenVideo
          }
        };

        // Single atomic update to prevent duplicate state
        set((state) => ({
          ...state,
          userInfo: updatedUserInfo
        }));

        const response = await fetch('/api/user-info', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            onboardingInfo: updatedUserInfo.onboardingInfo
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to update hasSeenIntroVideo: ${response.status} ${response.statusText}`);
        }

        const serverResponse = await response.json();
        
        // Update with server response, maintaining only the necessary state
        set((state) => ({
          ...state,
          userInfo: serverResponse
        }));

      } catch (error) {
        console.error('[UserStore] Failed to update hasSeenIntroVideo:', error);
        // Rollback to previous state
        set((state) => ({
          ...state,
          userInfo: previousState
        }));
        throw error;
      }
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
          const existingOnboardingInfo = {
            ...DEFAULT_ONBOARDING_INFO,
            ...(currentState.userInfo.onboardingInfo || {}),
            // Make hasSeenIntroVideo a boolean
            hasSeenIntroVideo: !!(currentState.userInfo.onboardingInfo?.hasSeenIntroVideo)
          };
          
          updatedState.userInfo = {
            ...currentState.userInfo,
            onboardingInfo: {
              ...existingOnboardingInfo,
              ...updates.onboardingInfo,
              // Ensure boolean type if present
              ...(updates.onboardingInfo.hasSeenIntroVideo !== undefined ? 
                { hasSeenIntroVideo: Boolean(updates.onboardingInfo.hasSeenIntroVideo) } : {})
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
    const dependency = STEP_DEPENDENCIES[stepNum as OnboardingStep];
    const defaultOnboardingInfo: OnboardingInfo = {
      ...DEFAULT_ONBOARDING_INFO,
      ...userInfo.onboardingInfo,
      // Make hasSeenIntroVideo a boolean
      hasSeenIntroVideo: !!(userInfo.onboardingInfo.hasSeenIntroVideo)
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
