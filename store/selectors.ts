import { useStore } from './store'
import { useEffect, useCallback, useRef } from 'react'
import { useAudioStore } from './slices/audioSlice'
import { useUIStore } from './slices/uiSlice'
import { useGameStore } from './slices/gameSlice'
import { useChatStore } from './slices/chatSlice'
import { useATSStore } from './slices/atsSlice'

/* --- UI Selectors ---- */
export const useUI = () => {
  const theme = useUIStore((state) => state.theme)
  const window = useUIStore((state) => state.window)
  const currentRoute = useUIStore((state) => state.currentRoute)
  const activeTab = useUIStore((state) => state.activeTab)
  const setTheme = useUIStore((state) => state.setTheme)
  const setWindowSize = useUIStore((state) => state.setWindowSize)
  const setCurrentRoute = useUIStore((state) => state.setCurrentRoute)
  const setActiveTab = useUIStore((state) => state.setActiveTab)
  
  return {
    theme,
    window,
    currentRoute,
    activeTab,
    setTheme,
    setWindowSize,
    setCurrentRoute,
    setActiveTab,
  }
}

// Individual property selectors for performance
export const useTheme = () => useUIStore(state => state.theme)
export const useWindowSize = () => useUIStore(state => state.window)
export const useCurrentRoute = () => useUIStore(state => state.currentRoute)

/* --- User Selector ---- */
// Consolidated user selector that provides all user-related state and actions
export const useUser = () => {
  // Profile state and actions
  const profile = useStore((state) => state.profile)
  const profileLoading = useStore((state) => state.profileLoading)
  const updateProfile = useStore((state) => state.updateProfile)
  const isProfileComplete = useStore((state) => state.isProfileComplete)
  const completedSteps = useStore((state) => state.completedSteps)
  const studyPreferences = useStore((state) => state.studyPreferences)
  const interfaceSettings = useStore((state) => state.interfaceSettings)
  const tutorialProgress = useStore((state) => state.tutorialProgress)
  const onboardingComplete = useStore((state) => state.onboardingComplete)
  const lastVisitedRoute = useStore((state) => state.lastVisitedRoute)
  const onboardingRoute = useStore((state) => state.onboardingRoute)
  
  // Profile actions
  const setCompletedSteps = useStore((state) => state.setCompletedSteps)
  const addCompletedStep = useStore((state) => state.addCompletedStep)
  const updateStudyPreferences = useStore((state) => state.updateStudyPreferences)
  const updateInterfaceSettings = useStore((state) => state.updateInterfaceSettings)
  const updateTutorialProgress = useStore((state) => state.updateTutorialProgress)
  const setOnboardingComplete = useStore((state) => state.setOnboardingComplete)
  const setLastVisitedRoute = useStore((state) => state.setLastVisitedRoute)
  const setOnboardingRoute = useStore((state) => state.setOnboardingRoute)
  
  // User info state and actions
  const userInfo = useStore((state) => state.userInfo)
  const isSubscribed = useStore((state) => state.isSubscribed)
  const setIsSubscribed = useStore((state) => state.setIsSubscribed)
  
  // User stats state and actions
  const coins = useStore((state) => state.coins)
  const statsLoading = useStore((state) => state.statsLoading)
  const updateCoins = useStore((state) => state.updateCoins)
  const updateCoinsDisplay = useStore((state) => state.updateCoinsDisplay)
  
  // Shared actions
  const refreshUserInfo = useStore((state) => state.refreshUserInfo)
  
  return {
    // Profile state and actions
    profile,
    profileLoading,
    updateProfile,
    isProfileComplete,
    completedSteps,
    studyPreferences,
    interfaceSettings,
    tutorialProgress,
    onboardingComplete,
    lastVisitedRoute,
    onboardingRoute,
    
    // Profile actions
    setCompletedSteps,
    addCompletedStep,
    updateStudyPreferences,
    updateInterfaceSettings,
    updateTutorialProgress,
    setOnboardingComplete,
    setLastVisitedRoute,
    setOnboardingRoute,
    
    // User info state and actions
    userInfo,
    isSubscribed,
    setIsSubscribed,
    
    // User stats state and actions
    coins,
    statsLoading,
    updateCoins,
    updateCoinsDisplay,
    
    // Shared actions
    refreshUserInfo,
  }
}

/* --- Game Selector ---- */
// Consolidated game selector that provides all game-related state and actions
export const useGame = () => {
  // Game progress
  const userRooms = useGameStore((state) => state.userRooms)
  const userLevel = useGameStore((state) => state.userLevel)
  const patientsPerDay = useGameStore((state) => state.patientsPerDay)
  const totalPatients = useGameStore((state) => state.totalPatients)
  const streakDays = useGameStore((state) => state.streakDays)
  
  // Active game session
  const isGameInProgress = useGameStore((state) => state.isGameInProgress)
  const currentUserTestId = useGameStore((state) => state.currentUserTestId)
  const isFlashcardsOpen = useGameStore((state) => state.isFlashcardsOpen)
  const flashcardRoomId = useGameStore((state) => state.flashcardRoomId)
  const activeRooms = useGameStore((state) => state.activeRooms)
  const completeAllRoom = useGameStore((state) => state.completeAllRoom)
  
  // Test results
  const userResponses = useGameStore((state) => state.userResponses)
  const correctCount = useGameStore((state) => state.correctCount)
  const wrongCount = useGameStore((state) => state.wrongCount)
  const testScore = useGameStore((state) => state.testScore)
  
  // Game actions
  const startGame = useGameStore((state) => state.startGame)
  const endGame = useGameStore((state) => state.endGame)
  const unlockRoom = useGameStore((state) => state.unlockRoom)
  const setFlashcardRoomId = useGameStore((state) => state.setFlashcardRoomId)
  const setIsFlashcardsOpen = useGameStore((state) => state.setIsFlashcardsOpen)
  const setActiveRooms = useGameStore((state) => state.setActiveRooms)
  const setCompleteAllRoom = useGameStore((state) => state.setCompleteAllRoom)
  const setUserResponses = useGameStore((state) => state.setUserResponses)
  const setCorrectCount = useGameStore((state) => state.setCorrectCount)
  const setWrongCount = useGameStore((state) => state.setWrongCount)
  const setTestScore = useGameStore((state) => state.setTestScore)
  const resetGameState = useGameStore((state) => state.resetGameState)
  const setUserRooms = useGameStore((state) => state.setUserRooms)
  const updateUserLevel = useGameStore((state) => state.updateUserLevel)
  const setStreakDays = useGameStore((state) => state.setStreakDays)
  const setTotalPatients = useGameStore((state) => state.setTotalPatients)
  
  return {
    // Game progress
    userRooms,
    userLevel,
    patientsPerDay,
    totalPatients,
    streakDays,
    
    // Active game session
    isGameInProgress,
    currentUserTestId,
    isFlashcardsOpen,
    flashcardRoomId,
    activeRooms,
    completeAllRoom,
    
    // Test results
    userResponses,
    correctCount,
    wrongCount,
    testScore,
    
    // Game actions
    startGame,
    endGame,
    unlockRoom,
    setFlashcardRoomId,
    setIsFlashcardsOpen,
    setActiveRooms,
    setCompleteAllRoom,
    setUserResponses,
    setCorrectCount,
    setWrongCount,
    setTestScore,
    resetGameState,
    setUserRooms,
    updateUserLevel,
    setStreakDays,
    setTotalPatients,
  }
}

/* --- Individual Profile Selectors ---- */
// For components that only need specific profile data
export const useProfileComplete = () => useStore(state => state.isProfileComplete)
export const useCompletedSteps = () => useStore(state => state.completedSteps)
export const useStudyPreferences = () => useStore(state => state.studyPreferences)
export const useInterfaceSettings = () => useStore(state => state.interfaceSettings)
export const useTutorialProgress = () => useStore(state => state.tutorialProgress)
export const useOnboardingStatus = () => ({
  onboardingComplete: useStore(state => state.onboardingComplete),
  lastVisitedRoute: useStore(state => state.lastVisitedRoute),
  onboardingRoute: useStore(state => state.onboardingRoute)
})

/* --- Audio Selector ---- */
// Consolidated audio selector that provides all audio-related state and actions
export const useAudio = () => {
  // Audio state
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const currentSong = useAudioStore((state) => state.currentSong)
  const currentLoop = useAudioStore((state) => state.currentLoop)
  const volume = useAudioStore((state) => state.volume)
  const songQueue = useAudioStore((state) => state.songQueue)
  const audioContext = useAudioStore((state) => state.audioContext)
  
  // Audio actions
  const playMusic = useAudioStore((state) => state.playMusic)
  const stopMusic = useAudioStore((state) => state.stopMusic)
  const playSound = useAudioStore((state) => state.playSound)
  const playLoop = useAudioStore((state) => state.playLoop)
  const stopLoop = useAudioStore((state) => state.stopLoop)
  const setVolume = useAudioStore((state) => state.setVolume)
  const initializeAudioContext = useAudioStore((state) => state.initializeAudioContext)
  
  // Theme-music integration
  const handleThemeChange = useAudioStore((state) => state.handleThemeChange)
  
  // Song information
  const getCurrentSongTitle = useAudioStore((state) => state.getCurrentSongTitle)
  
  // Queue system
  const skipToNext = useAudioStore((state) => state.skipToNext)
  const togglePlayPause = useAudioStore((state) => state.togglePlayPause)
  const setSongQueue = useAudioStore((state) => state.setSongQueue)
  
  // Initialize audio context on first use - but only once per component instance
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    console.debug('[useAudio] Initializing audio context on hook mount')
    hasInitializedRef.current = true;
    
    initializeAudioContext().catch(error => {
      console.error('[useAudio] Failed to initialize audio context:', error);
    });
  }, [initializeAudioContext]);
  
  return {
    // Audio state
    isPlaying,
    currentSong,
    currentLoop,
    volume,
    songQueue,
    audioContext,
    
    // Audio actions
    playMusic,
    stopMusic,
    playSound,
    playLoop,
    stopLoop,
    setVolume,
    initializeAudioContext,
    
    // Theme-music integration
    handleThemeChange,
    
    // Song information
    getCurrentSongTitle,
    
    // Queue system
    skipToNext,
    togglePlayPause,
    setSongQueue,
  };
}

/* --- Vocab Selector ---- */
// Consolidated vocab selector that provides all vocabulary-related state and actions
export const useVocab = () => {
  // Vocab state
  const vocabList = useStore((state) => state.vocabList)
  const showVocabList = useStore((state) => state.showVocabList)
  const isCmdIEnabled = useStore((state) => state.isCmdIEnabled)
  
  // Vocab actions
  const addVocabWord = useStore((state) => state.addVocabWord)
  const removeVocabWord = useStore((state) => state.removeVocabWord)
  const toggleVocabList = useStore((state) => state.toggleVocabList)
  const toggleCmdI = useStore((state) => state.toggleCmdI)
  
  return {
    // State
    vocabList,
    showVocabList,
    isCmdIEnabled,
    
    // Actions
    addVocabWord,
    removeVocabWord,
    toggleVocabList,
    toggleCmdI
  }
}

// Individual property selectors for performance
export const useVocabList = () => useStore(state => state.vocabList)
export const useShowVocabList = () => useStore(state => state.showVocabList)
export const useIsCmdIEnabled = () => useStore(state => state.isCmdIEnabled)

/* --- Clinic Data Management ---- */
export const useClinicData = () => {
  // Clinic data state
  const reportData = useGameStore((state) => state.reportData);
  const isLoading = useGameStore((state) => state.isClinicDataLoading);
  
  // Clinic data actions
  const fetchData = useGameStore((state) => state.fetchClinicData);
  const resetData = useGameStore((state) => state.resetClinicData);
  const performDailyCalculations = useGameStore((state) => state.performDailyCalculations);
  
  // Game state needed for clinic data
  const userRooms = useGameStore((state) => state.userRooms);
  const streakDays = useGameStore((state) => state.streakDays);
  const totalPatients = useGameStore((state) => state.totalPatients);
  
  // Enhanced functionality for page.tsx
  const initializeClinicData = useCallback(async () => {
    try {
      await fetchData();
      return true;
    } catch (error) {
      console.error('[ERROR] Failed to initialize clinic data:', error);
      return false;
    }
  }, [fetchData]);
  
  // Daily patient calculation with toast notifications now managed by the store
  const calculateDailyPatients = useCallback(async () => {
    try {
      await performDailyCalculations();
      return true;
    } catch (error) {
      console.error('[ERROR] Failed to calculate daily patients:', error);
      return false;
    }
  }, [performDailyCalculations]);
  
  return {
    // State
    reportData,
    isLoading,
    userRooms,
    streakDays,
    totalPatients,
    
    // Actions
    fetchData,
    resetData,
    
    // Enhanced functionality
    initializeClinicData,
    calculateDailyPatients,
    performDailyCalculations
  };
};

/* --- Chat Selector ---- */
export const useChat = () => {
  const currentPrompt = useChatStore((state) => state.currentPrompt)
  const chatHistory = useChatStore((state) => state.chatHistory)
  const setCurrentPrompt = useChatStore((state) => state.setCurrentPrompt)
  const addChatMessage = useChatStore((state) => state.addChatMessage)
  const clearChat = useChatStore((state) => state.clearChat)
  
  return {
    currentPrompt,
    chatHistory,
    setCurrentPrompt,
    addChatMessage,
    clearChat,
  }
}

/* --- ATS Selector ---- */
export const useATS = () => {
  const timer = useATSStore((state) => state.timer)
  const timerFormatted = useATSStore((state) => state.timerFormatted)
  const videoPause = useATSStore((state) => state.videoPause)
  const setTimer = useATSStore((state) => state.setTimer)
  const setVideoPause = useATSStore((state) => state.setVideoPause)
  const startTimer = useATSStore((state) => state.startTimer)
  const stopTimer = useATSStore((state) => state.stopTimer)
  const resetState = useATSStore((state) => state.resetState)
  
  return {
    timer,
    timerFormatted,
    videoPause,
    setTimer,
    setVideoPause,
    startTimer,
    stopTimer,
    resetState,
  }
}

// Individual property selectors for performance
export const useATSTimer = () => useATSStore(state => state.timer)
export const useATSVideoPause = () => useATSStore(state => state.videoPause) 