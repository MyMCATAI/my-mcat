import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserInfo } from '@/types/user';

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
  onboardingRoute?: string;
}

interface UserState {
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
  onboardingRoute: string;
  
  // User info state
  userInfo: UserInfo | null;
  isSubscribed: boolean;
  
  // User stats state
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
  setOnboardingRoute: (route: string) => void;
  
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
    // Profile state
    profile: null,
    profileLoading: true,
    isProfileComplete: false,
    completedSteps: [],
    
    // Preferences state
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
    
    // Onboarding state
    onboardingComplete: false,
    lastVisitedRoute: '/',
    onboardingRoute: '/onboarding',
    
    // User info state
    userInfo: null,
    isSubscribed: false,
    
    // Stats state
    coins: 0,
    statsLoading: false,
    error: null,
    
    // Profile actions
    updateProfile: async (updates) => {
      set({ profileLoading: true });
      
      try {
        // Get the current profile and email/userId for the API call
        const state = get();
        const userInfo = state.userInfo;
        
        if (!userInfo || (!userInfo.email && !userInfo.userId)) {
          console.error('Cannot update profile: No user email or ID available');
          set({ 
            profileLoading: false,
            error: 'Cannot update profile: No user email or ID available'
          });
          return;
        }
        
        // Determine which query param to use (email or userId)
        const queryParam = userInfo.email 
          ? `email=${encodeURIComponent(userInfo.email)}`
          : `userId=${userInfo.userId}`;
        
        // Send the update to the API
        const response = await fetch(`/api/user-info/profile?${queryParam}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update profile: ${response.status} ${response.statusText}`);
        }
        
        const updatedProfile = await response.json();
        
        // Update the local state with the response
        set({
          profile: updatedProfile,
          profileLoading: false,
          isProfileComplete: !!updatedProfile,
          error: null,
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        set({
          profileLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update profile',
        });
      }
    },
    
    setCompletedSteps: (steps) => {
      set({ completedSteps: steps });
    },
    
    addCompletedStep: (step) => {
      set(state => ({
        completedSteps: [...state.completedSteps, step]
      }));
    },
    
    // Preferences actions
    updateStudyPreferences: (preferences) => {
      set(state => ({
        studyPreferences: {
          ...state.studyPreferences,
          ...preferences
        }
      }));
    },
    
    updateInterfaceSettings: (settings) => {
      set(state => ({
        interfaceSettings: {
          ...state.interfaceSettings,
          ...settings
        }
      }));
    },
    
    updateTutorialProgress: (progress) => {
      set(state => ({
        tutorialProgress: {
          ...state.tutorialProgress,
          ...progress
        }
      }));
    },
    
    // Onboarding actions
    setOnboardingComplete: (completed) => {
      set({ onboardingComplete: completed });
    },
    
    setLastVisitedRoute: (route) => {
      set({ lastVisitedRoute: route });
    },
    
    setOnboardingRoute: (route) => {
      set({ onboardingRoute: route });
    },
    
    // User info actions
    refreshUserInfo: async () => {
      set({ statsLoading: true });
      
      try {
        // Fetch both user info and profile in parallel
        const [userInfoResponse, profileResponse] = await Promise.all([
          fetch('/api/user-info'),
          fetch('/api/user-info/profile')
        ]);
        
        // Parse the user info response
        if (!userInfoResponse.ok) throw new Error('Failed to fetch user info');
        const userInfo = await userInfoResponse.json();
        
        // Check if user is in 14-day free trial period based on account creation date
        const isNewUserTrial = userInfo.createdAt ? isWithin14Days(new Date(userInfo.createdAt)) : false;
        
        // Update state with user info
        const updates: Partial<UserState> = {
          userInfo,
          statsLoading: false,
        };
        
        // Update coins if they changed
        if (userInfo.score !== get().coins) {
          updates.coins = userInfo.score || 0;
        }
        
        // Update subscription status
        // Include Gold, Premium, and trial subscriptions
        // Also include users in their 14-day trial period
        updates.isSubscribed = !!(
          userInfo.subscriptionType === 'gold' ||
          userInfo.subscriptionType === 'premium' ||
          userInfo.subscriptionType?.startsWith('Gold') ||
          userInfo.subscriptionType?.includes('_Trial') ||
          isNewUserTrial ||
          userInfo.hasPaid
        );
        
        // Check onboarding status
        // IMPORTANT: Match main branch logic by checking targetScore
        if (userInfo.onboardingInfo && typeof userInfo.onboardingInfo === 'object') {
          // Check if targetScore exists (main branch logic)
          const targetScore = userInfo.onboardingInfo.targetScore;
          const isOnboardingComplete = targetScore !== undefined && 
                                targetScore !== null && 
                                targetScore > 0;
          
          // Update onboarding complete flag based on targetScore criteria to match main branch
          if (isOnboardingComplete !== get().onboardingComplete) {
            updates.onboardingComplete = isOnboardingComplete;
            
            // Sync with database if there's a mismatch
            const dbOnboardingComplete = userInfo.onboardingInfo.onboardingComplete === true;
            if (dbOnboardingComplete !== isOnboardingComplete) {
              // Queue an update to sync the database value
              setTimeout(() => {
                get().updateProfile({ onboardingComplete: isOnboardingComplete });
              }, 0);
            }
          }
          
          // If targetScore exists, update study preferences
          if (targetScore && typeof targetScore === 'number') {
            updates.studyPreferences = {
              ...get().studyPreferences,
              dailyGoal: targetScore,
            };
          }
        }
        
        // Parse the profile response
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          
          // Only update profile if it exists
          if (profile) {
            updates.profile = profile;
            updates.isProfileComplete = true;
            updates.profileLoading = false;
            
            // Update study preferences if they exist
            if (profile.studyPreferences) {
              updates.studyPreferences = {
                ...get().studyPreferences,
                ...profile.studyPreferences,
              };
            }
            
            // Update interface settings if they exist
            if (profile.interfaceSettings) {
              updates.interfaceSettings = {
                ...get().interfaceSettings,
                ...profile.interfaceSettings,
              };
            }
            
            // Update tutorial progress if it exists
            if (profile.tutorialProgress) {
              updates.tutorialProgress = {
                ...get().tutorialProgress,
                ...profile.tutorialProgress,
              };
            }
            
            // Update completed steps if they exist
            if (profile.completedSteps && Array.isArray(profile.completedSteps)) {
              updates.completedSteps = profile.completedSteps;
            }
          }
        }
        
        // Apply all updates to state
        set(updates);
        
      } catch (error) {
        console.error('Error in refreshUserInfo:', error);
        set({
          statsLoading: false,
          error: error instanceof Error ? error.message : 'Failed to refresh user info',
        });
      }
    },
    
    setIsSubscribed: (status) => {
      set({ isSubscribed: status });
    },
    
    // Stats actions
    updateCoins: async (amount) => {
      // Set loading state
      set({ statsLoading: true });
      
      try {
        // Send request to update coins/score
        const response = await fetch('/api/user/score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update score: ${response.status} ${response.statusText}`);
        }
        
        // After successful update, refresh user info to get updated data
        await get().refreshUserInfo();
        
      } catch (error) {
        console.error('Error updating coins:', error);
        set({
          statsLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update coins',
        });
      }
    },
    
    updateCoinsDisplay: (newAmount) => {
      set({ coins: newAmount });
    },
  }))
);
