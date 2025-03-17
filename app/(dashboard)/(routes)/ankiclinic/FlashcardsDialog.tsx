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
import { ThumbsDown, Cat } from 'lucide-react';
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
import { useGame } from '@/store/selectors';
import { useWindowSize } from '@/store/selectors';
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
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onMCQAnswer: (isCorrect: boolean) => void;
  setTotalMCQQuestions: React.Dispatch<React.SetStateAction<number>>;
}

const FlashcardsDialog = forwardRef<{ open: () => void, setWrongCards: (cards: any[]) => void, setCorrectCount: (count: number) => void }, FlashcardsDialogProps>(({
  isOpen,
  onOpenChange,
  roomId,
  buttonContent,
  isLoading,
  setIsLoading,
  onMCQAnswer,
  setTotalMCQQuestions,
}, ref) => {
  // Get state and actions from the Zustand store
  const { 
    setCorrectCount: storeSetCorrectCount, 
    setWrongCount: storeSetWrongCount, 
    correctCount: storeCorrectCount,
    activeRooms,
    setActiveRooms,
    currentUserTestId,
    setCompleteAllRoom
  } = useGame();
  
  // Local component state
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
  const [isChatFocused, setIsChatFocused] = useState(false);
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

  // For mobile responsiveness
  const windowSize = useWindowSize();
  const isMobile = !windowSize.isDesktop;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Handle complete all room directly with the store
  const handleCompleteAllRoom = useCallback(() => {
    setCompleteAllRoom(true);
  }, [setCompleteAllRoom]);

  const handleWrongAnswer = (question: string, correctAnswer: string) => {
    const newWrongCard = {
      question,
      answer: correctAnswer,
      timestamp: new Date().toISOString(),
    };
    
    setWrongCards((prev: WrongCard[]) => [newWrongCard, ...prev]);
    // Update the store's wrong count
    storeSetWrongCount(wrongCards.length + 1);
    setStreak(0);
  };

  const handleCorrectAnswer = () => {
    setLocalCorrectCount((prev: number) => prev + 1);
    // Update the store's correct count
    storeSetCorrectCount(localCorrectCount + 1);
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
    
    if (!open && isLoading) {
      setIsLoading(false);
    }
    
    onOpenChange(open);
    
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
    }
  };

  const handleHideChat = () => {
    setShowChat(false);
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <>
      {buttonContent}
      <Dialog 
        open={isOpen} 
        onOpenChange={handleOpenChange}
        modal
      >
        <DialogContent 
          className={`${
            isMobile ? 'max-w-[98vw] h-[85vh] p-3 overflow-hidden' : 'max-w-[80vw] h-[80vh]'
          } gradientbg border text-[--theme-text-color] border-[--theme-border-color] flex flex-col focus:outline-none rounded-xl`}
          onKeyDown={handleKeyDown}
        >
          <DialogHeader className={`mb-2 flex-shrink-0 ${isMobile ? 'px-2' : 'px-6'}`}>
            <DialogTitle className="w-full text-[--theme-hover-text] text-center items-center justify-center rounded-lg bg-[--theme-hover-color] p-2 flex">
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
          
          <div className="flex flex-grow flex-col min-h-0 overflow-y-hidden relative">
            <div className={`flex flex-grow min-h-0 ${isMobile ? 'px-2 flex-col' : 'px-6 flex-row'} space-x-4`}>
              {/* Flashcard Deck */}
              <div className={`${isMobile ? 'w-full' : 'w-2/3'} bg-[--theme-leaguecard-color] p-2 rounded-lg flex flex-col`}>
                {/* Controls Section */}
                <div className={`flex justify-between items-center ${isMobile ? 'p-2 mb-2' : 'p-4 mb-4'}`}>
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
                    {currentQuestionContext && !isMobile && (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={showChat ? handleHideChat : handleHint}
                              className="hover:bg-transparent text-[--theme-text-color] hover:text-[--theme-hover-color] transition-colors group"
                            >
                              <Cat className="h-5 w-5 transition-transform duration-300 origin-bottom group-hover:[animation:cat-nod_1s_ease-in-out_1]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            {showChat ? "Hide chat" : (isAnswerRevealed ? "Explain answer" : "Get a hint")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {/* Downvote Button */}
                    {currentQuestionContext && (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
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
                <div className={`flex-grow overflow-y-auto ${isMobile && 'max-h-[62vh]'}`}>
                  <div className="h-full w-full flex items-center justify-center overflow-hidden">
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
                      isChatFocused={isChatFocused}
                      isFeedbackOpen={isFeedbackOpen}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile toggle button for Kitty Litter drawer */}
              {isMobile && (
                <button
                  className="absolute bottom-4 right-4 z-40 bg-[--theme-gradient-startstreak] rounded-full p-3 shadow-lg flex items-center justify-center hover:bg-[--theme-hover-color] transition-colors text-[--theme-hover-text]"
                  style={{
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  }}
                  onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                  aria-label="Toggle Kitty Litter"
                >
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
                    </svg>
                    {wrongCards.length > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {wrongCards.length}
                      </div>
                    )}
                  </div>
                </button>
              )}

              {/* Right Side - Either fixed on desktop or drawer on mobile */}
              <div 
                className={`${
                  isMobile 
                    ? `fixed inset-x-0 bottom-0 top-auto z-50 transition-all duration-300 transform ${
                        isDrawerOpen 
                          ? 'translate-y-0 opacity-100' 
                          : 'translate-y-full opacity-0 pointer-events-none'
                      } rounded-t-2xl shadow-xl max-h-[80vh] overflow-hidden`
                    : 'w-1/3'
                } bg-[--theme-leaguecard-color] p-3 rounded-lg flex flex-col min-h-0 h-full border border-[--theme-border-color]`}
                style={{
                  // Ensure consistent theme styling
                  backgroundColor: 'var(--theme-leaguecard-color)',
                  boxShadow: isDrawerOpen ? '0 -4px 20px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                {/* Mobile drawer backdrop and close button */}
                {isMobile && isDrawerOpen && (
                  <>

                    {/* Drag handle indicator */}
                    <div className="flex justify-center items-center mb-2">
                      <div className="w-12 h-1 bg-[--theme-border-color] rounded-full"></div>
                    </div>
                    
                    <button
                      className="absolute bottom-3 right-3 bg-[--theme-gradient-startstreak] hover:bg-[--theme-hover-color] rounded-full p-2 z-50 transition-colors text-[--theme-hover-text]"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </>
                )}

                {/* Original chat/kitty litter content */}
                {showChat ? (
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex justify-between items-center mb-2 flex-shrink-0 px-6">
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
                        onFocus={() => setIsChatFocused(true)}
                        onBlur={() => setIsChatFocused(false)}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`flex justify-between items-center ${isMobile ? 'mb-2 mt-1 px-1' : 'mb-2'}`}>
                      <h3 className="text-lg font-semibold text-[--theme-text-color]">Kitty Litter</h3>
                    </div>
                    <ScrollArea className={`flex-grow ${isMobile ? 'max-h-[60vh]' : ''} pr-2`}>
                      <div className="space-y-4">
                        {wrongCards.length > 0 ? (
                          wrongCards.map((card, index) => (
                            <animated.div 
                              key={index} 
                              style={index === 0 ? springs : undefined}
                              className="p-4 border border-[--theme-border-color] rounded-lg bg-[--theme-flashcard-color] shadow-sm"
                            >
                              <div className="font-semibold mb-2 text-[--theme-text-color]">{card.question}</div>
                              <div className="text-[--theme-hover-color] font-medium">{card.answer}</div>
                            </animated.div>
                          ))
                        ) : (
                          <div className="text-center p-6 text-[--theme-text-color]/60 italic rounded-lg border border-dashed border-[--theme-border-color]">
                            Questions you get wrong will appear here
                          </div>
                        )}
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
