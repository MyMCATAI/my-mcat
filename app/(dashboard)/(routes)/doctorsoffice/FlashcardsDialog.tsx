import React, { useState, forwardRef, useImperativeHandle, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import FlashcardDeck from './FlashcardDeck';
import { useSpring, animated, config } from '@react-spring/web';
import { TestTube2 } from 'lucide-react';
import Interruption from './Interruption';
import { roomToSubjectMap } from './OfficeContainer';
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
}

const FlashcardsDialog = forwardRef<{ open: () => void }, FlashcardsDialogProps>(({
  isOpen,
  onOpenChange,
  roomId,
  buttonContent,
}, ref) => {
  const [wrongCards, setWrongCards] = useState<WrongCard[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [streak, setStreak] = useState(0);
  const [encouragement, setEncouragement] = useState('');
  const [showInterruption, setShowInterruption] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleInterruption = () => {
    setShowInterruption(true);
  };

  const handleKalypsoClick = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsTypingComplete(false);
      setShowInterruption(false);
    }
  };

  useImperativeHandle(ref, () => ({
    open: () => onOpenChange(true)
  }));

  return (
    <>
      {buttonContent}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[80vw] h-[80vh] gradientbg border text-[--theme-text-color] border-[--theme-border-color] flex flex-col z-[100]">
          <DialogHeader className="mb-2 flex-shrink-0">
            <DialogTitle className="text-[--theme-hover-text] text-center items-center justify-center rounded-md bg-[--theme-hover-color] p-2 flex">
              <span className="flex-grow">
                {roomToSubjectMap[roomId]} flashcards
              </span>
              <button 
                onClick={handleInterruption}
                className="hover:bg-[--theme-leaguecard-color] rounded-md p-1.5 transition-colors"
                title="Test Interruption"
              >
                <TestTube2 className="h-5 w-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-grow min-h-0 relative">
            <div className="absolute top-4 left-6 z-10">
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

            <div className="w-2/3 pr-2 flex flex-col min-h-0 relative">
              <div className="flex-grow bg-[--theme-leaguecard-color] p-2 rounded-md flex flex-col min-h-0">
                <ScrollArea className="flex-grow h-full">
                  <div className="h-full w-full flex items-center justify-center min-h-[500px]">
                    <FlashcardDeck 
                      roomId={roomId} 
                      onWrongAnswer={handleWrongCard}
                      onCorrectAnswer={handleCorrectAnswer}
                    />
                  </div>
                </ScrollArea>
              </div>

              <Interruption 
                isVisible={showInterruption}
                onClose={() => setShowInterruption(false)}
                message="Oh! A patient needs your help! 🏥 Quick!"
                imageUrl="/kalypsodistressed.gif"
                duration={5000}
                position="top-left"
              />
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
                        className="p-4 border border-[--theme-border-color] rounded-md"
                      >
                        <div className="text-sm text-gray-500 mb-2">{card.timestamp}</div>
                        <div className="font-semibold mb-2">{card.question}</div>
                        <div className="text-[--theme-hover-text]">{card.answer}</div>
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
