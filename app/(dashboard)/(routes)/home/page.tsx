// app/(dashboard)/(routes)/home/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUser, useAudio, useNavigation } from "@/store/selectors";
import { useUserActivity } from '@/hooks/useUserActivity';
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { FEATURE_UNLOCK } from "@/components/navigation/HoverSidebar";
import type { FetchedActivity } from "@/types";
import { isToday } from "date-fns";
import Summary from "./Summary";
import SideBar from "./SideBar";
import AdaptiveTutoring from "./AdaptiveTutoring";
import TestingSuit from "./TestingSuit";
import ThemeSwitcher from "@/components/home/ThemeSwitcher";
import FlashcardDeck from "./FlashcardDeck";
import PracticeTests from "./PracticeTests";
import StreakPopup from "@/components/score/StreakDisplay";
import { checkProStatus, shouldUpdateKnowledgeProfiles, updateKnowledgeProfileTimestamp } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { shouldShowRedeemReferralModal } from '@/lib/referral';
import { useUIStore } from "@/store/slices/uiSlice";
import RedeemReferralModal from '@/components/social/friend-request/RedeemReferralModal';
import ChatContainer from "@/components/chatgpt/ChatContainer";
import HoverSidebar from "@/components/navigation/HoverSidebar";

// Import the extracted components from their new location
import { LoadingSpinner } from "@/components/home/LoadingSpinner";
import { ContentWrapper } from "@/components/home/ContentWrapper";
import LockedFeatureOverlay from "@/components/LockedFeatureOverlay";

/* ----------------------------------------- Types ------------------------------------------ */
type KalypsoState = "wait" | "talk" | "end" | "start";
type ChatbotContextType = { contentTitle: string; context: string } | null;

// Memoize components that don't need frequent updates
const MemoizedSummary = memo(Summary);
const MemoizedSideBar = memo(SideBar);
const MemoizedAdaptiveTutoring = memo(AdaptiveTutoring);

const HomePage: React.FC = () => {
  console.log('[HomePage] Component rendering');
  
  /* ---------------------------------------- Hooks ---------------------------------------- */
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userInfo, refreshUserInfo, isSubscribed } = useUser();
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(false);
  const { startActivity, endActivity, updateActivityEndTime } = useUserActivity();
  const { playMusic, stopMusic, volume, setVolume, isPlaying } = useAudio();
  const { activePage, navigateHomeTab, updateSubSection } = useNavigation();
  const { isFeatureUnlocked } = useFeatureUnlock();
  const paymentStatus = searchParams?.get("payment");
  
  // Track renders in development only
  useEffect(() => {
    console.log('[HomePage] Render', { 
      isLoadingUserInfo, 
      loadingState: loadingState ? loadingState.isLoading : 'not initialized', 
      userInfoExists: !!userInfo
    });
  });
  
  /* ----------------------------------------- Refs ---------------------------------------- */
  const kalypsoRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatbotRef = useRef<{ sendMessage: (message: string, context?: string) => void }>({
    sendMessage: () => {},
  });
  const initializationRef = useRef(false);
  const navigationInitializedRef = useRef(false);
  const currentTrackedTabRef = useRef<string | null>(null);
  const safetyTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  /* ---------------------------------------- State ---------------------------------------- */
  // Split large state object into smaller, focused states
  const [activities, setActivities] = useState<FetchedActivity[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentStudyActivityId, setCurrentStudyActivityId] = useState<string | null>(null);
  const [chatbotContext, setChatbotContext] = useState<ChatbotContextType>(null);
  
  // UI state group
  const [uiState, setUIState] = useState({
    kalypsoState: "start" as KalypsoState,
    showScorePopup: false,
    showStreakPopup: false,
    showReferralModal: false
  });
  
  // User data group
  const [userData, setUserData] = useState({
    isPro: false,
    testScore: 0,
    userStreak: 0
  });

  // Replace multiple loading flags with a more flexible approach
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    isUpdatingProfile: false,
    isGeneratingActivities: false,
    isLoadingTimeout: false
  });

  // Set up global safety timer immediately
  useEffect(() => {
    console.log('[HomePage] Setting up safety timer');
    
    // Clear any existing timer
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
    }
    
    // Set a global safety timer to exit loading state
    safetyTimerRef.current = setTimeout(() => {
      console.log('[HomePage] Safety timer triggered', { loadingState });
      
      if (loadingState.isLoading) {
        console.log('[HomePage] FORCING EXIT from loading state via safety timer');
        setLoadingState(prev => ({ ...prev, isLoading: false }));
      }
    }, 5000); // Force exit loading after 5 seconds
    
    return () => {
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
    };
  }, []);

  // Add this after the loading state declaration
  const isPageLoading = useMemo(() => 
    loadingState.isUpdatingProfile || loadingState.isGeneratingActivities || loadingState.isLoadingTimeout,
    [loadingState.isUpdatingProfile, loadingState.isGeneratingActivities, loadingState.isLoadingTimeout]
  );

  // Update functions for new state structure
  const updateLoadingState = useCallback((newState: Partial<typeof loadingState>) => {
    console.log('[HomePage] updateLoadingState called with', newState, 'current state:', loadingState);
    
    setLoadingState(prev => {
      // Only update if values actually changed
      const hasChanges = Object.entries(newState).some(
        ([key, value]) => prev[key as keyof typeof prev] !== value
      );
      
      const newLoadingState = hasChanges ? { ...prev, ...newState } : prev;
      console.log('[HomePage] Loading state updated to:', newLoadingState);
      return newLoadingState;
    });
  }, [loadingState]);

  const updateUIState = useCallback((updates: Partial<typeof uiState>) => {
    setUIState(prev => {
      // Only update if values actually changed
      const hasChanges = Object.entries(updates).some(
        ([key, value]) => prev[key as keyof typeof prev] !== value
      );
      
      return hasChanges ? { ...prev, ...updates } : prev;
    });
  }, []);

  const updateUserData = useCallback((updates: Partial<typeof userData>) => {
    setUserData(prev => {
      // Only update if values actually changed
      const hasChanges = Object.entries(updates).some(
        ([key, value]) => prev[key as keyof typeof prev] !== value
      );
      
      return hasChanges ? { ...prev, ...updates } : prev;
    });
  }, []);
  
  // Log when component is fully loaded (dev only)
  useEffect(() => {
    console.log('[HomePage] Loading state check:', { isLoadingUserInfo, loadingState });
    
    if (!isLoadingUserInfo && !loadingState.isLoading) {
      console.log('[HomePage] Fully loaded and ready to display content');
    }
  }, [isLoadingUserInfo, loadingState.isLoading]);
  
  // Debug mode check
  const isDebugMode = searchParams?.get('debug') === 'true';

  // Get the default tab from query parameters or use KalypsoAI as default
  const defaultTab = useMemo(() => {
    const tabParam = searchParams?.get("tab");
    return tabParam || "KalypsoAI";
  }, [searchParams]);

  /* ---- Memoized Values ---- */
  const shouldInitialize = useMemo(() => {
    const shouldInit = !isInitialized && userInfo && !isLoadingUserInfo;
    console.log('[HomePage] shouldInitialize check:', { shouldInit, isInitialized, hasUserInfo: !!userInfo, isLoadingUserInfo });
    return shouldInit;
  }, [isInitialized, userInfo, isLoadingUserInfo]);

  // Prefetch data as soon as possible - prioritize critical data
  useEffect(() => {
    console.log('[HomePage] Prefetch effect triggered', { 
      initializationRef: initializationRef.current,  
      hasUserInfo: !!userInfo, 
      isLoadingUserInfo 
    });
    
    if (initializationRef.current || !userInfo || isLoadingUserInfo) return;
    
    const initializeData = async () => {
      console.log('[HomePage] Starting initializeData');
      
      try {
        // Prioritize API calls - run them in parallel
        const [activitiesPromise, proStatusPromise] = [
          fetch("/api/calendar-activity").then(res => res.json()),
          checkProStatus()
        ];
        
        // Start navigation setup while data is loading
        if (!navigationInitializedRef.current && defaultTab) {
          navigateHomeTab(defaultTab);
          navigationInitializedRef.current = true;
        }
        
        // Wait for data to load
        const [fetchedActivities, proStatus] = await Promise.all([
          activitiesPromise,
          proStatusPromise
        ]);
        
        console.log('[HomePage] Data loaded successfully', { 
          activitiesCount: fetchedActivities?.length, 
          proStatus 
        });
        
        // Update state with all fetched data to prevent cascading renders
        setActivities(fetchedActivities);
        setIsInitialized(true);
        updateUserData({ isPro: proStatus });
        updateUIState({ showReferralModal: shouldShowRedeemReferralModal() });
        
        console.log('[HomePage] Setting loading state to false');
        setLoadingState(prev => ({ ...prev, isLoading: false }));
        console.log('[HomePage] Loading state should now be false');
        
        initializationRef.current = true;
      } catch (error) {
        console.error('[HOME_PAGE] Error during data prefetching:', error);
        toast.error("Failed to load some data. Please refresh if you experience issues.");
        
        // Ensure we still mark loading as complete
        console.log('[HomePage] Setting loading to false after error');
        setLoadingState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    initializeData();
  }, [userInfo, isLoadingUserInfo, defaultTab, navigateHomeTab, updateUserData, updateUIState]);

  // Skip useEffect for the original initializePage since we now use the prefetch approach
  const initializePage = useCallback(async () => {
    // This is kept for compatibility but doesn't need to do anything anymore
    if (initializationRef.current) return;
  }, []);

  // Update the navigation initialization effect to respect user navigation
  useEffect(() => {
    // Only initialize the navigation once, not after user has clicked on sidebar items
    if (!navigationInitializedRef.current && defaultTab) {
      navigateHomeTab(defaultTab);
      navigationInitializedRef.current = true;
    }
  }, [defaultTab, navigateHomeTab]);

  /* ---- Callbacks & Event Handlers ---- */
  // Memoize chatbot context update
  const updateChatbotContext = useCallback((context: ChatbotContextType) => {
    setChatbotContext(context);
  }, []);

  const updateCalendarChatContext = useCallback((currentActivities: FetchedActivity[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Create array of next 7 days
    const nextWeekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    // Helper function to format activities for a specific date
    const formatActivitiesForDate = (activities: FetchedActivity[]) => {
      return activities
        .map(
          (a) =>
            `${a.activityTitle} (${a.activityType}, ${a.hours}h, ${a.status})`
        )
        .join(", ");
    };

    // Get activities for yesterday and each day of the week
    const yesterdayActivities = currentActivities.filter(
      (activity) =>
        new Date(activity.scheduledDate).toDateString() ===
        yesterday.toDateString()
    );

    // Create context string with detailed information
    const context = `
      Here's my personal MCAT study calendar:

      Yesterday (${yesterday.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}):
      ${formatActivitiesForDate(yesterdayActivities) || "No activities scheduled"}

      ${nextWeekDays
        .map((date) => {
          const dayActivities = currentActivities.filter(
            (activity) =>
              new Date(activity.scheduledDate).toDateString() ===
              date.toDateString()
          );

          const dayLabel =
            date.toDateString() === today.toDateString()
              ? "Today"
              : date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                });

          return `${dayLabel}:
          ${formatActivitiesForDate(dayActivities) || "No activities scheduled"}`;
        })
        .join("\n\n")}
    `;

    if (chatbotRef.current) {
      chatbotRef.current.sendMessage("", context);
    }
  }, []);

  // Fetch activities (used for refreshing data)
  const fetchActivities = useCallback(async () => {
    if (loadingState.isLoading) return;

    try {
      const activities = await fetch("/api/calendar-activity").then(res => res.json());
      setActivities(activities);
    } catch (error) {
      console.error('[HOME_PAGE] Error fetching activities:', error);
    }
  }, [loadingState.isLoading]);

  // Handle activity tracking for user engagement
  const handleActivityChange = useCallback(async (type: string, location: string) => {
    if (currentStudyActivityId) {
      try {
        await endActivity(currentStudyActivityId);
      } catch (error) {
        console.error('Error ending previous activity:', error);
      }
    }

    try {
      const activity = await startActivity({
        type,
        location,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });

      if (activity) {
        setCurrentStudyActivityId(activity.id);
      }
    } catch (error) {
      console.error('Error starting new activity:', error);
    }
  }, [endActivity, startActivity, currentStudyActivityId]);

  // Tab change handler - now only handles special cases (backward compatibility)
  const handleTabChange = useCallback(async (newTab: string) => {
    // Handle special navigation cases
    if (newTab === 'AnkiClinic') {
      try {
        // Clean up current activity first
        if (currentStudyActivityId) {
          await endActivity(currentStudyActivityId);
        }
        await router.push('/ankiclinic');
        return; // Important: return immediately after navigation
      } catch (error) {
        console.error('Navigation error:', error);
        toast.error('Failed to navigate to Anki Clinic');
      }
      return; // Return in case of error too
    }

    // Handle tab with view parameter
    const [tab, params] = newTab.split('?');
    const searchParams = new URLSearchParams(params);
    const view = searchParams.get('view');

    // Use global navigation
    navigateHomeTab(tab);

    if (tab === "Summary" && view) {
      // Add context for the view
      updateSubSection({ currentView: view });
      router.push(`/home?tab=Summary&view=${view}`);
    }
    
    // REMOVED: Activity tracking is now handled by the effect triggered by activePage changes
  }, [router, navigateHomeTab, updateSubSection, currentStudyActivityId, endActivity]);

  // Add an effect for activity tracking that responds to global state changes
  useEffect(() => {
    // Skip during initial render/loading
    if (isLoadingUserInfo || !isInitialized) return;
    
    // Don't create a new activity if we're on the special cases
    if (activePage === 'ankiclinic') return;
    
    // Skip if we're already tracking this tab
    if (currentTrackedTabRef.current === activePage) {
      return;
    }
    
    // Handle activity tracking based on tab
    const activityType = activePage === "AdaptiveTutoringSuite" ? 'tutoring' : 'studying';
    
    // Async function to update activity
    const updateActivity = async () => {
      try {
        await handleActivityChange(activityType, activePage);
        // Update ref to current tracked tab
        currentTrackedTabRef.current = activePage;
      } catch (error) {
        console.error(`[HomePage] Error updating activity for ${activePage}:`, error);
      }
    };
    
    updateActivity();
    
  }, [activePage, handleActivityChange, isLoadingUserInfo, isInitialized]);

  // When activity changes, update the tracked tab ref
  useEffect(() => {
    if (currentStudyActivityId) {
      currentTrackedTabRef.current = activePage;
    } else {
      currentTrackedTabRef.current = null;
    }
  }, [currentStudyActivityId, activePage]);

  const switchKalypsoState = useCallback((newState: KalypsoState) => {
    updateUIState({ kalypsoState: newState });
    if (kalypsoRef.current) {
      kalypsoRef.current.src = `/kalypso${newState}.gif`;
    }
  }, [updateUIState]);

  const toggleChatBot = useCallback(() => {
    // Use global navigation instead of local state
    navigateHomeTab("KalypsoAI");
  }, [navigateHomeTab]);

  /* ---------------------------------------- Memoized Values ---------------------------------------- */
  const pageTitle = useMemo(() => {
    switch (activePage) {
      case "Summary": return "Statistics";
      case "Tests": return "Testing Suite";
      case "AdaptiveTutoringSuite": return "Adaptive Tutoring Suite";
      case "flashcards": return "Flashcards";
      case "CARS": return "Daily CARs Practice";
      case "KalypsoAI": return "Kalypso";
      default: return "Home";
    }
  }, [activePage]);

  /* ---------------------------------------- Effects ---------------------------------------- */
  // Track component lifecycle - simplified
  useEffect(() => {
    console.log('[HomePage] Component lifecycle effect');
    
    // Reset the safety timer to ensure it runs from component mount
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
    }
    
    safetyTimerRef.current = setTimeout(() => {
      console.log('[HomePage] Lifecycle safety timer triggered');
      if (loadingState.isLoading) {
        console.log('[HomePage] FORCING EXIT from loading state via lifecycle safety timer');
        setLoadingState(prev => ({ ...prev, isLoading: false }));
      }
    }, 3000); // 3 second safety timeout
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
    };
  }, []);

  // Combine initialization effects
  useEffect(() => {
    if (shouldInitialize) {
      initializePage();
    }
  }, [shouldInitialize, initializePage]);

  useEffect(() => {
    updateCalendarChatContext(activities);
  }, [activities, updateCalendarChatContext]);

  useEffect(() => {
    const handleScroll = () => {
      const remToPixels = (rem: number) =>
        rem * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const scrollToPosition = remToPixels(7.125);

      window.scrollTo({
        top: scrollToPosition,
        behavior: "smooth",
      });
    };

    // Wait for content to load
    const timer = setTimeout(() => {
      handleScroll();
    }, 100); // Small delay to ensure content is rendered

    return () => clearTimeout(timer);
  }, []); // No dependencies needed as the effect only runs once

  useEffect(() => {
    switchKalypsoState("start"); // Start with talking animation to encourage engagement
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [switchKalypsoState]);

  // Payment status effect
  useEffect(() => {
    if (!paymentStatus) return;

    if (paymentStatus === "success") {
      toast.success("Payment Successful! Your coins have been added to your account.");
    } else if (paymentStatus === "cancelled") {
      toast.error("Payment Cancelled. Your payment was cancelled.");
    }
  }, [paymentStatus]);

  // Activity tracking effects
  useEffect(() => {
    const initializeActivity = async () => {
      if (pathname?.startsWith('/home') && !currentStudyActivityId && !isLoadingUserInfo) {
        const activity = await startActivity({
          type: 'studying',
          location: activePage,
          metadata: {
            initialLoad: true,
            timestamp: new Date().toISOString()
          }
        });

        if (activity) {
          setCurrentStudyActivityId(activity.id);
        }
      }
    };

    initializeActivity();
  }, [isLoadingUserInfo, pathname, activePage, startActivity, currentStudyActivityId]);

  useEffect(() => {
    if (!currentStudyActivityId) return;

    const intervalId = setInterval(() => {
      updateActivityEndTime(currentStudyActivityId);
    }, 300000);

    return () => clearInterval(intervalId);
  }, [currentStudyActivityId, updateActivityEndTime]);

  useEffect(() => {
    updateUIState({ showReferralModal: shouldShowRedeemReferralModal() });
  }, [updateUIState]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any pending activities
      if (currentStudyActivityId) {
        endActivity(currentStudyActivityId);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
    };
  }, [endActivity, currentStudyActivityId]);



  // Add the missing navigation effect back without the console.log
  // Update URL parameter effect to respect user navigation 
  useEffect(() => {
    // Only set default page if we're on the home page without a tab parameter
    // AND navigation hasn't been initialized yet
    if (pathname === '/home' && !searchParams?.has('tab') && !navigationInitializedRef.current) {
      navigateHomeTab('KalypsoAI');
      navigationInitializedRef.current = true;
    }
  }, [pathname, searchParams, navigateHomeTab]);

  /* -------------------------------------- Rendering ------------------------------------- */
  const content = useMemo(() => {
    console.log('[HomePage] Rendering content with states:', { 
      isLoadingUserInfo, 
      loading: loadingState.isLoading, 
      showingContent: !isLoadingUserInfo && !loadingState.isLoading 
    });
    
    if (isLoadingUserInfo) {
      console.log('[HomePage] Showing user info loading spinner');
      return <LoadingSpinner message="Loading user info..." />;
    }

    if (loadingState.isLoading) {
      console.log('[HomePage] Showing page initialization loading spinner');
      return <LoadingSpinner message="Initializing page..." />;
    }
    
    console.log('[HomePage] Rendering main content');
    return (
      <>
        {/* Hover Sidebar - positioned outside ContentWrapper to be fixed */}
        <HoverSidebar
          activities={activities}
          onTasksUpdate={(tasks) => {
            setActivities(tasks as FetchedActivity[]);
          }}
          onTabChange={handleTabChange}
          currentPage={activePage}
          isSubscribed={isSubscribed}
        />
        
        <ContentWrapper>
          <div className="w-3/4 relative overflow-visible">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="text-white text-2xl ml-3 font-thin leading-normal shadow-text cursor-pointer bg-transparent border-none"
                  onClick={() => router.push("/home")}
                >
                  {pageTitle}
                </button>
                <ThemeSwitcher />
              </div>
            </div>
            <div className="relative overflow-visible">
              <div className="p-3 pb-6 gradientbg h-[calc(100vh-5.5rem)] rounded-lg mb-4">
                {/* Main content area - conditional rendering based on active page */}
                {(activePage === 'KalypsoAI' || !activePage) && (
                  <div className="h-full overflow-hidden relative">
                    <ChatContainer chatbotRef={chatbotRef} activities={activities} />
                    {!isFeatureUnlocked(FEATURE_UNLOCK.KALYPSO_AI) && (
                      <LockedFeatureOverlay featureId={FEATURE_UNLOCK.KALYPSO_AI} />
                    )}
                  </div>
                )}
                {activePage === 'Summary' && (
                  <div className="h-full overflow-hidden relative">
                    <MemoizedSummary 
                      handleSetTab={handleTabChange}
                      isActive={true}
                      chatbotRef={chatbotRef}
                      userInfo={userInfo}
                    />
                  </div>
                )}
                {activePage === 'AdaptiveTutoringSuite' && (
                  <div className="h-full overflow-hidden relative">
                    <MemoizedAdaptiveTutoring 
                      toggleChatBot={toggleChatBot}
                      setChatbotContext={updateChatbotContext}
                      chatbotRef={chatbotRef}
                      onActivityChange={handleActivityChange}
                    />
                    {!isFeatureUnlocked(FEATURE_UNLOCK.TUTORING) && (
                      <LockedFeatureOverlay featureId={FEATURE_UNLOCK.TUTORING} />
                    )}
                  </div>
                )}
                {activePage === 'CARS' && (
                  <div className="h-full overflow-hidden relative">
                    <TestingSuit />
                    {!isFeatureUnlocked(FEATURE_UNLOCK.CARS) && (
                      <LockedFeatureOverlay featureId={FEATURE_UNLOCK.CARS} />
                    )}
                  </div>
                )}
                {activePage === 'flashcards' && (
                  <div className="h-full overflow-hidden relative">
                    <FlashcardDeck />
                  </div>
                )}
                {activePage === 'Tests' && (
                  <div className="h-full overflow-hidden relative">
                    <PracticeTests 
                      handleSetTab={handleTabChange} 
                      chatbotRef={chatbotRef}
                      onActivitiesUpdate={fetchActivities}
                    />
                    {!isFeatureUnlocked(FEATURE_UNLOCK.TESTS) && (
                      <LockedFeatureOverlay featureId={FEATURE_UNLOCK.TESTS} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-1/4">
            <h2 className="text-white text-2xl font-thin leading-normal shadow-text">
              &nbsp;
            </h2>
            <div className="gradientbg p-3 pb-6 h-[calc(100vh-5.5rem)] rounded-lg knowledge-profile-component mb-4">
              <MemoizedSideBar 
                activities={activities}
                currentPage={activePage}
                chatbotContext={chatbotContext}
                chatbotRef={chatbotRef}
                handleSetTab={handleTabChange}
                onActivitiesUpdate={fetchActivities}
                isSubscribed={isSubscribed}
                showTasks={true}
              />
            </div>
          </div>

          {/* Modals and Popups */}
          {uiState.showReferralModal && (
            <RedeemReferralModal 
              isOpen={uiState.showReferralModal} 
              onClose={() => updateUIState({ showReferralModal: false })}
            />
          )}
          {uiState.showStreakPopup && (
            <StreakPopup 
              isOpen={uiState.showStreakPopup}
              onClose={() => updateUIState({ showStreakPopup: false })}
              streak={userData.userStreak}
            />
          )}
        </ContentWrapper>
      </>
    );
  }, [
    // Keep only the dependencies that actually affect rendering
    isLoadingUserInfo,
    loadingState.isLoading,
    activePage,
    activities,
    chatbotContext,
    chatbotRef,
    handleTabChange,
    isSubscribed,
    userInfo,
    router,
    // Add dependencies for new state structure
    uiState.showReferralModal,
    uiState.showStreakPopup,
    userData.userStreak,
    uiState.kalypsoState,
    updateUIState,
    fetchActivities,
    setActivities,
    isFeatureUnlocked
  ]);

  return content;
};

// Use memo to prevent unnecessary renders of the entire component
export default memo(HomePage);