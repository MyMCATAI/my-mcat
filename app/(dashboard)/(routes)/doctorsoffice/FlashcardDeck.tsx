'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, Undo2, Skull, Dumbbell } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react';
import ContentRenderer from '@/components/ContentRenderer';
import { FlattenedQuestionResponse } from '@/lib/question';
import { roomToSubjectMap } from './OfficeContainer';
import { roomToContentMap } from './OfficeContainer';

interface Flashcard {
  id: string;
  questionContent: string;
  questionOptions: string[];
  category: {
    subjectCategory: string;
    conceptCategory: string;
  };
  userResponses: Array<{ isCorrect: boolean; timeSpent: number }>;
}

interface FlashcardDeckProps {
  roomId: string;
  onWrongAnswer: (question: string, answer: string) => void;
  onCorrectAnswer: () => void;
}

const settings = {
  swipeThreshold: 0.5,
  rotationFactor: 10,
};

const physics = {
  touchResponsive: { friction: 50, tension: 2000 },
  animateBack: { friction: 10, tension: 200 }
};

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({roomId, onWrongAnswer, onCorrectAnswer}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const correctSound = useRef<HTMLAudioElement | null>(null);
  const whooshSound = useRef<HTMLAudioElement | null>(null);

  const flashcardsRef = useRef<Flashcard[]>([]);
  const currentCardIndexRef = useRef<number>(0);
  
  useEffect(() => {
    correctSound.current = new Audio('/correct.mp3');
    whooshSound.current = new Audio('/whoosh.mp3');
    
    // Set initial volume for both sounds
    if (correctSound.current) correctSound.current.volume = 0.3;
    if (whooshSound.current) whooshSound.current.volume = 0.3;
  }, []);

  const playSound = useCallback((sound: HTMLAudioElement) => {
    sound.currentTime = 0; // Reset the playback position
    sound.volume = 0.5; // Set volume to 30% (adjust this value between 0 and 1 as needed)
    sound.play().catch(e => console.error('Error playing sound:', e));
  }, []);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
      // Your existing flashcard fetching code
      const subjects = Array.isArray(roomToSubjectMap[roomId]) 
        ? roomToSubjectMap[roomId] 
        : roomToSubjectMap[roomId] || [];
      const contents = Array.isArray(roomToContentMap[roomId])
        ? roomToContentMap[roomId]
        : roomToContentMap[roomId] || [];
      
      const subjectParams = subjects
        .map(subject => `subjectCategory=${encodeURIComponent(subject.replace(/ /g, "_"))}`)
        .join('&');
      const contentParams = contents
        .map(content => `contentCategory=${encodeURIComponent(content.replace(/ /g, "_"))}`)
        .join('&');

      const pageNumber = 1;
      const pageSize = 10;

      const response = await fetch(`/api/question?${subjectParams}&${contentParams}&types=flashcard&page=${pageNumber}&pageSize=${pageSize}`);
      
      const data = await response.json();
      setCardStartTime(Date.now());

      const transformedFlashcards = data.questions.map((question: FlattenedQuestionResponse) => ({
        id: question.id,
        questionContent: question.questionContent,
        questionOptions: question.questionOptions || '',
        category: {
          subjectCategory: question.category_subjectCategory,
          conceptCategory: question.category_conceptCategory,
        },
        difficulty: question.difficulty || 1,
        tags: question.tags || [],
      }));

      setFlashcards(transformedFlashcards);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setIsLoading(false);
    }
  };
  
  const handleLinkClick = useCallback((href: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the click from bubbling up to the card
    console.log(href);
    window.open(href, '_blank', 'noopener,noreferrer');
  }, []);

  const handleCardClick = useCallback(() => {
    toggleReveal();
  }, []);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    console.log("Flashcards updated:", flashcards.length);
    flashcardsRef.current = flashcards;
  }, [flashcards]);
  
  useEffect(() => {
    currentCardIndexRef.current = currentCardIndex;
  }, [currentCardIndex]);

  

  const getQuestionContent = () => {
    if (flashcards.length === 0 || currentCardIndex >= flashcards.length) {
      return '';
    }
    
    const currentCard = flashcards[currentCardIndex];
    return currentCard.questionContent.replace(/{{(.*?)}}/g, '_________');
  };

  const getAnswerContent = () => {
    if (flashcards.length === 0 || currentCardIndex >= flashcards.length) {
      return '';
    }
    
    const currentCard = flashcards[currentCardIndex];
    const answerMatches = currentCard.questionContent.match(/{{c1::(.*?)}}/g);
    return answerMatches 
      ? answerMatches.map(match => match.slice(6, -2)).join(', ')
      : '';
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // Format: YYYY-MM-DDTHH-mm
  };

  const handleUserResponse = useCallback(async (action: 'correct' | 'incorrect' | 'weakness' | 'strength') => {
    const currentCard = flashcardsRef.current[currentCardIndexRef.current];
    const isCorrect = action === 'correct' || action === 'strength';

    if (currentCardIndexRef.current >= flashcardsRef.current.length) {
      return;
    }

    const timeSpent = Math.floor((Date.now() - cardStartTime)/1000);
    setCardStartTime(Date.now());

    if (isCorrect) {
      onCorrectAnswer();
      if (correctSound.current) {
        playSound(correctSound.current);
      }
    } else if (!isCorrect && whooshSound.current) {
      playSound(whooshSound.current);
      onWrongAnswer(
        currentCard.questionContent.replace(/{{(.*?)}}/g, '_________'),
        getAnswerContent()
      );
    }

    try {
      const requestBody = {
        questionId: currentCard.id,
        userAnswer: isCorrect ? 'Correct' : 'Incorrect', // currentCard.questionOptions[0], we need to figure out a regex to select the answer from this commented out code
        isCorrect,
        timeSpent,
        userNotes: `Action: ${action}`,
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('/api/user-test/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to save user response');
      }

    } catch (error) {
      console.error('Error saving flashcard response:', error);
    }
  }, [onCorrectAnswer, onWrongAnswer, playSound, cardStartTime]);

  const [{ opacity }, api] = useSpring(() => ({
    opacity: 1,
  }));

  const getSwipeDirection = (mx: number, my: number) => {
    const threshold = 50; // pixels
    if (Math.abs(mx) > Math.abs(my)) {
      return mx > threshold ? 'right' : mx < -threshold ? 'left' : 'none';
    } else {
      return my > threshold ? 'down' : my < -threshold ? 'up' : 'none';
    }
  };

  const handleSwipe = (direction: string) => {
    
    // Guard against empty flashcards
    if (flashcardsRef.current.length === 0) {
      console.log("No flashcards available");
      return;
    }

    // Check if we've gone through all cards
    if (currentCardIndex >= flashcardsRef.current.length) {
      console.log("All cards viewed");
      return;
    }

    api.start({
      opacity: 0,
      config: { duration: 200 },
      onRest: () => {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
        setIsRevealed(false);
        api.start({ opacity: 1 });
      }
    });

    switch (direction) {
      case 'left':
      case 'up':
        handleUserResponse(direction === 'up' ? 'weakness' : 'incorrect');
        break;
      case 'right':
      case 'down':
        handleUserResponse(direction === 'down' ? 'strength' : 'correct');
        break;
    }
  };

  const handleButtonAction = (action: string) => {
    switch (action) {
      case 'correct':
        handleSwipe('right');
        break;
      case 'incorrect':
        handleSwipe('left');
        break;
      case 'weakness':
        handleSwipe('up');
        break;
      case 'strength':
        handleSwipe('down');
        break;
      case 'undo':
        handlePrevious();
        break;
    }
  };

  const bind = useDrag(({ active, movement: [mx, my], velocity: [vx, vy], event, type }) => {
    const dir = getSwipeDirection(mx, my);
    const trigger = dir !== 'none';
    
    if (active) {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
      }
    } else if (!active && trigger) {
      handleSwipe(dir);
    } else if (!active && !trigger) {
      if (type === 'pointerup') {
        const timeout = setTimeout(() => {
          handleCardClick();
        }, 100);
        setClickTimeout(timeout);
      }
    }
    
    api.start({
      opacity: active ? 0.5 : 1,
      config: physics.touchResponsive,
    });
  });


  const handlePrevious = () => {
    const newCurrentIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    setCurrentCardIndex(newCurrentIndex);
    setNextCardIndex(currentCardIndex);
    setIsRevealed(false);
  };

  const toggleReveal = () => {
    setIsRevealed(prevState => !prevState);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleSwipe('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleSwipe('right');
          break;
        case ' ':
          event.preventDefault(); // Prevent page scroll
          toggleReveal();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {isLoading && flashcards.length === 0 ? (
        <div className="text-[--theme-text-color]">Loading flashcards...</div>
      ) : (
        <div className="w-full max-w-3xl px-4" {...bind()}>
          {flashcards.length - currentCardIndex > 0 && (
            <animated.div
              className="w-full cursor-pointer"
              style={{ opacity }}
              onClick={handleCardClick}
            >
              {/* Question Section */}
              <div className="w-full mb-8">
                <div className="w-full overflow-y-auto flex flex-col justify-center items-center">
                  <ContentRenderer 
                    content={getQuestionContent()} 
                    onLinkClick={handleLinkClick} 
                  />
                </div>
              </div>

              {/* Dividing Line */}
              <div className="w-full border-t border-gray-300 my-4" />

              {/* Answer Section */}
              <div className={`w-full transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-full overflow-y-auto flex flex-col justify-center items-center">
                  {isRevealed && (
                    <ContentRenderer 
                      content={getAnswerContent()} 
                      onLinkClick={handleLinkClick} 
                    />
                  )}
                </div>
              </div>
            </animated.div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardDeck;
 