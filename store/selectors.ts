import { useEffect, useCallback, useRef } from 'react'
import { useAudioStore } from './slices/audioSlice'
import { useUIStore } from './slices/uiSlice'
import { useGameStore } from './slices/gameSlice'
import { useUserStore } from './slices/userSlice'
import { useVocabStore } from './slices/vocabSlice'
import { useKnowledgeStore } from './slices/knowledgeSlice'

/* --- UI Selectors ---- */
export const useUI = () => {
  const theme = useUIStore((state) => state.theme)
  const window = useUIStore((state) => state.window)
  const currentRoute = useUIStore((state) => state.currentRoute)
  const navigation = useUIStore((state) => state.navigation)
  const context = useUIStore((state) => state.context)
  const setTheme = useUIStore((state) => state.setTheme)
  const setWindowSize = useUIStore((state) => state.setWindowSize)
  const setCurrentRoute = useUIStore((state) => state.setCurrentRoute)
  const setPage = useUIStore((state) => state.setPage)
  const setSubSection = useUIStore((state) => state.setSubSection)
  const setContext = useUIStore((state) => state.setContext)
  const clearContext = useUIStore((state) => state.clearContext)
  
  return {
    theme,
    window,
    currentRoute,
    navigation,
    context,
    setTheme,
    setWindowSize,
    setCurrentRoute,
    setPage,
    setSubSection,
    setContext,
    clearContext,
  }
}

export const useTheme = () => useUIStore(state => state.theme)
export const useWindowSize = () => useUIStore(state => state.window)
export const useCurrentRoute = () => useUIStore(state => state.currentRoute)

/* --- Navigation Selector ---- */
export const useNavigation = () => {
  const navigation = useUIStore((state) => state.navigation)
  const context = useUIStore((state) => state.context)
  const setPage = useUIStore((state) => state.setPage)
  const setSubSection = useUIStore((state) => state.setSubSection)
  const setContext = useUIStore((state) => state.setContext)
  const clearContext = useUIStore((state) => state.clearContext)
  
  // Navigate to a section within the app
  const navigateToPage = (page: string) => {
    console.log(`[useNavigation] navigateToPage called with: ${page}, current page: ${navigation.page}`);
    setPage(page);
    console.log(`[useNavigation] navigateToPage completed, page should now be: ${page}`);
  };
  
  // Update sub-section without changing page
  const updateSubSection = (updates: Record<string, any>) => {
    console.log(`[useNavigation] updateSubSection called with:`, updates);
    setSubSection(updates);
  };
  
  // Combined navigation with context update
  const navigateWithContext = (page: string, contextData: Record<string, any>) => {
    console.log(`[useNavigation] navigateWithContext called with page: ${page}`);
    setPage(page);
    setContext(contextData);
  };
  
  // Home page specific navigation
  const navigateHomeTab = (tab: string, additionalContext?: Record<string, any>) => {
    console.log(`[useNavigation] navigateHomeTab called with: ${tab}, current page: ${navigation.page}`);
    setPage(tab);
    if (additionalContext) {
      setContext(additionalContext);
    }
    console.log(`[useNavigation] navigateHomeTab completed, page should now be: ${tab}`);
  };
  
  // Navigate to ATS content
  const navigateToATS = (subject: string, contentType: string, additionalContext?: Record<string, any>) => {
    setPage('ats');
    setSubSection({
      concept: subject,
      contentType,
      ...additionalContext
    });
  };
  
  // Reset navigation state
  const resetNavigation = () => {
    setPage('KalypsoAI');
    clearContext();
  };
  
  return {
    // Current state
    activePage: navigation.page,
    subSection: navigation.subSection,
    context,
    
    // Navigation actions
    navigateToPage,
    updateSubSection,
    navigateWithContext,
    navigateHomeTab,
    navigateToATS,
    resetNavigation,
    
    // Direct state setters (for advanced usage)
    setPage,
    setSubSection,
    setContext,
    clearContext
  };
}

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
  const onboardingComplete = useUserStore((state) => state.userInfo?.onboardingInfo?.onboardingComplete ?? false)
  const lastVisitedRoute = useUserStore((state) => state.lastVisitedRoute)
  
  // Profile actions
  const setCompletedSteps = useUserStore((state) => state.setCompletedSteps)
  const addCompletedStep = useUserStore((state) => state.addCompletedStep)
  const updateStudyPreferences = useUserStore((state) => state.updateStudyPreferences)
  const updateInterfaceSettings = useUserStore((state) => state.updateInterfaceSettings)
  const updateTutorialProgress = useUserStore((state) => state.updateTutorialProgress)
  const setOnboardingComplete = useUserStore((state) => state.setOnboardingComplete)
  const setLastVisitedRoute = useUserStore((state) => state.setLastVisitedRoute)
  
  // User info state and actions
  const userInfo = useUserStore((state) => state.userInfo)
  const isSubscribed = useUserStore((state) => state.isSubscribed)
  const setIsSubscribed = useUserStore((state) => state.setIsSubscribed)
  
  // Explicitly access hasSeenIntroVideo from onboardingInfo
  const hasSeenIntroVideo = userInfo?.onboardingInfo?.hasSeenIntroVideo || false
  const setHasSeenIntroVideo = useUserStore((state) => state.setHasSeenIntroVideo)
  
  // User stats state and actions
  const coins = useUserStore((state) => state.coins)
  const statsLoading = useUserStore((state) => state.statsLoading)
  const updateCoins = useUserStore((state) => state.updateCoins)
  const updateCoinsDisplay = useUserStore((state) => state.updateCoinsDisplay)
  const refreshUserInfo = useUserStore((state) => state.refreshUserInfo)

  return {
    // Profile state
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
    
    // Profile actions
    setCompletedSteps,
    addCompletedStep,
    updateStudyPreferences,
    updateInterfaceSettings,
    updateTutorialProgress,
    setOnboardingComplete,
    setLastVisitedRoute,
    
    // User info
    userInfo,
    isSubscribed,
    setIsSubscribed,
    hasSeenIntroVideo,
    setHasSeenIntroVideo,
    
    // Stats
    coins,
    statsLoading,
    updateCoins,
    updateCoinsDisplay,
    refreshUserInfo,
  }
}

// Dedicated selector for hasSeenIntroVideo
export const useHasSeenIntroVideo = () => {
  const userInfo = useUserStore((state) => state.userInfo)
  const hasSeenIntroVideo = userInfo?.onboardingInfo?.hasSeenIntroVideo || false
  const setHasSeenIntroVideo = useUserStore((state) => state.setHasSeenIntroVideo)
  
  return { hasSeenIntroVideo, setHasSeenIntroVideo }
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
// Commented out as they're currently unused in the codebase
// export const useVocabList = () => useVocabStore(state => state.vocabList)
// export const useShowVocabList = () => useVocabStore(state => state.showVocabList)
// export const useIsCmdIEnabled = () => useVocabStore(state => state.isCmdIEnabled)

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

/* --- Knowledge Profile Selector ---- */
export const useKnowledge = () => {
  // Knowledge state
  const sections = useKnowledgeStore((state) => state.sections)
  const sectionSummaries = useKnowledgeStore((state) => state.sectionSummaries)
  const weakestConcepts = useKnowledgeStore((state) => state.weakestConcepts)
  const isLoading = useKnowledgeStore((state) => state.isLoading)
  const lastFetched = useKnowledgeStore((state) => state.lastFetched)
  const error = useKnowledgeStore((state) => state.error)
  
  // Knowledge actions
  const fetchKnowledgeProfiles = useKnowledgeStore((state) => state.fetchKnowledgeProfiles)
  const resetKnowledgeProfiles = useKnowledgeStore((state) => state.resetKnowledgeProfiles)
  const checkAndUpdateKnowledgeProfiles = useKnowledgeStore((state) => state.checkAndUpdateKnowledgeProfiles)
  
  // Computed statistics
  const overallMastery = sectionSummaries.length > 0 
    ? sectionSummaries.reduce((sum, s) => sum + s.averageMastery, 0) / sectionSummaries.length
    : 0
    
  const strongestSection = sectionSummaries.length > 0
    ? [...sectionSummaries].sort((a, b) => b.averageMastery - a.averageMastery)[0]
    : null
  
  const weakestSection = sectionSummaries.length > 0
    ? [...sectionSummaries].sort((a, b) => a.averageMastery - b.averageMastery)[0]
    : null
  
  return {
    // Raw data
    sections,
    sectionSummaries,
    weakestConcepts,
    isLoading,
    lastFetched,
    error,
    
    // Computed data
    overallMastery,
    strongestSection,
    weakestSection,
    
    // Actions
    fetchKnowledgeProfiles,
    resetKnowledgeProfiles,
    checkAndUpdateKnowledgeProfiles
  }
} 