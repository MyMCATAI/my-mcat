import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UserInfo } from '@/types/user'
import { calculatePlayerLevel, getLevelNumber, getPatientsPerDay } from './gameStoreUtils'
import type { DoctorOfficeStats } from '@/types'
import { toast } from 'react-hot-toast'

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

// Add a flag to track global initialization
let isStoreInitialized = false;

//******************************************* UI Slice ****************************************************//
interface UISlice {
  window: WindowSize
  currentRoute: string
  theme: ThemeType
  setWindowSize: (size: WindowSize) => void
  setCurrentRoute: (route: string) => void
  setTheme: (theme: ThemeType) => void
}

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

//******************************************* Audio Slice ****************************************************//
interface AudioSlice {
  // Audio state
  isPlayingSong: boolean;
  currentSong: string | null;
  currentLoop: string | null;
  masterVolume: number;
  
  // Audio context references (not serializable - handled internally)
  _audioContext: AudioContext | null;
  _masterGainNode: GainNode | null;
  _bufferCache: Map<string, AudioBuffer>;
  
  // Internal constants and maps
  _MUSIC_SOURCE: Map<string, AudioBufferSourceNode>;
  _LOOP_SOURCES: Map<string, { source: AudioBufferSourceNode; gainNode: GainNode }>;
  _BUFFER_CACHE_LIMIT: number;
  _VOLUME_COEFFICIENTS: {
    music: number;
    sfx: number;
    ambient: number;
    [key: string]: number;
  };
  _SOUND_MAPPINGS: {
    [key: string]: string;
  };
  
  // Internal methods
  _handleAudioError: (error: Error, context: string) => void;
  
  // Basic audio actions
  playMusic: (src: string, startPlayback?: boolean, onEnded?: () => void) => Promise<AudioBufferSourceNode | null>;
  stopMusic: () => void;
  playSound: (soundName: string) => Promise<void>;
  loopSound: (soundName: string) => Promise<void>;
  stopLoopSound: (soundName: string) => void;
  stopAllLoops: () => Promise<void>;
  getCurrentLoop: () => string | null;
  setMasterVolume: (newVolume: number) => void;
  
  // Audio context management
  initializeAudioContext: () => Promise<AudioContext | null>;
  loadAudioBuffer: (url: string) => Promise<AudioBuffer>;
  
  // Transition actions (replacing useAudioTransitions)
  handleFlashcardsTransition: (isOpen: boolean) => Promise<void>;
  
  // Global store initialization
  initializeStore: () => Promise<void>;
}

//******************************************* Game Slice ****************************************************//
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
  
  // Actions
  endGame: () => void;
  resetGameState: () => void;
  setActiveRooms: (rooms: Set<string> | ((prevRooms: Set<string>) => Set<string>)) => void;
  setCompleteAllRoom: (complete: boolean) => void;
  setCorrectCount: (count: number) => void;
  setFlashcardRoomId: (roomId: string) => void;
  setIsFlashcardsOpen: (isOpen: boolean) => void;
  setUserResponses: (responses: any[]) => void;
  setTestScore: (score: number) => void;
  setTotalPatients: (count: number) => void;
  setWrongCount: (count: number) => void;
  setStreakDays: (days: number) => void;
  setUserRooms: (rooms: string[]) => void;
  startGame: (userTestId: string) => void;
  unlockRoom: (roomId: string) => void;
  updateUserLevel: () => void;
}

type Store = UISlice & UserSlice & GameSlice & AudioSlice;

//====================================================================================================//
//================================= Store Initialization =============================================//
//====================================================================================================//

export const useStore = create<Store>()(
  devtools(
    (set, get) => ({
      //***********************************************************************************************//
      //************************************** UI State ***********************************************//
      //***********************************************************************************************//


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
          // Match main branch behavior by including trial subscriptions
          const newSubStatus = 
            userInfo.subscriptionType === 'gold' || 
            userInfo.subscriptionType === 'premium' ||
            userInfo.subscriptionType?.startsWith('Gold') ||
            userInfo.subscriptionType?.includes('_Trial') || 
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
      
      //***********************************************************************************************//
      //************************************** GAME State *********************************************//
      //***********************************************************************************************//
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
          userResponses: [],
          correctCount: 0,
          wrongCount: 0,
          testScore: 0,
          isFlashcardsOpen: false,
        });
      },
      
      setActiveRooms: (rooms: Set<string> | ((prevRooms: Set<string>) => Set<string>)) => {
        // Handle both direct values and updater functions
        if (typeof rooms === 'function') {
          set((state) => ({ 
            activeRooms: new Set(rooms(state.activeRooms)) 
          }));
        } else {
          // Ensure we're always creating a new Set object
          set({ activeRooms: new Set(rooms) });
        }
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
      
      setIsFlashcardsOpen: (isOpen) => {
        set({ isFlashcardsOpen: isOpen });
      },
      
      setUserResponses: (responses) => {
        set({ userResponses: responses });
      },
      
      setTestScore: (score) => {
        set({ testScore: score });
      },
      
      setTotalPatients: (count) => {
        set({ totalPatients: count });
      },
      
      setWrongCount: (count) => {
        set({ wrongCount: count });
      },
      
      setStreakDays: (days) => {
        set({ streakDays: days });
      },
      
      setUserRooms: (rooms) => {
        set({ userRooms: rooms });
        get().updateUserLevel();
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

      //************************************************************************************************//
      //************************************** AUDIO State *******************************************//
      //***********************************************************************************************//
      
      // Audio state
      isPlayingSong: false,
      currentSong: null,
      currentLoop: null,
      masterVolume: 0.5,
      
      // Non-serializable audio references (prefixed with _ to indicate internal use)
      _audioContext: null,
      _masterGainNode: null,
      _bufferCache: new Map<string, AudioBuffer>(),
      
      // Constants
      _MUSIC_SOURCE: new Map<string, AudioBufferSourceNode>(),
      _LOOP_SOURCES: new Map<string, { source: AudioBufferSourceNode; gainNode: GainNode }>(),
      _BUFFER_CACHE_LIMIT: 20, // MB
      _VOLUME_COEFFICIENTS: {
        music: 1.0,  // Music at full volume
        sfx: 0.5,    // SFX at half volume
        ambient: 0.75  // Ambient at 75% volume
      },
      _SOUND_MAPPINGS: {
        'flashcard-door-open': 'sfx',
        'flashcard-door-closed': 'sfx',
        'flashcard-loop-catfootsteps': 'ambient',
        'elevenlabs-response': 'sfx',
        // ... other sound mappings
      },
      
      // Error handling
      _handleAudioError: (error: Error, context: string) => {
        console.error(`🎵 [AudioContext] ${context}:`, error);
        
        // Check for specific error types
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          toast.error('Please interact with the page first to enable audio.');
        } else if (error.name === 'EncodingError') {
          toast.error('This audio format is not supported by your browser.');
        } else {
          toast.error('Failed to play audio. Please try again.');
        }
      },
      
      // Audio context initialization
      initializeAudioContext: async () => {
        const state = get();
        console.debug('[DEBUG][AudioStore] Initializing audio context');
        
        try {
          // Check if we already have a running context
          if (state._audioContext?.state === 'running') {
            console.debug('[DEBUG][AudioStore] Audio context already running');
            return state._audioContext;
          }

          // Try to resume suspended context
          if (state._audioContext?.state === 'suspended') {
            console.debug('[DEBUG][AudioStore] Resuming suspended audio context');
            await state._audioContext.resume();
            return state._audioContext;
          }

          // Create new context if needed
          if (typeof window !== 'undefined') {
            console.debug('[DEBUG][AudioStore] Creating new audio context');
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({
              latencyHint: 'interactive',
              sampleRate: 44100
            });
            
            await ctx.resume();
            
            // Create master gain node
            const masterGain = ctx.createGain();
            masterGain.connect(ctx.destination);
            masterGain.gain.value = state.masterVolume;
            
            // Update state with new context and gain node
            set({ 
              _audioContext: ctx,
              _masterGainNode: masterGain
            });
            
            console.debug('[DEBUG][AudioStore] Audio context created successfully');
            
            // Monitor performance in development
            if (process.env.NODE_ENV === 'development') {
              if (ctx.baseLatency > 0.025) {
                console.warn('[DEBUG][AudioStore] High audio latency detected:', ctx.baseLatency);
              }
              
              if ((ctx as any).getOutputTimestamp) {
                const timestamp = (ctx as any).getOutputTimestamp();
                if (timestamp.contextTime > timestamp.performanceTime) {
                  console.warn('[DEBUG][AudioStore] Audio buffer underrun detected');
                }
              }
            }
            
            return ctx;
          }
          
          return null;
        } catch (error) {
          state._handleAudioError(error as Error, 'Audio context initialization failed');
          return null;
        }
      },
      
      // Global store initialization - call this once at app startup
      initializeStore: async () => {
        // Prevent multiple initializations
        if (isStoreInitialized) {
          console.debug('[DEBUG][Store] Store already initialized, skipping');
          return;
        }
        
        console.debug('[DEBUG][Store] Initializing global store');
        
        try {
          // Initialize audio context
          const state = get();
          await state.initializeAudioContext();
          
          // Set initialization flag
          isStoreInitialized = true;
          console.debug('[DEBUG][Store] Store initialization complete');
        } catch (error) {
          console.error('[DEBUG][Store] Store initialization failed:', error);
        }
      },
      
      // Load and cache audio buffer
      loadAudioBuffer: async (url: string) => {
        const state = get();
        console.debug(`[DEBUG][AudioStore] Loading audio buffer: ${url}`);
        
        // Check if buffer is already cached
        if (state._bufferCache.has(url)) {
          console.debug(`[DEBUG][AudioStore] Using cached buffer for: ${url}`);
          return state._bufferCache.get(url)!;
        }
        
        // Check cache size before adding new buffer
        let totalSize = 0;
        for (const buffer of state._bufferCache.values()) {
          totalSize += buffer.length * buffer.numberOfChannels * 4; // 4 bytes per sample
        }
        
        if (totalSize > state._BUFFER_CACHE_LIMIT * 1024 * 1024) {
          // Clear oldest entries if cache is too large
          console.debug('[DEBUG][AudioStore] Cache limit reached, clearing oldest entry');
          const oldestKey = state._bufferCache.keys().next().value;
          if (oldestKey) {
            state._bufferCache.delete(oldestKey);
          }
        }
        
        const ctx = await state.initializeAudioContext();
        if (!ctx) throw new Error('Failed to initialize audio context');

        try {
          console.debug(`[DEBUG][AudioStore] Fetching audio file: ${url}`);
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();
          console.debug(`[DEBUG][AudioStore] Decoding audio data: ${url}`);
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          
          // Cache the decoded buffer
          state._bufferCache.set(url, audioBuffer);
          console.debug(`[DEBUG][AudioStore] Audio buffer cached: ${url}`);
          
          return audioBuffer;
        } catch (error) {
          state._handleAudioError(error as Error, `Failed to load audio: ${url}`);
          throw error;
        }
      },
      
      // Basic audio actions
      playMusic: async (src, startPlayback = true, onEnded) => {
        const state = get();
        console.debug(`[DEBUG][AudioStore] Play music called: ${src}, startPlayback: ${startPlayback}`);
        
        if (!startPlayback) {
          state.stopMusic();
          return null;
        }

        try {
          if (state._MUSIC_SOURCE.size > 0) {
            console.debug('[DEBUG][AudioStore] Stopping existing music before playing new track');
            state.stopMusic();
          }

          const audioBuffer = await state.loadAudioBuffer(src);
          const ctx = await state.initializeAudioContext();
          if (!ctx) throw new Error('No audio context');

          set({ 
            isPlayingSong: true,
            currentSong: src
          });

          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;

          // Add gain node with music coefficient
          const gainNode = ctx.createGain();
          gainNode.gain.value = state.masterVolume * state._VOLUME_COEFFICIENTS.music;
          
          // Connect nodes
          source.connect(gainNode);
          gainNode.connect(state._masterGainNode!);

          state._MUSIC_SOURCE.set(src, source);
          
          if (startPlayback) {
            console.debug('[DEBUG][AudioStore] Starting music playback');
            source.start(0);
          }

          source.onended = () => {
            console.debug('[DEBUG][AudioStore] Music playback ended');
            state._MUSIC_SOURCE.delete(src);
            set({
              isPlayingSong: false,
              currentSong: null
            });
            onEnded?.();
          };

          return source;
        } catch (error) {
          state._handleAudioError(error as Error, 'Error playing music');
          return null;
        }
      },
      
      stopMusic: () => {
        const state = get();
        console.debug('[DEBUG][AudioStore] Stopping all music');
        
        state._MUSIC_SOURCE.forEach((source, url) => {
          try {
            source.onended = null;
            source.stop();
            source.disconnect();
            state._MUSIC_SOURCE.delete(url);
            console.debug(`[DEBUG][AudioStore] Stopped music: ${url}`);
          } catch (error) {
            state._handleAudioError(error as Error, 'Error stopping music');
          }
        });

        set({
          isPlayingSong: false,
          currentSong: null
        });
      },
      
      playSound: async (soundName) => {
        const state = get();
        console.log(`[DEBUG][AudioStore] Playing sound: ${soundName}`);
        
        try {
          const ctx = await state.initializeAudioContext();
          if (!ctx) {
            console.error(`[DEBUG][AudioStore] Audio context initialization failed`);
            return;
          }
          
          try {
            const buffer = await state.loadAudioBuffer(`/audio/${soundName}.mp3`);
            console.log(`[DEBUG][AudioStore] Audio buffer loaded successfully for ${soundName}`);
            
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            
            // Get appropriate coefficient
            const category = state._SOUND_MAPPINGS[soundName] || 'sfx';
            const coefficient = state._VOLUME_COEFFICIENTS[category];
            
            // Create gain node with coefficient
            const localGain = ctx.createGain();
            localGain.gain.value = state.masterVolume * coefficient;
            
            // Connect nodes
            source.connect(localGain);
            localGain.connect(state._masterGainNode!);
            
            // Fade in
            localGain.gain.setValueAtTime(0, ctx.currentTime);
            localGain.gain.linearRampToValueAtTime(coefficient * state.masterVolume, ctx.currentTime + 0.02);
            
            source.start();
            console.log(`[DEBUG][AudioStore] Sound started: ${soundName}`);
            
            // Fade out
            const duration = buffer.duration;
            localGain.gain.setValueAtTime(coefficient * state.masterVolume, ctx.currentTime + duration - 0.05);
            localGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
          } catch (bufferError) {
            console.error(`[DEBUG][AudioStore] Error loading audio buffer for ${soundName}:`, bufferError);
            console.log(`[DEBUG][AudioStore] Attempted to load from path: /audio/${soundName}.mp3`);
          }
        } catch (error) {
          console.error(`[DEBUG][AudioStore] Error in playSound for ${soundName}:`, error);
          state._handleAudioError(error as Error, `playSound(${soundName})`);
        }
      },
      
      loopSound: async (soundName) => {
        const state = get();
        const normalizedName = soundName.replace('/audio/', '').replace(/\.(mp3|wav)$/, '');
        const fullPath = `/audio/${normalizedName}.wav`;
        
        console.debug(`[DEBUG][AudioStore] Looping sound: ${normalizedName}, fullPath: ${fullPath}, current loops: ${Array.from(state._LOOP_SOURCES.keys()).join(', ')}`);
        
        // Only one loop can be active at a time
        if (state._LOOP_SOURCES.has(fullPath)) {
          console.debug(`[DEBUG][AudioStore] Loop already active: ${fullPath}`);
          return;
        }

        // Check if any other loops are active and stop them
        if (state._LOOP_SOURCES.size > 0) {
          console.debug(`[DEBUG][AudioStore] Found ${state._LOOP_SOURCES.size} active loops, stopping them before starting new loop`);
          await state.stopAllLoops();
          
          // Add a small delay to ensure audio context has time to clean up
          console.debug('[DEBUG][AudioStore] Adding small delay after stopping loops');
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        try {
          const ctx = await state.initializeAudioContext();
          if (!ctx) throw new Error('Audio context not initialized');

          console.debug(`[DEBUG][AudioStore] Audio context state: ${ctx.state}`);
          
          // Double-check that we haven't already started this loop during async operations
          if (state._LOOP_SOURCES.has(fullPath)) {
            console.debug(`[DEBUG][AudioStore] Loop was started by another call during async operation, skipping: ${fullPath}`);
            return;
          }
          
          const audioBuffer = await state.loadAudioBuffer(fullPath);
          console.debug(`[DEBUG][AudioStore] Successfully loaded audio buffer for ${fullPath}, duration: ${audioBuffer.duration}s`);
          
          // Check again after buffer loading
          if (state._LOOP_SOURCES.has(fullPath)) {
            console.debug(`[DEBUG][AudioStore] Loop was started by another call after buffer loading, skipping: ${fullPath}`);
            return;
          }
          
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = true;

          // Apply the appropriate volume coefficient
          const category = state._SOUND_MAPPINGS[normalizedName] || 'ambient';
          const coefficient = state._VOLUME_COEFFICIENTS[category];

          // Create local gain with fixed coefficient
          const gainNode = ctx.createGain();
          gainNode.gain.value = state.masterVolume * coefficient;
          console.debug(`[DEBUG][AudioStore] Setting gain for loop: ${state.masterVolume} * ${coefficient} = ${state.masterVolume * coefficient}`);

          // Connect directly to master
          source.connect(gainNode);
          gainNode.connect(state._masterGainNode!);

          // Set up error handling for the source
          source.onended = () => {
            console.debug(`[DEBUG][AudioStore] Loop ended unexpectedly: ${fullPath}`);
            if (state._LOOP_SOURCES.has(fullPath)) {
              state._LOOP_SOURCES.delete(fullPath);
              if (state.currentLoop === fullPath) {
                set({ currentLoop: null });
              }
            }
          };

          state._LOOP_SOURCES.set(fullPath, { source, gainNode });
          source.start(0);
          console.debug(`[DEBUG][AudioStore] Loop started: ${fullPath}`);
          
          // Update state with current loop
          set({ currentLoop: fullPath });

        } catch (error) {
          console.error(`[DEBUG][AudioStore] Error in loopSound for ${fullPath}:`, error);
          state._handleAudioError(error as Error, 'Failed to start audio loop');
        }
      },
      
      stopLoopSound: (soundName) => {
        const state = get();
        const normalizedName = soundName.replace('/audio/', '').replace(/\.(mp3|wav)$/, '');
        const fullPath = `/audio/${normalizedName}.wav`;
        
        console.debug(`[DEBUG][AudioStore] Stopping loop: ${normalizedName}, fullPath: ${fullPath}`);
        
        const audio = state._LOOP_SOURCES.get(fullPath);
        if (audio) {
          try {
            console.debug(`[DEBUG][AudioStore] Found active loop to stop: ${fullPath}`);
            audio.source.onended = null; // Remove the onended handler
            audio.source.stop();
            audio.source.disconnect();
            audio.gainNode.disconnect();
            state._LOOP_SOURCES.delete(fullPath);
            console.debug(`[DEBUG][AudioStore] Loop stopped: ${fullPath}`);
            
            // Clear current loop if it matches
            if (state.currentLoop === fullPath) {
              console.debug(`[DEBUG][AudioStore] Clearing current loop state: ${fullPath}`);
              set({ currentLoop: null });
            }
          } catch (error) {
            console.error(`[DEBUG][AudioStore] Error stopping loop ${fullPath}:`, error);
            state._handleAudioError(error as Error, 'Error stopping ambient sound');
            
            // Clean up the reference even if there was an error
            state._LOOP_SOURCES.delete(fullPath);
            if (state.currentLoop === fullPath) {
              set({ currentLoop: null });
            }
          }
        } else {
          console.debug(`[DEBUG][AudioStore] No active loop found: ${fullPath}, active loops: ${Array.from(state._LOOP_SOURCES.keys()).join(', ')}`);
        }
      },
      
      stopAllLoops: async () => {
        const state = get();
        console.debug(`[DEBUG][AudioStore] Stopping all loops, active loops: ${state._LOOP_SOURCES.size}`);
        
        // If no active loops, just clear the state and return
        if (state._LOOP_SOURCES.size === 0) {
          console.debug('[DEBUG][AudioStore] No active loops to stop, just clearing state');
          set({ currentLoop: null });
          return;
        }
        
        // Create a copy of the keys to avoid modification during iteration
        const loopKeys = Array.from(state._LOOP_SOURCES.keys());
        
        // Use Promise.all to handle all stop operations in parallel
        try {
          await Promise.all(loopKeys.map(async (name) => {
            try {
              const audio = state._LOOP_SOURCES.get(name);
              if (!audio) return;
              
              console.debug(`[DEBUG][AudioStore] Stopping loop: ${name}`);
              audio.source.onended = null; // Remove the onended handler
              audio.source.stop();
              audio.source.disconnect();
              audio.gainNode.disconnect();
              state._LOOP_SOURCES.delete(name);
              console.debug(`[DEBUG][AudioStore] Loop stopped: ${name}`);
            } catch (error) {
              console.error(`[DEBUG][AudioStore] Error stopping loop ${name}:`, error);
              state._handleAudioError(error as Error, 'Error stopping ambient sound');
              
              // Clean up the reference even if there was an error
              state._LOOP_SOURCES.delete(name);
            }
          }));
        } catch (error) {
          console.error('[DEBUG][AudioStore] Error in stopAllLoops:', error);
        } finally {
          // Always clear the map and current loop state to prevent getting stuck
          state._LOOP_SOURCES.clear();
          console.debug('[DEBUG][AudioStore] Clearing current loop state');
          set({ currentLoop: null });
        }
      },
      
      getCurrentLoop: () => {
        const loop = get().currentLoop;
        console.debug(`[DEBUG][AudioStore] Getting current loop: ${loop}`);
        return loop;
      },
      
      setMasterVolume: (newVolume) => {
        const state = get();
        console.debug(`[DEBUG][AudioStore] Setting master volume: ${newVolume}`);
        
        if (!state._masterGainNode || !state._audioContext) {
          // Just update the state if audio context isn't initialized
          console.debug('[DEBUG][AudioStore] No audio context, just updating volume state');
          set({ masterVolume: newVolume });
          return;
        }

        const now = state._audioContext.currentTime;
        state._masterGainNode.gain.cancelScheduledValues(now);
        state._masterGainNode.gain.linearRampToValueAtTime(newVolume, now + 0.1);
        console.debug(`[DEBUG][AudioStore] Volume transition scheduled: ${state.masterVolume} -> ${newVolume}`);
        
        // Update state
        set({ masterVolume: newVolume });
      },
      
      // Transition actions (replacing useAudioTransitions)
      handleFlashcardsTransition: async (isOpen) => {
        const state = get();
        console.debug(`[DEBUG][AudioStore] Handling flashcards transition, isOpen=${isOpen}`);
        
        try {
          if (isOpen) {
            // Stop ambient sound when flashcards open
            console.debug('[DEBUG][AudioStore] Flashcards opened, stopping ambient sound');
            await state.stopAllLoops();
            
            // Small delay to ensure audio context has time to clean up
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Play flashcards music
            console.debug('[DEBUG][AudioStore] Starting flashcards music');
            await state.loopSound('flashcard-loop-catfootsteps');
          } else {
            // Stop flashcards music when closed
            console.debug('[DEBUG][AudioStore] Flashcards closed, stopping flashcards music');
            await state.stopAllLoops();
            
            // Small delay to ensure audio context has time to clean up
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Play ambient sound
            console.debug('[DEBUG][AudioStore] Starting ambient sound');
            await state.loopSound('flashcard-loop-catfootsteps');
          }
        } catch (error) {
          console.error('[DEBUG][AudioStore] Error in handleFlashcardsTransition:', error);
          state._handleAudioError(error as Error, 'Error handling flashcards transition');
          
          // Ensure we clean up any pending audio
          await state.stopAllLoops();
        }
      }
    }),
    {
      // Exclude non-serializable fields from devtools
      serialize: {
        options: {
          map: new Map([
            ['_audioContext', '__excluded__'],
            ['_masterGainNode', '__excluded__'],
            ['_bufferCache', '__excluded__'],
            ['_MUSIC_SOURCE', '__excluded__'],
            ['_LOOP_SOURCES', '__excluded__']
          ])
        }
      }
    }
  )
) 

// Export a function to initialize the store at the app level
export const initializeGlobalStore = async () => {
  if (typeof window !== 'undefined' && !isStoreInitialized) {
    console.debug('[DEBUG][Store] Initializing global store from exported function');
    await useStore.getState().initializeStore();
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