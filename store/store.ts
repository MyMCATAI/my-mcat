import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UserInfo } from '@/types/user'
import type { DoctorOfficeStats } from '@/types'
import { toast } from 'react-hot-toast'
import { isWithin14Days } from '@/lib/utils'
// Import the audio slice for initialization
import { useAudioStore } from './slices/audioSlice'
// Import the UI slice for initialization
import { useUIStore } from './slices/uiSlice'
// Import the Game slice for initialization
import { useGameStore } from './slices/gameSlice'

// Add a flag to track global initialization
let isStoreInitialized = false;

//***************************************** User Slice ********************************************************//
//************************* UserProfile, UserInfo, UserStats, User  *******************************************//

interface UserProfile {
  profile: {
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
    onboardingRoute?: string;
  } | null;
  isLoading: boolean;
}

interface UserInfoState {
  userInfo: UserInfo | null;
  isSubscribed: boolean;
}

interface UserStats {
  coins: number;
  isLoading: boolean;
}

/* --- User Slice ---- */
interface UserSlice {
  // UserProfile state
  profile: UserProfile['profile'];
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
  onboardingRoute: string;
  
  // UserInfo state
  userInfo: UserInfoState['userInfo'];
  isSubscribed: boolean;
  
  // UserStats state
  coins: number;
  statsLoading: boolean;
  error: string | null;
  
  // Actions
  updateProfile: (updates: any) => Promise<void>;
  refreshUserInfo: () => Promise<void>;
  updateCoins: (amount: number) => Promise<void>;
  updateCoinsDisplay: (newAmount: number) => void;
  setIsSubscribed: (status: boolean) => void;
  setCompletedSteps: (steps: string[]) => void;
  addCompletedStep: (step: string) => void;
  updateStudyPreferences: (preferences: Partial<UserSlice['studyPreferences']>) => void;
  updateInterfaceSettings: (settings: Partial<UserSlice['interfaceSettings']>) => void;
  updateTutorialProgress: (progress: Partial<UserSlice['tutorialProgress']>) => void;
  setOnboardingComplete: (completed: boolean) => void;
  setLastVisitedRoute: (route: string) => void;
  setOnboardingRoute: (route: string) => void;
}

// Audio Slice has been moved to its own file: slices/audioSlice.ts
// Game Slice has been moved to its own file: slices/gameSlice.ts

//******************************************* Vocab Slice ****************************************************//
interface VocabSlice {
  // Vocab state
  vocabList: Array<{
    word: string;
    definitions: string;
  }>;
  showVocabList: boolean;
  isCmdIEnabled: boolean;
  
  // Vocab actions
  addVocabWord: (word: string, definition: string) => void;
  removeVocabWord: (word: string) => void;
  toggleVocabList: () => void;
  toggleCmdI: () => void;
}

// Updated to exclude AudioSlice, UISlice, and GameSlice since they're now in their own files
type Store = UserSlice & VocabSlice;

//====================================================================================================//
//================================= Store Initialization =============================================//
//====================================================================================================//

export const useStore = create<Store>()(
  devtools(
    (set, get) => ({
      //***********************************************************************************************//
      //************************************** USER State *********************************************//
      //***********************************************************************************************//
      // User State
      profile: null,
      profileLoading: true,
      isProfileComplete: false,
      completedSteps: [],
      studyPreferences: {
        dailyGoal: 30, // Default: 30 minutes
        reminderTime: '09:00', // Default: 9 AM
      },
      interfaceSettings: {
        darkMode: false,
        fontSize: 'medium',
      },
      tutorialProgress: {
        currentStep: 0,
        completedRoutes: [],
      },
      onboardingComplete: false,
      lastVisitedRoute: '/',
      onboardingRoute: '/onboarding',
      userInfo: null,
      isSubscribed: false,
      coins: 0,
      statsLoading: true,
      error: null,

      // User Actions
      updateProfile: async (updates) => {
        try {
          // Get the current profile and email/userId for the API call
          const currentProfile = get().profile;
          const userInfo = get().userInfo;
          
          if (!userInfo || (!userInfo.email && !userInfo.userId)) {
            console.error('Cannot update profile: No user email or ID available');
            return;
          }
          
          // Determine query parameter
          
          const queryParam = userInfo.email 
            ? `email=${encodeURIComponent(userInfo.email)}` 
            : `userId=${userInfo.userId}`;
          
          // Implement your API call here
          const response = await fetch(`/api/user-info/profile?${queryParam}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          
          if (!response.ok) throw new Error('Failed to update profile');
          
          const updatedProfile = await response.json();
          
          // Update the profile and related state
          set({ 
            profile: updatedProfile,
            profileLoading: false,
            // Update other profile-related state if present in the response
            ...(updatedProfile.completedSteps && { completedSteps: updatedProfile.completedSteps }),
            ...(updatedProfile.studyPreferences && { studyPreferences: updatedProfile.studyPreferences }),
            ...(updatedProfile.interfaceSettings && { interfaceSettings: updatedProfile.interfaceSettings }),
            ...(updatedProfile.tutorialProgress && { tutorialProgress: updatedProfile.tutorialProgress }),
            ...(updatedProfile.onboardingComplete !== undefined && { 
              onboardingComplete: updatedProfile.onboardingComplete 
            }),
            ...(updatedProfile.lastVisitedRoute && { lastVisitedRoute: updatedProfile.lastVisitedRoute }),
            ...(updatedProfile.onboardingRoute && { onboardingRoute: updatedProfile.onboardingRoute }),
          });
          
          // Update isProfileComplete based on completedSteps
          const steps = updatedProfile.completedSteps || get().completedSteps;
          set({ isProfileComplete: steps.length >= 3 }); // Assuming 3 steps is complete
        } catch (error) {
          console.error('Failed to update profile:', error);
        }
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

          // Get user name from Clerk
          const clerkResponse = await fetch('/api/user-info/profile', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const clerkData = clerkResponse.ok ? await clerkResponse.json() : null;
          const firstName = clerkData?.firstName || "";

          // Batch all fetch requests together with auth headers
          const [userInfoResponse, profileResponse] = await Promise.all([
            fetch('/api/user-info', {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            }),
            fetch('/api/user-info/profile', {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            })
          ]);

          clearTimeout(loadingTimeout);

          // If user info doesn't exist, create it with the name from Clerk
          if (userInfoResponse.status === 404) {
            const createResponse = await fetch('/api/user-info', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                firstName: firstName,
                bio: "MCAT Student",
                onboardingInfo: {
                  targetScore: 520,  // Default target score
                  onboardingComplete: true,
                  firstName: firstName
                }
              })
            });
            
            if (!createResponse.ok) throw new Error('Failed to create user info');
            const userInfo = await createResponse.json();
            
            set({
              userInfo,
              profile: {
                ...get().profile,
                firstName: firstName,
                bio: "MCAT Student"
              },
              onboardingComplete: true,  // Mark onboarding as complete
              statsLoading: false,
              profileLoading: false,
              error: null,
              coins: userInfo.score || 0
            });
            return;
          }

          if (!userInfoResponse.ok) throw new Error('Failed to fetch user info');
          const userInfo = await userInfoResponse.json();
          
          // Check if user is in 14-day free trial period based on account creation date
          const isNewUserTrial = userInfo.createdAt ? isWithin14Days(new Date(userInfo.createdAt)) : false;

          // Prepare single state update with only changed values
          const updates: Partial<Store> = {
            userInfo,
            profile: {
              ...get().profile,
              firstName: userInfo.firstName,
              bio: userInfo.bio
            },
            statsLoading: false,
            profileLoading: false,
            error: null
          };

          // Only update coins if changed
          if (userInfo.score !== get().coins) {
            updates.coins = userInfo.score || 0;
          }

          // Only update subscription if changed
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
                onboardingRoute: profileData.onboardingRoute || '/onboarding',
                isProfileComplete: (profileData.completedSteps || []).length >= 3
              });
            }
          }

          // Single state update for all other fields
          set(updates);

        } catch (error) {
          console.error('Error in refreshUserInfo:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh user info',
            statsLoading: false,
            profileLoading: false
          });
        }
      },
      
      updateCoins: async (amount) => {
        try {
          // Implement your API call to update coins/score
          const response = await fetch('/api/user/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
          });
          
          if (!response.ok) throw new Error('Failed to update coins');
          
          // After successful update, refresh user info to get updated data
          await get().refreshUserInfo();
        } catch (error) {
          console.error('Failed to update coins:', error);
        }
      },
      
      updateCoinsDisplay: (newAmount) => {
        set({ coins: newAmount });
      },
      
      setIsSubscribed: (status) => {
        set({ isSubscribed: status });
      },
      
      // New profile-related actions
      setCompletedSteps: (steps) => {
        set({ completedSteps: steps });
        set({ isProfileComplete: steps.length >= 3 }); // Assuming 3 steps is complete
        
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
          set({ isProfileComplete: newSteps.length >= 3 }); // Assuming 3 steps is complete
          
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
          set({ 
            profile: { 
              ...profile, 
              studyPreferences: updatedPreferences 
            } 
          });
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
          set({ 
            profile: { 
              ...profile, 
              interfaceSettings: updatedSettings 
            } 
          });
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
          set({ 
            profile: { 
              ...profile, 
              tutorialProgress: updatedProgress 
            } 
          });
        }
        
        // Persist to backend if possible
        get().updateProfile({ tutorialProgress: updatedProgress });
      },
      
      setOnboardingComplete: (completed) => {
        set({ onboardingComplete: completed });
        
        // Also update the profile object for consistency
        const profile = get().profile;
        if (profile) {
          set({ 
            profile: { 
              ...profile, 
              onboardingComplete: completed 
            } 
          });
        }
        
        // Persist to backend if possible
        get().updateProfile({ onboardingComplete: completed });
      },
      
      setLastVisitedRoute: (route) => {
        set({ lastVisitedRoute: route });
        
        // Also update the profile object for consistency
        const profile = get().profile;
        if (profile) {
          set({ 
            profile: { 
              ...profile, 
              lastVisitedRoute: route 
            } 
          });
        }
        
        // Persist to backend if possible
        get().updateProfile({ lastVisitedRoute: route });
      },
      
      setOnboardingRoute: (route) => {
        set({ onboardingRoute: route });
        
        // Also update the profile object for consistency
        const profile = get().profile;
        if (profile) {
          set({ 
            profile: { 
              ...profile, 
              onboardingRoute: route 
            } 
          });
        }
        
        // Persist to backend if possible
        get().updateProfile({ onboardingRoute: route });
      },

      //************************************************************************************************//
      //************************************** Vocab State *******************************************//
      //***********************************************************************************************//
      
      // Vocab state
      vocabList: [],
      showVocabList: false,
      isCmdIEnabled: false,
      
      // Vocab actions
      addVocabWord: (word, definition) => {
        set((state) => ({
          vocabList: [...state.vocabList, { word, definitions: definition }],
          showVocabList: true
        }));
      },
      removeVocabWord: (word) => {
        set((state) => ({
          vocabList: state.vocabList.filter((v) => v.word !== word),
          showVocabList: state.vocabList.length > 1
        }));
      },
      toggleVocabList: () => {
        set((state) => ({
          showVocabList: !state.showVocabList
        }));
      },
      toggleCmdI: () => {
        set((state) => ({
          isCmdIEnabled: !state.isCmdIEnabled
        }));
      }
    }),
    {
      name: 'main-store'
    }
  )
) 

// Export a function to initialize the store at the app level
export const initializeGlobalStore = async () => {
  if (typeof window !== 'undefined' && !isStoreInitialized) {
    console.debug('[DEBUG][Store] Initializing global store from exported function');
    
    try {
      // Initialize audio context from the audio slice
      await useAudioStore.getState().initializeAudioContext();
      
      // Initialize UI state
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme && ['cyberSpace', 'sakuraTrees', 'sunsetCity', 'mykonosBlue'].includes(savedTheme)) {
        useUIStore.getState().setTheme(savedTheme as any);
      }
      
      // Set initialization flag
      isStoreInitialized = true;
      console.debug('[DEBUG][Store] Store initialization complete');
    } catch (error) {
      console.error('[DEBUG][Store] Store initialization failed:', error);
    }
  }
};

export type Card = {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  category?: string;
  difficulty?: string;
  otherOptions?: string[];
}; 