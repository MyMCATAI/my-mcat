// app/(dashboard)/(routes)/home/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUserActivity } from '@/hooks/useUserActivity';
import { FetchedActivity } from "@/types";
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
import { useAudio } from "@/store/selectors";
import RedeemReferralModal from '@/components/social/friend-request/RedeemReferralModal';
import ChatContainer from "@/components/chatgpt/ChatContainer";
import HoverSidebar from "@/components/navigation/HoverSidebar";
import KalypsoGreeting from "@/components/home/KalypsoGreeting";

/* ----------------------------------------- Types ------------------------------------------ */
interface ContentWrapperProps {
  children: React.ReactNode;
}

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ message = "Loading..." }) => (
  <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-[9999]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-sky-500 mx-auto mb-4" />
      <p className="text-sky-300 text-xl">{message}</p>
    </div>
  </div>
));
LoadingSpinner.displayName = 'LoadingSpinner';

const ContentWrapper: React.FC<ContentWrapperProps> = memo(({ children }) => (
  <div className="w-full px-[2rem] lg:px-[2.7rem] xl:px-[7rem] overflow-visible">
    <div className="text-[--theme-text-color] flex gap-[1.5rem] overflow-visible">
      {children}
    </div>
  </div>
));
ContentWrapper.displayName = 'ContentWrapper';

// Memoize components that don't need frequent updates
const MemoizedSummary = memo(Summary);
const MemoizedSideBar = memo(SideBar);
const MemoizedAdaptiveTutoring = memo(AdaptiveTutoring);

const HomePage: React.FC = () => {
  /* ---------------------------------------- Hooks ---------------------------------------- */
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userInfo, isLoading: isLoadingUserInfo, isSubscribed } = useUserInfo();
  const { startActivity, endActivity, updateActivityEndTime } = useUserActivity();
  const { playMusic, stopMusic, volume, setVolume, isPlaying } = useAudio();
  const paymentStatus = searchParams?.get("payment");
  
  // Debug mode check
  const isDebugMode = searchParams?.get('debug') === 'true';

  // Get the default tab from query parameters or use KalypsoAI as default
  const defaultTab = useMemo(() => {
    const tabParam = searchParams?.get("tab");
    return tabParam || "KalypsoAI";
  }, [searchParams]);

  /* ---------------------------------------- State ---------------------------------------- */
  // Combine related states into a single object to reduce re-renders
  const [pageState, setPageState] = useState({
    activeTab: defaultTab, // Use the calculated default tab
    currentPage: defaultTab, // Match current page with active tab
    activities: [] as FetchedActivity[],
    isInitialized: false,
    currentStudyActivityId: null as string | null,
    chatbotContext: null as {contentTitle: string; context: string;} | null,
    kalypsoState: "start" as "wait" | "talk" | "end" | "start", 
    isPro: false,
    showScorePopup: false,
    testScore: 0,
    showStreakPopup: false,
    userStreak: 0,
    showReferralModal: false
  });

  // Combine loading states into a single object
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    isUpdatingProfile: false,
    isGeneratingActivities: false,
    isLoadingTimeout: false
  });

  /* ----------------------------------------- Refs ---------------------------------------- */
  const kalypsoRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatbotRef = useRef<{ sendMessage: (message: string, context?: string) => void }>({
    sendMessage: () => {},
  });
  const initializationRef = useRef(false);

  // Memoize state updates to prevent unnecessary re-renders
  const updatePageState = useCallback((updates: Partial<typeof pageState>) => {
    setPageState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateLoadingState = useCallback((newState: Partial<typeof loadingState>) => {
    setLoadingState(prev => ({ ...prev, ...newState }));
  }, []);

  /* ---- Memoized Values ---- */
  const shouldInitialize = useMemo(() => {
    return !pageState.isInitialized && userInfo && !isLoadingUserInfo;
  }, [pageState.isInitialized, userInfo, isLoadingUserInfo]);

  /* ---- Callbacks & Event Handlers ---- */
  // Memoize chatbot context update
  const updateChatbotContext = useCallback((context: {contentTitle: string; context: string;}) => {
    updatePageState({ chatbotContext: context });
  }, [updatePageState]);

  const initializePage = useCallback(async () => {
    if (!shouldInitialize) return;
    
    try {
      const [activities, proStatus] = await Promise.all([
        fetch("/api/calendar-activity").then(res => res.json()),
        checkProStatus()
      ]);

      // Batch all state updates
      updatePageState({
        activities,
        isPro: proStatus,
        isInitialized: true
      });

      updateLoadingState({
        isLoading: false
      });

    } catch (error) {
      console.error('[HOME_PAGE] Error during initialization:', error);
      toast.error("Failed to initialize page. Please refresh.");
      
      updateLoadingState({
        isLoading: false
      });
    }
  }, [shouldInitialize, updatePageState, updateLoadingState]);

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
      updatePageState({ activities });
    } catch (error) {
      console.error('[HOME_PAGE] Error fetching activities:', error);
    }
  }, [loadingState.isLoading, updatePageState]);

  // Handle activity tracking for user engagement
  const handleActivityChange = useCallback(async (type: string, location: string) => {
    if (pageState.currentStudyActivityId) {
      try {
        await endActivity(pageState.currentStudyActivityId);
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
        updatePageState({ currentStudyActivityId: activity.id });
      }
    } catch (error) {
      console.error('Error starting new activity:', error);
    }
  }, [endActivity, startActivity, pageState.currentStudyActivityId, updatePageState]);

  // Tab change handler with navigation logic
  const handleTabChange = useCallback(async (newTab: string) => {
    // Handle special navigation cases
    if (newTab === 'AnkiClinic') {
        try {
            // Clean up current activity first
            if (pageState.currentStudyActivityId) {
                await endActivity(pageState.currentStudyActivityId);
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

    // Batch state updates
    const updates: Partial<typeof pageState> = {
        activeTab: tab,
        currentPage: tab
    };

    if (tab === "Summary" && view) {
        router.push(`/home?tab=Summary&view=${view}`);
    }

    updatePageState(updates);

    // Handle activity changes
    if (tab !== "AdaptiveTutoringSuite") {
        await handleActivityChange('studying', tab);
    } else {
        // For AdaptiveTutoringSuite, track with a different activity type
        // This ensures we still have consistent state tracking
        await handleActivityChange('tutoring', 'AdaptiveTutoringSuite');
    }
  }, [router, handleActivityChange, updatePageState, pageState.currentStudyActivityId, endActivity]);

  const switchKalypsoState = (newState: "wait" | "talk" | "end" | "start") => {
    setPageState(prev => ({ ...prev, kalypsoState: newState }));
    if (kalypsoRef.current) {
      kalypsoRef.current.src = `/kalypso${newState}.gif`;
    }
  };

  const toggleChatBot = () => {
    // Implement chatbot toggling functionality
    updatePageState({ activeTab: "KalypsoAI" });
  };

  /* ---------------------------------------- Memoized Values ---------------------------------------- */
  const pageTitle = useMemo(() => {
    switch (pageState.activeTab) {
      case "Summary": return "Statistics";
      case "Tests": return "Testing Suite";
      case "AdaptiveTutoringSuite": return "Adaptive Tutoring Suite";
      case "flashcards": return "Flashcards";
      case "CARS": return "Daily CARs Practice";
      case "KalypsoAI": return "Kalypso";
      default: return "Home";
    }
  }, [pageState.activeTab]);

  const isPageLoading = useMemo(() => 
    loadingState.isUpdatingProfile || loadingState.isGeneratingActivities || loadingState.isLoadingTimeout,
    [loadingState.isUpdatingProfile, loadingState.isGeneratingActivities, loadingState.isLoadingTimeout]
  );

  /* ---------------------------------------- Effects ---------------------------------------- */
  // Track component lifecycle - simplified
  useEffect(() => {
    // Mark initialization to prevent double initialization
    if (initializationRef.current) return;
    initializationRef.current = true;
    
    // Add a safety timeout to ensure loading completes
    const safetyTimeout = setTimeout(() => {
      if (loadingState.isLoading) {
        // Force loading to complete after timeout
        updateLoadingState({ isLoading: false });
      }
    }, 3000); // 3 second safety timeout
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearTimeout(safetyTimeout);
    };
  }, [loadingState.isLoading, updateLoadingState]);

  // Combine initialization effects
  useEffect(() => {
    if (shouldInitialize) {
      initializePage();
    }
  }, [shouldInitialize, initializePage]);

  useEffect(() => {
    updateCalendarChatContext(pageState.activities);
  }, [pageState.activities, updateCalendarChatContext]);

  useEffect(() => {
    const handleScroll = () => {
      const remToPixels = (rem: number) =>
        rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
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
  }, [pageState.activities, pageState.activeTab]); // Re-run when content changes

  useEffect(() => {
    switchKalypsoState("start"); // Start with talking animation to encourage engagement
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
      if (pathname && pathname.startsWith('/home') && !pageState.currentStudyActivityId && !isLoadingUserInfo) {
        const activity = await startActivity({
          type: 'studying',
          location: pageState.activeTab,
          metadata: {
            initialLoad: true,
            timestamp: new Date().toISOString()
          }
        });

        if (activity) {
          setPageState(prev => ({ ...prev, currentStudyActivityId: activity.id }));
        }
      }
    };

    initializeActivity();
  }, [isLoadingUserInfo, pathname, pageState.activeTab, startActivity, pageState.currentStudyActivityId]);

  // Handle URL without tab parameter - ensure we show Kalypso AI
  useEffect(() => {
    if (pathname === '/home' && !searchParams?.has('tab')) {
      // Ensure we're showing Kalypso AI when user navigates directly to /home
      updatePageState({
        activeTab: 'KalypsoAI',
        currentPage: 'KalypsoAI'
      });
    }
  }, [pathname, searchParams, updatePageState]);

  useEffect(() => {
    if (!pageState.currentStudyActivityId) return;

    const intervalId = setInterval(() => {
      updateActivityEndTime(pageState.currentStudyActivityId);
    }, 300000);

    return () => clearInterval(intervalId);
  }, [pageState.currentStudyActivityId, updateActivityEndTime]);

  useEffect(() => {
    setPageState(prev => ({ ...prev, showReferralModal: shouldShowRedeemReferralModal() }));
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup any pending activities
      if (pageState.currentStudyActivityId) {
        endActivity(pageState.currentStudyActivityId);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [endActivity, pageState.currentStudyActivityId]);

  /* -------------------------------------- Rendering ------------------------------------- */
  const content = useMemo(() => {
    if (isLoadingUserInfo) {
      return <LoadingSpinner message="Loading user info..." />;
    }

    if (isPageLoading) {
      return <LoadingSpinner message="Initializing page..." />;
    }

    return (
      <>
        {/* Hover Sidebar - positioned outside ContentWrapper to be fixed */}
        <HoverSidebar
          activities={pageState.activities as any[]}
          onTasksUpdate={(tasks) => {
            updatePageState({ activities: tasks as FetchedActivity[] });
          }}
          onTabChange={handleTabChange}
          currentPage={pageState.currentPage}
          isSubscribed={isSubscribed}
        />
        
        <ContentWrapper>
          <div className="w-3/4 relative overflow-visible">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2
                  className="text-white text-2xl ml-3 font-thin leading-normal shadow-text cursor-pointer"
                  onClick={() => router.push("/home")}
                >
                  {pageTitle}
                </h2>
                <ThemeSwitcher />
              </div>
            </div>
            <div className="relative overflow-visible">
              <div className="p-3 gradientbg h-[calc(100vh-5.5rem)] rounded-lg mb-4">
                {/* Set KalypsoAI as the main component to show */}
                {(pageState.activeTab === 'KalypsoAI' || !pageState.activeTab) && (
                  <div className="h-full w-full overflow-visible relative">
                    <div className="w-full h-full p-4">
                      <ChatContainer chatbotRef={chatbotRef} />
                    </div>
                    {/* Position Kalypso in the bottom right corner of the chat area */}
                    <div className="absolute bottom-0 right-0 z-50 pointer-events-none" style={{ marginBottom: '20px', marginRight: '20px' }}>
                      <KalypsoGreeting />
                    </div>
                  </div>
                )}
                {pageState.activeTab === 'Summary' && (
                  <MemoizedSummary 
                    handleSetTab={handleTabChange}
                    isActive={pageState.activeTab === 'Summary'}
                    chatbotRef={chatbotRef}
                    userInfo={userInfo}
                  />
                )}
                {pageState.activeTab === 'AdaptiveTutoringSuite' && (
                  <div className="h-full overflow-hidden">
                    <MemoizedAdaptiveTutoring 
                      toggleChatBot={toggleChatBot}
                      setChatbotContext={updateChatbotContext}
                      chatbotRef={chatbotRef}
                      onActivityChange={handleActivityChange}
                    />
                  </div>
                )}
                {pageState.activeTab === 'CARS' && <TestingSuit />}
                {pageState.activeTab === 'flashcards' && <FlashcardDeck />}
                {pageState.activeTab === 'Tests' && (
                  <PracticeTests 
                    handleSetTab={handleTabChange} 
                    chatbotRef={chatbotRef}
                    onActivitiesUpdate={fetchActivities}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="w-1/4">
            <h2 className="text-white text-2xl font-thin leading-normal shadow-text">
              &nbsp;
            </h2>
            <div className="gradientbg p-3 pb-6 h-[calc(100vh-5.5rem)] rounded-lg knowledge-profile-component mb-4 relative">
              <MemoizedSideBar 
                activities={pageState.activities}
                currentPage={pageState.currentPage}
                chatbotContext={pageState.chatbotContext}
                chatbotRef={chatbotRef}
                handleSetTab={handleTabChange}
                onActivitiesUpdate={fetchActivities}
                isSubscribed={isSubscribed}
                showTasks={true}
              />
            </div>
          </div>

          {/* Modals and Popups */}
          {pageState.showReferralModal && (
            <RedeemReferralModal 
              isOpen={pageState.showReferralModal} 
              onClose={() => updatePageState({ showReferralModal: false })}
            />
          )}
          {pageState.showStreakPopup && (
            <StreakPopup 
              isOpen={pageState.showStreakPopup}
              onClose={() => updatePageState({ showStreakPopup: false })}
              streak={pageState.userStreak}
            />
          )}
        </ContentWrapper>
      </>
    );
  }, [
    isLoadingUserInfo,
    isPageLoading,
    pageState.activeTab,
    pageState.activities,
    pageState.currentPage,
    pageState.chatbotContext,
    chatbotRef,
    handleTabChange,
    fetchActivities,
    isSubscribed,
    userInfo,
    toggleChatBot,
    updatePageState,
    handleActivityChange,
    pageTitle,
    pageState.showReferralModal,
    pageState.showStreakPopup,
    pageState.userStreak,
    router,
    updateChatbotContext
  ]);

  return content;
};

export default memo(HomePage);