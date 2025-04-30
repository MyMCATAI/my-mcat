"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense, useMemo } from "react";
import ReactDOM from 'react-dom';
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DoctorOfficeStats } from "@/types";
import { toast, Toaster } from "react-hot-toast";
import { imageGroups } from "./constants/imageGroups";
import dynamic from 'next/dynamic';
import { useUserActivity } from '@/hooks/useUserActivity';
import { useAudio } from "@/store/selectors";
import type { UserResponse } from "@prisma/client";
import type { FetchedActivity } from "@/types";
import { GridImage } from './types';
import { getWelcomeMessage, getSuccessMessage } from './utils';
import { useGame } from "@/store/selectors";
import { useWindowSize } from "@/store/selectors";
import ClinicHeader from "./components/ClinicHeader";
import OfficeContainer from './OfficeContainer';
import { FeatureUnlockBanner } from '@/components/ankiclinic/FeatureUnlockBanner';
import SideBar from '../home/SideBar';
import HoverSidebar from "@/components/navigation/HoverSidebar";

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
  
  // Use a ref instead of state to track ambient sound initialization
  // This prevents re-renders when the ambient sound is initialized
  const ambientSoundInitializedRef = useRef(false);
  
  /* ------------------------------------------- Hooks -------------------------------------------- */
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
  const [populateRoomsFn, setPopulateRoomsFn] = useState<(() => GridImage[]) | null>(null);
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [reportData, setReportData] = useState<DoctorOfficeStats | null>(null);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [chatbotContext, setChatbotContext] = useState<any>(null);
  const marketplaceDialogRef = useRef<{
    open: () => void
  } | null>(null);

  /* ----------------------------------------- Computation ----------------------------------------- */

  // Memoize expensive computations
  const isClinicUnlocked = true; // Simplified for now, always unlocked

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
  
  // Simplified effect for audio management - using audio store state to prevent duplicate loops
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
        
        // Set volume to lower level before playing
        const originalVolume = audio.volume;
        audio.setVolume(0.3); // Reduce volume to 30%
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
        // Set volume to lower level before playing
        audio.setVolume(0.3); // Reduce volume to 30%
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

  const handleTabChange = (tab: string) => {
    if (tab !== "ankiclinic") {
      router.push(`/home?tab=${tab}`);
    }
  };

  const handleCompleteAllRoom = () => {
    setCompleteAllRoom(true);
  };

  const toggleGroup = async (groupName: string) => {
    const group = imageGroups.find((g) => g.name === groupName);
    if (!group) return;

    try {
      // Simplify to just handle toggling the room
      unlockRoom(groupName);
      
      // Update visible images
      setVisibleImages((prev) => {
        const newSet = new Set(prev);
        group.items.forEach((item) => newSet.add(item.id));
        return newSet;
      });

      toast.success(`Added ${groupName} to your clinic!`);
    } catch (error) {
      console.error("Error updating clinic rooms:", error);
      toast.error("Failed to update clinic rooms");
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

  useEffect(() => {
    fetchActivities();
  }, []);

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

  /* ----------------------------------------- Render  ---------------------------------------- */

  return (
    <div className={`absolute inset-0 flex bg-transparent text-[--theme-text-color] ${isMobile ? 'p-0' : 'p-4'}`}>
      <Toaster position="top-center" />
      
      {/* HoverSidebar - positioned on the left side */}
      <HoverSidebar
        activities={activities}
        onTasksUpdate={fetchActivities}
        onTabChange={handleTabChange}
        currentPage="ankiclinic"
        isSubscribed={true}
      />
      
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
        <div className={`flex w-full h-full gap-4 bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] ${isMobile ? 'rounded-none' : 'rounded-lg'} overflow-hidden`}>
          {/* Main content container - 3/4 width - Isolated from sidebar */}
          <div 
            className="w-3/4 h-full relative"
            style={{
              isolation: 'isolate', // CSS isolation to prevent event propagation
              touchAction: 'manipulation', // Better touch handling
            }}
          >
            <OfficeContainer
              ref={officeContainerRef}
              onNewGame={handleSetPopulateRooms}
              visibleImages={visibleImages}
              imageGroups={imageGroups}
              updateVisibleImages={updateVisibleImages}
            />
          </div>
          
          {/* Sidebar container - 1/4 width - Explicitly prevent drag propagation */}
          <div 
            className="w-1/4 h-full"
            style={{
              isolation: 'isolate', // CSS isolation to prevent event propagation
              touchAction: 'manipulation', // Better touch handling
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="h-full gradientbg p-3 pb-6 rounded-lg">
              <SideBar 
                activities={activities}
                currentPage="ankiclinic"
                chatbotContext={chatbotContext}
                chatbotRef={chatbotRef}
                handleSetTab={handleTabChange}
                onActivitiesUpdate={fetchActivities}
                isSubscribed={true}
                showTasks={true}
              />
            </div>
          </div>
          
          {/* Mobile buttons wrapper - fixed at bottom */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center p-4 z-50 bg-black/30 backdrop-blur-sm">
              {/* Left side - New Game button */}
              <div>
                <NewGameButton
                  onGameStart={handleGameStart}
                />
              </div>
            </div>
          )}
          
          {/* Fellowship Level button with patients */}
          <ClinicHeader
            totalPatients={totalPatients}
            patientsPerDay={patientsPerDay}
            userLevel={userLevel}
            imageGroups={imageGroups}
            visibleImages={visibleImages}
            toggleGroup={toggleGroup}
          />
          
          {/* Feature unlock banner */}
          <div className="absolute top-20 right-4 left-4 z-40">
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

      {/* Desktop only - New Game and Tutorial buttons */}
      {!isMobile && (
        <>
          {/* New Game button at bottom left */}
          <div className="absolute bottom-4 left-4 z-50">
            <NewGameButton
              onGameStart={handleGameStart}
            />
          </div>
        </>
      )}

      {/* Add ShoppingDialog - always mounted */}
      <ShoppingDialog
        ref={marketplaceDialogRef}
        imageGroups={imageGroups}
        visibleImages={visibleImages}
        toggleGroup={toggleGroup}
        userScore={1000} // Default score for now
        isOpen={isMarketplaceOpen}
        onOpenChange={setIsMarketplaceOpen}
        clinicRooms="[]" // Default empty value for now
      />
    </div>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
// eslint-disable-next-line import/no-unused-modules
export default React.memo(DoctorsOfficePage);

