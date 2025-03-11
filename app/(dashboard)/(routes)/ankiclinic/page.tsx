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
import { useAudio } from "@/store/selectors";
import type { UserResponse } from "@prisma/client";
import type { FetchedActivity } from "@/types";
import { GridImage } from './types';
import type { UserResponseWithCategory } from "@/types";
import { shouldShowRedeemReferralModal } from '@/lib/referral';
import { getAccentColor, getWelcomeMessage, getSuccessMessage } from './utils';
import { useGame } from "@/store/selectors";
import { useWindowSize } from "@/store/selectors";
import ClinicHeader from "./components/ClinicHeader";
import HoverSidebar from "@/components/navigation/HoverSidebar";

// Dynamically import components with SSR disabled
const ResourcesMenu = dynamic(() => import('./ResourcesMenu'), {
  ssr: false
});

const WelcomeDialog = dynamic(() => import('./WelcomeDialog'), {
  ssr: false
});

const OfficeContainer = dynamic(() => import('./OfficeContainer'), {
  ssr: false
});

const FloatingButton = dynamic(() => import('../home/FloatingButton'), {
  ssr: false
});

// Dynamically import components that can be lazy-loaded
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

const NewGameButton = dynamic(() => import('./components/NewGameButton'), {
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
const AMBIENT_SOUND = '/audio/flashcard-loop-catfootsteps.mp3';

/* ----- Types ---- */
interface DoctorsOfficePageProps {
  // Add any props if needed
}

const DoctorsOfficePage = ({ ...props }: DoctorsOfficePageProps) => {
  // Add a check for window at the component level
  const isBrowser = typeof window !== 'undefined';
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Add missing refs
  const mountCountRef = useRef(0);
  const isFetchingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const stateUpdateInProgressRef = useRef(false);
  const isMountedRef = useRef(false);
  const ambientSoundInitializedRef = useRef(false);
  
  // Keep only essential refs, remove debugging refs
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
  
  // Remove debug-related refs
  // mountCountRef, isFetchingRef, isInitializedRef, stateUpdateInProgressRef, isMountedRef, etc.

  /* ------------------------------------------- Hooks -------------------------------------------- */
  const { isSubscribed, userInfo, incrementScore, decrementScore, refetch } = useUserInfo();
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
  
  /* ------------------------------------------- State -------------------------------------------- */
  const [activeTab, setActiveTab] = useState("ankiclinic");
  const [showWelcomeDialogue, setShowWelcomeDialogue] = useState(false);
  const [isAfterTestDialogOpen, setIsAfterTestDialogOpen] = useState(false);
  const [largeDialogQuit, setLargeDialogQuit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMCQQuestions, setTotalMCQQuestions] = useState(0);
  const [correctMCQQuestions, setCorrectMCQQuestions] = useState(0);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [clinicCostPerDay, setClinicCostPerDay] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [populateRoomsFn, setPopulateRoomsFn] = useState<(() => GridImage[]) | null>(null);
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [reportData, setReportData] = useState<DoctorOfficeStats | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  
  // Simplified effect for welcome dialog
  useEffect(() => {
    if (userInfo && !isClinicUnlocked) {
      setShowWelcomeDialogue(true);
    }
  }, [userInfo, isClinicUnlocked]);

  // Use isBrowser check for any window/document access
  useEffect(() => {
    if (!isBrowser) return;
    
    mountCountRef.current += 1;
    isMountedRef.current = true;
    
    console.log('[DEBUG] AnkiClinic mounted, pathname:', pathname);
    console.log('[DEBUG] Mount count:', mountCountRef.current);
    
    // Check for React Strict Mode (which causes double renders)
    if (mountCountRef.current === 2) {
      console.log('[DEBUG] Detected possible React Strict Mode (double render)');
    }
    
    // Create a stable reference to the audio object
    const audioRef = audio;
    
    return () => {
      console.log('[DEBUG] AnkiClinic unmounting');
      isMountedRef.current = false;
      
      // Cleanup any in-progress operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Ensure we stop all audio when component unmounts
      console.log('[DEBUG] Stopping all audio on unmount');
      audioRef.stopAllLoops();
      
      // Reset the ambient sound initialization flag
      if (ambientSoundInitializedRef.current) {
        console.log('[DEBUG] Resetting ambient sound initialization flag');
        ambientSoundInitializedRef.current = false;
      }
    };
  }, [pathname, isBrowser]);

  // Add a new effect to initialize ambient sound
  useEffect(() => {
    if (!isBrowser) return;
    
    // Only play ambient sound if:
    // 1. Component is mounted
    // 2. Not in loading state
    // 3. Flashcards are not open
    // 4. Ambient sound hasn't been initialized yet
    if (isMountedRef.current && !isLoading && !isFlashcardsOpen && !ambientSoundInitializedRef.current) {
      // Add a longer delay to ensure audio context is ready and component is stable
      const timeoutId = setTimeout(() => {
        if (!isMountedRef.current) {
          return;
        }
        
        try {
          // Mark as initialized to prevent multiple initializations
          ambientSoundInitializedRef.current = true;
          
          // Play the ambient sound loop
          audio.loopSound(AMBIENT_SOUND);
        } catch (error) {
          console.error('[ERROR] Failed to play ambient sound:', error);
          // Reset the initialized flag so we can try again
          ambientSoundInitializedRef.current = false;
        }
      }, 1500); // Longer delay to ensure stability
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [isBrowser, isLoading, isFlashcardsOpen, audio]);

  // Add a cleanup effect that only runs on unmount
  useEffect(() => {
    // This effect doesn't do anything on mount
    
    // But it provides a cleanup function for component unmount
    return () => {
      if (ambientSoundInitializedRef.current) {
        console.log('[DEBUG] Final cleanup: Stopping all audio on unmount');
        audio.stopAllLoops();
        ambientSoundInitializedRef.current = false;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // We intentionally use an empty dependency array to only run on mount/unmount
  
  // Add a separate effect to handle flashcard state changes
  useEffect(() => {
    if (!isBrowser || !isMountedRef.current) return;
    
    // If flashcards are open, stop the ambient sound
    if (isFlashcardsOpen && ambientSoundInitializedRef.current) {
      // Keep the small delay before stopping the ambient sound
      // This ensures the door open sound has time to play
      setTimeout(() => {
        if (isMountedRef.current && isFlashcardsOpen) {
          audio.stopLoopSound(AMBIENT_SOUND);
        }
      }, 300);
      
      // Don't reset the initialized flag, as we'll restart when flashcards close
      return;
    }
    
    // If flashcards were closed and ambient sound was initialized, restart it
    if (!isFlashcardsOpen && ambientSoundInitializedRef.current && isMountedRef.current) {
      // Use a ref to track the timeout ID to prevent multiple restarts
      const timeoutIdRef = { current: null as NodeJS.Timeout | null };
      
      // Small delay before restarting
      timeoutIdRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          audio.loopSound(AMBIENT_SOUND);
        }
      }, 500);
      
      return () => {
        // Only clear the timeout, don't stop the sound here
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
      };
    }
  }, [isBrowser, isFlashcardsOpen, audio]);

  // Simplified effect for flashcard dialog auto-open
  useEffect(() => {
    if (isLoading || isClosingDialogRef.current) {
      return;
    }
    
    if (flashcardRoomId !== "" && !isFlashcardsOpen) {
      setIsFlashcardsOpen(true);
    }
  }, [flashcardRoomId, isFlashcardsOpen, isLoading, setIsFlashcardsOpen]);

  // Debug mode effect
  useEffect(() => {
    if (!isBrowser) return;
    
    // Check if user is signed in and refresh user info if needed
    if (isSubscribed && !userInfo) {
      refetch();
    }
  }, [isBrowser, isSubscribed, userInfo, refetch]);

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
          
          setIsLoading(false);
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
        
        setIsLoading(false);
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
        setIsLoading(false);
      }
    }
  };

  // Simplified effect for data initialization
  useEffect(() => {
    // Add a small delay to ensure client-side hydration is complete
    const timer = setTimeout(() => {
      console.log('[DEBUG] does not appear');
      fetchData();
    }, 10);
    
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
    if (!isLoading && userInfo && !hasCalculatedRef.current) {
      performDailyCalculations();
      hasCalculatedRef.current = true;
    }
  }, [isLoading, userInfo]);

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

  // Handle flashcard dialog open/close - simplified
  const handleSetIsFlashcardsOpen = useCallback((open: boolean) => {
    if (isClosingDialogRef.current && open) {
      return;
    }
    
    if (open) {
      // OPENING FLASHCARD DIALOG
      // Note: We're keeping this here for cases where the dialog is opened programmatically,
      // but in most cases, the sound will be played by the RoomSprite component when a question is clicked
      if (!isFlashcardsOpen) {
        // Only play the sound if it wasn't triggered by a room click
        // This prevents duplicate sounds from playing
        if (flashcardRoomId === "") {
          audio.playSound('flashcard-door-open');
        }
      }
    } else {
      // CLOSING FLASHCARD DIALOG
      isClosingDialogRef.current = true;
      
      // Play door close sound when dialog is closed
      audio.playSound('flashcard-door-closed');
      
      if (isLoading) {
        setIsLoading(false);
      }
    }
    
    setIsFlashcardsOpen(open);
    
    if (!open) {
      setTimeout(() => {
        // Remove this room removal logic and let FlashcardsDialog.handleClose handle it
        
        setTimeout(() => {
          setFlashcardRoomId('');
          
          setTimeout(() => {
            isClosingDialogRef.current = false;
          }, 100);
        }, 300);
      }, 300);
    }
  }, [flashcardRoomId, setFlashcardRoomId, setIsFlashcardsOpen, isLoading, audio, isFlashcardsOpen]);

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
    if (!isLoading && completeAllRoom && currentUserTestId) {
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
  }, [currentUserTestId, completeAllRoom, isLoading, isFlashcardsOpen, largeDialogQuit, 
      fetchUserResponses, correctCount, wrongCount, setTestScore]);
  
  // Show loading state during initial load
  if (isLoading && !isClinicUnlocked) {
    return <LoadingClinic />;
  }

  // Add a toggle button component for the sidebar
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

  // Rest of the component remains the same
  return (
    <div className={`absolute inset-0 flex bg-transparent text-[--theme-text-color] ${isMobile ? 'p-0' : 'p-4'}`}>
      <Toaster position="top-center" />
      
      {showWelcomeDialogue && 
        <WelcomeDialog 
          isOpen={showWelcomeDialogue}
          onUnlocked={()=>setShowWelcomeDialogue(false)}
        />}
    <Suspense fallback={
        <div className="flex w-full h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
          <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] animate-pulse" />
          <div className="w-3/4 bg-gray-900/50 animate-pulse rounded-r-lg" />
        </div>
      }>
        <div className={`flex w-full h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] ${isMobile ? 'rounded-none' : 'rounded-lg'} overflow-hidden`}>
          {/* Mobile layout: completely separate components for sidebar and main content */}
          {isMobile ? (
            <>
              {/* Main content container - full width on mobile */}
              <div className="w-full h-full relative">
                <OfficeContainer
                  ref={officeContainerRef}
                  onNewGame={handleSetPopulateRooms}
                  visibleImages={visibleImages}
                  imageGroups={imageGroups}
                  updateVisibleImages={updateVisibleImages}
                />
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
                  {/* Pill handle for UI feedback */}
                  <div className="w-12 h-1.5 bg-gray-300/30 rounded-full mx-auto mb-6"></div>
                  
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
                  
                  <ResourcesMenu
                    reportData={reportData}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Desktop layout: side-by-side components */}
              <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] relative z-50">
                <ResourcesMenu
                  reportData={reportData}
                />
              </div>
              
              <div className="w-3/4 font-krungthep relative z-20 rounded-r-lg">
                <OfficeContainer
                  ref={officeContainerRef}
                  onNewGame={handleSetPopulateRooms}
                  visibleImages={visibleImages}
                  imageGroups={imageGroups}
                  updateVisibleImages={updateVisibleImages}
                />
              </div>
            </>
          )}
          
          {/* Reposition buttons based on device type */}
          {isMobile && (
            <>
              {/* Mobile buttons wrapper - fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-black/30 backdrop-blur-sm">
                {/* Left side - Tutorial button */}
                <div>
                  <a 
                    href="/ankiclinic-tutorial" 
                    className="p-3 bg-[--theme-gradient-startstreak] rounded-full shadow-lg flex items-center justify-center"
                    onClick={(e) => {
                      e.preventDefault();
                      // This functionality is now handled in the ClinicHeader component
                      const headerButton = document.querySelector('.clinic-header-tutorial-trigger');
                      if (headerButton) {
                        (headerButton as HTMLElement).click();
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
                
                {/* Center - New Game button */}
                <div>
                  <NewGameButton
                    onGameStart={handleGameStart}
                  />
                </div>
                
                {/* Right side - Sidebar toggle */}
                <div>
                  <SidebarToggleButton onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                </div>
              </div>
            </>
          )}
          
          {/* Fellowship Level button with coins and patients - always at top */}
          <ClinicHeader
            totalPatients={totalPatients}
            patientsPerDay={patientsPerDay}
            userInfo={userInfo}
            userLevel={userLevel}
            imageGroups={imageGroups}
            visibleImages={visibleImages}
            toggleGroup={toggleGroup}
          />
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
      
      {/* Add HoverSidebar instead of FloatingButton */}
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
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onMCQAnswer={handleMCQAnswer}
        setTotalMCQQuestions={setTotalMCQQuestions}
        buttonContent={<div />}
      />}

      {/* Desktop only - Tutorial button */}
      {!isMobile && (
        <div className="absolute bottom-4 left-[calc(25%+16px)] z-50">
          <a 
            href="/ankiclinic-tutorial" 
            className="text-sm text-white font-bold flex items-center p-2 bg-[--theme-gradient-startstreak] rounded-lg"
            onClick={(e) => {
              e.preventDefault();
              // This functionality is now handled in the ClinicHeader component
              const headerButton = document.querySelector('.clinic-header-tutorial-trigger');
              if (headerButton) {
                (headerButton as HTMLElement).click();
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Tutorial
          </a>
        </div>
      )}

      {/* Desktop only - New Game button */}
      {!isMobile && (
        <div className="absolute top-6 left-4 ml-[calc(25%+16px)] flex gap-2 z-50">
          <NewGameButton
            onGameStart={handleGameStart}
          />
        </div>
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