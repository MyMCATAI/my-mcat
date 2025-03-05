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

// Import components that should load immediately
import ResourcesMenu from './ResourcesMenu';
import WelcomeDialog from './WelcomeDialog';
import OfficeContainer from './OfficeContainer';
import FloatingButton from '../home/FloatingButton';

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Keep only essential refs, remove debugging refs
  const officeContainerRef = useRef<HTMLDivElement>(null);
  const flashcardsDialogRef = useRef<{ 
    open: () => void, 
    setWrongCards: (cards: any[]) => void, 
    setCorrectCount: (count: number) => void 
  } | null>(null);
  const marketplaceDialogRef = useRef<{
    open: () => void
  }>(null);
  const afterTestFeedRef = useRef<{ setWrongCards: (cards: any[]) => void } | null>(null);
  const isClosingDialogRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasCalculatedRef = useRef(false);
  
  // Remove debug-related refs
  // mountCountRef, isFetchingRef, isInitializedRef, stateUpdateInProgressRef, isMountedRef, etc.

  /* ------------------------------------------- Hooks -------------------------------------------- */
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
  const [isAfterTestDialogOpen, setIsAfterTestDialogOpen] = useState(false);
  const [largeDialogQuit, setLargeDialogQuit] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isFlashcardsTooltipOpen, setIsFlashcardsTooltipOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMCQQuestions, setTotalMCQQuestions] = useState(0);
  const [correctMCQQuestions, setCorrectMCQQuestions] = useState(0);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [clinicCostPerDay, setClinicCostPerDay] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [populateRoomsFn, setPopulateRoomsFn] = useState<(() => GridImage[]) | null>(null);
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [reportData, setReportData] = useState<DoctorOfficeStats | null>(null);

  // Add useAudioTransitions hook after state declarations
  const { 
    initializeAmbientSound, 
    stopAllAudio,
    isAudioTransitionInProgress 
  } = useAudioTransitions({
    isFlashcardsOpen,
    isLoading,
    isMounted: true // Simplified from isMountedRef.current
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
  
  // Simplified effect for audio management
  useEffect(() => {
    // Initialize ambient sound when not in flashcards mode
    if (!isFlashcardsOpen && !isLoading) {
      initializeAmbientSound();
    }
    
    // Cleanup audio on unmount
    return () => {
      stopAllAudio();
    };
  }, [isFlashcardsOpen, isLoading, initializeAmbientSound, stopAllAudio]);

  // Simplified effect for welcome dialog
  useEffect(() => {
    if (userInfo && !isLoading && !hasCalculatedRef.current) {
      hasCalculatedRef.current = true;
      setShowWelcomeDialogue(true);
    }
  }, [userInfo, isLoading]);

  // Simplified effect for debug mode preservation
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const isDebugMode = searchParams?.get('debug') === 'true';
    
    if (isDebugMode) {
      document.body.classList.add('debug-mode');
    } else if (searchParams?.get('debug') === 'false') {
      document.body.classList.remove('debug-mode');
    }
    
    return () => {
      if (document.body.classList.contains('debug-mode') && !isDebugMode) {
        document.body.classList.remove('debug-mode');
      }
    };
  }, [searchParams]);

  // Simplified effect for flashcard dialog auto-open
  useEffect(() => {
    if (isLoading || isClosingDialogRef.current) return;
    
    if (flashcardRoomId !== "" && !isFlashcardsOpen) {
      setIsFlashcardsOpen(true);
    }
  }, [flashcardRoomId, isFlashcardsOpen, isLoading, setIsFlashcardsOpen]);

  const fetchData = async () => {
    if (reportData && !isLoading) {
      return;
    }
    
    setIsLoading(true);
    
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
          },
          priority: 'high'
        }),
        fetch("/api/clinic", { 
          signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          priority: 'high'
        }),
      ]);

      if (signal.aborted) return;

      const [reportData, clinicData] = await Promise.all([
        reportResponse.json(),
        clinicResponse.json()
      ]);

      if (signal.aborted) return;
      
      setReportData(reportData);
      
      if (JSON.stringify(userRooms) !== JSON.stringify(clinicData.rooms)) {
        setUserRooms(clinicData.rooms || []);
      }
      
      if (userLevel !== clinicData.level) {
        updateUserLevel();
      }
      
      if (streakDays !== clinicData.streakDays) {
        setStreakDays(clinicData.streakDays || 0);
      }
      
      if (totalPatients !== (clinicData.totalPatientsTreated || 0)) {
        setTotalPatients(clinicData.totalPatientsTreated || 0);
      }
      
      setIsLoading(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request aborted
      } else {
        toast.error("Failed to load clinic data. Please try refreshing the page.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified effect for data initialization
  useEffect(() => {
    fetchData();
    
    return () => {
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
    
    if (!open) {
      // CLOSING FLASHCARD DIALOG
      isClosingDialogRef.current = true;
      
      if (isLoading) {
        setIsLoading(false);
      }
    }
    
    setIsFlashcardsOpen(open);
    
    if (!open) {
      setTimeout(() => {
        if (flashcardRoomId && flashcardRoomId !== 'WaitingRoom0') {
          const newActiveRooms = new Set(activeRooms);
          newActiveRooms.delete(flashcardRoomId);
          setActiveRooms(newActiveRooms);
        }
        
        setTimeout(() => {
          setFlashcardRoomId('');
          
          setTimeout(() => {
            isClosingDialogRef.current = false;
          }, 100);
        }, 300);
      }, 300);
    }
  }, [flashcardRoomId, activeRooms, setActiveRooms, setFlashcardRoomId, setIsFlashcardsOpen, isLoading]);

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

  // Rest of the component remains the same
  return (
    <div className="fixed inset-x-0 bottom-0 top-[4rem] flex bg-transparent text-[--theme-text-color] p-4">
      <Toaster position="top-center" />
      {showWelcomeDialogue && 
        <WelcomeDialog 
          isOpen={showWelcomeDialogue}
          onUnlocked={()=>setShowWelcomeDialogue(false)}
        />}
    <Suspense fallback={
        <div className="flex w-full h-full max-w-full max-h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
          <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] animate-pulse" />
          <div className="w-3/4 bg-gray-900/50 animate-pulse rounded-r-lg" />
        </div>
      }>
        <div className="flex w-full h-full max-w-full max-h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
          {/* Give ResourcesMenu a higher z-index */}
          <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] relative z-30">
            <ResourcesMenu
              reportData={reportData}
            />
          </div>
          
          {/* Keep OfficeContainer at a lower z-index */}
          <div className="w-3/4 font-krungthep relative z-20 rounded-r-lg">
            <OfficeContainer
              ref={officeContainerRef}
              onNewGame={handleSetPopulateRooms}
              visibleImages={visibleImages}
              imageGroups={imageGroups}
              updateVisibleImages={updateVisibleImages}
            />
            {/* Button on the top left corner */}
            <div className="absolute top-4 left-4 flex gap-2 z-50">
              <NewGameButton
                onGameStart={handleGameStart}
              />
            </div>
            {/* Fellowship Level button with coins and patients */}
            <div className="absolute top-4 right-4 z-50 flex items-center">
              {/* Patient count */}
              <div className="group relative flex items-center bg-opacity-75 bg-gray-800 rounded-lg p-2 mr-2">
                <Image
                  src="/game-components/patient.png"
                  alt="Patient"
                  width={32}
                  height={32}
                  className="mr-2"
                />
                <div className="flex flex-col">
                  <span className="text-[--theme-hover-color] font-bold text-lg">{totalPatients}</span>
                </div>
                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-[--theme-leaguecard-color] text-[--theme-text-color] text-sm rounded-lg p-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 border border-[--theme-border-color]">
                  <p className="mb-2">Total patients treated: {totalPatients}</p>
                  <p className="mb-2">You treat <span className="text-[--theme-hover-color]">{patientsPerDay} patients per day</span> at your current level.</p>
                  <p>Higher clinic levels allow you to treat more patients daily, which affects your total score.</p>
                  <ul className="text-xs mt-1 space-y-1">
                    <li>• INTERN: 4/day</li>
                    <li>• RESIDENT: 8/day</li>
                    <li>• FELLOWSHIP: 10/day</li>
                    <li>• ATTENDING: 16/day</li>
                    <li>• PHYSICIAN: 24/day</li>
                    <li>• MEDICAL DIRECTOR: 30/day</li>
                  </ul>
                </div>
              </div>
              {/* Rest of the component remains the same */}
              {/* ... */}
            </div>
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
      
      <div className="absolute bottom-4 right-4 z-[100]">
        <FloatingButton
          currentPage="ankiclinic"
          initialTab={activeTab}
          activities={activities}
          onTasksUpdate={fetchActivities}
          isSubscribed={isSubscribed}
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
    </div>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(DoctorsOfficePage, (prevProps, nextProps) => {
  // Return true if props are equal (meaning no re-render needed)
  // Since we don't have any props that should trigger re-renders, we return true
  return true;
});