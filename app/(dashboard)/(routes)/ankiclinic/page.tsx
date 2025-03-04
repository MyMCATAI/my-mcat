"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { usePathname } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';
import { useGame } from "@/store/selectors";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useAudioTransitions } from "@/hooks/useAudioTransitions";
import { useUserActivity } from '@/hooks/useUserActivity';
import { useAudio } from "@/contexts/AudioContext";
import type { UserResponseWithCategory } from "@/types";
import type { GridImage } from './types';

const ResourcesMenu = dynamic(() => import('./ResourcesMenu'), { ssr: false });
const WelcomeDialog = dynamic(() => import('./WelcomeDialog'), { ssr: false });
const OfficeContainer = dynamic(() => import('./OfficeContainer'), { ssr: false });
const AfterTestFeed = dynamic(() => import('./AfterTestFeed'), { ssr: false });
const FloatingButton = dynamic(() => import('../home/FloatingButton'), { ssr: false });
const FlashcardsDialog = dynamic(() => import('./FlashcardsDialog'), { ssr: false });
const TutorialVidDialog = dynamic(() => import('@/components/ui/TutorialVidDialog'), { ssr: false });
const RedeemReferralModal = dynamic(() => import('@/components/social/friend-request/RedeemReferralModal'), { ssr: false });
const ShoppingDialog = dynamic(() => import('./ShoppingDialog'), { ssr: false });

/* --- Constants ----- */
const AMBIENT_SOUND = '/audio/flashcard-loop-catfootsteps.mp3';

/* ----- Types ---- */
interface DoctorsOfficePageProps {}

const LoadingClinic = () => (
  <div className="flex w-full h-full bg-opacity-50 bg-black border-4 rounded-lg overflow-hidden">
    <div className="w-1/4 p-4 bg-gray-600 animate-pulse"></div>
    <div className="w-3/4 bg-gray-900/50 animate-pulse rounded-r-lg"></div>
  </div>
);

const DoctorsOfficePage = () => {
  /* ---- Refs --- */
  const officeContainerRef = useRef<HTMLDivElement>(null);
  const flashcardsDialogRef = useRef<{ 
    open: () => void, 
    setWrongCards: (cards: any[]) => void, 
    setCorrectCount: (count: number) => void 
  } | null>(null);
  const afterTestFeedRef = useRef<{ setWrongCards: (cards: any[]) => void } | null>(null);
  const lastFlashcardToggleTimeRef = useRef<number>(0);
  const isClosingDialogRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(false);
  
  /* ---- State ----- */
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const { 
    userRooms, userLevel, patientsPerDay, totalPatients, streakDays,
    isGameInProgress, currentUserTestId, isFlashcardsOpen, flashcardRoomId, 
    activeRooms, completeAllRoom, correctCount, wrongCount, testScore, userResponses,
    unlockRoom, startGame, endGame, setIsFlashcardsOpen, setUserRooms,
    setFlashcardRoomId, setActiveRooms, setCompleteAllRoom, resetGameState,
    setCorrectCount, setWrongCount, setTestScore, setUserResponses,
    setStreakDays, setTotalPatients, updateUserLevel
  } = useGame();
  const { isSubscribed, userInfo, incrementScore, decrementScore } = useUserInfo();
  const { setIsAutoPlay } = useMusicPlayer();
  const { startActivity } = useUserActivity();
  const audio = useAudio();
  const { stopAllAudio } = useAudioTransitions({
    isFlashcardsOpen,
    isLoading,
    isMounted: true
  });
  
  // Create a wrapper function that adapts between Zustand's setFlashcardRoomId and React's setState
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

  // Create a wrapper function for setActiveRooms to adapt between Zustand and React's setState
  const handleSetActiveRooms = useCallback((rooms: Set<string> | ((prevState: Set<string>) => Set<string>)) => {
    if (typeof rooms === 'function') {
      // If it's a function, call it with the current value to get the new value
      const newRooms = rooms(activeRooms);
      setActiveRooms(newRooms);
    } else {
      // If it's a direct value, use it directly
      setActiveRooms(rooms);
    }
  }, [activeRooms, setActiveRooms]);

  const [showWelcomeDialogue, setShowWelcomeDialogue] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isAfterTestDialogOpen, setIsAfterTestDialogOpen] = useState(false);
  const [largeDialogQuit, setLargeDialogQuit] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [totalMCQQuestions, setTotalMCQQuestions] = useState(0);
  const [correctMCQQuestions, setCorrectMCQQuestions] = useState(0);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [populateRoomsFn, setPopulateRoomsFn] = useState<(() => GridImage[]) | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  
  /* ----- Callbacks --- */
  const updateVisibleImages = useCallback((newVisibleImages: Set<string>) => {
    setVisibleImages(newVisibleImages);
  }, []);

  const handleSetPopulateRooms = useCallback((fn: () => GridImage[]) => {
    setPopulateRoomsFn(() => fn);
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
      const correct = responses?.filter((response: any) => response.isCorrect)?.length || 0;
      const wrong = responses?.filter((response: any) => !response.isCorrect)?.length || 0;

      setCorrectCount(correct);
      setWrongCount(wrong);
    } catch (error) {
      console.error("Error fetching user responses:", error);
      toast.error("Failed to load test responses");
    }
  }, [setUserResponses, setCorrectCount, setWrongCount]);

  /* --- Animations & Effects --- */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  useEffect(() => {
    setIsAutoPlay(true);
    return () => {
      setIsAutoPlay(false);
      stopAllAudio();
    };
  }, [setIsAutoPlay, stopAllAudio]);
  
  useEffect(() => {
    if (!isLoading) return;
    setTimeout(() => setIsLoading(false), 500);
  }, [isLoading]);

  // Handles test completion, scoring, and updates database
  useEffect(() => {
    const finishTest = async () => {
      if (!isLoading && completeAllRoom) {
        // Finish all rooms
        // Fetch user responses
        if (currentUserTestId) {
          fetchUserResponses(currentUserTestId);
          // Dummy scoring logic
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
        }
      }
    };

    finishTest();
  }, [currentUserTestId, activeRooms.size, isFlashcardsOpen, fetchUserResponses, correctCount,
    wrongCount, testScore, isLoading, largeDialogQuit, completeAllRoom, setTestScore]);

  // Component mount: Initializes activity tracking
  useEffect(() => {
    const initializeActivity = async () => {
      await startActivity({
        type: 'studying',
        location: 'Game',
        metadata: {
          initialLoad: true,
          timestamp: new Date().toISOString()
        }
      });
    };
    initializeActivity();
  }, [startActivity]);

  // Opens flashcard dialog when a room is selected
  useEffect(() => {
    if (flashcardRoomId !== "") {
      setIsFlashcardsOpen(true);
    }
  }, [flashcardRoomId, setIsFlashcardsOpen]);

  /* ---- Event Handlers ----- */
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
    setIsAfterTestDialogOpen(false);
    setLargeDialogQuit(false);

    if (flashcardsDialogRef.current) {
      flashcardsDialogRef.current.setWrongCards([]);
      flashcardsDialogRef.current.setCorrectCount(0);
    }
    if (afterTestFeedRef.current) {
      afterTestFeedRef.current.setWrongCards([]);
    }
  };

  const handleGameStart = async (userTestId: string) => {
    audio.playSound('flashcard-startup');// Play startup sound
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
    setTotalMCQQuestions(prev => prev + 1);
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

  const handleCompleteAllRoom = () => {
    setCompleteAllRoom(true);
  };

  const handleTabChange = (tab: string) => {
    // Handle tab changes if needed
  };

  const fetchActivities = async () => {
    // Fetch activities if needed
  };

  /* ---- Render Methods ----- */
  const isClinicUnlocked = userInfo?.unlocks && 
    (typeof userInfo.unlocks === 'string' ? 
      JSON.parse(userInfo.unlocks) : 
      userInfo.unlocks
    )?.includes('game');

  // Show loading state during initial load
  if (isLoading && !isClinicUnlocked) {
    return <LoadingClinic />;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-[4rem] flex bg-transparent text-white p-4">
      <Toaster position="top-center" />
      {showWelcomeDialogue && <WelcomeDialog isOpen={showWelcomeDialogue} onUnlocked={() => setShowWelcomeDialogue(false)} />}
      <Suspense fallback={<LoadingClinic />}>
        <div className="flex w-full h-full bg-opacity-50 bg-black border-4 rounded-lg overflow-hidden">
          <div className="w-1/4 p-4 bg-gray-600">
            <ResourcesMenu 
              userRooms={userRooms} 
              totalCoins={userInfo?.score || 0} 
              reportData={null}
              totalPatients={totalPatients}
              patientsPerDay={patientsPerDay}
            />
          </div>
          <div className="w-3/4 relative rounded-r-lg">
            <OfficeContainer 
              ref={officeContainerRef}
              setFlashcardRoomId={handleSetFlashcardRoomId} 
              setIsFlashcardsOpen={setIsFlashcardsOpen}
              onNewGame={handleSetPopulateRooms}
              visibleImages={visibleImages}
              userRooms={userRooms}
              imageGroups={[]}
              updateVisibleImages={updateVisibleImages}
              activeRooms={activeRooms}
              setActiveRooms={handleSetActiveRooms}
              isFlashcardsOpen={isFlashcardsOpen}
            />
            {isAfterTestDialogOpen && 
              <AfterTestFeed 
                ref={afterTestFeedRef}
                open={isAfterTestDialogOpen} 
                onOpenChange={setIsAfterTestDialogOpen}
                userResponses={userResponses}
                correctCount={correctCount}
                wrongCount={wrongCount}
                largeDialogQuit={largeDialogQuit}
                setLargeDialogQuit={setLargeDialogQuit}
                isSubscribed={isSubscribed}
              />
            }
            <div className="absolute bottom-4 right-4">
              <FloatingButton 
                onTabChange={handleTabChange}
                currentPage="ankiclinic"
                initialTab="ankiclinic"
              />
            </div>
            <TutorialVidDialog 
              isOpen={isTutorialOpen} 
              onClose={() => setIsTutorialOpen(false)} 
              videoUrl="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/TutorialAnkiClinic.mp4"
            />
            <RedeemReferralModal isOpen={showReferralModal} onClose={() => setShowReferralModal(false)} />
            {isMarketplaceOpen && 
              <ShoppingDialog 
                isOpen={isMarketplaceOpen} 
                onOpenChange={() => setIsMarketplaceOpen(false)}
                imageGroups={[]}
                visibleImages={visibleImages}
                toggleGroup={() => {}}
                userScore={userInfo?.score || 0}
              />
            }
            {isFlashcardsOpen && 
              <FlashcardsDialog 
                ref={flashcardsDialogRef}
                isOpen={isFlashcardsOpen} 
                onOpenChange={setIsFlashcardsOpen} 
                roomId={flashcardRoomId}
                buttonContent={<div />}
                activeRooms={activeRooms}
                setActiveRooms={handleSetActiveRooms}
                currentUserTestId={currentUserTestId}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                handleCompleteAllRoom={handleCompleteAllRoom}
                onMCQAnswer={handleMCQAnswer}
                setTotalMCQQuestions={setTotalMCQQuestions}
              />
            }
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default React.memo(DoctorsOfficePage);
