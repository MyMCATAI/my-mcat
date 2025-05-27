"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react";
import ReactDOM from 'react-dom';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { DoctorOfficeStats } from "@/types";
import { toast, Toaster } from "react-hot-toast";
import { imageGroups } from "./constants/imageGroups";
import dynamic from 'next/dynamic';
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUserActivity } from '@/hooks/useUserActivity';
import { useAudio } from "@/store/selectors";
import type { UserResponse } from "@prisma/client";
import type { FetchedActivity } from "@/types";
import { GridImage } from './types';
import { getWelcomeMessage, getSuccessMessage } from './utils';
import { useGame } from "@/store/selectors";
import { useWindowSize } from "@/store/selectors";
import ClinicHeader from "./components/ClinicHeader";
import HoverSidebar from "@/components/navigation/HoverSidebar";
import OfficeContainer from './OfficeContainer';
import SideBar from "../home/SideBar";
import { useUser } from "@/store/selectors";
import AdaptiveTutoring from "../home/AdaptiveTutoring";
import AnkiClinicTutoring from "./components/AnkiClinicTutoring";

import { FeatureUnlockBanner } from '@/components/ankiclinic/FeatureUnlockBanner';
import KalypsoOnboarding from '@/components/onboarding/KalypsoOnboarding';

// Important UI components with loading fallbacks
const NewGameButton = dynamic(() => import('./components/NewGameButton'), {
  ssr: false,
  loading: () => (
    <button className="p-3 bg-[--theme-gradient-startstreak] rounded-full shadow-lg flex items-center justify-center opacity-70">
      <span className="animate-pulse">Loading...</span>
    </button>
  )
});

// Secondary components that can load later
const ShoppingDialog = dynamic(() => import('./ShoppingDialog'), {
  ssr: false
});

const FlashcardsDialog = dynamic(() => import('./FlashcardsDialog'), {
  ssr: false
});

const AfterTestFeed = dynamic(() => import('./AfterTestFeed'), {
  ssr: false
});

const RedeemReferralModal = dynamic(() => import('@/components/social/friend-request/RedeemReferralModal'), {
  ssr: false
});

// Loading component for better UX during initial load
const LoadingClinic = () => (
  <div className="flex w-full h-full max-w-full max-h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
    <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] animate-pulse"></div>
    <div className="w-3/4 bg-gray-900/50 animate-pulse rounded-r-lg"></div>
  </div>
);

/* --- Constants ----- */
const AMBIENT_SOUND = 'flashcard-loop-catfootsteps';

/* ----- Types ---- */

const DoctorsOfficePage = () => {
  // Add a check for window at the component level
  const isBrowser = typeof window !== 'undefined';
  
  // Consolidate refs
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(false);
  const officeContainerRef = useRef<HTMLDivElement>(null);
  const flashcardsDialogRef = useRef<{ 
    open: () => void, 
    setWrongCards: (cards: any[]) => void, 
    setCorrectCount: (count: number) => void 
  } | null>(null);
  const afterTestFeedRef = useRef<{ setWrongCards: (cards: any[]) => void } | null>(null);
  const isClosingDialogRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasCalculatedRef = useRef(false);
  const chatbotRef = useRef<{ sendMessage: (message: string) => void }>({ sendMessage: () => {} });
  
  // Add ref for the sidebar
  const sidebarRef = useRef<{ activateChatTab: () => void } | null>(null);
  
  // Use a ref instead of state to track ambient sound initialization
  // This prevents re-renders when the ambient sound is initialized
  const ambientSoundInitializedRef = useRef(false);
  
  /* ------------------------------------------- Hooks -------------------------------------------- */
  const { isSubscribed, userInfo, incrementScore, decrementScore, refetch, updateScore } = useUserInfo();
  const { refreshUserInfo } = useUser();
  const audio = useAudio();
  const { startActivity } = useUserActivity();
  const router = useRouter();
  const windowSize = useWindowSize();
  
  // Detect if we're on mobile
  const isMobile = !windowSize.isDesktop;
  
  // Get the game state and actions from Zustand
  const { 
    userRooms, userLevel, patientsPerDay, totalPatients, streakDays,
    isGameInProgress, currentUserTestId, isFlashcardsOpen, flashcardRoomId, 
    activeRooms, completeAllRoom, correctCount, wrongCount, testScore, userResponses,
    unlockRoom, startGame, endGame, setIsFlashcardsOpen, setUserRooms,
    setFlashcardRoomId, setActiveRooms, setCompleteAllRoom, resetGameState,
    setCorrectCount, setWrongCount, setTestScore, setUserResponses,
    setStreakDays, setTotalPatients, updateUserLevel
  } = useGame();
  
  const searchParams = useSearchParams();
  
  // Add reference for tracking if the start game was triggered from query params
  const startGameTriggeredRef = useRef(false);
  
  /* ------------------------------------------- State -------------------------------------------- */
  const [isAfterTestDialogOpen, setIsAfterTestDialogOpen] = useState(false);
  const [largeDialogQuit, setLargeDialogQuit] = useState(false);
  const [mcqState, setMcqState] = useState({
    isLoading: true,
    totalQuestions: 0,
    correctQuestions: 0
  });
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [isCalculating, setIsCalculating] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [populateRoomsFn, setPopulateRoomsFn] = useState<(() => GridImage[]) | null>(null);
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [reportData, setReportData] = useState<DoctorOfficeStats | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const marketplaceDialogRef = useRef<{
    open: () => void
  } | null>(null);
  const [showAdaptiveTutoring, setShowAdaptiveTutoring] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCoinReward, setShowCoinReward] = useState(false);

  /* ----------------------------------------- Computation ----------------------------------------- */

  // Memoize expensive computations
  const isClinicUnlocked = useMemo(() => {
    if (!userInfo?.unlocks) return false;
    
    const unlocks = typeof userInfo.unlocks === 'string' 
      ? JSON.parse(userInfo.unlocks) 
      : userInfo.unlocks;
      
    return unlocks?.includes('game');
  }, [userInfo?.unlocks]);

  // Parse clinicRooms string into array
  const parsedClinicRooms = useMemo(() => {
    if (!userInfo?.clinicRooms || userInfo.clinicRooms === "undefined") return [];
    
    try {
      return JSON.parse(userInfo.clinicRooms);
    } catch (error) {
      console.error('Error parsing clinicRooms:', error);
      return [];
    }
  }, [userInfo?.clinicRooms]);

  // Simple chatbot context for SideBar
  const chatbotContext = useMemo(() => ({
    section: 'ankiclinic',
    level: userLevel,
    userName: userInfo?.firstName || 'User',
    isSubscribed: isSubscribed
  }), [userLevel, userInfo?.firstName, isSubscribed]);

  /* ----------------------------------------- Callbacks ------------------------------------------ */

  // Define AdaptiveTutoring related hooks/callbacks here at the top level
  // to ensure consistent hook ordering
  const toggleChatBot = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const setChatbotContext = useCallback((context: { contentTitle: string; context: string }) => {
    // Update the chatbot context if needed
  }, []);

  const onActivityChange = useCallback(async (type: string, location: string, metadata?: any) => {
    // Track user activity similar to how it's done in Home page
    try {
      await startActivity({
        type,
        location,
        metadata
      });
    } catch (error) {
      console.error("Error tracking activity:", error);
    }
  }, [startActivity]);

  // Add toggle for AdaptiveTutoring
  const toggleAdaptiveTutoring = useCallback(() => {
    setShowAdaptiveTutoring(prev => !prev);
  }, []);

  const handleOnboardingComplete = useCallback((showCoinReward?: boolean) => {
    localStorage.setItem('kalypso-onboarding-completed', 'true');
    setShowOnboarding(false);
    
    if (showCoinReward) {
      // Show coin reward animation
      setShowCoinReward(true);
    } else {
      // Show a welcome message
      toast.success(
        <div className="flex items-center gap-2">
          <span>🎉 Welcome to MyMCAT! Your learning journey begins now.</span>
        </div>,
        { duration: 4000 }
      );
    }
  }, []);

  const handleCoinRewardClose = useCallback(() => {
    setShowCoinReward(false);
    
    // Show welcome message after coin reward
    setTimeout(() => {
      toast.success(
        <div className="flex items-center gap-2">
          <span>🎉 Welcome to MyMCAT! Your learning journey begins now.</span>
        </div>,
        { duration: 4000 }
      );
    }, 500);
  }, []);

  const handleOnboardingClose = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  // Manual trigger for testing onboarding
  const handleTriggerOnboarding = useCallback(() => {
    // Clear the localStorage to reset the tour every time
    localStorage.removeItem('kalypso-onboarding-completed');
    setShowOnboarding(true);
  }, []);

  // Add this function to provide a custom volume level for specific sounds
  const playSoundWithVolume = useCallback((soundName: string, volumeLevel: number = 1) => {
    // Create a temporary gain node for this specific sound
    if (audio.audioContext && audio.sfxGainNode) {
      const originalVolume = audio.sfxGainNode.gain.value;
      // Save the current value
      const currentTime = audio.audioContext.currentTime;
      // Set to the lower volume for this specific sound
      audio.sfxGainNode.gain.setValueAtTime(originalVolume * volumeLevel, currentTime);
      
      // Play the sound
      audio.playSound(soundName);
      
      // Schedule a return to the original volume after a short delay
      setTimeout(() => {
        if (audio.audioContext && audio.sfxGainNode) {
          audio.sfxGainNode.gain.setValueAtTime(originalVolume, audio.audioContext.currentTime);
        }
      }, 1000); // Return to normal volume after 1 second
    } else {
      // Fallback if no audio context
      audio.playSound(soundName);
    }
  }, [audio]);

  // Add a handler for Kalypso click
  const handleKalypsoClick = useCallback(() => {
    // Play a sound effect at greatly reduced volume (20% of normal instead of 50%)
    playSoundWithVolume('chatbot-open', 0.2);
    // Open the sidebar
    setIsSidebarOpen(true);
    
    // Activate the chat tab directly via ref
    setTimeout(() => {
      if (sidebarRef.current) {
        sidebarRef.current.activateChatTab();
      }
    }, 100);
  }, [audio, playSoundWithVolume]);

  // Add functions required for SideBar
  const handleSetTab = useCallback((tab: string) => {
    // Implement tab switching logic if needed
  }, []);

  const onActivitiesUpdate = useCallback(() => {
    // Implement activities update logic if needed
    // This could re-fetch activities
    fetchActivities();
  }, []);

  const fetchUserResponses = useCallback(async (testId: string) => {
    try {
      const response = await fetch(
        `/api/user-test/${testId}?includeQuestionInfo=true`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user responses");
      }
      const data = await response.json();
      const responses = data.responses || [];
      setUserResponses(responses);

      // Calculate correct and wrong counts
      const correct =
        responses?.filter((response: UserResponse) => response.isCorrect)
          ?.length || 0;
      const wrong =
        responses?.filter((response: UserResponse) => !response.isCorrect)
          ?.length || 0;

      // Update the store instead of local state
      setCorrectCount(correct);
      setWrongCount(wrong);
    } catch (error) {
      console.error("Error fetching user responses:", error);
      toast.error("Failed to load test responses");
    }
  }, [setCorrectCount, setWrongCount, setUserResponses]);

  const updateVisibleImages = useCallback((newVisibleImages: Set<string>) => {
    setVisibleImages(newVisibleImages);
  }, []);

  // Create a stable callback for setting the function
  const handleSetPopulateRooms = useCallback((fn: () => GridImage[]) => {
    setPopulateRoomsFn(() => fn);
  }, []);

  // Create wrapper functions that match the expected React.Dispatch<React.SetStateAction<T>> type
  const handleSetIsLoading = useCallback<React.Dispatch<React.SetStateAction<boolean>>>((value) => {
    if (typeof value === 'function') {
      // If it's a function updater, call it with the current value
      const updaterFn = value as (prevState: boolean) => boolean;
      setMcqState(prev => ({ 
        ...prev, 
        isLoading: updaterFn(prev.isLoading) 
      }));
    } else {
      // If it's a direct value
      setMcqState(prev => ({ ...prev, isLoading: value }));
    }
  }, []);

  const handleSetTotalMCQQuestions = useCallback<React.Dispatch<React.SetStateAction<number>>>((value) => {
    if (typeof value === 'function') {
      // If it's a function updater, call it with the current value
      const updaterFn = value as (prevState: number) => number;
      setMcqState(prev => ({ 
        ...prev, 
        totalQuestions: updaterFn(prev.totalQuestions) 
      }));
    } else {
      // If it's a direct value
      setMcqState(prev => ({ ...prev, totalQuestions: value }));
    }
  }, []);

  // Update the initializeAmbientSound function to use a significantly reduced volume
  const initializeAmbientSound = useCallback(() => {
    // Only initialize if not already initialized, flashcards are not open, and no loop is currently playing
    if (!ambientSoundInitializedRef.current && !isFlashcardsOpen && !audio.currentLoop) {
      // Set the flag before playing to prevent race conditions
      ambientSoundInitializedRef.current = true;
      // Apply a greatly reduced volume to the loop
      if (audio.audioContext && audio.loopGainNode) {
        const originalVolume = audio.loopGainNode.gain.value;
        // Further reduce the volume for this specific ambient sound
        audio.loopGainNode.gain.value = originalVolume * 0.25; // Reduce to 25% (from 70%)
      }
      audio.playLoop(AMBIENT_SOUND);
    }
  }, [audio, isFlashcardsOpen]);

  /* ----------------------------------------- UseEffects ---------------------------------------- */
  
  // Use in the effect that manages audio
  useEffect(() => {
    if (!isBrowser) return;
    
    // Set mounted flag only once
    isMountedRef.current = true;
    
    // Only initialize ambient sound once when component mounts
    let timeoutId: NodeJS.Timeout | undefined;
    
    // Handle flashcard state changes
    if (isFlashcardsOpen) {
      if (audio.currentLoop === AMBIENT_SOUND) {
        audio.stopLoop();
      }
    } else if (!audio.currentLoop) {
      // If no loop is playing, initialize with a small delay
      if (!timeoutId && !ambientSoundInitializedRef.current) {
        // Clear any existing timeout to prevent multiple initializations
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          // Double-check conditions before initializing
          if (!ambientSoundInitializedRef.current && !isFlashcardsOpen && !audio.currentLoop) {
            initializeAmbientSound();
          }
        }, 1000);
      } else if (ambientSoundInitializedRef.current) {
        // Only restart if we've initialized before but no loop is playing
        initializeAmbientSound();
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Only stop audio on actual unmount, not just re-renders
      const isRealUnmount = document.visibilityState === 'hidden' || 
                            (officeContainerRef.current && !document.body.contains(officeContainerRef.current));
      
      if (isRealUnmount) {
        isMountedRef.current = false;
        
        if (audio.currentLoop === AMBIENT_SOUND) {
          audio.stopLoop();
          ambientSoundInitializedRef.current = false;
        }
      }
    };
  }, [isBrowser, isFlashcardsOpen, audio, initializeAmbientSound]);

  // Simplified effect for flashcard dialog auto-open
  useEffect(() => {
    if (mcqState.isLoading || isClosingDialogRef.current) {
      return;
    }
    
    if (flashcardRoomId !== "" && !isFlashcardsOpen) {
      setIsFlashcardsOpen(true);
    }
  }, [flashcardRoomId, isFlashcardsOpen, mcqState.isLoading, setIsFlashcardsOpen]);

  const fetchData = async () => {
    // If already fetching, don't start another fetch
    if (isFetchingRef.current || (reportData && !mcqState.isLoading)) {
      return;
    }
    
    // Set fetching flag and loading state
    isFetchingRef.current = true;
    
    // Create a new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      const [reportResponse, clinicResponse] = await Promise.all([
        fetch("/api/user-report", { 
          signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch("/api/clinic", { 
          signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
      ]);

      if (!isMountedRef.current || signal.aborted) return;

      const reportDataResult = await reportResponse.json();
      const clinicData = await clinicResponse.json();
      
      if (!isMountedRef.current || signal.aborted) return;
      
      // Batch all state updates
      if (isBrowser && ReactDOM.unstable_batchedUpdates) {
        ReactDOM.unstable_batchedUpdates(() => {
          // Only update if values have changed
          if (JSON.stringify(reportData) !== JSON.stringify(reportDataResult)) {
            setReportData(reportDataResult);
          }
          
          if (clinicData.rooms && Array.isArray(clinicData.rooms) && 
              JSON.stringify(userRooms) !== JSON.stringify(clinicData.rooms)) {
            setUserRooms(clinicData.rooms);
          }
          
          if (streakDays !== (reportDataResult.streak || 0)) {
            setStreakDays(reportDataResult.streak || 0);
          }
          
          if (totalPatients !== (clinicData.totalPatientsTreated || 0)) {
            setTotalPatients(clinicData.totalPatientsTreated || 0);
          }
          
          setMcqState(prev => ({ ...prev, isLoading: false }));
        });
      } else {
        // Fallback for server-side or if unstable_batchedUpdates is not available
        if (JSON.stringify(reportData) !== JSON.stringify(reportDataResult)) {
          setReportData(reportDataResult);
        }
        
        if (clinicData.rooms && Array.isArray(clinicData.rooms) && 
            JSON.stringify(userRooms) !== JSON.stringify(clinicData.rooms)) {
          setUserRooms(clinicData.rooms);
        }
        
        if (streakDays !== (reportDataResult.streak || 0)) {
          setStreakDays(reportDataResult.streak || 0);
        }
        
        if (totalPatients !== (clinicData.totalPatientsTreated || 0)) {
          setTotalPatients(clinicData.totalPatientsTreated || 0);
        }
        
        setMcqState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request aborted
      } else {
        if (isMountedRef.current) {
          toast.error("Failed to load clinic data. Please try refreshing the page.");
        }
      }
    } finally {
      if (isMountedRef.current) {
        isFetchingRef.current = false;
      }
    }
  };

  // Simplified effect for data initialization
  useEffect(() => {
    // Fetch data only once on mount
    const timer = setTimeout(() => {
      fetchData();
    }, 10);
    
    // Check if this is the user's first visit to show onboarding
    const hasSeenOnboarding = localStorage.getItem('kalypso-onboarding-completed');
    if (!hasSeenOnboarding && userInfo && !mcqState.isLoading) {
      setShowOnboarding(true);
    }
    
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Empty dependency array ensures it only runs once

  const performDailyCalculations = async () => {
    if (isCalculating) {
      return;
    }
    setIsCalculating(true);

    try {
      const response = await fetch("/api/daily-calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.error || data.alreadyUpdatedToday) {
        const { greeting, message } = getWelcomeMessage(userInfo?.firstName);
        toast.custom(
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-2 min-w-[300px]">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-amber-600 dark:text-amber-400">{greeting}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p className="italic">{message}</p>
              <p>{"You've already treated your patients for today. Total patients treated:"} <span className="font-medium text-amber-600 dark:text-amber-400">{data.totalPatientsTreated}</span></p>
              <p className="text-emerald-600 dark:text-emerald-400">{"Come back tomorrow to treat more patients!"}</p>
            </div>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
          }
        );
        return;
      }

      await incrementScore();
      // Update total patients in the store
      setTotalPatients(data.totalPatientsTreated);

      if (data.newPatientsTreated > 0) {
        const { greeting, message } = getSuccessMessage(userInfo?.firstName);
        toast.custom(
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-2 min-w-[300px]">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">{greeting}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p className="italic">{message}</p>
              <ul className="space-y-1 mt-2">
                <li className="flex items-center gap-2">
                  <span className="font-medium">New patients treated:</span> 
                  <span className="text-emerald-600 dark:text-emerald-400">{data.newPatientsTreated}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">Total patients:</span> 
                  <span className="text-emerald-600 dark:text-emerald-400">{data.totalPatientsTreated}</span>
                </li>
              </ul>
            </div>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
          }
        );
      } else {
        const { greeting, message } = getWelcomeMessage(userInfo?.firstName);
        toast.custom(
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col gap-2 min-w-[300px]">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{greeting}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p className="italic">{message}</p>
              <p>No new patients to treat today. Try completing more flashcards!</p>
            </div>
          </div>,
          {
            duration: 5000,
            position: 'top-center',
          }
        );
      }
    } catch (error) {
      console.error('🚨 Error in daily calculations:', error);
      toast.error(
        "Failed to perform daily calculations. Please try again later."
      );
    } finally {
      setIsCalculating(false);
    }
  };

  // Effect to run daily calculations after data is loaded
  useEffect(() => {
    if (!mcqState.isLoading && userInfo && !hasCalculatedRef.current) {
      // Remove the automatic call to performDailyCalculations
      // performDailyCalculations();
      hasCalculatedRef.current = true;
    }
  }, [mcqState.isLoading, userInfo]);

  const handleTabChange = (tab: string) => {
    if (tab !== "ankiclinic") {
      router.push(`/home?tab=${tab}`);
    }
    // No need to update activeTab state
  };

  const handleCompleteAllRoom = () => {
    handleSetCompleteAllRoom(true);
  };

  const toggleGroup = async (groupName: string) => {
    const group = imageGroups.find((g) => g.name === groupName);
    if (!group) return;

    // Buying logic
    if (userInfo?.score && userInfo.score < group.cost) {
      toast.error(`You need ${group.cost} coins to buy ${groupName}.`);
      return;
    }

    try {
      const response = await fetch("/api/clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: groupName, cost: group.cost }),
      });

      if (!response.ok) throw new Error();
      const { rooms: updatedRooms } = await response.json();
      
      // Update the store with the new room
      unlockRoom(groupName);
      
      // Refresh user info to update coins and rooms in UI
      await refreshUserInfo();
      
      // Update visible images
      setVisibleImages((prev) => {
        const newSet = new Set(prev);
        group.items.forEach((item) => newSet.add(item.id));
        return newSet;
      });

      toast.success(`Added ${groupName} to your clinic!`);
    } catch (error) {
      console.error("Error updating clinic rooms:", error);
      toast.error(
        (error as Error).message || "Failed to update clinic rooms"
      );
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/calendar-activity");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const activities = await response.json();
      setActivities(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities. Please try again.");
    }
  };

  const resetLocalGameState = async () => {
    resetGameState();
    // Start new studying activity
    await startActivity({
      type: 'studying',
      location: 'Game',
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
    
    // Reset local state that's not in the store
    setMcqState(prev => ({ ...prev, totalQuestions: 0, correctQuestions: 0 }));

    flashcardsDialogRef.current?.setWrongCards([])
    flashcardsDialogRef.current?.setCorrectCount(0)
    afterTestFeedRef.current?.setWrongCards([])
  };

  // Replace the startup sound playback with the quieter version
  const handleGameStart = async (userTestId: string) => {
    // Play startup sound at MUCH lower volume (10% of normal instead of 40%)
    playSoundWithVolume('flashcard-startup', 0.1);
    
    // Start new testing activity
    await startActivity({
      type: 'testing',
      location: 'Game',
      metadata: {
        userTestId,
        timestamp: new Date().toISOString()
      }
    });

    // Update game state in the store
    startGame(userTestId);
    
    if (typeof populateRoomsFn === 'function') {
      const selectedRooms = populateRoomsFn();
      const roomNames = selectedRooms.map(room => {
        // Remove numbers from room names and add spaces before capitals
        return room.id
          .replace(/\d+/g, '')
          .replace(/([A-Z])/g, ' $1')
          .trim();
      });
      
      toast.success(
        <div>
          <p className="font-bold mb-1 text-gray-900 dark:text-gray-100">New game started!</p>
          <p className="text-sm mb-1 text-gray-600 dark:text-gray-300">Selected rooms:</p>
          <ul className="text-sm list-disc list-inside text-gray-600 dark:text-gray-300">
            {roomNames.map((name, index) => (
              <li key={`room-name-${index}`}>{name}</li>
            ))}
          </ul>
        </div>,
        { duration: 5000 }
      );
    } else {
      console.error("populateRoomsFn is not a function");
      toast.error("Failed to start new game. Please try refreshing the page.");
    }
  };

  // Now define handleStartAssignedHomework which depends on handleGameStart
  const handleStartAssignedHomework = useCallback(async () => {
    if ((userInfo?.score || 0) < 1) {
      toast.error("You need 1 coin to start a new game!");
      return;
    }

    try {
      await decrementScore();
      resetGameState();

      // Create a new user test
      const response = await fetch("/api/user-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create user test");
      }

      const data = await response.json();
      const userTestId = data.id;

      // Start a new game with the user test ID
      handleGameStart(userTestId);
    } catch (error) {
      console.error("Error starting assigned homework game:", error);
      toast.error("Failed to start assigned homework. Please try again.");
    }
  }, [decrementScore, resetGameState, handleGameStart, userInfo?.score]);

  // NOW ADD THE EFFECT HERE - after both functions are defined
  useEffect(() => {
    const startGame = searchParams.get('startGame');
    if (startGame === 'true' && !startGameTriggeredRef.current && !isGameInProgress) {
      startGameTriggeredRef.current = true;
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        handleStartAssignedHomework();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, handleStartAssignedHomework, isGameInProgress]);

  const handleMCQAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setMcqState(prev => ({ ...prev, correctQuestions: prev.correctQuestions + 1 }));
    }
  };

  const handleAfterTestDialogClose = () => {
    setIsAfterTestDialogOpen(false);
    // Reset game state when dialog is closed
    resetLocalGameState();
    endGame();
  };


  // Create wrapper functions to adapt between React's setState and Zustand's actions
  const handleSetFlashcardRoomId = useCallback((roomId: string | ((prevState: string) => string)) => {
    if (typeof roomId === 'function') {
      // If it's a function, call it with the current value to get the new value
      const newRoomId = roomId(flashcardRoomId);
      setFlashcardRoomId(newRoomId);
    } else {
      // If it's a direct value, use it directly
      setFlashcardRoomId(roomId);
    }
  }, [flashcardRoomId, setFlashcardRoomId]);

  const handleSetActiveRooms = useCallback((rooms: Set<string> | ((prevState: Set<string>) => Set<string>)) => {
    if (typeof rooms === 'function') {
      // If it's a function, call it with the current value to get the new value
      const newRooms = rooms(activeRooms);
      // Create a new Set to ensure reactivity
      setActiveRooms(new Set(newRooms));
    } else {
      // If it's a direct value, create a new Set from it
      setActiveRooms(new Set(rooms));
    }
  }, [activeRooms, setActiveRooms]);


  const handleSetIsFlashcardsOpen = useCallback((value: boolean) => {
    // Prevent rapid open/close cycles or redundant updates
    if ((isClosingDialogRef.current && value) || value === isFlashcardsOpen) {
      return;
    }
    
    if (value) {
      // OPENING FLASHCARD DIALOG
      // Only play the sound if it wasn't triggered by a room click
      if (flashcardRoomId === "") {
        audio.playSound('flashcard-door-open');
      }
      
      // Stop ambient sound when opening flashcards
      if (audio.currentLoop === AMBIENT_SOUND) {
        audio.stopLoop();
      }
    } else {
      // CLOSING FLASHCARD DIALOG
      isClosingDialogRef.current = true;
      
      // Play door close sound when dialog is closed
      audio.playSound('flashcard-door-closed');
      
      // Handle cleanup after closing
      setTimeout(() => {
        setFlashcardRoomId('');
        setTimeout(() => {
          isClosingDialogRef.current = false;
        }, 100);
      }, 300);
    }
    
    // Update state
    setIsFlashcardsOpen(value);
  }, [flashcardRoomId, setFlashcardRoomId, setIsFlashcardsOpen, audio, isFlashcardsOpen]);


  // Handle flashcard dialog open/close - improved with audio state checks
  const handleSetCompleteAllRoom = useCallback((complete: boolean | ((prevState: boolean) => boolean)) => {
    if (typeof complete === 'function') {
      const newComplete = complete(completeAllRoom);
      setCompleteAllRoom(newComplete);
    } else {
      setCompleteAllRoom(complete);
    }
  }, [completeAllRoom, setCompleteAllRoom]);

  // Simplified effect for test completion
  useEffect(() => {
    if (!mcqState.isLoading && completeAllRoom && currentUserTestId) {
      const finishTest = async () => {
        try {
          await fetchUserResponses(currentUserTestId);
          
          const correctQuestionWeight = 1;
          const incorrectQuestionWeight = -0.5;
          let testScore =
            correctCount * correctQuestionWeight +
            wrongCount * incorrectQuestionWeight;
          testScore = Math.max(testScore, 0);
          
          setTestScore(testScore);
        
          // Update the UserTest with score
          fetch(`/api/user-test/${currentUserTestId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              score: testScore,
              finishedAt: new Date().toISOString(),
            }),
          }).catch(console.error);

          if (!isFlashcardsOpen && !largeDialogQuit) {
            setIsAfterTestDialogOpen(true);
          }
        } catch (error) {
          console.error("Error finishing test:", error);
        }
      };

      finishTest();
    }
  }, [currentUserTestId, completeAllRoom, mcqState.isLoading, isFlashcardsOpen, largeDialogQuit, 
      fetchUserResponses, correctCount, wrongCount, setTestScore]);
  
  // Show loading state during initial load
  if (mcqState.isLoading && !isClinicUnlocked) {
    return <LoadingClinic />;
  }

  const SidebarToggleButton = ({ onClick }: { onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="p-3 bg-[--theme-gradient-startstreak] rounded-full shadow-lg flex items-center justify-center"
      aria-label="Toggle resources menu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </button>
  );

  // Coin Reward Animation Component
  const CoinRewardAnimation = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [showTitle, setShowTitle] = useState(false);
    const [showCoin, setShowCoin] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
    const audio = useAudio();

    useEffect(() => {
      if (isOpen && !hasPlayedAudio) {
        // Play fanfare audio only once
        audio.playSound('fanfare');
        setHasPlayedAudio(true);
        
        // Sequence the animations
        setTimeout(() => setShowTitle(true), 500);
        setTimeout(() => setShowCoin(true), 1000);
        setTimeout(() => setShowDescription(true), 2000);
        
        // Auto close after 6 seconds
        setTimeout(() => onClose(), 6000);
      }
    }, [isOpen, audio, onClose, hasPlayedAudio]);

    // Reset audio flag when component closes
    useEffect(() => {
      if (!isOpen) {
        setHasPlayedAudio(false);
        setShowTitle(false);
        setShowCoin(false);
        setShowDescription(false);
      }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-[10003] flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Title Animation - Made smaller */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={showTitle ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="text-5xl md:text-5xl font-bold text-yellow-400"
            style={{
              textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }}
          >
            You've won your first coin!
          </motion.div>

          {/* Coin Animation - Made much bigger */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={showCoin ? { 
              opacity: 1, 
              scale: [0, 1.2, 1], 
              rotate: [0, 360, 720] 
            } : {}}
            transition={{ 
              duration: 1.5, 
              type: "spring", 
              damping: 12,
              times: [0, 0.6, 1]
            }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl scale-150 animate-pulse"></div>
              
              {/* Coin image - Made much bigger */}
              <Image
                src="/game-components/CupcakeCoin.gif"
                alt="Cupcake Coin"
                width={400}
                height={400}
                className="relative z-10 drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))'
                }}
              />
              
              {/* Sparkle effects - Adjusted for bigger coin */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={showCoin ? {
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: [0, Math.cos(i * 45 * Math.PI / 180) * 150],
                      y: [0, Math.sin(i * 45 * Math.PI / 180) * 150]
                    } : {}}
                    transition={{
                      duration: 2,
                      delay: 0.5 + i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-400 rounded-full"
                    style={{
                      boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)'
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Description Animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={showDescription ? { opacity: 1, y: 0 } : {}}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="text-2xl md:text-3xl text-white font-semibold max-w-2xl mx-auto px-4"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.8)'
            }}
          >
            You win coins for getting questions right and consistency, and lose them for inconsistency!
          </motion.div>

          {/* Click to continue hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={showDescription ? { opacity: 1 } : {}}
            transition={{ delay: 1 }}
            className="text-lg text-gray-300 cursor-pointer hover:text-white transition-colors"
            onClick={onClose}
          >
            Click anywhere to continue
          </motion.div>
        </div>
        
        {/* Click overlay to close */}
        <div 
          className="absolute inset-0 cursor-pointer" 
          onClick={onClose}
        />
      </div>
    );
  };

  /* ----------------------------------------- Render  ---------------------------------------- */

  return (
    <div className={`absolute inset-0 flex bg-transparent text-[--theme-text-color] ${isMobile ? 'p-0' : 'p-4'}`}>
      <Toaster position="top-center" />
      
      <Suspense fallback={
        <div className="flex w-full h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
          <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] animate-pulse" />
          <div className="w-3/4 bg-gray-900/50 animate-pulse rounded-r-lg" />
        </div>
      }>
        <div className={`flex w-full h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] ${isMobile ? 'rounded-none' : 'rounded-lg'} overflow-hidden relative`}>
          {/* Mobile layout: completely separate components for sidebar and main content */}
          {isMobile ? (
            <>
              {/* Main content container - full width on mobile */}
              <div className="w-full h-full relative">
                {showAdaptiveTutoring ? (
                  <AnkiClinicTutoring
                    toggleChatBot={toggleChatBot}
                    setChatbotContext={setChatbotContext}
                    chatbotRef={chatbotRef}
                    onActivityChange={onActivityChange}
                    className="gradientbg h-full w-full"
                    onClose={() => setShowAdaptiveTutoring(false)}
                  />
                ) : (
                  <OfficeContainer
                    ref={officeContainerRef}
                    onNewGame={(fn) => setPopulateRoomsFn(() => fn)}
                    visibleImages={visibleImages}
                    imageGroups={imageGroups}
                    updateVisibleImages={setVisibleImages}
                    toggleAdaptiveTutoring={toggleAdaptiveTutoring}
                    onKalypsoClick={handleKalypsoClick}
                  />
                )}
              </div>
              
              {/* Mobile sidebar - completely separate from main content flow */}
              <div 
                className={`fixed inset-0 z-50 transition-all duration-300 ${
                  isSidebarOpen 
                    ? 'opacity-100 pointer-events-auto' 
                    : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="bg-black/70 fixed inset-0" onClick={() => setIsSidebarOpen(false)}></div>
                <div className={`fixed inset-x-0 bottom-0 top-auto z-50 bg-[--theme-gradient-startstreak] rounded-t-2xl p-4 max-h-[80vh] overflow-auto transition-transform duration-300 transform ${
                  isSidebarOpen ? 'translate-y-0' : 'translate-y-full'
                }`}
                style={{ 
                  boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
                }}
                >
                  {/* Pill handle for UI feedback - now clickable */}
                  <div 
                    className="w-full h-8 flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                    role="button"
                    aria-label="Close sidebar"
                  >
                    <div className="w-12 h-1.5 bg-gray-300/30 rounded-full" />
                  </div>
                  
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/30 rounded-full p-2 transition-colors"
                    aria-label="Close sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  
                  <SideBar
                    activities={activities}
                    currentPage="ankiclinic"
                    chatbotContext={chatbotContext}
                    chatbotRef={chatbotRef}
                    handleSetTab={handleTabChange}
                    onActivitiesUpdate={fetchActivities}
                    isSubscribed={isSubscribed}
                    showTasks={true}
                    sidebarRef={sidebarRef}
                    onStartAssignedHomework={handleStartAssignedHomework}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Desktop layout: side-by-side components with sidebar on right */}
              <div className="w-3/4 font-krungthep relative z-20 rounded-l-lg h-full">
                {showAdaptiveTutoring ? (
                  <AnkiClinicTutoring
                    toggleChatBot={toggleChatBot}
                    setChatbotContext={setChatbotContext}
                    chatbotRef={chatbotRef}
                    onActivityChange={onActivityChange}
                    className="gradientbg h-full w-full"
                    onClose={() => setShowAdaptiveTutoring(false)}
                  />
                ) : (
                  <OfficeContainer
                    ref={officeContainerRef}
                    onNewGame={(fn) => setPopulateRoomsFn(() => fn)}
                    visibleImages={visibleImages}
                    imageGroups={imageGroups}
                    updateVisibleImages={setVisibleImages}
                    toggleAdaptiveTutoring={toggleAdaptiveTutoring}
                    onKalypsoClick={handleKalypsoClick}
                  />
                )}
              </div>
              
              <div className="w-1/4 p-4 gradientbg relative z-50 rounded-r-lg" data-sidebar>
                <SideBar
                  activities={activities}
                  currentPage="ankiclinic"
                  chatbotContext={chatbotContext}
                  chatbotRef={chatbotRef}
                  handleSetTab={handleTabChange}
                  onActivitiesUpdate={fetchActivities}
                  isSubscribed={isSubscribed}
                  showTasks={true}
                  sidebarRef={sidebarRef}
                  onStartAssignedHomework={handleStartAssignedHomework}
                />
              </div>
            </>
          )}
          
          {/* Conditionally render ClinicHeader */}
          {showAdaptiveTutoring && (
            <div className="absolute inset-0 z-[100] pointer-events-none">
              {/* This empty div blocks the ClinicHeader from being visible */}
            </div>
          )}
          
          <ClinicHeader
            totalPatients={totalPatients}
            patientsPerDay={patientsPerDay}
            userInfo={userInfo}
            userLevel={userLevel}
            imageGroups={imageGroups}
            visibleImages={visibleImages}
            toggleGroup={toggleGroup}
            className={showAdaptiveTutoring ? 'opacity-0 pointer-events-none' : ''}
            onTriggerOnboarding={handleTriggerOnboarding}
          />
          
          {/* Feature unlock banner */}
          <div className="absolute top-20 right-4 left-4 z-40 md:left-4 md:right-1/4">
            <FeatureUnlockBanner />
          </div>
        </div>
      </Suspense>

      {isAfterTestDialogOpen && <AfterTestFeed 
        ref={afterTestFeedRef}
        open={isAfterTestDialogOpen}
        onOpenChange={(open) => {
          setIsAfterTestDialogOpen(open);
          if (!open) {
            handleAfterTestDialogClose();
          }
        }}
        largeDialogQuit={largeDialogQuit}
        setLargeDialogQuit={setLargeDialogQuit}
      />}

      <HoverSidebar
        activities={activities}
        onTasksUpdate={fetchActivities}
        onTabChange={handleTabChange}
        currentPage="ankiclinic"
        isSubscribed={isSubscribed}
      />
      
      <RedeemReferralModal 
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />

      {isFlashcardsOpen && <FlashcardsDialog 
        ref={flashcardsDialogRef}
        isOpen={isFlashcardsOpen}
        onOpenChange={handleSetIsFlashcardsOpen}
        roomId={flashcardRoomId}
        isLoading={mcqState.isLoading}
        setIsLoading={handleSetIsLoading}
        onMCQAnswer={handleMCQAnswer}
        setTotalMCQQuestions={handleSetTotalMCQQuestions}
        buttonContent={<div />}
      />}

      {/* Add ShoppingDialog - always mounted */}
      <ShoppingDialog
        ref={marketplaceDialogRef}
        imageGroups={imageGroups}
        visibleImages={visibleImages}
        toggleGroup={toggleGroup}
        userScore={userInfo?.score || 0}
        isOpen={isMarketplaceOpen}
        onOpenChange={setIsMarketplaceOpen}
        clinicRooms={userInfo?.clinicRooms || "[]"}
      />

      {/* Kalypso Onboarding */}
      <KalypsoOnboarding
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />

      {showCoinReward && <CoinRewardAnimation 
        isOpen={showCoinReward}
        onClose={handleCoinRewardClose}
      />}
    </div>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
// eslint-disable-next-line import/no-unused-modules
export default React.memo(DoctorsOfficePage);

