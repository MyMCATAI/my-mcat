import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UserInfo } from '@/types/user'
import { calculatePlayerLevel, getLevelNumber, getPatientsPerDay } from './gameStoreUtils'
import type { DoctorOfficeStats } from '@/types'

/* --- Constants ----- */
export const MOBILE_BREAKPOINT = 640  // sm
export const TABLET_BREAKPOINT = 1024 // lg

/* --- Types ---- */
interface WindowSize {
  width: number
  height: number
  isDesktop: boolean
}

export type ThemeType = 'cyberSpace' | 'sakuraTrees' | 'sunsetCity' | 'mykonosBlue'

/* --- User Types ---- */
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
    hasCompletedOnboarding?: boolean;
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

/* --- Store Slices ---- */
interface UISlice {
  window: WindowSize
  currentRoute: string
  theme: ThemeType
  setWindowSize: (size: WindowSize) => void
  setCurrentRoute: (route: string) => void
  setTheme: (theme: ThemeType) => void
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
  hasCompletedOnboarding: boolean;
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
  setHasCompletedOnboarding: (completed: boolean) => void;
  setLastVisitedRoute: (route: string) => void;
  setOnboardingRoute: (route: string) => void;
}

/* --- Game Slice ---- */
interface GameSlice {
  // Game progress (matching local state names)
  patientsPerDay: number; // Direct match with page.tsx
  streakDays: number;     // Direct match with page.tsx
  totalPatients: number;  // Direct match with page.tsx
  userLevel: string;    // Changed from currentLevel (number) to string to match page.tsx
  userRooms: string[];  // Changed from unlockedRooms to match page.tsx
  
  // Active game session
  activeRooms: Set<string>;  // Direct match with page.tsx
  completeAllRoom: boolean;  // Direct match with page.tsx
  currentUserTestId: string | null; // Direct match with page.tsx
  flashcardRoomId: string;   // Direct match with page.tsx
  isFlashcardsOpen: boolean; // Direct match with page.tsx
  isGameInProgress: boolean; // Direct match with page.tsx
  
  // Test results
  correctCount: number;      // Direct match with page.tsx
  testScore: number;         // Direct match with page.tsx
  userResponses: any[];      // Direct match with page.tsx
  wrongCount: number;        // Direct match with page.tsx
  
  // UI state
  isAfterTestDialogOpen: boolean; // Direct match with page.tsx
  isMarketplaceOpen: boolean;     // Direct match with page.tsx (was isShoppingOpen)
  largeDialogQuit: boolean;       // Direct match with page.tsx
  
  // Game data
  reportData: DoctorOfficeStats | null; // Added from page.tsx
  
  // Game history
  testHistory: TestResult[];
  
  // Actions
  endGame: () => void;
  resetGameState: () => void;
  setActiveRooms: (rooms: Set<string>) => void;
  setCompleteAllRoom: (complete: boolean) => void;
  setCorrectCount: (count: number) => void;
  setFlashcardRoomId: (roomId: string) => void;
  setIsAfterTestDialogOpen: (isOpen: boolean) => void;
  setIsFlashcardsOpen: (isOpen: boolean) => void;
  setIsMarketplaceOpen: (isOpen: boolean) => void;
  setLargeDialogQuit: (quit: boolean) => void;
  setReportData: (data: DoctorOfficeStats | null) => void; // Added setter for reportData
  setStreakDays: (days: number) => void;
  setTestScore: (score: number) => void;
  setTotalPatients: (count: number) => void;
  setUserResponses: (responses: any[]) => void;
  setUserRooms: (rooms: string[]) => void;
  setWrongCount: (count: number) => void;
  startGame: (userTestId: string) => void;
  unlockRoom: (roomId: string) => void;
  updateUserLevel: () => void;
}

/* --- Store Type ---- */
type Store = UISlice & UserSlice & GameSlice;

export const useStore = create<Store>()(
  devtools(
    (set, get) => ({
      //************************************** UI State *********************************************//

      window: {
        width: typeof window !== 'undefined' ? window.innerWidth : 1920,
        height: typeof window !== 'undefined' ? window.innerHeight : 1080,
        isDesktop: true
      },
      currentRoute: '/',
      theme: 'cyberSpace',

      // UI Actions
      setWindowSize: (size) => set({ window: size }),
      setCurrentRoute: (route) => set({ currentRoute: route }),
      setTheme: (theme) => {
        set({ theme })
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', theme)
        }
      },

      //************************************** USER State *********************************************//


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
      hasCompletedOnboarding: false,
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
            ...(updatedProfile.hasCompletedOnboarding !== undefined && { 
              hasCompletedOnboarding: updatedProfile.hasCompletedOnboarding 
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

          // Batch all fetch requests together
          const [userInfoResponse, profileResponse] = await Promise.all([
            fetch('/api/user-info'),
            fetch('/api/user-info/profile')
          ]);

          clearTimeout(loadingTimeout);

          if (!userInfoResponse.ok) throw new Error('Failed to fetch user info');
          const userInfo = await userInfoResponse.json();

          // Prepare single state update with only changed values
          const updates: Partial<Store> = {
            userInfo,
            statsLoading: false,
            profileLoading: false,
            error: null
          };

          // Only update coins if changed
          if (userInfo.score !== get().coins) {
            updates.coins = userInfo.score || 0;
          }

          // Only update subscription if changed
          const newSubStatus = userInfo.subscriptionType === 'gold' || userInfo.subscriptionType === 'premium';
          if (newSubStatus !== get().isSubscribed) {
            updates.isSubscribed = newSubStatus;
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
                hasCompletedOnboarding: profileData.hasCompletedOnboarding || false,
                lastVisitedRoute: profileData.lastVisitedRoute || '/',
                onboardingRoute: profileData.onboardingRoute || '/onboarding',
                isProfileComplete: (profileData.completedSteps || []).length >= 3
              });
            }
          }

          // Single state update
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
      
      setHasCompletedOnboarding: (completed) => {
        set({ hasCompletedOnboarding: completed });
        
        // Also update the profile object for consistency
        const profile = get().profile;
        if (profile) {
          set({ 
            profile: { 
              ...profile, 
              hasCompletedOnboarding: completed 
            } 
          });
        }
        
        // Persist to backend if possible
        get().updateProfile({ hasCompletedOnboarding: completed });
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
      
      //************************************** Game State *********************************************//
      
      // Game progress
      patientsPerDay: 4,
      streakDays: 0,
      totalPatients: 0,
      userLevel: "PATIENT LEVEL",
      userRooms: [],
      
      // Active game session
      activeRooms: new Set<string>(["WaitingRoom0"]),
      completeAllRoom: false,
      currentUserTestId: null,
      flashcardRoomId: "",
      isFlashcardsOpen: false,
      isGameInProgress: false,
      
      // Test results
      correctCount: 0,
      testScore: 0,
      userResponses: [],
      wrongCount: 0,
      
      // UI state
      isAfterTestDialogOpen: false,
      isMarketplaceOpen: false,
      largeDialogQuit: false,
      
      // Game data
      reportData: null,
      
      // Game history
      testHistory: [],
      
      // Game Actions
      endGame: () => {
        set({ 
          isGameInProgress: false,
          currentUserTestId: null,
          userResponses: [],
          correctCount: 0,
          wrongCount: 0,
          testScore: 0,
        });
      },
      
      resetGameState: () => {
        set({ 
          isGameInProgress: false,
          currentUserTestId: null,
          activeRooms: new Set<string>(["WaitingRoom0"]),
          completeAllRoom: false,
          isAfterTestDialogOpen: false,
          largeDialogQuit: false,
          userResponses: [],
          correctCount: 0,
          wrongCount: 0,
          testScore: 0,
          isFlashcardsOpen: false,
        });
      },
      
      setActiveRooms: (rooms) => {
        // Ensure we're always creating a new Set object
        set({ activeRooms: new Set(rooms) });
      },
      
      setCompleteAllRoom: (complete) => {
        set({ completeAllRoom: complete });
      },
      
      setCorrectCount: (count) => {
        set({ correctCount: count });
      },
      
      setFlashcardRoomId: (roomId) => {
        set({ flashcardRoomId: roomId });
      },
      
      setIsAfterTestDialogOpen: (isOpen) => {
        set({ isAfterTestDialogOpen: isOpen });
      },
      
      setIsFlashcardsOpen: (isOpen) => {
        set({ isFlashcardsOpen: isOpen });
      },
      
      setIsMarketplaceOpen: (isOpen) => {
        set({ isMarketplaceOpen: isOpen });
      },
      
      setLargeDialogQuit: (quit) => {
        set({ largeDialogQuit: quit });
      },
      
      setReportData: (data) => {
        set({ reportData: data });
      },
      
      setStreakDays: (days) => {
        set({ streakDays: days });
      },
      
      setTestScore: (score) => {
        set({ testScore: score });
      },
      
      setTotalPatients: (count) => {
        set({ totalPatients: count });
      },
      
      setUserResponses: (responses) => {
        set({ userResponses: responses });
      },
      
      setUserRooms: (rooms) => {
        set({ userRooms: rooms });
        get().updateUserLevel();
      },
      
      setWrongCount: (count) => {
        set({ wrongCount: count });
      },
      
      startGame: (userTestId) => {
        set({ 
          isGameInProgress: true,
          currentUserTestId: userTestId,
        });
      },
      
      unlockRoom: (roomId) => {
        const currentRooms = get().userRooms;
        if (!currentRooms.includes(roomId)) {
          const updatedRooms = [...currentRooms, roomId];
          set({ userRooms: updatedRooms });
          get().updateUserLevel();
        }
      },
      
      updateUserLevel: () => {
        const { userRooms } = get();
        const playerLevel = calculatePlayerLevel(userRooms);
        const levelNumber = getLevelNumber(playerLevel);
        const patientsPerDay = getPatientsPerDay(levelNumber);
        
        set({
          userLevel: playerLevel,
          patientsPerDay
        });
      },
    }),
    { name: 'MYMCAT Store' }
  )
) 


export type Card = {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  category?: string;
  difficulty?: string;
  otherOptions?: string[];
};

export type TestResult = {
  correct: number;
  wrong: number;
  cards: Card[];
  timestamp: number;
}; 