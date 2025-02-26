import React, { useState, forwardRef, useImperativeHandle, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import FlashcardDeck, { Flashcard } from './FlashcardDeck';
import { useSpring, animated, config } from '@react-spring/web';
import { ThumbsDown, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { roomToSubjectMap } from './constants';
import ChatBot from '@/components/chatbot/ChatBotFlashcard';
import { cleanQuestion, cleanAnswer } from './utils/testUtils';
import DownvoteFeedback from '@/components/DownvoteFeedback';
// import Interruption from './Interruption';

interface WrongCard {
  question: string;
  answer: string;
  timestamp: string;
}

interface QuestionContext {
  question: string;
  correctAnswer: string;
  explanation: string;
  otherOptions: string[];
  type: string;
}

interface FlashcardsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  buttonContent: React.ReactNode;
  activeRooms: Set<string>; 
  setActiveRooms: React.Dispatch<React.SetStateAction<Set<string>>>; 
  currentUserTestId: string | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleCompleteAllRoom: () => void;
  onMCQAnswer: (isCorrect: boolean) => void;
  setTotalMCQQuestions: React.Dispatch<React.SetStateAction<number>>;
}

const FlashcardsDialog = forwardRef<{ open: () => void, setWrongCards: (cards: any[]) => void, setCorrectCount: (count: number) => void }, FlashcardsDialogProps>(({
  isOpen,
  onOpenChange,
  roomId,
  buttonContent,
  activeRooms,  
  setActiveRooms, 
  currentUserTestId,
  isLoading,
  setIsLoading,
  handleCompleteAllRoom,
  onMCQAnswer,
  setTotalMCQQuestions,
}, ref) => {
  const [wrongCards, setWrongCards] = useState<WrongCard[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [streak, setStreak] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  // const [showInterruption, setShowInterruption] = useState(false);
  // const [isTypingComplete, setIsTypingComplete] = useState(false);
  // const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Flashcard | null>(null);
  const [currentQuestionContext, setCurrentQuestionContext] = useState<QuestionContext | null>(null);
  const chatbotRef = useRef<{
    sendMessage: (message: string) => void;
  }>({ sendMessage: () => {} });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [springs, api] = useSpring(() => ({
    from: { x: 0 }
  }));

  const counterSpring = useSpring({
    to: {
      scale: showPlusOne ? 1.2 : 1
    },
    config: { tension: 300, friction: 10 }
  });

  const plusOneSpring = useSpring({
    opacity: showPlusOne ? 1 : 0,
    transform: showPlusOne ? 'translateY(0px)' : 'translateY(20px)',
    config: config.gentle,
    onRest: () => {
      if (showPlusOne) {
        setTimeout(() => setShowPlusOne(false), 500);
      }
    }
  });

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const getRandomEncouragement = (currentStreak: number) => {
    const messages = [
      'Amazing!',
      'Well done!',
      'Excellent!',
      'Keep it up!',
      'Fantastic!',
      'Brilliant!'
    ];

    let message = messages[Math.floor(Math.random() * messages.length)];
    
    if (currentStreak >= 3) {
      message += ` ${currentStreak} in a row! 🔥`;
    }
    
    return message;
  };

  const handleWrongCard = (question: string, answer: string) => {
    const newWrongCard: WrongCard = {
      question,
      answer,
      timestamp: new Date().toLocaleTimeString()
    };
    
    api.start({
      from: { x: -100 },
      to: { x: 0 },
      config: {
        mass: 1,
        tension: 180,
        friction: 12
      }
    });
    
    setWrongCards(prev => [newWrongCard, ...prev]);
    setStreak(0);
  };

  const handleCorrectAnswer = () => {
    setCorrectCount(prev => prev + 1);
    setShowPlusOne(true);
    
    const newStreak = streak + 1;
    setStreak(newStreak);
    
    if (Math.random() < 0.2 || newStreak >= 3) {
      setEncouragement(getRandomEncouragement(newStreak));
      setTimeout(() => {
        setEncouragement('');
      }, 2000);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setShowChat(false);
    onOpenChange(open);
  };

  // const handleInterruption = () => {
  //   setShowInterruption(true);
  // };

  // const handleKalypsoClick = () => {
  //   if (audioRef.current) {
  //     audioRef.current.pause();
  //     audioRef.current = null;
  //     setIsTypingComplete(false);
  //     setShowInterruption(false);
  //   }
  // };

  const handleClose = useCallback(() => {
    onOpenChange(false);
    if (roomId === 'WaitingRoom0') {
      return;
    }
    if (correctCount > 0) {
      const newActiveRooms = new Set([...activeRooms].filter(room => room !== roomId));
      if (newActiveRooms.size === 0) {
        handleCompleteAllRoom();
      }
      setActiveRooms(newActiveRooms);
    }
  }, [roomId, setActiveRooms, onOpenChange, correctCount]);

  const handleDownvote = () => {
    setIsFeedbackOpen(true);
  };

  const [showChat, setShowChat] = useState(false);

  const handleHintRequest = () => {
    setIsChatFocused(!showChat);
    setShowChat(prev => !prev);
  };

  const handleHideChat = () => {
    setIsChatFocused(false);
    setShowChat(false);
  };

  const handleQuestionChange = useCallback((question: Flashcard | null) => {
    if (!question) {
      setCurrentQuestionContext(null);
      return;
    }

    setCurrentQuestion(question);

    // Get the explanation from questionAnswerNotes
    let explanation = '';
    try {
      const notes = question.questionAnswerNotes;
      if (Array.isArray(notes)) {
        explanation = notes[0] || '';
      } else if (typeof notes === 'string') {
        try {
          const parsedNotes = JSON.parse(notes);
          explanation = Array.isArray(parsedNotes) ? parsedNotes[0] : notes;
        } catch {
          explanation = notes;
        }
      }
    } catch (e) {
      explanation = '';
    }

    if (question.questionType === 'normal') {
      const options = question.questionOptions || [];
      setCurrentQuestionContext({
        question: cleanQuestion(question.questionContent),
        correctAnswer: options[0] || '',
        explanation,
        otherOptions: options,
        type: 'normal'
      });
    } else {
      setCurrentQuestionContext({
        question: cleanQuestion(question.questionContent),
        correctAnswer: cleanAnswer(question.questionContent),
        explanation,
        otherOptions: [],
        type: 'flashcard'
      });
    }
  }, []);

  const [isChatFocused, setIsChatFocused] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Reset if answer is revealed
  useEffect(() => {
    if (isOpen) setIsAnswerRevealed(false);
  }, [isOpen]);

  useEffect(() => {
    setIsAnswerRevealed(false);
    handleHideChat();
  }, [currentQuestion]);

  useImperativeHandle(ref, () => ({
    open: () => onOpenChange(true),
    setWrongCards,
    setCorrectCount
  }));



  return (
    <>
      {buttonContent}
      <Dialog 
        open={isOpen} 
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="max-w-[90vw] h-[90vh] gradientbg border text-[--theme-text-color] border-[--theme-border-color] flex flex-col z-[100] focus:outline-none">
          <DialogHeader className="mb-2 flex-shrink-0 px-6">
            <DialogTitle className="w-full text-[--theme-hover-text] text-center items-center justify-center rounded-md bg-[--theme-hover-color] p-2 flex">
              <span className="flex-grow">
                {Array.isArray(roomToSubjectMap[roomId]) 
                  ? roomToSubjectMap[roomId].length === 1
                    ? roomToSubjectMap[roomId][0]
                    : roomToSubjectMap[roomId].join(' & ')
                  : roomToSubjectMap[roomId]
                } flashcards
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-grow min-h-0 relative flex-col">
            <div className="flex flex-grow min-h-0 px-6 space-x-4">
              {/* Flashcard Deck - Full width on mobile */}
              <div className={`${isMobile ? 'w-full' : 'w-2/3'} bg-[--theme-leaguecard-color] p-2 rounded-md flex flex-col`}>
                {/* Controls Section */}
                <div className="flex justify-between items-center p-4 mb-4">
                  {/* Left side - Score and Encouragement */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <animated.div 
                        style={counterSpring}
                        className="text-[--theme-hover-color] flex items-center justify-center"
                      >
                        <span className="text-5xl font-bold">
                          {correctCount}
                        </span>
                        <animated.span 
                          style={plusOneSpring}
                          className="absolute -right-8 top-0 text-green-500 font-bold text-2xl"
                        >
                          +1
                        </animated.span>
                      </animated.div>
                      {encouragement && (
                        <animated.div 
                          style={plusOneSpring}
                          className="absolute left-16 top-6 whitespace-nowrap text-green-500 font-bold text-xl"
                        >
                          {encouragement}
                        </animated.div>
                      )}
                    </div>
                  </div>
                  {/* Right side - Control Buttons */}
                  <div className="flex items-center space-x-2 ml-auto">
                    {/* Hint Button */}
                    {currentQuestionContext && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleHintRequest}
                              className="hover:bg-transparent text-[--theme-text-color] hover:text-[--theme-hover-color] transition-colors group"
                            >
                              <HelpCircle className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            {isAnswerRevealed ? "Explain answer" : "Get a hint"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {/* Downvote Button */}
                    {currentQuestionContext && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleDownvote}
                              className="hover:bg-transparent text-[--theme-text-color] hover:text-[--theme-hover-color] transition-colors group"
                            >
                              <ThumbsDown className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12 origin-[70%_30%]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>Report this question</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>

                {/* Flashcard content */}
                <div className="flex-grow overflow-y-auto">
                  <div className="h-full w-full flex items-center justify-center min-h-[60vh]">
                    <FlashcardDeck 
                      handleCompleteAllRoom={handleCompleteAllRoom}
                      roomId={roomId} 
                      onWrongAnswer={handleWrongCard}
                      onCorrectAnswer={handleCorrectAnswer}
                      activeRooms={activeRooms}
                      setActiveRooms={setActiveRooms}
                      currentUserTestId={currentUserTestId}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      onClose={handleClose}
                      onMCQAnswer={onMCQAnswer}
                      setTotalMCQQuestions={setTotalMCQQuestions}
                      onQuestionChange={handleQuestionChange}
                      onAnswerReveal={(revealed: boolean) => setIsAnswerRevealed(revealed)}
                      isChatFocused={isChatFocused}
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Kitty Litter (Hidden on mobile) */}
              {!isMobile && (
                <div className="w-1/3 bg-[--theme-leaguecard-color] p-3 rounded-md flex flex-col min-h-0 h-full">
                  {showChat ? (
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="flex justify-between items-center mb-2 flex-shrink-0 px-2">
                        <h3 className="text-lg font-semibold">Kalypso</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleHideChat}
                          className="text-[--theme-text-color] hover:text-[--theme-hover-color] whitespace-nowrap m-2"
                        >
                          Back to Kitty Litter
                        </Button>
                      </div>
                      <div className="flex-1 min-h-0 h-full">
                        <ChatBot
                          width="100%"
                          height="100%"
                          backgroundColor="var(--theme-leaguecard-color)"
                          mode={isAnswerRevealed ? "questionReview" : "hint"}
                          chatbotContext={{
                            contentTitle: "Kalypso",
                            context: currentQuestionContext 
                              ? `${currentQuestionContext.type === 'normal' 
                                  ? `Multiple Choice Question:\n${currentQuestionContext.question}\n\nOptions:\n${currentQuestionContext.otherOptions.join('\n')}`
                                  : `Flashcard Question:\n${currentQuestionContext.question}`
                                }${isAnswerRevealed ? `\n\nCorrect Answer: ${currentQuestionContext.correctAnswer}${
                                  currentQuestionContext.explanation ? `\n\nExplanation: ${currentQuestionContext.explanation}` : ''
                                }` : ''}`
                              : ""
                          }}
                          chatbotRef={chatbotRef}
                          onFocus={() => setIsChatFocused(true)}
                          onBlur={() => setIsChatFocused(false)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-2 flex-shrink-0">Kitty Litter</h3>
                      <ScrollArea className="flex-grow">
                        <div className="space-y-4">
                          {wrongCards.map((card, index) => (
                            <animated.div 
                              key={index} 
                              style={index === 0 ? springs : undefined}
                              className="p-4 border border-[--theme-border-color] rounded-md bg-[--theme-flashcard-color]"
                            >
                              <div className="text-sm text-[--theme-text-color] opacity-50 mb-2">{card.timestamp}</div>
                              <div className="font-semibold mb-2 text-[--theme-text-color]">{card.question}</div>
                              <div className="text-[--theme-hover-color] font-medium">{card.answer}</div>
                            </animated.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <DownvoteFeedback
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentUserTestId={currentUserTestId}
        currentQuestionId={currentQuestion?.id || null}
        currentQuestionContent={currentQuestion?.questionContent || null}
      />
    </>
  );
});


FlashcardsDialog.displayName = 'FlashcardsDialog';

export default FlashcardsDialog;
