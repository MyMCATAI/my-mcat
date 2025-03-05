"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense, forwardRef, useMemo } from "react";
import ReactDOM from 'react-dom';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DoctorOfficeStats } from "@/types";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { calculatePlayerLevel, getPatientsPerDay, calculateTotalQC, 
  getClinicCostPerDay, getLevelNumber, calculateQualityOfCare } from "@/utils/calculateResourceTotals";
import { imageGroups } from "./constants/imageGroups";
import { PurchaseButton } from "@/components/purchase-button";
import dynamic from 'next/dynamic';
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUserActivity } from '@/hooks/useUserActivity';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useAudio } from "@/contexts/AudioContext";
import { useAudioTransitions } from "@/hooks/useAudioTransitions";
import type { UserResponse } from "@prisma/client";
import type { FetchedActivity } from "@/types";
import { GridImage } from './types';
import type { UserResponseWithCategory } from "@/types";
import { shouldShowRedeemReferralModal } from '@/lib/referral';
import { getAccentColor, getWelcomeMessage, getSuccessMessage } from './utils';
import { useGame } from "@/store/selectors";
import FlashcardsDialog from './FlashcardsDialog'; // Direct import instead of dynamic

// Only dynamically import components that are truly heavy or rarely used
// Core components should be imported directly for faster initial render
import ResourcesMenu from './ResourcesMenu';
import OfficeContainer from './OfficeContainer';

// Keep dynamic imports for less critical components
const WelcomeDialog = dynamic(() => import('./WelcomeDialog'), {
  ssr: false
});

const ShoppingDialog = dynamic(() => import('./ShoppingDialog'), {
  ssr: false
});

// Simple dynamic import for AfterTestFeed
const AfterTestFeed = dynamic(() => import('./AfterTestFeed'), {
  ssr: false
});

const FloatingButton = dynamic(() => import('../home/FloatingButton'), {
  ssr: false
});

const TutorialVidDialog = dynamic(() => import('@/components/ui/TutorialVidDialog'), {
  ssr: false
});

const RedeemReferralModal = dynamic(() => import('@/components/social/friend-request/RedeemReferralModal'), {
  ssr: false
});

const NewGameButton = dynamic(() => import('./components/NewGameButton'), {
  ssr: false
});

// Loading component for better UX during initial load
const LoadingClinic = () => (
  <div className="fixed inset-x-0 bottom-0 top-[4rem] flex bg-transparent text-[--theme-text-color] p-4">
    <div className="flex w-full h-full max-w-full max-h-full items-center justify-center text-xl font-medium">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--theme-primary-color]"></div>
        <p>Loading AnkiClinic...</p>
      </div>
    </div>
  </div>
);

/* --- Constants ----- */
const AMBIENT_SOUND = '/audio/flashcard-loop-catfootsteps.mp3';

/* ----- Types ---- */
interface DoctorsOfficePageProps {
  // Add any props if needed
}

const DoctorsOfficePage = ({ ...props }: DoctorsOfficePageProps) => {
  // Add debug mode check
  const searchParams = useSearchParams();
  const isDebugMode = searchParams?.get('debug') === 'true';
  
  // Only log in debug mode
  const debugLog = (message: string, ...args: any[]) => {
    if (isDebugMode) {
      console.log(message, ...args);
    }
  };
  
  const pathname = usePathname();
  
  // Add mount counter ref
  const mountCountRef = useRef(0);
  const isFetchingRef = useRef(false);
  // Add a ref to store the current abort controller
  const abortControllerRef = useRef<AbortController | null>(null);
  // Add a ref to track if component is already initialized
  const isInitializedRef = useRef(false);
  // Add a ref to track if state updates are in progress
  const stateUpdateInProgressRef = useRef(false);
  // Add a ref to track if component is mounted
  const isMountedRef = useRef(false);
  
  // Add this ref near the other refs at the top of the component
  const isClosingDialogRef = useRef(false);
  
  // Move these refs to the top level of the component, outside of any useEffect
  const hasInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);
  let initTimeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  
  /* =================================
  // Component Lifecycle Management
  // - Tracks component mounting and unmounting
  // - Sets initial loading state
  // - Cleans up on unmount by setting isMountedRef to false
  ================================*/
  useEffect(() => {
    mountCountRef.current += 1;
    isMountedRef.current = true;
    
    // Only run client-side code
    if (typeof window !== 'undefined') {
      // Set loading to false after a short delay to allow the UI to render first
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      debugLog('[DEBUG] DoctorsOfficePage mounted');
      
      return () => {
        isMountedRef.current = false;
        debugLog('[DEBUG] DoctorsOfficePage unmounted');
      };
    }
  }, [pathname, debugLog]);

  /* ------------------------------------------- Hooks -------------------------------------------- */
  const officeContainerRef = useRef<HTMLDivElement>(null);
  const flashcardsDialogRef = useRef<{ 
    open: () => void, 
    setWrongCards: (cards: any[]) => void, 
    setCorrectCount: (count: number) => void 
  } | null>(null);
  const { isSubscribed, userInfo, incrementScore, decrementScore } = useUserInfo();
  const audio = useAudio();
  const { setIsAutoPlay } = useMusicPlayer();
  const { startActivity } = useUserActivity();
  const router = useRouter();
  
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
  
  /* ------------------------------------------- State -------------------------------------------- */
  const [activeTab, setActiveTab] = useState("ankiclinic");
  const [showWelcomeDialogue, setShowWelcomeDialogue] = useState(false);
  // Local UI states that were moved from Zustand
  const [isAfterTestDialogOpen, setIsAfterTestDialogOpen] = useState(false);
  const [largeDialogQuit, setLargeDialogQuit] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  //Flashcards
  const prevFlashcardsOpenRef = useRef(false); //this keeps track of previous state
  const [isFlashcardsTooltipOpen, setIsFlashcardsTooltipOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state
  const [totalMCQQuestions, setTotalMCQQuestions] = useState(0);
  const [correctMCQQuestions, setCorrectMCQQuestions] = useState(0);
  const afterTestFeedRef = useRef<{ setWrongCards: (cards: any[]) => void } | null>(null);
  // Game functionality
  // Marketplace Dialog
  const marketplaceDialogRef = useRef<{
    open: () => void
  }>(null);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [clinicCostPerDay, setClinicCostPerDay] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const hasCalculatedRef = useRef(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [populateRoomsFn, setPopulateRoomsFn] = useState<(() => GridImage[]) | null>(null);
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  // Add a ref to track loading state updates
  const loadingStateUpdatedRef = useRef(false);
  const [reportData, setReportData] = useState<DoctorOfficeStats | null>(null);
  // Add a ref to track the last time isFlashcardsOpen was changed
  const lastFlashcardToggleTimeRef = useRef(0);
  // Add a ref to track the previous isFlashcardsOpen value
  const prevIsFlashcardsOpenRef = useRef(isFlashcardsOpen);

  // Add useAudioTransitions hook after state declarations
  const { 
    initializeAmbientSound, 
    stopAllAudio,
    isAudioTransitionInProgress 
  } = useAudioTransitions({
    isFlashcardsOpen,
    isLoading,
    isMounted: isMountedRef.current
  });

  /* ----------------------------------------- Computation ----------------------------------------- */

  // Memoize expensive computations
  const isClinicUnlocked = useMemo(() => {
    if (!userInfo?.unlocks) return false;
    
    const unlocks = typeof userInfo.unlocks === 'string' 
      ? JSON.parse(userInfo.unlocks) 
      : userInfo.unlocks;
      
    return unlocks?.includes('game');
  }, [userInfo?.unlocks]);

  /* ----------------------------------------- Callbacks ------------------------------------------ */

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

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    audio.setVolume(newVolume);
  }, [audio]);

  // Create a stable callback for setting the function
  const handleSetPopulateRooms = useCallback((fn: () => GridImage[]) => {
    setPopulateRoomsFn(() => fn);
  }, []);

  /* ----------------------------------------- UseEffects ---------------------------------------- */
  
  /* =================================
  // Ambient Sound Controller
  // - Initializes ambient sound on mount
  // - Handles ambient sound playback
  // - Cleans up on unmount
  ================================*/
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    debugLog('[DEBUG] Initializing ambient sound on mount');
    
    // Initialize ambient sound with debounce
    const initializeAmbientSound = async () => {
      // If already initialized or currently initializing, skip
      if (hasInitializedRef.current || isInitializingRef.current) {
        debugLog('[DEBUG] Skipping duplicate ambient sound initialization');
        return;
      }
      
      // Mark as initializing to prevent duplicate calls
      isInitializingRef.current = true;
      
      try {
        debugLog('[DEBUG] Starting ambient sound loop');
        
        // Stop any existing loops first to prevent double audio
        audio.stopAllLoops();
        
        // Small delay to ensure audio context is ready and to debounce multiple calls
        await new Promise(resolve => {
          // Clear any existing timeout
          if (initTimeoutIdRef.current) {
            clearTimeout(initTimeoutIdRef.current);
          }
          
          // Set new timeout
          initTimeoutIdRef.current = setTimeout(() => {
            resolve(true);
          }, 300); // Longer delay to ensure we don't get multiple initializations
        });
        
        // Check if we're still mounted before proceeding
        if (!isMountedRef.current) {
          debugLog('[DEBUG] Component unmounted during initialization delay, aborting');
          return;
        }
        
        // Now we can safely initialize
        hasInitializedRef.current = true;
        audio.loopSound('flashcard-loop-catfootsteps');
        debugLog('[DEBUG] Ambient sound loop started successfully');
      } catch (error: any) {
        console.error('Error initializing ambient sound:', error);
        debugLog(`[DEBUG] Ambient sound error: ${error.message || 'Unknown error'}`);
      } finally {
        // Reset initializing flag
        isInitializingRef.current = false;
      }
    };
    
    initializeAmbientSound();
    
    return () => {
      debugLog('[DEBUG] Cleaning up ambient sound on unmount');
      
      // Clear any pending initialization
      if (initTimeoutIdRef.current) {
        clearTimeout(initTimeoutIdRef.current);
      }
      
      // Ensure we stop the specific loop we started
      try {
        audio.stopAllLoops(); // Stop all loops to be safe
        audio.stopLoopSound('flashcard-loop-catfootsteps');
        debugLog('[DEBUG] Successfully stopped ambient sound loop');
      } catch (error: any) {
        debugLog(`[DEBUG] Error stopping ambient sound: ${error.message || 'Unknown error'}`);
      }
      
      // Reset flags
      hasInitializedRef.current = false;
      isInitializingRef.current = false;
    };
  }, [audio, debugLog]);
  
  /* =================================
  // Flashcards State Monitor
  // - Tracks changes to the flashcards dialog open/close state
  // - Reinitializes ambient sound when flashcards are closed
  // - Uses a ref to compare previous and current state
  ================================*/
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    if (prevIsFlashcardsOpenRef.current !== isFlashcardsOpen) {
      prevIsFlashcardsOpenRef.current = isFlashcardsOpen;
      
      // Handle audio transitions based on flashcards state
      if (!isFlashcardsOpen) {
        console.log('[DEBUG] Flashcards closed, reinitializing ambient sound');
        initializeAmbientSound();
      }
    }
  }, [isFlashcardsOpen, initializeAmbientSound]);

  // Auto-open flashcard dialog when roomId changes - with optimization

  /* =================================
  // Welcome Dialog Controller
  // - Shows welcome/referral modals based on user state
  // - Only runs when userInfo changes and component is mounted
  // - Uses hasCalculatedRef to prevent showing welcome dialog multiple times
  ================================*/
  useEffect(() => {
    // Skip if not mounted or if state updates are in progress
    if (!isMountedRef.current || stateUpdateInProgressRef.current) return;
    
    // Only show welcome dialog if user info is available and not in loading state
    if (userInfo && !isLoading && !hasCalculatedRef.current) {
      hasCalculatedRef.current = true;
      setShowWelcomeDialogue(true);
    }
  }, [userInfo, isLoading, setShowWelcomeDialogue]);

  /* =================================
  // Data Initialization & Daily Calculations
  // - Fetches initial clinic data on component mount
  // - Sets up retry logic for failed data fetches (up to 3 retries)
  // - Performs daily calculations once data is loaded
  // - Uses refs to track initialization state and prevent duplicate operations
  // - Cleans up pending requests on unmount
  ================================*/
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    
    const initializeData = async () => {
      // Skip if already initialized and data is present
      if (isInitializedRef.current && reportData) {
        return;
      }
      
      isInitializedRef.current = true;
      
      const attemptFetch = async () => {
        try {
          await fetchData();
          
          // Only proceed with calculations if still mounted
          if (mounted && !hasCalculatedRef.current && userInfo) {
            performDailyCalculations();
            hasCalculatedRef.current = true;
          }
        } catch (error) {
          console.error('[DEBUG] Error during initialization:', error);
          
          // Retry logic
          if (mounted && retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(attemptFetch, RETRY_DELAY);
          } else if (mounted) {
            toast.error("Failed to initialize clinic data. Please refresh the page.");
          }
        }
      };
      
      // Small delay to let any Strict Mode double-mount settle
      const initTimer = setTimeout(() => {
        if (mounted) {
          initializeData();
        }
      }, 100);
      
      return () => {
        mounted = false;
        clearTimeout(initTimer);
        // Only abort requests if we're actually unmounting, not just in Strict Mode
        if (mountCountRef.current > 2 && abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    };
    
    initializeData();
  }, [userInfo, reportData]);

  /* =================================
  // Ambient Sound Controller
  // - Initializes background audio with a slight delay
  // - Only runs when component is fully mounted
  // - Includes cleanup to prevent memory leaks
  // - Manages audio regardless of loading state
  ================================*/
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Create a small delay to ensure audio context is ready
    const timeoutId = setTimeout(() => {
      // Initializing ambient sound regardless of loading state
      initializeAmbientSound();
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      // Cleaning up audio on unmount
      stopAllAudio();
    };
  }, [initializeAmbientSound, stopAllAudio, isMountedRef]);

  /* =================================
  // Audio Context Recovery
  // - Ensures audio context is properly initialized after navigation
  // - Handles browser audio context suspension issues
  // - Runs only in client-side environment
  // - Attempts to resume audio context if suspended
  ================================*/
  useEffect(() => {
    // This effect runs when the component mounts after navigation
    if (typeof window !== 'undefined' && audio) {
      // Force audio context to resume if suspended
      const resumeAudioContext = async () => {
        try {
          // This will trigger the audio context to resume if needed
          await audio.setVolume(audio.volume);
        } catch (error) {
          console.error('[DEBUG] Error resuming audio context:', error);
        }
      };
      
      resumeAudioContext();
    }
  }, [audio, pathname]);

  /* ---------------------------------------- Event Handlers -------------------------------------- */

  const fetchData = async () => {
    // If already fetching, don't start another fetch
    if (isFetchingRef.current) {
      // Skipping redundant data fetch - fetch already in progress
      return;
    }
    
    // Skip if we already have data and are not in loading state
    if (reportData && !isLoading) {
      // Data already loaded and not in loading state, skipping fetch
      return;
    }
    
    // Set fetching flag and loading state
    isFetchingRef.current = true;
    if (!isLoading) {
      setIsLoading(true);
    }
    
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
        
        setIsLoading(false);
      });
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
        setIsLoading(false);
      }
    }
  };

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

  const handleTabChange = (tab: string) => {
    if (tab !== "ankiclinic") {
      router.push(`/home?tab=${tab}`);
    }
    setActiveTab(tab);
  };

  const handleCompleteAllRoom = () => {
    handleSetCompleteAllRoom(true);
  };

  const toggleGroup = async (groupName: string) => {
    const group = imageGroups.find((g) => g.name === groupName);
    if (!group) return;

    const allVisible = group.items.every((item) => visibleImages.has(item.id));

    if (allVisible) {
      return;
    } else {
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
        
        await decrementScore();
        setVisibleImages((prev) => {
          const newSet = new Set(prev);
          group.items.forEach((item) => newSet.add(item.id));
          return newSet;
        });
        // Refetch user data after successful purchase
        await fetchData();
        setIsMarketplaceOpen(false);

        toast.success(`Added ${groupName} to your clinic!`);
      } catch (error) {
        console.error("Error updating clinic rooms:", error);
        toast.error(
          (error as Error).message || "Failed to update clinic rooms"
        );
      }
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
    setTotalMCQQuestions(0);
    setCorrectMCQQuestions(0);

    flashcardsDialogRef.current?.setWrongCards([])
    flashcardsDialogRef.current?.setCorrectCount(0)
    afterTestFeedRef.current?.setWrongCards([])
  };

  const handleGameStart = async (userTestId: string) => {
    // Play startup sound
    audio.playSound('flashcard-startup');
    
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
          <p className="font-bold mb-1">New game started!</p>
          <p className="text-sm mb-1">Selected rooms:</p>
          <ul className="text-sm list-disc list-inside">
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

  const handleMCQAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectMCQQuestions(prev => prev + 1);
    }
  };

  const handleAfterTestDialogClose = () => {
    setIsAfterTestDialogOpen(false);
    // Reset game state when dialog is closed
    resetLocalGameState();
    endGame();
  };

  /* ----------------------------------------- Render  ---------------------------------------- */

  // Handle flashcard dialog open/close - optimized
  const handleSetIsFlashcardsOpen = useCallback((open: boolean) => {
    // Throttle state changes to prevent rapid toggling
    const now = Date.now();
    if (now - lastFlashcardToggleTimeRef.current < 500) {
      return; // Skip if toggled too recently
    }
    
    // Update the last toggle time
    lastFlashcardToggleTimeRef.current = now;
    
    if (!open) {
      // Set the closing flag
      isClosingDialogRef.current = true;
      
      // Ensure isLoading is false when closing the dialog to allow audio transition
      if (isLoading) {
        setIsLoading(false);
      }
    }
    
    // Update the state
    setIsFlashcardsOpen(open);
    
    // If we're closing the dialog, update active rooms after a delay to ensure smooth transition
    if (!open) {
      // Dialog is closing, scheduling activeRooms update
      setTimeout(() => {
        // Only update active rooms if flashcardRoomId is not 'WaitingRoom0' and not empty
        if (flashcardRoomId && flashcardRoomId !== 'WaitingRoom0') {
          // Updating activeRooms to remove flashcardRoomId
          const newActiveRooms = new Set(activeRooms);
          newActiveRooms.delete(flashcardRoomId);
          setActiveRooms(newActiveRooms);
        }
        
        // Reset flashcardRoomId after a delay to ensure smooth transition
        setTimeout(() => {
          // Resetting flashcardRoomId
          setFlashcardRoomId('');
          
          // Reset the closing flag after all operations are complete
          setTimeout(() => {
            isClosingDialogRef.current = false;
          }, 100);
        }, 300);
      }, 300);
    }
  }, [activeRooms, flashcardRoomId, isLoading, setActiveRooms, setFlashcardRoomId, setIsFlashcardsOpen]);

  /* =================================
  // Flashcard Dialog Auto-Open Controller
  // - Automatically opens flashcard dialog when a room is selected
  // - Prevents opening during dialog closing process
  // - Verifies component is mounted before attempting to open
  // - Includes throttling to prevent rapid open/close cycles
  ================================*/
  useEffect(() => {
    if (!isMountedRef.current || !flashcardRoomId || isClosingDialogRef.current) {
      return;
    }
    
    // Auto-open flashcard dialog when roomId is set
    if (flashcardRoomId && !isFlashcardsOpen) {
      // Use a throttled version of the handler to prevent rapid state changes
      const now = Date.now();
      if (now - lastFlashcardToggleTimeRef.current > 500) {
        // Update the last toggle time
        lastFlashcardToggleTimeRef.current = now;
        
        // Set the state directly without using the handler to avoid circular dependencies
        setIsFlashcardsOpen(true);
      }
    }
  }, [flashcardRoomId, isFlashcardsOpen, setIsFlashcardsOpen]);

  const handleSetCompleteAllRoom = useCallback((complete: boolean | ((prevState: boolean) => boolean)) => {
    if (typeof complete === 'function') {
      // If it's a function, call it with the current value to get the new value
      const newComplete = complete(completeAllRoom);
      setCompleteAllRoom(newComplete);
    } else {
      // If it's a direct value, use it directly
      setCompleteAllRoom(complete);
    }
  }, [completeAllRoom, setCompleteAllRoom]);

  // Check if audio transition is in progress using the hook
  const isAudioBusy = isAudioTransitionInProgress();
  
  /* =================================
  // Test Completion & Scoring Handler
  // - Processes test completion when all rooms are completed
  // - Calculates test score based on correct and wrong answers
  // - Updates database with test results
  // - Prevents concurrent state updates with a ref flag
  // - Opens after-test dialog when appropriate
  ================================*/
  useEffect(() => {
    // Skip if not mounted or if state updates are in progress
    if (!isMountedRef.current || stateUpdateInProgressRef.current) return;
    
    // Only run when all conditions are met
    if (!isLoading && completeAllRoom && currentUserTestId) {
      // Set flag to prevent concurrent state updates
      stateUpdateInProgressRef.current = true;
      
      const finishTest = async () => {
        try {
          // Fetch user responses
          await fetchUserResponses(currentUserTestId);
          
          // Dummy scoring logic
          const correctQuestionWeight = 1;
          const incorrectQuestionWeight = -0.5;
          let testScore =
            correctCount * correctQuestionWeight +
            wrongCount * incorrectQuestionWeight;
          testScore = Math.max(testScore, 0);
          
          if (isMountedRef.current) {
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
          }
        } finally {
          // Reset flag after state updates
          if (isMountedRef.current) {
            setTimeout(() => {
              stateUpdateInProgressRef.current = false;
            }, 50);
          }
        }
      };

      finishTest();
    }
  }, [currentUserTestId, completeAllRoom, isLoading, isFlashcardsOpen, largeDialogQuit, 
      fetchUserResponses, correctCount, wrongCount, setTestScore, setIsAfterTestDialogOpen]);
  
  // Render with early return for loading state
  if (!isMountedRef.current || isLoading) {
    return <LoadingClinic />;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-[4rem] flex bg-transparent text-[--theme-text-color] p-4">
      <Toaster position="top-center" />
      {showWelcomeDialogue && 
        <WelcomeDialog 
          isOpen={showWelcomeDialogue}
          onUnlocked={()=>setShowWelcomeDialogue(false)}
        />}
      <Suspense fallback={
        <div className="flex w-full h-full max-w-full max-h-full items-center justify-center text-[--theme-text-color] text-xl font-medium">
          Loading...
        </div>
      }>
        <div className="flex w-full h-full max-w-full max-h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
          <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] relative z-30">
            <ResourcesMenu
              reportData={reportData}
              totalCoins={userInfo?.score || 0}
            />
          </div>
          
          <div className="w-3/4 font-krungthep relative z-20 rounded-r-lg">
            <OfficeContainer
              ref={officeContainerRef}
              onNewGame={handleSetPopulateRooms}
              visibleImages={visibleImages}
              imageGroups={imageGroups}
              setFlashcardRoomId={setFlashcardRoomId}
              updateVisibleImages={updateVisibleImages}
            />
            <div className="absolute top-4 left-4 flex gap-2 z-50">
              <NewGameButton
                userScore={userInfo?.score || 0}
                onGameStart={handleGameStart}
                resetGameState={resetLocalGameState}
              />
            </div>
            <div className="absolute top-4 right-4 z-50 flex items-center">
              {/* Rest of the UI components */}
            </div>
          </div>
        </div>
      </Suspense>

      {isAfterTestDialogOpen && <AfterTestFeed 
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
      
      <div className="absolute bottom-4 right-4 z-[100]">
        <FloatingButton
          currentPage="ankiclinic"
          initialTab={activeTab}
          activities={activities}
          onTasksUpdate={fetchActivities}
          onTabChange={handleTabChange}
        />
      </div>
      
      <TutorialVidDialog
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        videoUrl="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/TutorialAnkiClinic.mp4"
      />

      <RedeemReferralModal 
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />

      {/* Conditionally render FlashcardsDialog */}
      {isMountedRef.current && (
        <FlashcardsDialog
          ref={flashcardsDialogRef}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          handleCompleteAllRoom={handleCompleteAllRoom}
          onMCQAnswer={handleMCQAnswer}
          setTotalMCQQuestions={setTotalMCQQuestions}
          buttonContent={<div />}
        />
      )}
    </div>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(DoctorsOfficePage, (prevProps, nextProps) => {
  // Return true if props are equal (meaning no re-render needed)
  // Since we don't have any props that should trigger re-renders, we return true
  return true;
});