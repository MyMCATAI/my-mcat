import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Play, Calendar, CheckCircle, Clock, BookOpen, Target, TrendingUp, Mic, MicOff, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useUserInfo } from '@/hooks/useUserInfo';
import { useAudio } from '@/store/selectors';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import "react-big-calendar/lib/css/react-big-calendar.css";

/* --- Constants ----- */
const KALYPSO_AVATAR = '/kalypso/kalypsoapproval.gif';
const DIAGNOSTIC_TEST_ID = 'cm65mma4j00b1uqgeyoiozs01';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const SAMPLE_DIAGNOSTIC_RESULTS = {
  strengths: ['Critical Analysis', 'Scientific Reasoning'],
  weaknesses: ['Reading Comprehension Speed', 'Data Interpretation'],
  overallScore: 78,
  recommendations: [
    'Focus on timed reading practice',
    'Review graph interpretation techniques',
    'Practice passage-based questions daily'
  ]
};

// Sample calendar events for the final step
const SAMPLE_CALENDAR_EVENTS = [
  // Today
  {
    id: '1',
    title: 'Amino Acids Review',
    start: new Date(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    resource: {
      activityTitle: 'Amino Acids Review',
      activityText: 'MyMCAT Adaptive Tutoring',
      hours: 2,
      eventType: 'content',
      status: 'Scheduled'
    }
  },
  // Tomorrow
  {
    id: '2',
    title: 'CARS Practice',
    start: new Date(Date.now() + 86400000),
    end: new Date(Date.now() + 86400000 + 90 * 60 * 1000), // 1.5 hours
    resource: {
      activityTitle: 'CARS Practice',
      activityText: 'Critical Analysis and Reasoning Skills',
      hours: 1.5,
      eventType: 'practice',
      status: 'Scheduled'
    }
  },
  // Day 2
  {
    id: '3',
    title: 'Enzyme Kinetics',
    start: new Date(Date.now() + 2 * 86400000),
    end: new Date(Date.now() + 2 * 86400000 + 2 * 60 * 60 * 1000),
    resource: {
      activityTitle: 'Enzyme Kinetics',
      activityText: 'UWorld Practice Questions',
      hours: 2,
      eventType: 'practice',
      status: 'Scheduled'
    }
  },
  // Day 3
  {
    id: '4',
    title: 'Physics Concepts',
    start: new Date(Date.now() + 3 * 86400000),
    end: new Date(Date.now() + 3 * 86400000 + 90 * 60 * 1000),
    resource: {
      activityTitle: 'Physics Concepts',
      activityText: 'Kinematics and Forces',
      hours: 1.5,
      eventType: 'content',
      status: 'Scheduled'
    }
  },
  // Day 4
  {
    id: '5',
    title: 'Psychology Review',
    start: new Date(Date.now() + 4 * 86400000),
    end: new Date(Date.now() + 4 * 86400000 + 60 * 60 * 1000),
    resource: {
      activityTitle: 'Psychology Review',
      activityText: 'Learning and Memory',
      hours: 1,
      eventType: 'content',
      status: 'Scheduled'
    }
  },
  // Day 5
  {
    id: '6',
    title: 'Organic Chemistry',
    start: new Date(Date.now() + 5 * 86400000),
    end: new Date(Date.now() + 5 * 86400000 + 2 * 60 * 60 * 1000),
    resource: {
      activityTitle: 'Organic Chemistry',
      activityText: 'Reaction Mechanisms',
      hours: 2,
      eventType: 'practice',
      status: 'Scheduled'
    }
  },
  // Day 6
  {
    id: '7',
    title: 'Biochemistry Pathways',
    start: new Date(Date.now() + 6 * 86400000),
    end: new Date(Date.now() + 6 * 86400000 + 90 * 60 * 1000),
    resource: {
      activityTitle: 'Biochemistry Pathways',
      activityText: 'Glycolysis and Krebs Cycle',
      hours: 1.5,
      eventType: 'content',
      status: 'Scheduled'
    }
  },
  // Week 2 - Practice Exam
  {
    id: '8',
    title: 'Full Length Exam 1',
    start: new Date(Date.now() + 7 * 86400000),
    end: new Date(Date.now() + 7 * 86400000 + 7.5 * 60 * 60 * 1000),
    resource: {
      activityTitle: 'Full Length Exam 1',
      activityText: 'AAMC Practice Exam',
      hours: 7.5,
      eventType: 'exam',
      status: 'Scheduled'
    }
  }
];

const SCHEDULE_GENERATION_MESSAGES = [
  "Purr-using your past exams...",
  "Clawing at your vulnerabilities...", 
  "Picking out subjects...",
  "Nibbling on some catnip...",
  "Your study plan is now ready!"
];

/* ----- Types ---- */
interface KalypsoOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (showCoinReward?: boolean) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    activityTitle: string;
    activityText: string;
    hours: number;
    eventType: string;
    status: string;
  };
}

interface DiagnosticResultsProps {
  results: typeof SAMPLE_DIAGNOSTIC_RESULTS;
  onContinue: () => void;
}

const KalypsoOnboarding: React.FC<KalypsoOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  /* ---- State ----- */
  const [currentStep, setCurrentStep] = useState(0);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [kalypsoMessage, setKalypsoMessage] = useState('');
  const [showKalypsoChat, setShowKalypsoChat] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [skippedDiagnostic, setSkippedDiagnostic] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showScheduleGeneration, setShowScheduleGeneration] = useState(false);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const [generationMessages, setGenerationMessages] = useState<string[]>([]);
  const [showFinalCalendar, setShowFinalCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  /* ---- Refs --- */
  const diagnosticTimeoutRef = useRef<NodeJS.Timeout>();
  const isPlayingVoiceRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();
  const audioChunksRef = useRef<Blob[]>([]);

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
      title: "Meow there, I'm Kalypso! 🐱",
      message: "Your tutoring firm sent me to help you learn. My job is to help you study and report back to the tutor!",
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

  const voiceInputMessage = useMemo(() => ({
    title: "Tell Me What You Struggle With 🎤",
    message: "", // Empty message - just show the recording interface
    action: "Continue",
    audioFile: "/kalypso/KalypsoVoice2.mp3"
  }), []);

  const analysisMessage = useMemo(() => ({
    title: "Analyzing Your Input 🧠",
    message: "", // No message - just the title
    action: "Continue",
    audioFile: "/kalypso/KalypsoVoice3.mp3"
  }), []);

  // Sample MCAT-related weaknesses based on voice input
  const mcatWeaknesses = useMemo(() => [
    {
      category: "Amino Acids",
      issues: ["Memorizing 20 standard amino acids", "Understanding side chain properties"],
      icon: "🧬"
    },
    {
      category: "Enzymes", 
      issues: ["Enzyme kinetics and mechanisms", "Competitive vs non-competitive inhibition"],
      icon: "⚗️"
    },
    {
      category: "Kinetics",
      issues: ["Rate laws and reaction orders", "Activation energy concepts"],
      icon: "📈"
    },
    {
      category: "Others",
      issues: ["Basic organic chemistry reactions", "Fundamental physics principles"],
      icon: "📚"
    }
  ], []);

  /* --- Animations & Effects --- */
  useEffect(() => {
    if (isOpen) {
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

  useEffect(() => {
    // Cleanup timeouts on unmount
    return () => {
      if (diagnosticTimeoutRef.current) {
        clearTimeout(diagnosticTimeoutRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

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

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

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
        setIsGeneratingSchedule(true);
        setKalypsoMessage("");
        
        // Show generation messages with delays
        for (let i = 0; i < SCHEDULE_GENERATION_MESSAGES.length; i++) {
          setTimeout(() => {
            setGenerationMessages(prev => [...prev, SCHEDULE_GENERATION_MESSAGES[i]]);
            
            // If this is the last message, move to final step
            if (i === SCHEDULE_GENERATION_MESSAGES.length - 1) {
              setTimeout(() => {
                setIsGeneratingSchedule(false);
                setShowScheduleGeneration(false);
                setCurrentStep(3);
                setShowFinalCalendar(true);
                setKalypsoMessage(stepMessages[3].message);
                playKalypsoVoice(stepMessages[3].audioFile);
              }, 1000);
            }
          }, i * 1000);
        }
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
    // Don't play audio for voice input step - just show the recording interface
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        setHasRecording(true);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const handleVoiceInputComplete = useCallback(() => {
    if (hasRecording) {
      setShowVoiceInput(false);
      setShowAnalysis(true);
      setIsAnalyzing(true);
      setKalypsoMessage("");
      
      // Simulate analysis time
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 3000);
    }
  }, [hasRecording]);

  const handleAnalysisComplete = useCallback(() => {
    setShowAnalysis(false);
    
    // Directly start schedule generation instead of going to step 2
    setShowScheduleGeneration(true);
    setIsGeneratingSchedule(true);
    setKalypsoMessage("");
    
    // Show generation messages with delays
    for (let i = 0; i < SCHEDULE_GENERATION_MESSAGES.length; i++) {
      setTimeout(() => {
        setGenerationMessages(prev => [...prev, SCHEDULE_GENERATION_MESSAGES[i]]);
        
        // If this is the last message, move to final step
        if (i === SCHEDULE_GENERATION_MESSAGES.length - 1) {
          setTimeout(() => {
            setIsGeneratingSchedule(false);
            setShowScheduleGeneration(false);
            setCurrentStep(3);
            setShowFinalCalendar(true);
            setKalypsoMessage(stepMessages[3].message);
            playKalypsoVoice(stepMessages[3].audioFile);
          }, 1000);
        }
      }, i * 1000);
    }
  }, [stepMessages, playKalypsoVoice]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

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

  const renderKalypsoAvatar = () => (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: '0%', opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-[-2rem] right-[-12rem] md:bottom-[-6rem] md:right-[-8rem] z-[10002] cursor-pointer overflow-hidden"
      onClick={handleStepAction}
    >
      <div className="w-[32rem] h-[32rem] md:w-[50rem] md:h-[50rem] relative hover:scale-105 transition-transform duration-200">
        <Image
          src={KALYPSO_AVATAR}
          alt="Kalypso"
          fill
          className="object-contain object-bottom"
          priority
        />
      </div>
    </motion.div>
  );

  const renderChatBubble = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{ delay: 0.3 }}
      className={`fixed right-[20rem] md:right-[33rem] z-[10002] w-auto min-w-[32rem] max-w-3xl ${
        showAnalysis || showScheduleGeneration || showFinalCalendar ? 'bottom-20 md:bottom-32' : 'bottom-60 md:bottom-80'
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl relative border border-gray-200 dark:border-gray-700 max-h-[75vh] flex flex-col">
        {/* Arrow pointing to Kalypso */}
        <div className="absolute -right-4 bottom-8 w-0 h-0 border-l-[20px] border-l-white dark:border-l-gray-800 border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent"></div>
        
        {/* Scrollable content area */}
        <div className="p-10 md:p-12 overflow-y-auto flex-1">
          <div className="space-y-6">
            {!showVoiceInput && !showAnalysis && !showScheduleGeneration && !showFinalCalendar && (
              <>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {stepMessages[currentStep]?.title}
                </div>
                {kalypsoMessage && (
                  <div className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                    {kalypsoMessage}
                  </div>
                )}
              </>
            )}
            
            {!showVoiceInput && showAnalysis && isAnalyzing && (
              <>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Analyzing Your Input 🧠
                </div>
              </>
            )}

            {showScheduleGeneration && (
              <div className="space-y-6">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center">
                  Creating Your Study Plan 📅
                </div>
                
                <div className="space-y-4 w-full max-w-md mx-auto">
                  {generationMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium">{message}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isGeneratingSchedule && generationMessages.length < SCHEDULE_GENERATION_MESSAGES.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-3 text-gray-900 dark:text-white p-4"
                    >
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Generating your schedule...</span>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {showFinalCalendar && (
              <div className="space-y-6">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center">
                  {stepMessages[currentStep]?.title}
                </div>
                {kalypsoMessage && (
                  <div className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed text-center">
                    {kalypsoMessage}
                  </div>
                )}
                
                {/* Calendar View */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="h-[400px]">
                    <BigCalendar
                      localizer={localizer}
                      events={SAMPLE_CALENDAR_EVENTS}
                      startAccessor="start"
                      endAccessor="end"
                      className="custom-calendar w-full h-full bg-transparent"
                      views={['month']}
                      defaultView="month"
                      date={calendarDate}
                      onNavigate={setCalendarDate}
                      toolbar={true}
                      popup
                      eventPropGetter={(event) => ({
                        className: `calendar-event ${
                          event.resource.eventType === 'exam' ? 'exam-event' : 'study-event'
                        }`,
                        style: {
                          backgroundColor: event.resource.eventType === 'exam' ? '#ef4444' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          padding: '2px 4px'
                        }
                      })}
                      components={{
                        toolbar: ({ label, onNavigate }) => (
                          <div className="flex items-center justify-between mb-4">
                            <button 
                              onClick={() => onNavigate('PREV')}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">{label}</span>
                            <button 
                              onClick={() => onNavigate('NEXT')}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      }}
                      style={{
                        fontSize: '0.875rem'
                      }}
                    />
                  </div>
                  
                  {/* Calendar Legend */}
                  <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-300">Study Sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-gray-700 dark:text-gray-300">Practice Exams</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {showDiagnostic && (
              <div className="mt-8">
                <div className="text-center">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Diagnostic test would appear here...
                  </p>
                </div>
              </div>
            )}
            
            {showResults && (
              <div className="mt-8">
                <div className="text-center">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Diagnostic results would appear here...
                  </p>
                </div>
              </div>
            )}
            
            {showVoiceInput && (
              <div className="flex flex-col items-center space-y-6 py-8">
                {/* Recording Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : hasRecording
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-12 h-12 text-white" />
                  ) : hasRecording ? (
                    <CheckCircle className="w-12 h-12 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </button>

                {/* Recording Status */}
                <div className="text-center">
                  {isRecording ? (
                    <div className="space-y-2">
                      <p className="text-red-600 dark:text-red-400 font-medium text-xl">
                        Recording... {formatTime(recordingTime)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Press the button again to stop
                      </p>
                    </div>
                  ) : hasRecording ? (
                    <div className="space-y-4">
                      <p className="text-green-600 dark:text-green-400 font-medium text-xl">
                        Recording complete! ({formatTime(recordingTime)})
                      </p>
                      <button
                        onClick={handleVoiceInputComplete}
                        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-lg font-medium"
                      >
                        Analyze My Input
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-gray-900 dark:text-white font-medium text-xl">
                        Press to start recording
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tell me about what you struggle with
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {showAnalysis && (
              <div className="mt-8">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center space-y-6 py-8">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xl font-medium text-gray-900 dark:text-white">
                      Fetching that for you...
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      Analyzing your input and identifying key areas for MCAT improvement
                    </p>
                  </div>
                ) : analysisComplete && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                        So you're new to the MCAT! Let's start with the basics.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {mcatWeaknesses.map((weakness, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-orange-500"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{weakness.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {weakness.category}
                              </h4>
                              <ul className="space-y-1">
                                {weakness.issues.map((issue, issueIndex) => (
                                  <li key={issueIndex} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center pt-4">
                      <button
                        onClick={handleAnalysisComplete}
                        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-lg font-medium"
                      >
                        Create My Study Plan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Fixed footer with navigation */}
        {!showVoiceInput && !showAnalysis && !showScheduleGeneration && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-2xl">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                {Array.from({ length: stepMessages.length }, (_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full transition-colors ${
                      i === currentStep 
                        ? 'bg-blue-500' 
                        : i < currentStep 
                          ? 'bg-green-500' 
                          : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-4">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 text-lg font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep === 1 && (
                  <button
                    onClick={handleSkipDiagnostic}
                    className="px-6 py-3 text-lg font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Skip
                  </button>
                )}
                
                <button
                  onClick={handleStepAction}
                  disabled={isCompleting}
                  className="px-8 py-3 text-lg font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isCompleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      {stepMessages[currentStep]?.action}
                      <Play className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && showKalypsoChat && (
        <>
          {renderOverlay()}
          {renderKalypsoAvatar()}
          {renderChatBubble()}
        </>
      )}
    </AnimatePresence>
  );
};

export default KalypsoOnboarding; 