//app/(dashboard)/(routes)/ankiclinic/FlashcardDeck.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react';
import ContentRenderer from '@/components/ContentRenderer';
import { FlattenedQuestionResponse } from '@/lib/question';
import toast from 'react-hot-toast';
import { tutorialQuestions } from './constants/tutorialQuestions';
import { roomToContentMap, roomToSubjectMap } from './constants';
import { cleanQuestion, cleanAnswer } from './utils/testUtils';
import { cn } from '@/lib/utils';
import { useAudio } from '@/contexts/AudioContext';
import FlashcardSummary from './components/FlashcardSummary';

/* -------------------------------------------- Types --------------------------------------------- */
export interface Flashcard {
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
  questionAnswerNotes?: string | string[];
  links?: string[]
}

interface CategoryPerformance {
  total: number;
  correct: number;
  incorrect: number;
  successRate: number;
  categoryId: string;
}

interface CategoryStats {
  [key: string]: CategoryPerformance;
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
  onMCQAnswer?: (correct: boolean) => void;
  handleCompleteAllRoom: () => void;
  setTotalMCQQuestions: React.Dispatch<React.SetStateAction<number>>;
  onQuestionChange?: (question: Flashcard | null) => void;
  onAnswerReveal?: (revealed: boolean) => void;
  isChatFocused?: boolean;
}

interface OptionsArray extends Array<string> {
  correctIndex?: number;
}

/* -------------------------------------------- Constants ------------------------------------------- */
const physics = {
  touchResponsive: { friction: 50, tension: 2000 },
  animateBack: { friction: 10, tension: 200 }
};

const showAnswerCheckReminder = () => {
  toast.error("Please check the answer first");
};

/* ------------------------------------------- Utilities ------------------------------------------ */
const shuffleArray = (array: string[]): OptionsArray => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray as OptionsArray;
};

const shuffleFlashcards = (array: Flashcard[]): Flashcard[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/* ----------------------------------------- Component ------------------------------------------- */
const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ roomId, onWrongAnswer, onCorrectAnswer, 
  activeRooms, setActiveRooms, currentUserTestId, isLoading, setIsLoading, onClose, onMCQAnswer,
  handleCompleteAllRoom, setTotalMCQQuestions, onQuestionChange, onAnswerReveal, isChatFocused = false }): JSX.Element => {

/* -------------------------------------------- State -------------------------------------------- */
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [isRevealed, setIsRevealed] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);
  const [hasSeenAnswer, setHasSeenAnswer] = useState(false);
  const [answeredMCQ, setAnsweredMCQ] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<{ options: string[], correctIndex: number }>({ options: [], correctIndex: -1 });
  const [selectedOption, setSelectedOption] = useState<number>(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [weakestCategory, setWeakestCategory] = useState<string | null>(null);

/* -------------------------------------------- Refs --------------------------------------------- */
  const flashcardsRef = useRef<Flashcard[]>([]);
  const currentCardIndexRef = useRef<number>(0);
  const answerSectionRef = useRef<HTMLDivElement>(null);
  const questionContainerRef = useRef<HTMLDivElement>(null);
  const isMCQ = flashcards[currentCardIndex]?.questionType === 'normal';
  const { playSound } = useAudio();

/* ------------------------------------------ Callbacks ------------------------------------------ */
  const handleDeckComplete = useCallback(() => {
    if (!isDeckCompleted) {
      setIsDeckCompleted(true);
      
      if (roomId === 'WaitingRoom0') {
        return;
      }

      const newActiveRooms = new Set([...activeRooms].filter(room => room !== roomId));
      setActiveRooms(newActiveRooms);

      if (newActiveRooms.size === 0) {
        handleCompleteAllRoom();
      }
    }
  }, [roomId, setActiveRooms, isDeckCompleted, handleCompleteAllRoom, activeRooms]);

  const getAnswerContent = useCallback(() => {
    if (flashcards.length === 0 || currentCardIndex >= flashcards.length) {
      return '';
    }
    const currentCard = flashcards[currentCardIndex];
    // For normal (multiple choice) questions
    if (currentCard.questionType === 'normal' && currentCard.questionOptions?.length > 0) {
      const correctOption = currentCard.questionOptions[0];
      return correctOption;
    }
    // For flashcard questions
    return cleanAnswer(currentCard.questionContent);
  }, [flashcards, currentCardIndex]);

  const updateCategoryStats = useCallback((category: string, isCorrect: boolean, categoryId: string) => {
    setCategoryStats(prevStats => {
      const currentStats = prevStats[category] || { 
        total: 0, 
        correct: 0, 
        incorrect: 0, 
        successRate: 0, 
        categoryId 
      };
      const newStats = {
        ...currentStats,
        total: currentStats.total + 1,
        correct: currentStats.correct + (isCorrect ? 1 : 0),
        incorrect: currentStats.incorrect + (isCorrect ? 0 : 1),
        categoryId,
      };
      newStats.successRate = (newStats.correct / newStats.total) * 100;
      
      return {
        ...prevStats,
        [category]: newStats
      };
    });
  }, []);

  const handleUserResponse = useCallback(async (action: 'correct' | 'incorrect' | 'weakness' | 'strength') => {
    const currentCard = flashcardsRef.current[currentCardIndexRef.current];
    const isCorrect = action === 'correct' || action === 'strength';

    if (currentCardIndexRef.current >= flashcardsRef.current.length) {
      return;
    }

    // Update category stats with categoryId
    const category = currentCard.category.conceptCategory;
    updateCategoryStats(category, isCorrect, currentCard.categoryId);

    const timeSpent = Math.floor((Date.now() - cardStartTime)/1000);
    setCardStartTime(Date.now());

    // Handle sound effects and callbacks
    if (isCorrect) {
      onCorrectAnswer();
      playSound('correct');
    } else {
      playSound('whoosh');
      onWrongAnswer(
        cleanQuestion(currentCard.questionContent),
        getAnswerContent()
      );
    }

    // Skip API request for tutorial questions
    if (roomId === 'WaitingRoom0') {
      return;
    }

    // Make API request for non-tutorial questions
    try {
      const requestBody = {
        questionId: currentCard.id,
        categoryId: currentCard.categoryId,
        userAnswer: isCorrect ? 'Correct' : 'Incorrect',
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
  }, [onCorrectAnswer, onWrongAnswer, cardStartTime, roomId, currentUserTestId, playSound, getAnswerContent, updateCategoryStats]);

  const toggleReveal = useCallback(() => {
    if (isMCQ) return;
    playSound('flashcard-spacebar-reveal');
    const newRevealState = !isRevealed;
    setIsRevealed(newRevealState);
    onAnswerReveal?.(newRevealState);
    setHasSeenAnswer(true);
  }, [isMCQ, isRevealed, onAnswerReveal, playSound]);


/* ------------------------------------ Animations Functions ------------------------------------ */
  const [{ opacity }, api] = useSpring(() => ({
    opacity: 1,
  }));

  const handleSwipe = useCallback((direction: string) => {
    // Add check for revealed answer
    if (!hasSeenAnswer) {
      showAnswerCheckReminder();
      return;
    }
    
    // Guard against empty flashcards
    if (flashcardsRef.current.length === 0) {
      return;
    }
  
    // Check if we've gone through all cards
    if (currentCardIndex >= flashcardsRef.current.length) {
      return;
    }
  
    setIsTransitioning(true);
    api.start({
      opacity: 0,
      config: { duration: 200 },
      onRest: () => {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
        setIsRevealed(false);
        setSelectedOption(-1);
        api.start({ 
          opacity: 1,
          onRest: () => {
            setIsTransitioning(false);
          }
        });
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
  }, [
    hasSeenAnswer,
    currentCardIndex,
    handleUserResponse,
    api,
    setCurrentCardIndex,
    setIsRevealed,
    setSelectedOption,
    setIsTransitioning
  ]);

  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTransitioning || isChatFocused) return;
  
      // If deck is complete, any key press closes dialog
      if (currentCardIndex >= flashcards.length) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
  
      // Progress MCQ on any key press after answering
      if (isMCQ && answeredMCQ) {
        event.preventDefault();
        event.stopPropagation();
        if (selectedOption === shuffledOptions.correctIndex) {
          handleSwipe('right');
        } else {
          handleSwipe('left');
        }
        return;
      }
  
      // Controls for flashcard questions
      switch (event.key) {
        case ' ':
          event.preventDefault();
          event.stopPropagation();
          if (!isMCQ) {
            toggleReveal();
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          if (!hasSeenAnswer) {
            showAnswerCheckReminder();
            return;
          }
          handleSwipe('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          if (!hasSeenAnswer) {
            showAnswerCheckReminder();
            return;
          }
          handleSwipe('right');
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    isTransitioning,
    isChatFocused,
    currentCardIndex,
    flashcards.length,
    onClose,
    isMCQ,
    answeredMCQ,
    selectedOption,
    shuffledOptions.correctIndex,
    hasSeenAnswer,
    handleSwipe,
    toggleReveal
  ]);


  useEffect(() => {
    if (currentCardIndex >= flashcards.length && flashcards.length > 0 && !isDeckCompleted) {
      handleDeckComplete();
    }
  }, [currentCardIndex, flashcards.length, handleDeckComplete, isDeckCompleted]);

  useEffect(() => {
    let mounted = true;
    
    const fetch = async () => { 
      if (mounted) {
        await fetchFlashcards();
      }
    };
    
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
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
    setIsRevealed(false);
    setHasSeenAnswer(false);
    setSelectedOption(-1);
    setAnsweredMCQ(false);
  }, [currentCardIndex, flashcards]);

  // Add effect to notify parent of question changes
  useEffect(() => {
    if (onQuestionChange) {
      const currentCard = flashcards[currentCardIndex];
      onQuestionChange(currentCard || null);
    }
  }, [currentCardIndex, flashcards, onQuestionChange]);



/* -------------------------------------- Event Handlers --------------------------------------- */
const getQuestionContent = () => {
  if (flashcards.length === 0 || currentCardIndex >= flashcards.length) {
    return '';
  }
  
  const currentCard = flashcards[currentCardIndex];
  return currentCard.questionContent.replace(/{{(.*?)}}/g, '_________');
};

  const handleLinkClick = useCallback((href: string, event: React.MouseEvent) => {
    event.stopPropagation();
    window.open(href, '_blank', 'noopener,noreferrer');
  }, []);

  const handleCardClick = useCallback(() => {
    toggleReveal();
  }, [toggleReveal]);

  const getSwipeDirection = (mx: number, my: number) => {
    const threshold = 50;
    if (Math.abs(mx) > Math.abs(my)) {
      return mx > threshold ? 'right' : mx < -threshold ? 'left' : 'none';
    } else {
      return my > threshold ? 'down' : my < -threshold ? 'up' : 'none';
    }
  };

  const bind = useDrag(({ active, movement: [mx, my], velocity: [vx, vy], event, type }) => {
    if (isMCQ) {
      return;
    }

    // Only check hasSeenAnswer for swipe actions, not clicks
    const dir = getSwipeDirection(mx, my);
    const trigger = dir !== 'none';
    
    if (trigger && !hasSeenAnswer) {
      showAnswerCheckReminder();
      return;
    }

    const isSignificantMovement = Math.abs(mx) > 50 || Math.abs(my) > 50;
    
    if (active) {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
      }
    } else if (!active && trigger) {
      handleSwipe(dir);
    }
    
    api.start({
      opacity: (active && isSignificantMovement) ? 0.5 : 1,
      config: physics.touchResponsive,
    });
  });

  const getShuffledOptions = (options: string[]) => {
    const shuffledOptions = shuffleArray([...options]);
    const correctAnswer = options[0];
    return {
      options: shuffledOptions,
      correctIndex: shuffledOptions.indexOf(correctAnswer)
    };
  };

  const handleOptionClick = useCallback((index: number, e: React.MouseEvent) => {
    playSound('flashcard-select'); 
    if (answeredMCQ) return;
    
    e.stopPropagation();
    setSelectedOption(index);
    setIsRevealed(true);
    setHasSeenAnswer(true);
    setAnsweredMCQ(true);
    onAnswerReveal?.(true);

    const isCorrect = index === shuffledOptions.correctIndex;
    onMCQAnswer?.(isCorrect);
  }, [answeredMCQ, shuffledOptions.correctIndex, onAnswerReveal, onMCQAnswer]);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
      if (roomId === 'WaitingRoom0') {
        const tutorialFlashcards = tutorialQuestions.map(question => ({
          ...question,
          difficulty: 1,
          tags: []
        }));

        setFlashcards(tutorialFlashcards);
        setCardStartTime(Date.now());
        const MCQquestionCount = tutorialFlashcards.filter(q => q.questionType === 'normal').length;
        setTotalMCQQuestions(MCQquestionCount);
        setIsLoading(false);
        return;
      }

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

      setCardStartTime(Date.now());

      const MCQquestionCount = data.questions.filter((question: FlattenedQuestionResponse) => question.types === 'normal').length;
      setTotalMCQQuestions(MCQquestionCount);

      const transformedFlashcards = data.questions.map((question: any) => {
        
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
            subjectCategory: question.category.subjectCategory || '',
            conceptCategory: question.category.conceptCategory || '',
            contentCategory: question.category.contentCategory|| '',
          },
          difficulty: question.difficulty || 1,
          tags: question.tags || [],
          questionAnswerNotes: question.questionAnswerNotes,
        };
      });
      
      const randomizedFlashcards = shuffleFlashcards(transformedFlashcards);
      setFlashcards(randomizedFlashcards);
      
      // Notify parent of initial question
      if (onQuestionChange && randomizedFlashcards.length > 0) {
        onQuestionChange(randomizedFlashcards[0]);
      }
      
      setIsLoading(false);    
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setIsLoading(false);
    }
  };

/* ----------------------------------------- Render -------------------------------------------- */
  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative focus-visible:outline-none">
      {isLoading && flashcards.length === 0 ? (
        <div className="h-full w-full flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--theme-text-color]" />
          <div className="text-[--theme-text-color]">Curating flashcards for you...</div>
        </div>
      ) : isDeckCompleted ? (
        <FlashcardSummary
          categoryStats={categoryStats}
          onClose={onClose}
        />
      ) : (
        <div className="w-full max-w-3xl px-4 min-h-full" {...bind()}>
          {flashcards.length - currentCardIndex > 0 && (
            <animated.div
              className={cn("w-full", isMCQ && "cursor-pointer")}
              style={{ opacity }}
              onClick={handleCardClick}
            >
              <div className="w-full min-h-full flex flex-col">
                {/* Question Section */}
                <div className="w-full mb-8" ref={questionContainerRef}>
                  <div className="w-full flex flex-col items-center">
                    <ContentRenderer 
                      content={getQuestionContent()} 
                      onLinkClick={handleLinkClick} 
                    />
                    
                    {/* MCQ Options */}
                    {isMCQ && flashcards[currentCardIndex]?.questionOptions?.length > 0 && (
                      <div className="w-full mt-4 space-y-2">
                        {shuffledOptions.options.map((option: string, index: number) => (
                          <button 
                            key={index}
                            onClick={(e) => handleOptionClick(index, e)}
                            type="button"
                            className={`w-full p-3 rounded-lg border transition-colors focus:outline-none
                              ${answeredMCQ ? 'cursor-default' : 'hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]'} 
                              ${
                                isRevealed && index === shuffledOptions.correctIndex
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : isRevealed && index === selectedOption && index !== shuffledOptions.correctIndex
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : 'border-[--theme-border-color]'
                              }
                              disabled:cursor-default
                            `}
                          >
                            <div className="text-left">
                              <ContentRenderer 
                                content={option}
                                className={`${
                                  isRevealed && (
                                    index === shuffledOptions.correctIndex || 
                                    (index === selectedOption && index !== shuffledOptions.correctIndex)
                                  ) ? 'text-white' : ''
                                }`}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Answer Section */}
                <div className={`w-full transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="w-full overflow-y-auto flex flex-col justify-center items-center">
                    {isRevealed && (
                      <>
                        {/* Only show "Answer:" header for non-MCQ questions */}
                        {flashcards[currentCardIndex]?.questionType !== 'normal' && (
                          <div className="text-lg font-semibold mb-2 text-green-600">
                            Answer:
                          </div>
                        )}
                        {/* Only show answer content for non-MCQ questions */}
                        {flashcards[currentCardIndex]?.questionType !== 'normal' && (
                          <ContentRenderer 
                            content={getAnswerContent()} 
                            onLinkClick={handleLinkClick} 
                          />
                        )}
                        {/* Show explanation for MCQ questions */}
                        {flashcards[currentCardIndex]?.questionType === 'normal' && 
                         flashcards[currentCardIndex]?.questionOptions?.length > 0 && (
                          <div ref={answerSectionRef} className="mt-4 text-[--theme-text-color]">
                            <div className="mb-3 font-semibold text-green-600">
                              Correct answer: <span className="text-[--theme-text-color]">{getAnswerContent()}</span>
                            </div>
                            <p>
                              {(() => {
                                try {
                                  const notes = flashcards[currentCardIndex].questionAnswerNotes;
                                  if (Array.isArray(notes)) {
                                    return notes[0] || 'No additional explanation available.';
                                  }
                                  if (typeof notes === 'string') {
                                    try {
                                      const parsedNotes = JSON.parse(notes);
                                      return Array.isArray(parsedNotes) ? parsedNotes[0] : notes;
                                    } catch {
                                      return notes;
                                    }
                                  }
                                  return 'No additional explanation available.';
                                } catch (e) {
                                  return 'No additional explanation available.';
                                }
                              })()}
                            </p>
                            {/* Show controls after answering MCQ */}
                            {answeredMCQ && (
                              <div className="text-center my-7 text-sm text-gray-400">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-gray-600 font-normal">any key</span>
                                  <span>to continue</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {/* Show links if available */}
                        {flashcards[currentCardIndex]?.links && flashcards[currentCardIndex]?.links?.length || 0 > 0 && (
                          <div className="mt-4 w-full">
                            <div className="text-sm font-semibold mb-2 text-[--theme-text-color]">
                              Additional Resources:
                            </div>
                            <ul className="list-disc list-inside space-y-1">
                              {flashcards[currentCardIndex].links?.map((link, index) => (
                                <li key={index}>
                                  <a
                                    href={link}
                                    onClick={(e) => handleLinkClick(link, e)}
                                    className="text-blue-500 hover:text-blue-600 underline text-sm"
                                  >
                                    {link}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Flashcard controls */}
                {flashcards[currentCardIndex]?.questionType === 'flashcard' && (
                  <div className="w-full text-center mt-7 text-sm text-gray-400">
                    {!isRevealed ? (
                      <div className="flex items-center justify-center gap-2">
                        <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Space</kbd>
                        <span>to reveal answer</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-5">
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">←</kbd>
                          <span>to mark flashcard as missed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">→</kbd>
                          <span>to mark flashcard as correct</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </animated.div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardDeck;