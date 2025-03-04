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
import type { UserResponse } from "@prisma/client";
import type { FetchedActivity } from "@/types";
import { GridImage } from './types';
import type { UserResponseWithCategory } from "@/types";
import { shouldShowRedeemReferralModal } from '@/lib/referral';
import { getAccentColor, getWelcomeMessage, getSuccessMessage } from './utils';
import { useGame } from "@/store/selectors";

// Dynamically import components that use window/document
const ResourcesMenu = dynamic(() => import('./ResourcesMenu'), {
  ssr: false
});

const WelcomeDialog = dynamic(() => import('./WelcomeDialog'), {
  ssr: false
});

const OfficeContainer = dynamic(() => import('./OfficeContainer'), {
  ssr: false
});

const ShoppingDialog = dynamic(() => import('./ShoppingDialog'), {
  ssr: false
});

const FlashcardsDialog = dynamic(() => import('./FlashcardsDialog'), {
  ssr: false
});

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
  
  // Add mount counter ref
  const mountCountRef = useRef(0);
  const prevDepsRef = useRef<{
    pathname?: string,
    userInfoId?: boolean,
    reportDataId?: boolean,
    activeRoomsSize?: number,
    isLoading?: boolean
  }>({});
  
  // Add a ref to track if data fetch is in progress
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
  
  // Track mount count and log navigation - combined into one effect
  useEffect(() => {
    mountCountRef.current += 1;
    isMountedRef.current = true;
    
    // Only run client-side code
    if (typeof window !== 'undefined') {
      // Combine all mount-related logging
      console.log(`[Navigation] AnkiClinic component mounted at ${new Date().toISOString()}`);
      console.log(`[Debug] AnkiClinic mount #${mountCountRef.current} at path: ${pathname}`);
      
      // Check for React Strict Mode (which causes double renders)
      if (mountCountRef.current === 2) {
        console.log('[Debug] Detected possible React Strict Mode (double render)');
      }
    }
    
    return () => {
      isMountedRef.current = false;
      if (typeof window !== 'undefined') {
        console.log(`[Debug] AnkiClinic unmount #${mountCountRef.current} at path: ${pathname}`);
      }
      
      // Cleanup any in-progress operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pathname]);

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
  // Add debug state to track audio lifecycle
  const [debugId] = useState(() => Math.random().toString(36).substr(2, 9));
  // Add a ref to track mounted state
  const audioTransitionInProgressRef = useRef(false);
  // Add a ref to track loading state updates
  const loadingStateUpdatedRef = useRef(false);
  // Add a ref to track debounced dependency checks
  const debouncedDepsCheckRef = useRef<NodeJS.Timeout | null>(null);
  const [reportData, setReportData] = useState<DoctorOfficeStats | null>(null);
  // Add a ref to track the last time isFlashcardsOpen was changed
  const lastFlashcardToggleTimeRef = useRef(0);
  // Add a ref to track the previous isFlashcardsOpen value
  const prevIsFlashcardsOpenRef = useRef(isFlashcardsOpen);

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
  
  // Optimized dependency tracking effect with debounce
  useEffect(() => {
    if (!isMountedRef.current || stateUpdateInProgressRef.current) return;
    
    // Debounce the dependency check to prevent rapid updates
    if (debouncedDepsCheckRef.current) {
      clearTimeout(debouncedDepsCheckRef.current);
    }
    
    debouncedDepsCheckRef.current = setTimeout(() => {
      const pathname = window.location.pathname;
      const currentDeps = {
        pathname,
        userInfoAvailable: !!userInfo,
        reportDataAvailable: !!reportData,
        activeRoomsSize: activeRooms.size,
        isLoading
      };
      
      // Check for changes in dependencies
      const prevDeps = prevDepsRef.current;
      const changes = [];
      
      if (prevDeps.pathname !== currentDeps.pathname) {
        changes.push(`pathname: ${prevDeps.pathname} -> ${currentDeps.pathname}`);
      }
      
      if (prevDeps.userInfoId !== currentDeps.userInfoAvailable) {
        changes.push(`userInfo: ${prevDeps.userInfoId ? 'present' : 'absent'} -> ${currentDeps.userInfoAvailable ? 'present' : 'absent'}`);
      }
      
      if (prevDeps.reportDataId !== currentDeps.reportDataAvailable) {
        changes.push(`reportData: ${prevDeps.reportDataId ? 'present' : 'absent'} -> ${currentDeps.reportDataAvailable ? 'present' : 'absent'}`);
      }
      
      if (prevDeps.activeRoomsSize !== currentDeps.activeRoomsSize) {
        changes.push(`activeRooms size: ${prevDeps.activeRoomsSize} -> ${currentDeps.activeRoomsSize}`);
      }
      
      if (prevDeps.isLoading !== currentDeps.isLoading) {
        changes.push(`isLoading: ${prevDeps.isLoading} -> ${currentDeps.isLoading}`);
      }
      
      if (changes.length > 0) {
        console.log(`[Debug] Dependencies changed on mount #${mountCountRef.current}:`, changes.join(', '));
      }
      
      // Update previous dependencies
      prevDepsRef.current = {
        pathname: currentDeps.pathname,
        userInfoId: currentDeps.userInfoAvailable,
        reportDataId: currentDeps.reportDataAvailable,
        activeRoomsSize: currentDeps.activeRoomsSize,
        isLoading: currentDeps.isLoading
      };
      
      debouncedDepsCheckRef.current = null;
    }, 100);
    
    return () => {
      if (debouncedDepsCheckRef.current) {
        clearTimeout(debouncedDepsCheckRef.current);
        debouncedDepsCheckRef.current = null;
      }
    };
  }, [userInfo, reportData, activeRooms, isLoading]);

  // Handles test completion, scoring, and updates database - with optimization
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

  // Manages music autoplay when component mounts/unmounts - with optimization
  useEffect(() => {
    // Set autoplay on mount
    setIsAutoPlay(true);
    
    // Cleanup on unmount
    return () => {
      setIsAutoPlay(false);
    };
  }, [setIsAutoPlay]);

  // Component mount: Initial data fetch and daily calculations setup
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    
    const initializeData = async () => {
      // Skip if already initialized and data is present
      if (isInitializedRef.current && reportData) {
        console.log('[AnkiClinic] Already initialized with data, skipping');
        return;
      }
      
      isInitializedRef.current = true;
      console.log(`[Debug] Initiating initial data fetch on mount #${mountCountRef.current}`);
      
      const attemptFetch = async () => {
        try {
          await fetchData();
          
          // Only proceed with calculations if still mounted
          if (mounted && !hasCalculatedRef.current && userInfo) {
            performDailyCalculations();
            hasCalculatedRef.current = true;
          }
        } catch (error) {
          console.error('[AnkiClinic] Error during initialization:', error);
          
          // Retry logic
          if (mounted && retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`[AnkiClinic] Retrying fetch attempt ${retryCount} of ${MAX_RETRIES}`);
            setTimeout(attemptFetch, RETRY_DELAY);
          } else if (mounted) {
            toast.error("Failed to initialize clinic data. Please refresh the page.");
          }
        }
      };

      await attemptFetch();
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
        console.log(`[Debug] Final unmount - aborting requests on unmount #${mountCountRef.current}`);
        abortControllerRef.current.abort();
      }
    };
  }, [userInfo, reportData]); // Add reportData as dependency to prevent unnecessary fetches

  // Component mount: fetches user activities - run only once
  useEffect(() => {
    const activityFetchTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        fetchActivities();
      }
    }, 500); // Delay activity fetch to prioritize main content
    
    return () => clearTimeout(activityFetchTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Component mount: Initializes activity tracking - run only once
  useEffect(() => {
    const activityTrackingTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        const initializeActivity = async () => {
          await startActivity({
            type: 'studying',
            location: 'Game',
            metadata: {
              initialLoad: true,
              timestamp: new Date().toISOString()
            }
          });
        }
        initializeActivity();
      }
    }, 1000); // Delay activity tracking to prioritize main content
    
    return () => clearTimeout(activityTrackingTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a debug effect to track isLoading changes
  useEffect(() => {
    console.log(`[DoctorsOfficePage] isLoading changed to ${isLoading}`);
  }, [isLoading]);

  // Modify the existing useEffect for ambient sound and flashcard door sounds
  useEffect(() => {
    // Skip if the value hasn't actually changed
    if (prevIsFlashcardsOpenRef.current === isFlashcardsOpen) {
      console.log(`[DoctorsOfficePage] isFlashcardsOpen didn't actually change (still ${isFlashcardsOpen}), skipping effect`);
      return;
    }
    
    // Update the ref
    prevIsFlashcardsOpenRef.current = isFlashcardsOpen;
    
    if (isFlashcardsOpen) {
      console.log(`================= FLASHCARD DIALOG STATE CHANGED TO OPEN (isLoading=${isLoading}) =================`);
    } else {
      console.log(`================= FLASHCARD DIALOG STATE CHANGED TO CLOSED (isLoading=${isLoading}) =================`);
    }
    
    console.log(`[DoctorsOfficePage] isFlashcardsOpen changed to ${isFlashcardsOpen}`);
    
    if (!isMountedRef.current) {
      console.log(`[DoctorsOfficePage] Component not mounted yet, skipping audio transition`);
      return;
    }
    
    let isEffectActive = true; // Local flag to track if effect is still active
    
    // Add a small delay to allow any loading state changes to settle
    const timeoutId = setTimeout(() => {
      // Skip audio transitions during initial load
      if (isLoading) {
        console.log(`[DoctorsOfficePage] Still loading after delay, skipping audio transition`);
        return;
      }
      
      // Prevent multiple audio transitions
      if (audioTransitionInProgressRef.current) {
        console.log(`[DoctorsOfficePage] Audio transition already in progress, skipping`);
        return;
      }
      
      console.log(`[DoctorsOfficePage] Setting audioTransitionInProgressRef to true`);
      audioTransitionInProgressRef.current = true;
  
      const handleAudioTransition = async () => {
        console.log(`[DoctorsOfficePage] handleAudioTransition called, isFlashcardsOpen=${isFlashcardsOpen}`);
        try {
          if (!isEffectActive) return;

          if (isFlashcardsOpen) {
            console.log("================= PLAYING DOOR OPEN SOUND =================");
            console.log(`[DoctorsOfficePage] Playing flashcard-door-open sound`);
            await audio.stopAllLoops();
            if (!isEffectActive) return;
            audio.playSound('flashcard-door-open');
          } else {
            console.log("================= PLAYING DOOR CLOSE SOUND =================");
            console.log(`[DoctorsOfficePage] Playing flashcard-door-closed sound`);
            if (prevFlashcardsOpenRef.current) {
              audio.playSound('flashcard-door-closed');
              await new Promise(resolve => setTimeout(resolve, 500));
              if (!isEffectActive) return;
              await audio.loopSound('flashcard-loop-catfootsteps');
            } else {
              await audio.loopSound('flashcard-loop-catfootsteps');
            }
          }
          if (!isEffectActive) return;
          prevFlashcardsOpenRef.current = isFlashcardsOpen;
        } catch (error) {
          if (isEffectActive) {
            console.error('[DoctorsOfficePage] Audio transition error:', error);
          }
        } finally {
          if (isEffectActive) {
            console.log("================= AUDIO TRANSITION COMPLETED =================");
            audioTransitionInProgressRef.current = false;
          }
        }
        isEffectActive = false;
      };

      handleAudioTransition();
    }, 50); // Small delay to allow loading state to settle

    return () => {
      clearTimeout(timeoutId);
      isEffectActive = false;
    };
  }, [isFlashcardsOpen, audio, isLoading]); // Added isLoading dependency

  // Opens flashcard dialog when a room is selected - optimize with additional check
  useEffect(() => {
    // Skip during initial load or if already transitioning
    if (isLoading || stateUpdateInProgressRef.current) return;
    
    // Skip if we're in the process of closing the dialog
    if (isClosingDialogRef.current) {
      console.log(`[DoctorsOfficePage] Skipping auto-open effect while dialog is closing`);
      return;
    }
    
    if (flashcardRoomId !== "" && !isFlashcardsOpen) {
      console.log(`[DoctorsOfficePage] Auto-opening flashcard dialog for roomId=${flashcardRoomId}`);
      stateUpdateInProgressRef.current = true;
      setIsFlashcardsOpen(true);
      // Reset the flag after a short delay
      setTimeout(() => {
        stateUpdateInProgressRef.current = false;
      }, 50);
    }
  }, [flashcardRoomId, isFlashcardsOpen, isLoading, setIsFlashcardsOpen]);

  // Shows welcome/referral modals based on user state - run only when userInfo changes
  useEffect(() => {
    // Skip during initial load or if already transitioning
    if (!isMountedRef.current || stateUpdateInProgressRef.current) return;
    
    // Use a timeout to batch these state updates
    const modalTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        stateUpdateInProgressRef.current = true;
        
        // Batch state updates
        const updates = () => {
          setShowReferralModal(shouldShowRedeemReferralModal());
          if(userInfo && !isClinicUnlocked) {
            setShowWelcomeDialogue(true);
          }
        };
        
        updates();
        
        // Reset the flag after updates
        setTimeout(() => {
          stateUpdateInProgressRef.current = false;
        }, 50);
      }
    }, 500);
    
    return () => clearTimeout(modalTimeout);
  }, [userInfo, isClinicUnlocked]);

  // Add a new effect to preserve debug mode - run only once
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Check if we need to preserve debug mode
    const isDebugMode = searchParams?.get('debug') === 'true';
    
    if (isDebugMode) {
      // Set a flag to indicate we're in debug mode
      document.body.classList.add('debug-mode');
    }
    
    return () => {
      if (isDebugMode) {
        document.body.classList.remove('debug-mode');
      }
    };
  }, [searchParams]);

  // Add logging effect for key state changes
  useEffect(() => {
    console.log('[AnkiClinic] State update:', {
      isLoading,
      hasReportData: !!reportData,
      hasUserInfo: !!userInfo,
      userRoomsLength: userRooms?.length,
      isFetching: isFetchingRef.current,
      mountCount: mountCountRef.current,
      isInitialized: isInitializedRef.current
    });
  }, [isLoading, reportData, userInfo, userRooms]);

  // Add a debug effect to track flashcardRoomId changes
  useEffect(() => {
    console.log(`[DoctorsOfficePage] flashcardRoomId changed to "${flashcardRoomId}"`);
  }, [flashcardRoomId]);
  
  // Add a debug effect to track activeRooms changes
  useEffect(() => {
    console.log(`[DoctorsOfficePage] activeRooms changed to:`, Array.from(activeRooms));
  }, [activeRooms]);

  /* ---------------------------------------- Event Handlers -------------------------------------- */

  const fetchData = async () => {
    // If already fetching, don't start another fetch
    if (isFetchingRef.current) {
      console.log(`[AnkiClinic] Skipping redundant data fetch - fetch already in progress`);
      return;
    }
    
    // Skip if we already have data and are not in loading state
    if (reportData && !isLoading) {
      console.log('[AnkiClinic] Data already loaded and not in loading state, skipping fetch');
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
        console.log('[AnkiClinic] Request aborted');
      } else {
        console.error('[AnkiClinic] Error in fetchData:', error);
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

  const handleSetIsFlashcardsOpen = useCallback((open: boolean) => {
    const now = Date.now();
    
    // Prevent rapid toggling
    if (now - lastFlashcardToggleTimeRef.current < 500) {
      console.log(`[DoctorsOfficePage] Ignoring rapid toggle of isFlashcardsOpen, last change was ${now - lastFlashcardToggleTimeRef.current}ms ago`);
      return;
    }
    
    // If we're in the process of closing and something tries to open it, ignore
    if (isClosingDialogRef.current && open) {
      console.log(`[DoctorsOfficePage] Ignoring attempt to open dialog while closing is in progress`);
      return;
    }
    
    // Update the last toggle time
    lastFlashcardToggleTimeRef.current = now;
    
    if (open) {
      console.log("================= OPENING FLASHCARD DIALOG =================");
    } else {
      console.log("================= CLOSING FLASHCARD DIALOG =================");
      // Set the closing flag
      isClosingDialogRef.current = true;
      
      // Ensure isLoading is false when closing the dialog to allow audio transition
      if (isLoading) {
        console.log("================= FIXING LOADING STATE FOR AUDIO =================");
        setIsLoading(false);
      }
    }
    
    console.log(`[DoctorsOfficePage] handleSetIsFlashcardsOpen called with open=${open}, current flashcardRoomId=${flashcardRoomId}, isLoading=${isLoading}`);
    setIsFlashcardsOpen(open);
    
    // If we're closing the dialog, update active rooms after a delay to ensure smooth transition
    if (!open) {
      console.log(`[DoctorsOfficePage] Dialog is closing, scheduling activeRooms update`);
      setTimeout(() => {
        // Only update active rooms if flashcardRoomId is not 'WaitingRoom0' and not empty
        if (flashcardRoomId && flashcardRoomId !== 'WaitingRoom0') {
          console.log(`[DoctorsOfficePage] Updating activeRooms to remove ${flashcardRoomId}`);
          const newActiveRooms = new Set(activeRooms);
          newActiveRooms.delete(flashcardRoomId);
          setActiveRooms(newActiveRooms);
        }
        
        // Reset flashcardRoomId after a delay to ensure smooth transition
        setTimeout(() => {
          console.log(`[DoctorsOfficePage] Resetting flashcardRoomId from ${flashcardRoomId} to empty`);
          setFlashcardRoomId('');
          
          // Reset the closing flag after all operations are complete
          setTimeout(() => {
            isClosingDialogRef.current = false;
            console.log(`[DoctorsOfficePage] Dialog closing process complete, reset closing flag`);
          }, 100);
        }, 300);
      }, 300);
    }
  }, [flashcardRoomId, activeRooms, setActiveRooms, setFlashcardRoomId, setIsFlashcardsOpen, isLoading, setIsLoading]);

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

  // Show loading state during initial load
  if (isLoading && !isClinicUnlocked) {
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
        <div className="flex w-full h-full max-w-full max-h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
          <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] animate-pulse" />
          <div className="w-3/4 bg-gray-900/50 animate-pulse rounded-r-lg" />
        </div>
      }>
        <div className="flex w-full h-full max-w-full max-h-full bg-opacity-50 bg-black border-4 border-[--theme-gradient-startstreak] rounded-lg overflow-hidden">
          <div className="w-1/4 p-4 bg-[--theme-gradient-startstreak] relative z-30">
            <ResourcesMenu
              reportData={reportData}
              userRooms={userRooms}
              totalCoins={userInfo?.score || 0}
              totalPatients={totalPatients}
              patientsPerDay={patientsPerDay}
            />
          </div>
          
          <div className="w-3/4 font-krungthep relative z-20 rounded-r-lg">
            <OfficeContainer
              ref={officeContainerRef}
              onNewGame={handleSetPopulateRooms}
              visibleImages={visibleImages}
              userRooms={userRooms}
              imageGroups={imageGroups}
              setFlashcardRoomId={handleSetFlashcardRoomId}
              updateVisibleImages={updateVisibleImages}
              activeRooms={activeRooms}
              setActiveRooms={handleSetActiveRooms}
              isFlashcardsOpen={isFlashcardsOpen}
              setIsFlashcardsOpen={handleSetIsFlashcardsOpen}
            />
            <div className="absolute top-4 left-4 flex gap-2 z-50">
              <NewGameButton
                userScore={userInfo?.score || 0}
                onGameStart={handleGameStart}
                isGameInProgress={isGameInProgress}
                resetGameState={resetLocalGameState}
              />
            </div>
            <div className="absolute top-4 right-4 z-50 flex items-center">
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
              <div className="flex items-center bg-opacity-75 bg-gray-800 rounded-lg p-2 mr-2">
                <PurchaseButton 
                  className="flex items-center hover:opacity-90 transition-opacity"
                  tooltipText="Click to purchase more coins"
                  userCoinCount={userInfo?.score}
                >
                  <div className="flex items-center">
                    <Image
                      src="/game-components/PixelCupcake.png"
                      alt="Studycoin"
                      width={32}
                      height={32}
                      className="mr-2"
                    />
                    <span className="text-[--theme-hover-color] font-bold">{userInfo?.score}</span>
                  </div>
                </PurchaseButton>
              </div>
              <div className="relative group">
                <button className={`flex items-center justify-center px-6 py-3 
                  ${(!userLevel || userLevel === "PATIENT LEVEL") 
                    ? "bg-green-500 animate-pulse" 
                    : "bg-[--theme-doctorsoffice-accent]"
                  }
                  border-[--theme-border-color] 
                  text-[--theme-text-color] 
                  hover:text-[--theme-hover-text] 
                  hover:bg-[--theme-hover-color] 
                  transition-colors text-3xl font-bold uppercase 
                  group-hover:text-[--theme-hover-text] 
                  group-hover:bg-[--theme-hover-color]`}>
                  <span>{userLevel || "PATIENT LEVEL"}</span>
                </button>
                <div className="absolute right-0 w-full shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out"> 
                  <div className="flex flex-col">
                    <a
                      href="#"
                      className="w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMarketplaceOpen(!isMarketplaceOpen);
                      }}
                    >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          Marketplace
                        </a>
                  </div>

                  <div className="flex flex-col">
                  {isMarketplaceOpen && (
                    <ShoppingDialog
                      ref={marketplaceDialogRef}
                      imageGroups={imageGroups}
                      visibleImages={visibleImages}
                      toggleGroup={toggleGroup}
                      userScore={userInfo?.score || 0}
                      isOpen={isMarketplaceOpen}
                      onOpenChange={setIsMarketplaceOpen}
                    />
                  )}

                  </div>
                  <div className="flex flex-col">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsFlashcardsTooltipOpen(!isFlashcardsTooltipOpen);
                    }}
                    onMouseLeave={() => setIsFlashcardsTooltipOpen(false)}
                    className="w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                    Flashcards
                  </button>
                  </div>

                  <div className="flex flex-col">
                    {isFlashcardsTooltipOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-[--theme-leaguecard-color] text-[--theme-text-color] text-sm rounded-lg p-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 border border-[--theme-border-color]">
                        <p className="mb-2">Coming soon!</p>
                      </div>
                    )}
                  </div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsTutorialOpen(true);
                    }}
                    className="w-full px-6 py-3 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Tutorial
                  </a>
                </div>
              </div>
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
        userResponses={userResponses}
        correctCount={correctCount}
        wrongCount={wrongCount}
        largeDialogQuit={largeDialogQuit}
        setLargeDialogQuit={setLargeDialogQuit}
        isSubscribed={isSubscribed}
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
        activeRooms={activeRooms}
        setActiveRooms={handleSetActiveRooms}
        currentUserTestId={currentUserTestId}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        handleCompleteAllRoom={handleCompleteAllRoom}
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
