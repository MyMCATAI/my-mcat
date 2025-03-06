import { useStore } from './store'
import { useEffect, useCallback } from 'react'

/* --- UI Selectors ---- */
export const useUI = () => {
  const theme = useStore((state) => state.theme)
  const window = useStore((state) => state.window)
  const currentRoute = useStore((state) => state.currentRoute)
  const setTheme = useStore((state) => state.setTheme)
  const setWindowSize = useStore((state) => state.setWindowSize)
  const setCurrentRoute = useStore((state) => state.setCurrentRoute)
  
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
export const useTheme = () => useStore(state => state.theme)
export const useWindowSize = () => useStore(state => state.window)
export const useCurrentRoute = () => useStore(state => state.currentRoute)

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
  const hasCompletedOnboarding = useStore((state) => state.hasCompletedOnboarding)
  const lastVisitedRoute = useStore((state) => state.lastVisitedRoute)
  const onboardingRoute = useStore((state) => state.onboardingRoute)
  
  // Profile actions
  const setCompletedSteps = useStore((state) => state.setCompletedSteps)
  const addCompletedStep = useStore((state) => state.addCompletedStep)
  const updateStudyPreferences = useStore((state) => state.updateStudyPreferences)
  const updateInterfaceSettings = useStore((state) => state.updateInterfaceSettings)
  const updateTutorialProgress = useStore((state) => state.updateTutorialProgress)
  const setHasCompletedOnboarding = useStore((state) => state.setHasCompletedOnboarding)
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
    hasCompletedOnboarding,
    lastVisitedRoute,
    onboardingRoute,
    
    // Profile actions
    setCompletedSteps,
    addCompletedStep,
    updateStudyPreferences,
    updateInterfaceSettings,
    updateTutorialProgress,
    setHasCompletedOnboarding,
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
  const userRooms = useStore((state) => state.userRooms)
  const userLevel = useStore((state) => state.userLevel)
  const patientsPerDay = useStore((state) => state.patientsPerDay)
  const totalPatients = useStore((state) => state.totalPatients)
  const streakDays = useStore((state) => state.streakDays)
  
  // Active game session
  const isGameInProgress = useStore((state) => state.isGameInProgress)
  const currentUserTestId = useStore((state) => state.currentUserTestId)
  const isFlashcardsOpen = useStore((state) => state.isFlashcardsOpen)
  const flashcardRoomId = useStore((state) => state.flashcardRoomId)
  const activeRooms = useStore((state) => state.activeRooms)
  const completeAllRoom = useStore((state) => state.completeAllRoom)
  
  // Test results
  const userResponses = useStore((state) => state.userResponses)
  const correctCount = useStore((state) => state.correctCount)
  const wrongCount = useStore((state) => state.wrongCount)
  const testScore = useStore((state) => state.testScore)
  
  // Game actions
  const startGame = useStore((state) => state.startGame)
  const endGame = useStore((state) => state.endGame)
  const unlockRoom = useStore((state) => state.unlockRoom)
  const setFlashcardRoomId = useStore((state) => state.setFlashcardRoomId)
  const setIsFlashcardsOpen = useStore((state) => state.setIsFlashcardsOpen)
  const setActiveRooms = useStore((state) => state.setActiveRooms)
  const setCompleteAllRoom = useStore((state) => state.setCompleteAllRoom)
  const setUserResponses = useStore((state) => state.setUserResponses)
  const setCorrectCount = useStore((state) => state.setCorrectCount)
  const setWrongCount = useStore((state) => state.setWrongCount)
  const setTestScore = useStore((state) => state.setTestScore)
  const resetGameState = useStore((state) => state.resetGameState)
  const setUserRooms = useStore((state) => state.setUserRooms)
  const updateUserLevel = useStore((state) => state.updateUserLevel)
  const setStreakDays = useStore((state) => state.setStreakDays)
  const setTotalPatients = useStore((state) => state.setTotalPatients)
  
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
  hasCompletedOnboarding: useStore(state => state.hasCompletedOnboarding),
  lastVisitedRoute: useStore(state => state.lastVisitedRoute),
  onboardingRoute: useStore(state => state.onboardingRoute)
})

/* --- Audio Selector ---- */
// Consolidated audio selector that provides all audio-related state and actions
export const useAudio = () => {
  // Audio state
  const isPlayingSong = useStore((state) => state.isPlayingSong)
  const currentSong = useStore((state) => state.currentSong)
  const currentLoop = useStore((state) => state.currentLoop)
  const masterVolume = useStore((state) => state.masterVolume)
  
  // Audio actions
  const playMusic = useStore((state) => state.playMusic)
  const stopMusic = useStore((state) => state.stopMusic)
  const playSound = useStore((state) => state.playSound)
  const loopSound = useStore((state) => state.loopSound)
  const stopLoopSound = useStore((state) => state.stopLoopSound)
  const stopAllLoops = useStore((state) => state.stopAllLoops)
  const getCurrentLoop = useStore((state) => state.getCurrentLoop)
  const setMasterVolume = useStore((state) => state.setMasterVolume)
  const initializeAudioContext = useStore((state) => state.initializeAudioContext)
  const handleFlashcardsTransition = useStore((state) => state.handleFlashcardsTransition)
  
  // Initialize audio context on first use
  useEffect(() => {
    console.debug('[useAudio] Initializing audio context on hook mount')
    initializeAudioContext().catch(error => {
      console.error('[useAudio] Failed to initialize audio context:', error)
    })
  }, [initializeAudioContext])

  // Enhanced API with additional debug logging
  return {
    // Audio state
    isPlaying: isPlayingSong,
    currentSong,
    currentLoop,
    volume: masterVolume,
    
    // Audio actions with debug logging
    playMusic: useCallback(async (src: string, startPlayback = true, onEnded?: () => void) => {
      console.debug(`[useAudio] Playing music: ${src}, startPlayback: ${startPlayback}`)
      return playMusic(src, startPlayback, onEnded)
    }, [playMusic]),
    
    stopMusic: useCallback(() => {
      console.debug('[useAudio] Stopping music')
      stopMusic()
    }, [stopMusic]),
    
    playSound: useCallback((soundName: string) => {
      console.debug(`[useAudio] Playing sound: ${soundName}`)
      playSound(soundName)
    }, [playSound]),
    
    loopSound: useCallback((soundName: string) => {
      console.debug(`[useAudio] Looping sound: ${soundName}`)
      loopSound(soundName)
    }, [loopSound]),
    
    stopLoopSound: useCallback((soundName: string) => {
      console.debug(`[useAudio] Stopping loop: ${soundName}`)
      stopLoopSound(soundName)
    }, [stopLoopSound]),
    
    stopAllLoops: useCallback(() => {
      console.debug('[useAudio] Stopping all loops')
      stopAllLoops()
    }, [stopAllLoops]),
    
    getActiveLoops: useCallback(() => {
      const loop = getCurrentLoop()
      console.debug(`[useAudio] Getting active loop: ${loop}`)
      return loop ? [loop] : []
    }, [getCurrentLoop]),
    
    setVolume: useCallback((newVolume: number) => {
      console.debug(`[useAudio] Setting volume: ${newVolume}`)
      setMasterVolume(newVolume)
    }, [setMasterVolume]),
    
    handleFlashcardsTransition: useCallback((isOpen: boolean) => {
      console.debug(`[useAudio] Handling flashcards transition, isOpen: ${isOpen}`)
      handleFlashcardsTransition(isOpen)
    }, [handleFlashcardsTransition])
  }
} 