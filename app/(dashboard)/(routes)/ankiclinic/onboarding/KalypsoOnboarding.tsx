import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useAudio } from '@/store/selectors';
import KalypsoAvatar from './KalypsoAvatar';
import VoiceRecorder from './VoiceRecorder';
import AnalysisDisplay from './AnalysisDisplay';
import ScheduleGenerator from './ScheduleGenerator';
import CalendarView from './CalendarView';
import ChatBubble from './ChatBubble';
import StepNavigation from './StepNavigation';

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
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [skippedDiagnostic, setSkippedDiagnostic] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showScheduleGeneration, setShowScheduleGeneration] = useState(false);
  const [showFinalCalendar, setShowFinalCalendar] = useState(false);

  /* ---- Refs --- */
  const isPlayingVoiceRef = useRef(false);

  /* ----- Callbacks --- */
  const router = useRouter();
  const { userInfo } = useUserInfo();
  const audio = useAudio();

  // Function to play Kalypso's voice
  const playKalypsoVoice = useCallback((audioFile: string) => {
    // Prevent playing if already playing
    if (isPlayingVoiceRef.current) return;
    
    try {
      isPlayingVoiceRef.current = true;
      const audioElement = new Audio(audioFile);
      audioElement.volume = 0.7; // Set volume to 70%
      
      // Reset the flag when audio ends or errors
      audioElement.onended = () => {
        isPlayingVoiceRef.current = false;
      };
      audioElement.onerror = () => {
        isPlayingVoiceRef.current = false;
      };
      
      audioElement.play().catch(error => {
        console.error('Error playing Kalypso voice:', error);
        isPlayingVoiceRef.current = false;
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
      isPlayingVoiceRef.current = false;
    }
  }, []);

  const stepMessages = useMemo(() => [
    {
      title: "Meow there, I'm Kalypso!",
      message: "Welcome to your firm's studyverse! My job is to study with you, reward you, and then report your weaknesses back to your tutor!",
      action: "Let's get started!",
      audioFile: "/kalypso/KalypsoVoice1.mp3"
    },
    {
      title: "Let's See What You Know! 🧠",
      message: "Your tutoring firm has loaded a diagnostic for you to take so I can start discovering what you know and don't know. If you'd rather skip it, then press skip and just tell me what you struggle with quickly!",
      action: "Start Diagnostic",
      audioFile: "/kalypso/KalypsoVoice2.mp3"
    },
    {
      title: "Creating Your Study Plan 📅",
      message: "Perfect! Now I'm going to create your personalized study schedule based on what I learned about you.",
      action: "Create My Study Plan",
      audioFile: "/kalypso/KalypsoVoice3.mp3"
    },
    {
      title: "Your Personalized Schedule 📅",
      message: "Purr-fect! Here's your custom study schedule. I've organized everything by topic and sent that information to your tutor!",
      action: "Complete Setup",
      audioFile: "/kalypso/KalypsoVoiceStudySchedule.mp3"
    }
  ], []);

  /* --- Animations & Effects --- */
  useEffect(() => {
    if (isOpen) {
      // Load Google Font for the sales sidebar
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Only play Kalypso's voice on the very first step (step 0) and not in voice input mode
      if (!showVoiceInput && !showAnalysis && currentStep === 0) {
        playKalypsoVoice(stepMessages[0].audioFile);
      }
      setShowKalypsoChat(true);
      setKalypsoMessage(showVoiceInput ? "" : stepMessages[0].message);
    } else {
      setShowKalypsoChat(false);
      setCurrentStep(0);
      // Reset voice playing flag when closing
      isPlayingVoiceRef.current = false;
    }
  }, [isOpen, audio, stepMessages, playKalypsoVoice, showVoiceInput, showAnalysis, currentStep]);

  // Update message when step changes
  useEffect(() => {
    if (showVoiceInput) {
      setKalypsoMessage(""); // No message for voice input
    } else if (showAnalysis) {
      setKalypsoMessage(""); // No message for analysis - just the title
    } else if (stepMessages[currentStep]) {
      setKalypsoMessage(stepMessages[currentStep].message);
    }
  }, [currentStep, stepMessages, showVoiceInput, showAnalysis]);

  /* ---- Event Handlers ----- */
  const handleStepAction = useCallback(async () => {
    switch (currentStep) {
      case 0:
        // Introduction -> Diagnostic Setup
        setCurrentStep(1);
        setKalypsoMessage(stepMessages[1].message);
        playKalypsoVoice(stepMessages[1].audioFile);
        break;
      
      case 1:
        // Start Diagnostic - Navigate to CARS passage
        router.push(`/test-questions/${DIAGNOSTIC_TEST_ID}`);
        break;
      
      case 2:
        // Start Schedule Generation
        setShowScheduleGeneration(true);
        setKalypsoMessage("");
        break;
      
      case 3:
        // Complete setup
        setIsCompleting(true);
        
        setTimeout(() => {
          onComplete(true);
          setIsCompleting(false);
        }, 2000);
        break;
    }
  }, [currentStep, stepMessages, playKalypsoVoice, router, onComplete]);

  const handleSkipDiagnostic = useCallback(() => {
    setSkippedDiagnostic(true);
    setShowVoiceInput(true);
    setKalypsoMessage("");
  }, []);

  const handleVoiceInputComplete = useCallback(() => {
      setShowVoiceInput(false);
      setShowAnalysis(true);
      setKalypsoMessage("");
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    setShowAnalysis(false);
    setShowScheduleGeneration(true);
    setKalypsoMessage("");
  }, []);

  const handleScheduleGenerationComplete = useCallback(() => {
            setShowScheduleGeneration(false);
            setCurrentStep(3);
            setShowFinalCalendar(true);
            setKalypsoMessage(stepMessages[3].message);
            playKalypsoVoice(stepMessages[3].audioFile);
  }, [stepMessages, playKalypsoVoice]);

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
    if (showVoiceInput) {
      return <VoiceRecorder onComplete={handleVoiceInputComplete} />;
    }

    if (showAnalysis) {
      return <AnalysisDisplay onComplete={handleAnalysisComplete} />;
    }

    if (showScheduleGeneration) {
      return <ScheduleGenerator onComplete={handleScheduleGenerationComplete} />;
    }

    if (showFinalCalendar) {
      return (
        <CalendarView 
          title={stepMessages[currentStep]?.title || ""}
          message={kalypsoMessage}
        />
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
                    className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-200 dark:border-gray-600 shadow-sm"
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
            showAnalysis={showAnalysis}
            showScheduleGeneration={showScheduleGeneration}
            showFinalCalendar={showFinalCalendar}
          >
            {renderChatContent()}
            
            {/* Show navigation only for regular steps */}
            {!showVoiceInput && !showAnalysis && !showScheduleGeneration && (
              <StepNavigation
                currentStep={currentStep}
                totalSteps={stepMessages.length}
                actionText={stepMessages[currentStep]?.action || "Continue"}
                isCompleting={isCompleting}
                showPrevious={currentStep > 0}
                showSkip={currentStep === 1}
                onPrevious={() => setCurrentStep(currentStep - 1)}
                onSkip={handleSkipDiagnostic}
                onAction={handleStepAction}
              />
            )}
          </ChatBubble>
        </>
      )}
    </AnimatePresence>
  );
};

export default KalypsoOnboarding; 