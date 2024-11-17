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
  questionType: string;
  id: string;
  questionContent: string;
  questionOptions: string[];
  categoryId: string;
  category: {
    subjectCategory: string;
    conceptCategory: string;
  };
  userResponses: Array<{ isCorrect: boolean; timeSpent: number }>;
  questionAnswerNotes?: string;
}

interface FlashcardDeckProps {
  roomId: string;
  onWrongAnswer: (question: string, answer: string) => void;
  onCorrectAnswer: () => void;
  activeRooms: Set<string>;
  setActiveRooms: React.Dispatch<React.SetStateAction<Set<string>>>;
  currentUserTestId: string | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

const physics = {
  touchResponsive: { friction: 50, tension: 2000 },
  animateBack: { friction: 10, tension: 200 }
};

export const cleanQuestion = (text: string): string => {
  const cleanedContent = text.replace(/\.\.\.[^}]*(?=}})/g, '');
  const answerMatches = cleanedContent.replace(/{{c1::(.*?)}}/g, '_________');
  const finalAnswer = answerMatches.replace(/{{c1::|}}/g, '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .trim();
  return finalAnswer;
};

// Add the interface for our extended array type
interface OptionsArray extends Array<string> {
  correctIndex?: number;
}

// Add the shuffle function at the top of the file with other utility functions
const shuffleArray = (array: string[]): OptionsArray => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray as OptionsArray;
};

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  roomId, 
  onWrongAnswer, 
  onCorrectAnswer,
  activeRooms,
  setActiveRooms,
  currentUserTestId,
  isLoading,
  setIsLoading,
  onClose,
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [isRevealed, setIsRevealed] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const correctSound = useRef<HTMLAudioElement | null>(null);
  const whooshSound = useRef<HTMLAudioElement | null>(null);
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);

  const flashcardsRef = useRef<Flashcard[]>([]);
  const currentCardIndexRef = useRef<number>(0);
  
  const [shuffledOptions, setShuffledOptions] = useState<{ options: string[], correctIndex: number }>({ options: [], correctIndex: -1 });

  useEffect(() => {
    correctSound.current = new Audio('/correct.mp3');
    whooshSound.current = new Audio('/whoosh.mp3');
    
    // Set initial volume for both sounds
    if (correctSound.current) correctSound.current.volume = 0.3;
    if (whooshSound.current) whooshSound.current.volume = 0.3;
  }, []);

  const handleDeckComplete = useCallback(() => {
    if (!isDeckCompleted) {
      setIsDeckCompleted(true);
      setActiveRooms(prev => new Set([...prev].filter(room => room !== roomId)));
    }
  }, [roomId, setActiveRooms, isDeckCompleted]);

  useEffect(() => {
    if (currentCardIndex >= flashcards.length && flashcards.length > 0 && !isDeckCompleted) {
      handleDeckComplete();
    }
  }, [currentCardIndex, flashcards.length, handleDeckComplete, isDeckCompleted]);

  const playSound = useCallback((sound: HTMLAudioElement) => {
    sound.currentTime = 0; // Reset the playback position
    sound.volume = 0.5; // Set volume to 30% (adjust this value between 0 and 1 as needed)
    sound.play().catch(e => console.error('Error playing sound:', e));
  }, []);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
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
      const response = await fetch(`/api/question?${subjectParams}&${contentParams}&types=flashcard,normal&page=${pageNumber}&pageSize=${pageSize}`);
      
      const data = await response.json();
      console.log("data",data)
      setCardStartTime(Date.now());

      const transformedFlashcards = data.questions.map((question: FlattenedQuestionResponse) => {
        let options: string[] = [];
        if (question.types === 'normal' && question.questionOptions) {
          try {
            options = JSON.parse(question.questionOptions);
          } catch (e) {
            console.error('Error parsing question options:', e);
            options = [];
          }
        }

        return {
          id: question.id,
          questionContent: question.questionContent,
          questionOptions: options,
          questionType: question.types || 'normal',
          categoryId: question.categoryId,
          category: {
            subjectCategory: question.category_subjectCategory,
            conceptCategory: question.category_conceptCategory,
          },
          difficulty: question.difficulty || 1,
          tags: question.tags || [],
          questionAnswerNotes: question.questionAnswerNotes,
        };
      });

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
    let mounted = true;
    
    const fetch = async () => { 
      if (mounted) {
        await fetchFlashcards();
      }
    };
    
    fetch();
    
    return () => { // Cleanup function to prevent double rendering
      mounted = false;
    };
  }, []);

  useEffect(() => {
    console.log("Flashcards updated:", flashcards.length);
    flashcardsRef.current = flashcards;
  }, [flashcards]);
  
  useEffect(() => {
    currentCardIndexRef.current = currentCardIndex;
  }, [currentCardIndex]);

  useEffect(() => {
    if (flashcards[currentCardIndex]?.questionType === 'normal' && 
        flashcards[currentCardIndex]?.questionOptions?.length > 0) {
      setShuffledOptions(getShuffledOptions(flashcards[currentCardIndex].questionOptions));
    }
  }, [currentCardIndex, flashcards]);

  const getQuestionContent = () => {
    if (flashcards.length === 0 || currentCardIndex >= flashcards.length) {
      return '';
    }
    
    const currentCard = flashcards[currentCardIndex];
    return currentCard.questionContent.replace(/{{(.*?)}}/g, '_________');
  };

  

  const cleanAnswer = (text: string): string => {
    const matches = [...text.matchAll(/{{c[^:]*::(.+?)(?=::|}})/g)];
    const result = matches.map(match => match[1]).join(', ');
    
    return result
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .trim();
  };

  const getAnswerContent = () => {
    if (flashcards.length === 0 || currentCardIndex >= flashcards.length) {
      return '';
    }
    
    const currentCard = flashcards[currentCardIndex];
    
    // For normal (multiple choice) questions
    if (currentCard.questionType === 'normal' && currentCard.questionOptions?.length > 0) {
      const correctOption = currentCard.questionOptions[0];
      return `Correct Answer: ${correctOption}`;
    }
    
    // For flashcard questions
    return cleanAnswer(currentCard.questionContent);
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
        cleanQuestion(currentCard.questionContent),
        getAnswerContent()
      );
    }

    try {
      const requestBody = {
        questionId: currentCard.id,
        categoryId: currentCard.categoryId,  // Add this line
        userAnswer: isCorrect ? 'Correct' : 'Incorrect', // currentCard.questionOptions[0], we need to figure out a regex to select the answer from this commented out code
        isCorrect,
        timeSpent,
        userNotes: `Action: ${action}`,
        userTestId: currentUserTestId,
      };
      
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

  // Add this new function to handle option shuffling at render time
  const getShuffledOptions = (options: string[]) => {
    const shuffledOptions = shuffleArray([...options]);
    const correctAnswer = options[0]; // First option is always correct
    return {
      options: shuffledOptions,
      correctIndex: shuffledOptions.indexOf(correctAnswer)
    };
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {isLoading && flashcards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
          <div className="text-[--theme-text-color]">Curating flashcards for you...</div>
        </div>
      ) : isDeckCompleted ? (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="text-[--theme-text-color] text-xl font-semibold">
            {"🎉 Great work! You've completed this flashcard deck."}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <Check size={18} />
            Continue Learning
          </button>
        </div>
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
                  
                  {/* Add options display for normal questions */}
                  {flashcards[currentCardIndex]?.questionType === 'normal' && 
                   flashcards[currentCardIndex]?.questionOptions?.length > 0 && (
                    <div className="w-full mt-4 space-y-2">
                      {shuffledOptions.options.map((option: string, index: number) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border ${
                            isRevealed && index === shuffledOptions.correctIndex
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dividing Line */}
              <div className="w-full border-t border-gray-300 my-4" />

              {/* Answer Section */}
              <div className={`w-full transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-full overflow-y-auto flex flex-col justify-center items-center">
                  {isRevealed && (
                    <>
                      <div className="text-lg font-semibold mb-2 text-green-600">
                        {flashcards[currentCardIndex]?.questionType === 'normal' ? 'Correct Answer:' : 'Answer:'}
                      </div>
                      <ContentRenderer 
                        content={getAnswerContent()} 
                        onLinkClick={handleLinkClick} 
                      />
                      {flashcards[currentCardIndex]?.questionType === 'normal' && 
                       flashcards[currentCardIndex]?.questionOptions?.length > 0 && (
                        <div className="mt-4 text-gray-600">
                          <p className="text-sm">Explanation:</p>
                          <p>
                            {(() => {
                              try {
                                const notes = JSON.parse(flashcards[currentCardIndex].questionAnswerNotes || '[]');
                                return Array.isArray(notes) && notes.length > 0 ? notes[0] : 'No additional explanation available.';
                              } catch (e) {
                                return 'No additional explanation available.';
                              }
                            })()}
                          </p>
                        </div>
                      )}
                    </>
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
 