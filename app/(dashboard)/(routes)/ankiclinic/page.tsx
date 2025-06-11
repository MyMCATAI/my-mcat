"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react";
import ReactDOM from 'react-dom';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import SideBar from '../home/SideBar';
import { useUser } from "@/store/selectors";
import { FeatureUnlockBanner } from '@/components/ankiclinic/FeatureUnlockBanner';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Add import for KalypsoOnboarding
const KalypsoOnboarding = dynamic(() => import('./onboarding/KalypsoOnboarding'), {
  ssr: false
});

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

const WelcomeDialog = dynamic(() => import('./WelcomeDialog'), {
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
  const chatbotRef = useRef<{ sendMessage: (message: string) => void }>({
    sendMessage: () => {},
  });
  
  // Use a ref instead of state to track ambient sound initialization
  // This prevents re-renders when the ambient sound is initialized
  const ambientSoundInitializedRef = useRef(false);
  
  /* ------------------------------------------- Hooks -------------------------------------------- */
  const { isSubscribed, userInfo, incrementScore, decrementScore, refetch, updateScore } = useUserInfo();
  const { refreshUserInfo, onboardingComplete } = useUser();
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
  const [showWelcomeDialogue, setShowWelcomeDialogue] = useState(false);
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
  const [showKalypsoOnboarding, setShowKalypsoOnboarding] = useState(false);
  const [showCoinReward, setShowCoinReward] = useState(false);
  const [showCoin, setShowCoin] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const marketplaceDialogRef = useRef<{
    open: () => void
  } | null>(null);

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

  /* ----------------------------------------- UseEffects ---------------------------------------- */
  
  // Simplified effect for welcome dialog
  useEffect(() => {
    if (userInfo && !isClinicUnlocked) {
      setShowWelcomeDialogue(true);
    }
  }, [userInfo, isClinicUnlocked]);

  // Add effect to show KalypsoOnboarding every time the page loads
  useEffect(() => {
    // Show KalypsoOnboarding every time the page is accessed
    // Only show after the component has mounted and onboarding is complete
    if (onboardingComplete && !mcqState.isLoading) {
      setShowKalypsoOnboarding(true);
    }
  }, [onboardingComplete, mcqState.isLoading]);

  // Improved audio management effect - using audio store state to prevent duplicate loops
  useEffect(() => {
    if (!isBrowser) return;
    
    // Set mounted flag only once
    isMountedRef.current = true;
    
    // Only initialize ambient sound once when component mounts
    let timeoutId: NodeJS.Timeout | undefined;
    
    const initializeAmbientSound = () => {
      // Only initialize if not already initialized, flashcards are not open, and no loop is currently playing
      if (!ambientSoundInitializedRef.current && !isFlashcardsOpen && !audio.currentLoop) {
        // Set the flag before playing to prevent race conditions
        ambientSoundInitializedRef.current = true;
        audio.playLoop(AMBIENT_SOUND);
      }
    };
    
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
        audio.playLoop(AMBIENT_SOUND);
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
  }, [isBrowser, isFlashcardsOpen, audio]);

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
        // User has already treated patients today - no notification needed
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
        // No new patients to treat today - no notification needed
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
      performDailyCalculations();
      hasCalculatedRef.current = true;
    }
  }, [mcqState.isLoading, userInfo]);

  const handleTabChange = (tab: string) => {
    if (tab !== "ankiclinic") {
      router.push(`/home?tab=${tab}`);
    }
    // No need to update activeTab state
  };

  // Add a function to handle chatbot activation from the Kalypso sprite
  const handleActivateChatbot = useCallback(() => {
    // Play the chatbot-open sound
    audio.playSound('chatbot-open');
    
    // For now, just show a toast - in the future this could activate the chatbot tab
    toast.success("Kalypso says hello! 🐱");
  }, [audio]);

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

  const handleKalypsoOnboardingComplete = useCallback((shouldShowCoinReward?: boolean) => {
    setShowKalypsoOnboarding(false);
    
    if (shouldShowCoinReward) {
      // Play fanfare sound
      audio.playSound('fanfare');
      
      // Show coin reward animation
      setShowCoinReward(true);
      
      // Animate the coin and description with delays
      setTimeout(() => setShowCoin(true), 500);
      setTimeout(() => setShowDescription(true), 1500);
      
      // Auto-close the coin reward after 5 seconds
      setTimeout(() => {
        setShowCoinReward(false);
        setShowCoin(false);
        setShowDescription(false);
        toast.success("Welcome to AnkiClinic! Ready to start studying! 🎉");
      }, 5000);
    }
  }, [audio]);

  /* ----------------------------------------- Render  ---------------------------------------- */

  // Show loading state during initial load
  if (mcqState.isLoading && !isClinicUnlocked) {
    return <LoadingClinic />;
  }

  return (
    <div className={`absolute inset-0 flex bg-transparent text-[--theme-text-color] ${isMobile ? 'p-0' : 'p-4'}`}>
      <Toaster position="top-center" />
      
      {/* Conditionally render KalypsoOnboarding every time the page loads */}
      {showKalypsoOnboarding && onboardingComplete && (
        <KalypsoOnboarding
          isOpen={showKalypsoOnboarding}
          onClose={() => setShowKalypsoOnboarding(false)}
          onComplete={handleKalypsoOnboardingComplete}
        />
      )}
      
      {showWelcomeDialogue && onboardingComplete &&
        <WelcomeDialog 
          isOpen={showWelcomeDialogue}
          onUnlocked={()=>setShowWelcomeDialogue(false)}
        />}
    <Suspense fallback={
        <div className="flex w-full h-full bg-opacity-50 bg-black border-4 border-[--theme-leaguecard-color] rounded-lg overflow-hidden">
          <div className="w-1/4 p-4 bg-[--theme-leaguecard-color] animate-pulse" />
          <div className="w-3/4 bg-gray-900/50 animate-pulse rounded-r-lg" />
        </div>
      }>
        <div className={`flex w-full h-full bg-opacity-50 bg-black border-4 border-[--theme-leaguecard-color] ${isMobile ? 'rounded-none' : 'rounded-lg'} overflow-hidden`}>
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
                  onKalypsoClick={handleActivateChatbot}
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
                <div className={`fixed inset-x-0 bottom-0 top-auto z-50 gradientbg p-4 max-h-[80vh] overflow-auto transition-transform duration-300 transform ${
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
                    chatbotContext={null}
                    chatbotRef={chatbotRef}
                    handleSetTab={() => {}}
                    onActivitiesUpdate={fetchActivities}
                    isSubscribed={isSubscribed}
                    showTasks={true}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Desktop layout: side-by-side components */}
              <div className="w-3/4 font-krungthep relative z-20 rounded-l-lg">
                <OfficeContainer
                  ref={officeContainerRef}
                  onNewGame={handleSetPopulateRooms}
                  visibleImages={visibleImages}
                  imageGroups={imageGroups}
                  updateVisibleImages={updateVisibleImages}
                  onKalypsoClick={handleActivateChatbot}
                />
              </div>
              
              <div className="w-1/4 p-4 gradientbg relative z-50">
                <SideBar
                  activities={activities}
                  currentPage="ankiclinic"
                  chatbotContext={null}
                  chatbotRef={chatbotRef}
                  handleSetTab={() => {}}
                  onActivitiesUpdate={fetchActivities}
                  isSubscribed={isSubscribed}
                  showTasks={true}
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
                <div className="ml-2">
                    <NewGameButton
                      onGameStart={handleGameStart}
                    />
                </div>
                
                {/* Right side - Sidebar toggle and Marketplace */}
                <div className="flex gap-2">
                  {/* Marketplace button */}
                  <button 
                    onClick={() => setIsMarketplaceOpen(true)}
                    className="p-3 bg-[--theme-gradient-startstreak] rounded-full shadow-lg flex items-center justify-center"
                    aria-label="Open marketplace"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  
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
          
          {/* Feature unlock banner */}

          {userLevel !== "PATIENT LEVEL" && totalPatients > 0 && (
            <div className="absolute top-20 right-4 left-4 z-40 md:left-1/4 md:right-4">
              <FeatureUnlockBanner />
            </div>
          )}
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

      {/* Coin Reward Popup */}
      {showCoinReward && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[10002] flex items-center justify-center"
          onClick={() => {
            setShowCoinReward(false);
            setShowCoin(false);
            setShowDescription(false);
          }}
        >
          <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto px-4">
            {/* "You've won a coin!" text */}
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={showCoin ? { opacity: 1, y: 0 } : {}}
              transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.2 }}
              className="text-4xl md:text-5xl text-yellow-400 font-bold text-center"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(255, 215, 0, 0.5)'
              }}
            >
              You've won a coin! 🎉
            </motion.div>
            
            {/* Coin Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 100 }}
              animate={showCoin ? { 
                opacity: 1, 
                scale: 1, 
                y: 0,
                rotate: [0, 360]
              } : {}}
              transition={{ 
                type: "spring", 
                damping: 15, 
                stiffness: 200,
                rotate: { duration: 2, ease: "easeOut" }
              }}
              className="flex items-center justify-center"
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
              className="text-2xl md:text-3xl text-white font-semibold max-w-2xl mx-auto px-4 text-center"
              style={{
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              You win coins for getting questions right and consistency, and lose them for inconsistency!
            </motion.div>
          </div>
        </motion.div>
      )}

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

      {/* Desktop only - New Game button */}
      {!isMobile && userLevel !== "PATIENT LEVEL" && (
        <div className="absolute top-6 left-4 flex gap-2 z-50">
          <div className="ml-4 mt-2">
            <NewGameButton
              onGameStart={handleGameStart}
            />
          </div>
        </div>
      )}

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
    </div>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
// eslint-disable-next-line import/no-unused-modules
export default React.memo(DoctorsOfficePage);

