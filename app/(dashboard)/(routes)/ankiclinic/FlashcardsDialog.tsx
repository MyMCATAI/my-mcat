import React, { useState, forwardRef, useImperativeHandle, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
import { useGame } from "@/store/selectors";
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
  // Get the store's actions
  const { setCorrectCount: storeSetCorrectCount, setWrongCount: storeSetWrongCount, correctCount: storeCorrectCount } = useGame();
  
  const [wrongCards, setWrongCards] = useState<WrongCard[]>([]);
  const [localCorrectCount, setLocalCorrectCount] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [streak, setStreak] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  // const [showInterruption, setShowInterruption] = useState(false);
  // const [isTypingComplete, setIsTypingComplete] = useState(false);
  // const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Flashcard | null>(null);
  const [currentQuestionContext, setCurrentQuestionContext] = useState<QuestionContext | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const chatbotRef = useRef<{
    sendMessage: (message: string) => void;
  }>({ sendMessage: () => {} });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

  const [showChat, setShowChat] = useState(false);

  const handleWrongAnswer = (question: string, correctAnswer: string) => {
    const newWrongCard = {
      question,
      answer: correctAnswer,
      timestamp: new Date().toISOString(),
    };
    
    setWrongCards(prev => [newWrongCard, ...prev]);
    // Update the store's wrong count
    storeSetWrongCount(wrongCards.length + 1);
    setStreak(0);
  };

  const handleCorrectAnswer = () => {
    // Update local state for UI
    setLocalCorrectCount(prev => {
      const newCount = prev + 1;
      // Don't update store state directly here - will do it in useEffect
      return newCount;
    });
    
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

  // Update store state when localCorrectCount changes
  useEffect(() => {
    // Update store state
    storeSetCorrectCount(localCorrectCount);
  }, [localCorrectCount, storeSetCorrectCount]);

  const handleOpenChange = (open: boolean) => {
    console.log(`[FlashcardsDialog] handleOpenChange called with open=${open}`);
    setShowChat(false);
    
    // If we're closing the dialog, ensure isLoading is false to allow audio transition
    if (!open && isLoading) {
      console.log(`[FlashcardsDialog] Setting isLoading to false to ensure audio transition`);
      setIsLoading(false);
    }
    
    // Make sure we're updating both the local component state and the global state
    console.log(`[FlashcardsDialog] Calling onOpenChange(${open})`);
    onOpenChange(open);
    
    // If we're closing the dialog, also reset the flashcardRoomId in the parent component
    if (!open) {
      console.log(`[FlashcardsDialog] Dialog is closing`);
      // We don't need to do anything else here - the parent component will handle
      // the audio transition when isFlashcardsOpen changes
    } else {
      console.log(`[FlashcardsDialog] Dialog is opening for roomId=${roomId}`);
    }
  };

  const handleClose = useCallback(() => {
    onOpenChange(false);
    if (roomId === 'WaitingRoom0') {
      return;
    }
    if (localCorrectCount > 0) {
      // Create a new Set by filtering out the current roomId
      const newActiveRooms = new Set([...activeRooms].filter(room => room !== roomId));
      
      // Update the activeRooms in the store
      setActiveRooms(newActiveRooms);
      
      // If all rooms are completed, call handleCompleteAllRoom
      if (newActiveRooms.size === 0) {
        handleCompleteAllRoom();
      }
    }
  }, [roomId, setActiveRooms, onOpenChange, localCorrectCount, activeRooms, handleCompleteAllRoom]);

  const handleDownvote = () => {
    setIsFeedbackOpen(true);
  };

  const handleHint = () => {
    if (currentQuestion) {
      setShowChat(true);
      setIsAnswerRevealed(true);
      const cleanedQuestion = cleanQuestion(currentQuestion.questionContent);
      
      // Determine the correct answer based on question type
      let correctAnswer = '';
      if (currentQuestion.questionType === 'normal' && currentQuestion.questionOptions?.length > 0) {
        correctAnswer = currentQuestion.questionOptions[0];
      } else {
        correctAnswer = cleanAnswer(currentQuestion.questionContent);
      }
      
      const cleanedAnswer = cleanAnswer(correctAnswer);
      
      const message = `I need help understanding this question: "${cleanedQuestion}". The correct answer is "${cleanedAnswer}". Can you explain why this is the correct answer?`;
      
      setTimeout(() => {
        chatbotRef.current?.sendMessage(message);
      }, 500);
    }
  };

  const handleShowChat = () => {
    setShowChat(true);
  };

  const handleHideChat = () => {
    setShowChat(false);
    setIsAnswerRevealed(false);
  };

  const getRandomEncouragement = (streak: number) => {
    const encouragements = [
      'Great job!',
      'Keep it up!',
      'You\'re on fire!',
      'Excellent!',
      'Fantastic!',
      'Amazing!',
      'Brilliant!',
      'Superb!',
      'Outstanding!',
      'Impressive!'
    ];
    
    const streakEncouragements = [
      'Streak x2!',
      'Streak x3!',
      'Streak x4!',
      'Streak x5!',
      'Unstoppable!'
    ];
    
    if (streak >= 3 && streak <= 7) {
      return streakEncouragements[Math.min(streak - 3, streakEncouragements.length - 1)];
    }
    
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  useEffect(() => {
    if (showPlusOne) {
      setTimeout(() => setShowPlusOne(false), 1000);
    }
  }, [showPlusOne]);

  // Reset if answer is revealed
  useEffect(() => {
    if (isOpen) setIsAnswerRevealed(false);
  }, [isOpen]);

  useEffect(() => {
    if (currentQuestion) {
      // Determine the correct answer based on question type
      let correctAnswer = '';
      if (currentQuestion.questionType === 'normal' && currentQuestion.questionOptions?.length > 0) {
        correctAnswer = currentQuestion.questionOptions[0];
      } else {
        correctAnswer = cleanAnswer(currentQuestion.questionContent);
      }

      // Extract explanation from questionAnswerNotes
      let explanation = '';
      if (currentQuestion.questionAnswerNotes) {
        // Handle both string and string[] types
        if (Array.isArray(currentQuestion.questionAnswerNotes)) {
          explanation = currentQuestion.questionAnswerNotes[0] || '';
        } else {
          explanation = currentQuestion.questionAnswerNotes;
        }
      }

      setCurrentQuestionContext({
        question: currentQuestion.questionContent,
        correctAnswer: correctAnswer,
        explanation: explanation,
        otherOptions: currentQuestion.questionOptions && Array.isArray(currentQuestion.questionOptions) 
          ? currentQuestion.questionOptions.filter(opt => opt !== correctAnswer)
          : [],
        type: currentQuestion.questionType
      });
    } else {
      setCurrentQuestionContext(null);
      handleHideChat();
    }
  }, [currentQuestion]);

  useImperativeHandle(ref, () => ({
    open: () => onOpenChange(true),
    setWrongCards,
    setCorrectCount: (count: number) => {
      setLocalCorrectCount(count);
      storeSetCorrectCount(count);
    }
  }));

  return (
    <>
      {buttonContent}
      <Dialog 
        open={isOpen} 
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="max-w-[80vw] h-[80vh] gradientbg border text-[--theme-text-color] border-[--theme-border-color] flex flex-col z-[100] focus:outline-none">
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
            <DialogDescription className="sr-only">
              Flashcard practice for {roomId ? roomToSubjectMap[roomId] || 'selected topic' : 'selected topic'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-grow min-h-0 relative flex-col">
            <div className="flex flex-grow min-h-0 px-6 space-x-4">
              {/* Flashcard Deck */}
              <div className="w-2/3 bg-[--theme-leaguecard-color] p-2 rounded-md flex flex-col">
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
                          {localCorrectCount}
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
                              onClick={handleHint}
                              className="hover:bg-transparent text-[--theme-text-color] hover:text-[--theme-hover-color] transition-colors group"
                            >
                              <HelpCircle className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            {showChat ? "Hide Chat" : "Get a hint"}
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
                      onWrongAnswer={handleWrongAnswer}
                      onCorrectAnswer={handleCorrectAnswer}
                      activeRooms={activeRooms}
                      setActiveRooms={setActiveRooms}
                      currentUserTestId={currentUserTestId}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      onClose={handleClose}
                      onMCQAnswer={onMCQAnswer}
                      setTotalMCQQuestions={setTotalMCQQuestions}
                      onQuestionChange={(question) => setCurrentQuestion(question)}
                      onAnswerReveal={(revealed: boolean) => setIsAnswerRevealed(revealed)}
                      isChatFocused={showChat}
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Toggleable Chat/Kitty Litter */}
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
                            ? `${
                                currentQuestionContext.type === 'normal' 
                                ? `Multiple Choice Question:\n${currentQuestionContext.question}\n\nOptions:\n${currentQuestionContext.otherOptions.join('\n')}`
                                : `Flashcard Question:\n${currentQuestionContext.question}`
                              }${isAnswerRevealed ? `\n\nCorrect Answer: ${currentQuestionContext.correctAnswer}${
                                currentQuestionContext.explanation ? `\n\nExplanation: ${currentQuestionContext.explanation}` : ''
                              }` : ''}`
                            : ""
                        }}
                        chatbotRef={chatbotRef}
                        onFocus={() => {}}
                        onBlur={() => {}}
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
