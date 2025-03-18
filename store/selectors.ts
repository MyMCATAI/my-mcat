import { useStore } from './store'
import { useEffect, useCallback, useRef } from 'react'
import { useAudioStore } from './slices/audioSlice'
import { useUIStore } from './slices/uiSlice'
import { useGameStore } from './slices/gameSlice'
import { useUserStore } from './slices/userSlice'
import { useVocabStore } from './slices/vocabSlice'

/* --- UI Selectors ---- */
export const useUI = () => {
  const theme = useUIStore((state) => state.theme)
  const window = useUIStore((state) => state.window)
  const currentRoute = useUIStore((state) => state.currentRoute)
  const setTheme = useUIStore((state) => state.setTheme)
  const setWindowSize = useUIStore((state) => state.setWindowSize)
  const setCurrentRoute = useUIStore((state) => state.setCurrentRoute)
  
  return {
    theme,
    window,
    currentRoute,
    setTheme,
    setWindowSize,
    setCurrentRoute,
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
  const profile = useUserStore((state) => state.profile)
  const profileLoading = useUserStore((state) => state.profileLoading)
  const updateProfile = useUserStore((state) => state.updateProfile)
  const isProfileComplete = useUserStore((state) => state.isProfileComplete)
  const completedSteps = useUserStore((state) => state.completedSteps)
  const studyPreferences = useUserStore((state) => state.studyPreferences)
  const interfaceSettings = useUserStore((state) => state.interfaceSettings)
  const tutorialProgress = useUserStore((state) => state.tutorialProgress)
  const onboardingComplete = useUserStore((state) => state.onboardingComplete)
  const lastVisitedRoute = useUserStore((state) => state.lastVisitedRoute)
  const onboardingRoute = useUserStore((state) => state.onboardingRoute)
  
  // Profile actions
  const setCompletedSteps = useUserStore((state) => state.setCompletedSteps)
  const addCompletedStep = useUserStore((state) => state.addCompletedStep)
  const updateStudyPreferences = useUserStore((state) => state.updateStudyPreferences)
  const updateInterfaceSettings = useUserStore((state) => state.updateInterfaceSettings)
  const updateTutorialProgress = useUserStore((state) => state.updateTutorialProgress)
  const setOnboardingComplete = useUserStore((state) => state.setOnboardingComplete)
  const setLastVisitedRoute = useUserStore((state) => state.setLastVisitedRoute)
  const setOnboardingRoute = useUserStore((state) => state.setOnboardingRoute)
  
  // User info state and actions
  const userInfo = useUserStore((state) => state.userInfo)
  const isSubscribed = useUserStore((state) => state.isSubscribed)
  const setIsSubscribed = useUserStore((state) => state.setIsSubscribed)
  
  // User stats state and actions
  const coins = useUserStore((state) => state.coins)
  const statsLoading = useUserStore((state) => state.statsLoading)
  const updateCoins = useUserStore((state) => state.updateCoins)
  const updateCoinsDisplay = useUserStore((state) => state.updateCoinsDisplay)
  
  // Shared actions
  const refreshUserInfo = useUserStore((state) => state.refreshUserInfo)
  
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
export const useProfileComplete = () => useUserStore(state => state.isProfileComplete)
export const useCompletedSteps = () => useUserStore(state => state.completedSteps)
export const useStudyPreferences = () => useUserStore(state => state.studyPreferences)
export const useInterfaceSettings = () => useUserStore(state => state.interfaceSettings)
export const useTutorialProgress = () => useUserStore(state => state.tutorialProgress)
export const useOnboardingStatus = () => ({
  onboardingComplete: useUserStore(state => state.onboardingComplete),
  lastVisitedRoute: useUserStore(state => state.lastVisitedRoute),
  onboardingRoute: useUserStore(state => state.onboardingRoute)
})

/* --- Audio Selector ---- */
// Consolidated audio selector that provides all audio-related state and actions
export const useAudio = () => {
  /* ---- State ----- */
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const currentSong = useAudioStore((state) => state.currentSong)
  const currentLoop = useAudioStore((state) => state.currentLoop)
  const volume = useAudioStore((state) => state.volume)
  const songQueue = useAudioStore((state) => state.songQueue)
  const audioContext = useAudioStore((state) => state.audioContext)
  
  // Additional state for debugging
  const currentMusic = useAudioStore((state) => state.currentMusic)
  const masterVolume = useAudioStore((state) => state.masterVolume)
  const currentSongIndex = useAudioStore((state) => state.currentSongIndex)
  
  // Audio sources for debugging
  const musicSource = useAudioStore((state) => state.musicSource)
  const loopSource = useAudioStore((state) => state.loopSource)
  const voiceSource = useAudioStore((state) => state.voiceSource)
  
  // Gain nodes for debugging
  const masterGainNode = useAudioStore((state) => state.masterGainNode)
  const musicGainNode = useAudioStore((state) => state.musicGainNode)
  const sfxGainNode = useAudioStore((state) => state.sfxGainNode)
  const loopGainNode = useAudioStore((state) => state.loopGainNode)
  const voiceGainNode = useAudioStore((state) => state.voiceGainNode)
  
  // Methods
  const playMusic = useAudioStore((state) => state.playMusic)
  const stopMusic = useAudioStore((state) => state.stopMusic)
  const playSound = useAudioStore((state) => state.playSound)
  const playLoop = useAudioStore((state) => state.playLoop)
  const stopLoop = useAudioStore((state) => state.stopLoop)
  const playVoice = useAudioStore((state) => state.playVoice)
  const stopVoice = useAudioStore((state) => state.stopVoice)
  const setVolume = useAudioStore((state) => state.setVolume)
  const initializeAudioContext = useAudioStore((state) => state.initializeAudioContext)
  
  // Player controls
  const handleThemeChange = useAudioStore((state) => state.handleThemeChange)
  
  // Metadata
  const getCurrentSongTitle = useAudioStore((state) => state.getCurrentSongTitle)
  
  // Player navigation
  const skipToNext = useAudioStore((state) => state.skipToNext)
  const togglePlayPause = useAudioStore((state) => state.togglePlayPause)
  const setSongQueue = useAudioStore((state) => state.setSongQueue)
  
  // Use a ref to track initialization
  const hasInitializedRef = useRef(false);
  
  // Effect to initialize audio context on component mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    
    console.debug('[useAudio] Initializing audio context on hook mount')
    hasInitializedRef.current = true;
    
    initializeAudioContext().catch(error => {
      console.error('[useAudio] Failed to initialize audio context:', error);
    });
  }, [initializeAudioContext]);
  
  return {
    /* ---- State ----- */
    isPlaying,
    currentSong,
    currentLoop,
    volume,
    songQueue,
    audioContext,
    
    // Additional state for debugging
    currentMusic,
    masterVolume,
    currentSongIndex,
    
    // Audio sources for debugging
    musicSource,
    loopSource,
    voiceSource,
    
    // Gain nodes for debugging
    masterGainNode,
    musicGainNode,
    sfxGainNode,
    loopGainNode,
    voiceGainNode,
    
    // Methods
    playMusic,
    stopMusic,
    playSound,
    playLoop,
    stopLoop,
    playVoice,
    stopVoice,
    setVolume,
    initializeAudioContext,
    
    // Player controls
    handleThemeChange,
    
    // Metadata
    getCurrentSongTitle,
    
    // Player navigation
    skipToNext,
    togglePlayPause,
    setSongQueue,
  };
}

/* --- Vocab Selector ---- */
// Consolidated vocab selector that provides all vocabulary-related state and actions
export const useVocab = () => {
  // Vocab state
  const vocabList = useVocabStore((state) => state.vocabList)
  const showVocabList = useVocabStore((state) => state.showVocabList)
  const isCmdIEnabled = useVocabStore((state) => state.isCmdIEnabled)
  
  // Vocab actions
  const addVocabWord = useVocabStore((state) => state.addVocabWord)
  const removeVocabWord = useVocabStore((state) => state.removeVocabWord)
  const toggleVocabList = useVocabStore((state) => state.toggleVocabList)
  const toggleCmdI = useVocabStore((state) => state.toggleCmdI)
  
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
export const useVocabList = () => useVocabStore(state => state.vocabList)
export const useShowVocabList = () => useVocabStore(state => state.showVocabList)
export const useIsCmdIEnabled = () => useVocabStore(state => state.isCmdIEnabled)

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