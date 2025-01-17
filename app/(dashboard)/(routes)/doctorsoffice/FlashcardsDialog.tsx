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
import { roomToSubjectMap } from './OfficeContainer';
import { ThumbsDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
// import Interruption from './Interruption';

interface WrongCard {
  question: string;
  answer: string;
  timestamp: string;
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

  const handleDownvote = async () => {
    if (!currentQuestion || !currentUserTestId) return;

    try {
      // Check if the UserResponse exists
      const response = await fetch(`/api/user-test/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTestId: currentUserTestId,
          questionId: currentQuestion.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create or fetch user response");
      }

      const userResponseData = await response.json();

      // Now perform the PUT request to update the flagged status
      const updateResponse = await fetch("/api/user-test/response", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userResponseData.id, // Use the correct UserResponse ID
          flagged: true,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update question flag status");
      }

      toast.success("Question reported! Thank you for helping us improve.");

      const msgresponse = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Question Downvoted\n\nQuestion ID: ${currentQuestion.id}\nQuestion Content: ${currentQuestion.questionContent}\n\nThis question was automatically flagged for review through the downvote system.`,
        }),
      });

      if (!msgresponse.ok) {
        throw new Error("Failed to send downvote message");
      }
    } catch (error) {
      console.error("Error sending downvote:", error);
      toast.error("Failed to send feedback. Please try again.");
    }
  };

  useImperativeHandle(ref, () => ({
    open: () => onOpenChange(true),
    setWrongCards,
    setCorrectCount
  }));

  return (
    <>
      {buttonContent}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[80vw] h-[80vh] gradientbg border text-[--theme-text-color] border-[--theme-border-color] flex flex-col z-[100]">
          <DialogHeader className="mb-2 flex-shrink-0">
            <DialogTitle className="text-[--theme-hover-text] text-center items-center justify-center rounded-md bg-[--theme-hover-color] p-2 flex">
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
          
          <div className="flex flex-grow min-h-0 relative">
            <div className="absolute top-4 left-6 z-10 flex justify-between items-start" style={{ width: 'calc(100% - 33.33% - 2rem)' }}>
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

              {currentQuestion && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownvote}
                        className="hover:bg-transparent text-[--theme-text-color] hover:text-[--theme-hover-color] mr-4 mt-2 transition-colors"
                      >
                        <ThumbsDown className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Report this question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="w-2/3 pr-2 flex flex-col h-full relative">
              <div className="flex-grow bg-[--theme-leaguecard-color] p-2 rounded-md flex flex-col h-full">
                <ScrollArea className="h-full">
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
                      onQuestionChange={setCurrentQuestion}
                    />
                  </div>
                </ScrollArea>
              </div>

              {/* Comment out Interruption component
              <Interruption 
                isVisible={showInterruption}
                onClose={() => setShowInterruption(false)}
                message="Oh! A patient needs your help! 🏥 Quick!"
                imageUrl="/kalypsodistressed.gif"
                duration={5000}
                position="top-left"
              />
              */}
            </div>
            
            <div className="w-1/3 flex flex-col min-h-0">
              <div className="flex-grow bg-[--theme-leaguecard-color] p-3 rounded-md flex flex-col min-h-0">
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
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

FlashcardsDialog.displayName = 'FlashcardsDialog';

export default FlashcardsDialog;
