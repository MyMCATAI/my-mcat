import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useAudio } from '@/store/selectors';
import { toast } from 'react-hot-toast';
import KalypsoAvatar from './KalypsoAvatar';
import TestCalendar from '@/components/calendar/TestCalendar';
import WeeklyCalendarModal from '@/components/calendar/WeeklyCalendarModal';
import ChatBubble from './ChatBubble';
import StepNavigation from './StepNavigation';
import DemographicsStep from './DemographicsStep';
import SettingContent from '@/components/calendar/SettingContent';
import { useExamActivities, useAllCalendarActivities } from '@/hooks/useCalendarActivities';
import { CalendarEvent } from '@/types/calendar';
import DatePickerDialog from '@/components/DatePickerDialog';
import { CalendarIcon } from 'lucide-react';
import { formatDisplayDate, toUTCDate } from "@/lib/utils";

/* --- Constants ----- */
const DIAGNOSTIC_TEST_ID = 'cm65mma4j00b1uqgeyoiozs01';

/* ----- Types ---- */
interface KalypsoOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (showCoinReward?: boolean) => void;
}

const KalypsoOnboarding: React.FC<KalypsoOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  /* ---- State ----- */
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [kalypsoMessage, setKalypsoMessage] = useState('');
  const [showKalypsoChat, setShowKalypsoChat] = useState(false);
  const [showExamCalendarSetup, setShowExamCalendarSetup] = useState(false);
  const [showFinalCalendar, setShowFinalCalendar] = useState(false);
  const [showDemographics, setShowDemographics] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [showWeeklyCalendar, setShowWeeklyCalendar] = useState(false);
  const [tasksGenerated, setTasksGenerated] = useState(false);
  const [refreshingCalendar, setRefreshingCalendar] = useState(false);

  /* ---- Refs --- */
  const isPlayingVoiceRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  /* ----- Callbacks --- */
  const router = useRouter();
  const { userInfo } = useUserInfo();
  const audio = useAudio();
  const { activities: examActivities, updateExamDate, fetchExamActivities } = useExamActivities();
  const { activities: allActivities, refetch: refetchAllActivities } = useAllCalendarActivities();

  // Function to stop any currently playing audio
  const stopKalypsoVoice = useCallback(() => {
    if (currentAudioRef.current) {
      console.log('🛑 Stopping Kalypso audio...');
      try {
        const audio = currentAudioRef.current;
        
        // Remove all event listeners first
        audio.onended = null;
        audio.onerror = null;
        audio.onloadstart = null;
        audio.oncanplay = null;
        
        // Aggressively stop the audio
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0; // Mute it immediately
        audio.src = ''; // Clear the source
        
        // Force cleanup
        try {
          audio.load(); // Force reload to stop any buffering
        } catch (loadError) {
          // Ignore load errors when clearing
        }
        
        currentAudioRef.current = null;
        console.log('✅ Audio stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping audio:', error);
        currentAudioRef.current = null;
      }
    }
    isPlayingVoiceRef.current = false;
  }, []);

  // Function to play Kalypso's voice
  const playKalypsoVoice = useCallback((audioFile: string) => {
    console.log(`🎵 Playing Kalypso audio: ${audioFile}`);
    
    // Stop any currently playing audio first
    stopKalypsoVoice();
    
    try {
      isPlayingVoiceRef.current = true;
      const audioElement = new Audio(audioFile);
      audioElement.volume = 0.7; // Set volume to 70%
      currentAudioRef.current = audioElement;
      
      // Reset the refs when audio ends or errors
      audioElement.onended = () => {
        isPlayingVoiceRef.current = false;
        if (currentAudioRef.current === audioElement) {
          currentAudioRef.current = null;
        }
      };
      audioElement.onerror = () => {
        isPlayingVoiceRef.current = false;
        if (currentAudioRef.current === audioElement) {
          currentAudioRef.current = null;
        }
      };
      
      audioElement.play().then(() => {
        console.log(`▶️ Audio started playing: ${audioFile}`);
      }).catch(error => {
        console.error('❌ Error playing Kalypso voice:', error);
        isPlayingVoiceRef.current = false;
        if (currentAudioRef.current === audioElement) {
          currentAudioRef.current = null;
        }
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
      isPlayingVoiceRef.current = false;
      currentAudioRef.current = null;
    }
  }, [stopKalypsoVoice]);

  const stepMessages = useMemo(() => [
    {
      title: "Meow there, I'm Kalypso!",
      message: "Welcome to MyMCAT.ai! My job is to be your best friend, learn your weaknesses, and then serve up exactly what you need to study and when!",
      action: "Let's get started!",
      audioFile: "/audio/KOnboarding1.mp3"
    },
    {
      title: "Tell Me About Yourself! 📋",
      message: "I love making new friends. And then, uh, cancelling plans with them to sleep on a keyboard.",
      action: "Save My Information",
      audioFile: "/audio/KOnboarding2.mp3"
    },
    {
      title: "Let's Set Up Your Study Schedule! 📅",
      message: "Purr-fect! Now let's set up your exam dates and study schedule. This will help me create the most paw-some personalized study plan for you!",
      action: "Configure My Schedule",
      audioFile: "/audio/KOnboarding3.mp3"
    },
    {
      title: "Your Personalized Schedule 📅",
      message: "Don't take all exams at the end. Learning scientists say test frequently. That's why I recommend spacing them out like below. Change the dates now, or later in the testing suite — where you can also add third party exams!.",
      action: "Fill Tasks",
      audioFile: "/audio/KOnboarding4.mp3"
    },
    {
      title: "Pawsitively awesome! 🐾",
      message: "This is your calendar. Everyday, on the sidebar, you'll have tasks and be able to edit this calendar — including rescheduling, changing preferences, and adding third party exams.",
      action: "Complete Setup",
      audioFile: "/audio/KOnboarding6.mp3"
    }
  ], []);

  /* --- Animations & Effects --- */
  // Handle opening/closing the onboarding
  useEffect(() => {
    if (isOpen) {
      // Load Google Font for the sales sidebar
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      setShowKalypsoChat(true);
      setKalypsoMessage(stepMessages[0].message);
      
      // Play initial audio only when first opening
      playKalypsoVoice(stepMessages[0].audioFile);
    } else {
      setShowKalypsoChat(false);
      setCurrentStep(0);
      // Stop and reset audio when closing
      stopKalypsoVoice();
    }
    }, [isOpen, stepMessages, playKalypsoVoice, stopKalypsoVoice]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopKalypsoVoice();
    };
  }, [stopKalypsoVoice]);

  // Update message when step changes
  useEffect(() => {
    if (stepMessages[currentStep]) {
      setKalypsoMessage(stepMessages[currentStep].message);
    }
  }, [currentStep, stepMessages]);

  // Process calendar events from activities
  useEffect(() => {
    if (examActivities && allActivities) {
      const examEvents = examActivities.map((activity) => {
        // Map exam titles to shorter display names
        let displayTitle = "EXAM";
        if (activity.activityTitle === "MCAT Exam") {
          displayTitle = "MCAT";
        } else if (activity.activityTitle.includes("Unscored Sample")) {
          displayTitle = "Unscored";
        } else if (activity.activityTitle.includes("Full Length Exam")) {
          const number = activity.activityTitle.match(/\d+/)?.[0];
          displayTitle = `FL${number}`;
        } else if (activity.activityTitle.includes("Sample Scored")) {
          displayTitle = "Scored";
        }

        return {
          id: activity.id,
          title: displayTitle,
          start: new Date(activity.scheduledDate),
          end: new Date(activity.scheduledDate),
          allDay: true,
          activityText: activity.activityText,
          hours: activity.hours,
          activityType: activity.activityType,
          resource: { 
            ...activity, 
            eventType: 'exam' as const,
            fullTitle: activity.activityTitle,
            activityText: activity.activityText,
            hours: activity.hours,
            activityType: activity.activityType,
            activityTitle: activity.activityTitle,
            status: activity.status
          }
        };
      });

      const studyEvents = allActivities
        .filter(activity => activity.activityType !== 'exam')
        .map((activity) => ({
          id: activity.id,
          title: activity.activityTitle,
          start: new Date(activity.scheduledDate),
          end: new Date(activity.scheduledDate),
          allDay: true,
          activityText: activity.activityText,
          hours: activity.hours,
          activityType: activity.activityType,
          resource: { 
            ...activity, 
            eventType: 'study' as const,
            fullTitle: `${activity.activityTitle} (${activity.hours}h)`,
            activityText: activity.activityText,
            hours: activity.hours,
            activityType: activity.activityType,
            activityTitle: activity.activityTitle,
            status: activity.status
          }
        }));

      setCalendarEvents([...examEvents, ...studyEvents]);
    }
  }, [examActivities, allActivities]);

  /* ---- Event Handlers ----- */
  const handleStepAction = useCallback(async () => {
    console.log(`🚀 Step transition: ${currentStep} -> ${currentStep + 1}`);
    switch (currentStep) {
      case 0:
        // Introduction -> Demographics Collection
        console.log('📝 Moving to Demographics step');
        setCurrentStep(1);
        setShowDemographics(true);
        setKalypsoMessage("");
        // Play the demographics step audio
        playKalypsoVoice(stepMessages[1].audioFile);
        break;
      
      case 1:
        // Demographics -> handled by handleDemographicsComplete
        break;
      
      case 2:
        // Exam Calendar Setup -> handled by handleExamCalendarComplete
        break;
      
      case 3:
        // Fill Tasks -> Show weekly calendar modal
        console.log('📊 Opening Weekly Calendar Modal');
        setShowWeeklyCalendar(true);
        // Play the weekly calendar modal audio
        playKalypsoVoice('/audio/KOnboarding5.mp3');
        break;
      
      case 4:
        // Complete setup
        setIsCompleting(true);
        
        setTimeout(() => {
          onComplete(true);
          setIsCompleting(false);
        }, 2000);
        break;
    }
  }, [currentStep, onComplete, playKalypsoVoice, stepMessages]);

  const handleDemographicsComplete = useCallback(async (data: {
    firstName: string;
    college: string;
    isNonTraditional: boolean;
    isCanadian: boolean;
    currentMcatScore: number | null;
    hasNotTakenMCAT: boolean;
    targetScore: number;
  }) => {
    try {
      // Save all the demographic data to the database
      const response = await fetch('/api/user-info/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          college: data.college,
          isNonTraditional: data.isNonTraditional,
          isCanadian: data.isCanadian,
          currentMcatScore: data.currentMcatScore,
          hasNotTakenMCAT: data.hasNotTakenMCAT,
          mcatAttemptNumber: "1", // Default to first attempt if not specified
          targetScore: data.targetScore,
          currentStep: 2, // Go to exam calendar setup step
        })
      });

      if (!response.ok) throw new Error('Failed to save demographic information');

      // Hide demographics form and go to exam calendar setup
      console.log('📅 Moving to Exam Calendar Setup step');
      setShowDemographics(false);
      setCurrentStep(2);
      setShowExamCalendarSetup(true);
      setKalypsoMessage(stepMessages[2].message);
      playKalypsoVoice(stepMessages[2].audioFile);
    } catch (error) {
      console.error('Error saving demographics:', error);
      toast.error('Failed to save your information. Please try again.');
    }
  }, [stepMessages, playKalypsoVoice]);

  const handleExamCalendarComplete = useCallback(async (result: {
    success: boolean;
    action: "generate" | "save" | "skip";
    data?: {
      examDate: Date;
      hoursPerDay: Record<string, string>;
      fullLengthDays: string[];
    };
  }) => {
    try {
      if (result.success) {
        if (result.action === "skip") {
          // Skip directly to completion with coin reward
          console.log('⏭️ Skipping calendar setup, completing onboarding');
          toast.success('Calendar setup skipped. Welcome to MyMCAT.ai!');
          
          // Call onComplete immediately to show coin reward without delay
          onComplete(true);
        } else {
          // Normal flow: Hide exam calendar setup and go to step 3 (Your Personalized Schedule)
          console.log('📋 Moving to Personalized Schedule step');
          setShowExamCalendarSetup(false);
          setCurrentStep(3);
          setShowFinalCalendar(true);
          setKalypsoMessage(stepMessages[3].message);
          playKalypsoVoice(stepMessages[3].audioFile);
          
          toast.success('Your exam schedule has been set up successfully!');
        }
      } else {
        toast.error('Failed to set up your exam schedule. Please try again.');
      }
    } catch (error) {
      console.error('Error handling exam calendar completion:', error);
      toast.error('Failed to process your exam schedule. Please try again.');
    }
  }, [stepMessages, playKalypsoVoice, onComplete]);

  // Calendar event handlers
  const handleCalendarNavigate = useCallback((date: Date) => {
    setCalendarDate(date);
  }, []);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    // For onboarding, we can just show basic info or do nothing
    console.log('Selected event:', event);
  }, []);

  // Handle opening date picker for a test
  const handleOpenDatePicker = useCallback((testId: string) => {
    setSelectedTestId(testId);
    setDatePickerOpen(true);
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback(async (date: Date) => {
    if (selectedTestId) {
      try {
        // Convert to UTC date without time component
        const utcDate = toUTCDate(date);
        await updateExamDate(selectedTestId, utcDate);
        setDatePickerOpen(false);
        setSelectedTestId(null);
        toast.success('Exam date updated successfully!');
      } catch (error) {
        console.error('Failed to update test date:', error);
        toast.error('Failed to update exam date. Please try again.');
      }
    }
  }, [selectedTestId, updateExamDate]);

  // Handle weekly calendar completion
  const handleWeeklyCalendarComplete = useCallback(async (result: { success: boolean; action?: 'generate' | 'save' | 'reset' }) => {
    if (result.success) {
      try {
        setRefreshingCalendar(true);
        
        // Small delay to ensure backend processing is complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh all activities to show newly generated tasks
        await Promise.all([
          fetchExamActivities(),
          refetchAllActivities()
        ]);
        
        setTasksGenerated(true);
        setShowWeeklyCalendar(false);
        setRefreshingCalendar(false);
        
        // Move to final step (Pawsitively awesome!)
        console.log('🎉 Moving to Final Completion step');
        setCurrentStep(4);
        setKalypsoMessage(stepMessages[4].message);
        playKalypsoVoice(stepMessages[4].audioFile);
        
        toast.success('Your study tasks have been generated successfully!');
        return true;
      } catch (error) {
        console.error('Failed to refresh activities after task generation:', error);
        setRefreshingCalendar(false);
        toast.error('Tasks generated but failed to refresh calendar. Please refresh the page.');
        return false;
      }
    }
    return false;
  }, [fetchExamActivities, refetchAllActivities, stepMessages, playKalypsoVoice]);

  /* ---- Render Methods ----- */
  const renderOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[10001]"
      onClick={onClose}
    />
  );

  const renderChatContent = () => {
    if (showDemographics) {
      return <DemographicsStep onComplete={handleDemographicsComplete} />;
    }

    if (showExamCalendarSetup) {
      return (
        <div className="w-[43rem] h-[40rem] flex flex-col justify-between">
          {/* Custom styled container for onboarding */}
          <div className="flex-1 flex flex-col justify-center [&_.text-white]:text-gray-800 [&_.border-gray-400\\/30]:border-gray-300 [&_.bg-white\\/5]:bg-gray-100 [&_.bg-white\\/10]:bg-gray-200 [&_.hover\\:bg-white\/20]:hover:bg-gray-300">
            <SettingContent
              isInitialSetup={true}
              onComplete={handleExamCalendarComplete}
            />
          </div>
        </div>
      );
    }

    if (showWeeklyCalendar) {
      return (
        <div className="w-[43rem] h-[40rem] flex flex-col">
          {/* Custom styled container for weekly calendar */}
          <div 
            className="flex-1 flex flex-col overflow-y-auto [&_.text-white]:text-gray-800 [&_.border-gray-400\\/30]:border-gray-300 [&_.bg-white\\/5]:bg-gray-100 [&_.bg-white\\/10]:bg-gray-200 [&_.hover\\:bg-white\/20]:hover:bg-gray-300"
            style={{
              // Override theme colors for onboarding white background
              '--theme-mainbox-color': '#ffffff',
              '--theme-text-color': '#374151',
              '--theme-emphasis-color': '#62c1e5',
              '--theme-hover-color': '#bbf7d0', // Light green for study events
              '--theme-hover-text': '#1f2937',
              '--theme-border-color': '#e5e7eb',
              '--theme-leaguecard-color': '#f9fafb',
              '--theme-leaguecard-accent': '#ffffff',
              '--theme-button-color': '#ffffff',
              '--theme-doctorsoffice-accent': '#bbf7d0', // Light green for study events
              '--theme-box-shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              // Make scrollbar always visible and styled
              scrollbarWidth: 'auto',
              scrollbarColor: '#cbd5e1 #f1f5f9'
            } as React.CSSProperties}
          >
            <WeeklyCalendarModal
              onComplete={handleWeeklyCalendarComplete}
              isInitialSetup={false}
            />
          </div>
        </div>
      );
    }

    if (showFinalCalendar) {
      // Get upcoming exam activities for the list
      const upcomingExams = examActivities?.filter(activity => 
        new Date(activity.scheduledDate) >= new Date()
      ).sort((a, b) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      ) || [];

      return (
        <div className="w-[43rem] h-[35rem] flex flex-col">
          {/* Title and message - Fixed at top */}
          <div className="mb-4 text-center flex-shrink-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight mb-2"
            >
              {stepMessages[currentStep]?.title || ""}
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium"
            >
              {stepMessages[currentStep]?.message || ""}
            </motion.div>
          </div>
          
          {/* Step 4: Calendar - Takes available space */}
          {currentStep === 4 && tasksGenerated && (
            <div 
              className="flex-1 mb-4 relative"
              style={{
                // Override theme colors for onboarding white background
                '--theme-mainbox-color': '#ffffff',
                '--theme-text-color': '#374151',
                '--theme-emphasis-color': '#62c1e5',
                '--theme-hover-color': '#bbf7d0', // Light green for study events
                '--theme-hover-text': '#1f2937',
                '--theme-border-color': '#e5e7eb',
                '--theme-leaguecard-color': '#f9fafb',
                '--theme-leaguecard-accent': '#ffffff',
                '--theme-button-color': '#ffffff',
                '--theme-doctorsoffice-accent': '#bbf7d0', // Light green for study events
                '--theme-box-shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
              } as React.CSSProperties}
            >
              {refreshingCalendar && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600">Updating calendar...</div>
                  </div>
                </div>
              )}
              <TestCalendar
                events={calendarEvents}
                date={calendarDate}
                onNavigate={handleCalendarNavigate}
                onSelectEvent={handleSelectEvent}
                buttonLabels={{
                  hideSummarize: true,
                  generate: ""
                }}
              />
            </div>
          )}

          {/* Step 3: Upcoming exams list - Takes available space and is directly scrollable */}
          {currentStep === 3 && upcomingExams.length > 0 && (
            <div className="flex-1 mb-4 overflow-y-auto bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="space-y-2">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between bg-white rounded-md p-3 border border-gray-100 shadow-sm">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{exam.activityTitle}</div>
                      <div className="text-xs text-gray-500">{exam.activityText}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {formatDisplayDate(new Date(exam.scheduledDate))}
                      </span>
                      <button
                        onClick={() => handleOpenDatePicker(exam.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors duration-200"
                        title="Change date"
                      >
                        <CalendarIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons - Always visible at bottom */}
          {(currentStep === 3 || currentStep === 4) && (
            <div className="flex justify-center gap-4 pb-4 flex-shrink-0">
              {currentStep === 3 ? (
                /* Step 3: Show Fill Tasks button */
                <button
                  onClick={() => setShowWeeklyCalendar(true)}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity duration-200"
                >
                  Fill Tasks
                </button>
              ) : (
                /* Step 4: Show Complete Setup button */
                <button
                  onClick={() => {
                    setIsCompleting(true);
                    setTimeout(() => {
                      onComplete(true);
                      setIsCompleting(false);
                    }, 2000);
                  }}
                  disabled={isCompleting}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
                >
                  {isCompleting ? "Completing..." : "Complete Setup"}
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    // Default step content
    return (
              <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
                >
                  {stepMessages[currentStep]?.title}
                </motion.div>
                {kalypsoMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    {kalypsoMessage}
                  </motion.div>
                )}
              </>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && showKalypsoChat && (
        <>
          {renderOverlay()}
          <KalypsoAvatar onAction={handleStepAction} />
          <ChatBubble 
            showFinalCalendar={showFinalCalendar}
            showDemographics={showDemographics}
            showExamCalendarSetup={showExamCalendarSetup}
          >
            {renderChatContent()}
            
            {/* Show navigation only for regular steps */}
            {!showDemographics && !showExamCalendarSetup && !showWeeklyCalendar && !showFinalCalendar && (
              <StepNavigation
                currentStep={currentStep}
                totalSteps={stepMessages.length}
                actionText={stepMessages[currentStep]?.action || "Continue"}
                isCompleting={isCompleting}
                showPrevious={currentStep > 0}
                showSkip={false}
                onPrevious={() => setCurrentStep(currentStep - 1)}
                onSkip={() => {}}
                onAction={handleStepAction}
              />
            )}
          </ChatBubble>
        </>
      )}
      
      <DatePickerDialog
        isOpen={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
          setSelectedTestId(null);
        }}
        onDateSelect={handleDateSelect}
        currentDate={selectedTestId && examActivities ? new Date(examActivities.find(t => t.id === selectedTestId)?.scheduledDate || '') : undefined}
        testName={selectedTestId && examActivities ? examActivities.find(t => t.id === selectedTestId)?.activityTitle : undefined}
      />


    </AnimatePresence>
  );
};

export default KalypsoOnboarding; 