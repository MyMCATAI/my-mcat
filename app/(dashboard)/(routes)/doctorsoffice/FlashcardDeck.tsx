'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react';
import ContentRenderer from '@/components/ContentRenderer';
import { FlattenedQuestionResponse } from '@/lib/question';
import { roomToSubjectMap } from './OfficeContainer';
import { roomToContentMap } from './OfficeContainer';
import toast from 'react-hot-toast';
import { tutorialQuestions } from './constants/tutorialQuestions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

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

// Create a separate function for shuffling flashcards
const shuffleFlashcards = (array: Flashcard[]): Flashcard[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const showAnswerCheckReminder = () => {
  toast.error("Please check the answer first");
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
  onMCQAnswer,
  handleCompleteAllRoom,
  setTotalMCQQuestions,
  onQuestionChange,
}): JSX.Element => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [isRevealed, setIsRevealed] = useState(false);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const correctSound = useRef<HTMLAudioElement | null>(null);
  const whooshSound = useRef<HTMLAudioElement | null>(null);
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);
  const [hasSeenAnswer, setHasSeenAnswer] = useState(false);
  // whether the user has answered the MCQ question
  const [answeredMCQ, setAnsweredMCQ] = useState(false);

  const flashcardsRef = useRef<Flashcard[]>([]);
  const currentCardIndexRef = useRef<number>(0);
  
  const [shuffledOptions, setShuffledOptions] = useState<{ options: string[], correctIndex: number }>({ options: [], correctIndex: -1 });
  const [selectedOption, setSelectedOption] = useState<number>(-1);


  useEffect(() => {
    correctSound.current = new Audio('/correct.mp3');
    whooshSound.current = new Audio('/whoosh.mp3');
    
    // Set initial volume for both sounds
    if (correctSound.current) correctSound.current.volume = 0.5;
    if (whooshSound.current) whooshSound.current.volume = 0.25;
  }, []);

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
  }, [roomId, setActiveRooms, isDeckCompleted]);

  useEffect(() => {
    if (currentCardIndex >= flashcards.length && flashcards.length > 0 && !isDeckCompleted) {
      handleDeckComplete();
    }
  }, [currentCardIndex, flashcards.length, handleDeckComplete, isDeckCompleted]);

  const playSound = useCallback((sound: HTMLAudioElement) => {
    sound.currentTime = 0; // Reset the playback position
    sound.play().catch(e => console.error('Error playing sound:', e));
  }, []);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
      // Handle tutorial room case
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

      // Regular room handling
      const subjects = Array.isArray(roomToSubjectMap[roomId]) 
        ? roomToSubjectMap[roomId] 
        : roomToSubjectMap[roomId] || [];
      const contents = Array.isArray(roomToContentMap[roomId])
        ? roomToContentMap[roomId]
        : roomToContentMap[roomId] || [];
      
      console.log('Fetching flashcards for:', {
        roomId,
        subjects,
        contents
      });
      
      const subjectParams = subjects
        .map(subject => `subjectCategory=${encodeURIComponent(subject.replace(/ /g, "_"))}`)
        .join('&');
      const contentParams = contents
        .map(content => `contentCategory=${encodeURIComponent(content.replace(/ /g, "_"))}`)
        .join('&');

      const pageNumber = 1;
      const pageSize = 10;
      const apiUrl = `/api/question?${subjectParams}&${contentParams}&types=flashcard,normal&page=${pageNumber}&pageSize=${pageSize}`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log('API Response:', data);
      
      setCardStartTime(Date.now());

      const MCQquestionCount = data.questions.filter((question: FlattenedQuestionResponse) => question.types === 'normal').length;
      setTotalMCQQuestions(MCQquestionCount);

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

      console.log('Transformed flashcards:', transformedFlashcards);
      
      // Randomize the flashcards
      const randomizedFlashcards = shuffleFlashcards(transformedFlashcards);
      setFlashcards(randomizedFlashcards);
      setIsLoading(false);    
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setIsLoading(false);
    }
  };
  
  const handleLinkClick = useCallback((href: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the click from bubbling up to the card
    window.open(href, '_blank', 'noopener,noreferrer');
  }, []);

  const handleCardClick = useCallback(() => {
    // Only allow click to reveal for non-MCQ questions
    if (flashcards[currentCardIndex]?.questionType === 'normal') {
      return;
    }
    toggleReveal();
  }, [currentCardIndex, flashcards]);

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
      return correctOption;
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

    // Handle sound effects and callbacks
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
  }, [onCorrectAnswer, onWrongAnswer, playSound, cardStartTime, roomId]);

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
    // Add check for revealed answer
    if (!hasSeenAnswer) {
      showAnswerCheckReminder();
      return;
    }
    
    // Guard against empty flashcards
    if (flashcardsRef.current.length === 0) {
      console.log("No flashcards available");
      return;
    }

    // Check if we've gone through all cards
    if (currentCardIndex >= flashcardsRef.current.length) {
      return;
    }

    api.start({
      opacity: 0,
      config: { duration: 200 },
      onRest: () => {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
        setIsRevealed(false);
        setSelectedOption(-1);
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
    if (flashcards[currentCardIndex]?.questionType === 'normal') {
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

  const toggleReveal = () => {
    // Only allow space to reveal for non-MCQ questions
    if (flashcards[currentCardIndex]?.questionType === 'normal') {
      return;
    }
    setIsRevealed(prev => !prev);
    setHasSeenAnswer(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const currentCard = flashcards[currentCardIndex];
      const isMCQ = currentCard?.questionType === 'normal';

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (!hasSeenAnswer) {
            showAnswerCheckReminder();
            return;
          }
          // Only allow marking incorrect if MCQ was wrong
          if (isMCQ && (selectedOption !== shuffledOptions.correctIndex)) {
            handleSwipe('left');
          } else if (!isMCQ) {
            handleSwipe('left');
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (!hasSeenAnswer) {
            showAnswerCheckReminder();
            return;
          }
          // Only allow marking correct if MCQ was right
          if (isMCQ && (selectedOption === shuffledOptions.correctIndex)) {
            handleSwipe('right');
          } else if (!isMCQ) {
            handleSwipe('right');
          }
          break;
        case ' ':
          // Disable spacebar for MCQ questions
          if (!isMCQ) {
            event.preventDefault();
            toggleReveal();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSeenAnswer, flashcards, currentCardIndex, selectedOption, shuffledOptions.correctIndex]);

  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const getShuffledOptions = (options: string[]) => {
    const shuffledOptions = shuffleArray([...options]);
    const correctAnswer = options[0]; // First option is always correct
    return {
      options: shuffledOptions,
      correctIndex: shuffledOptions.indexOf(correctAnswer)
    };
  };

  const handleOptionClick = (index: number, e: React.MouseEvent) => {
    if (answeredMCQ) return;
    
    e.stopPropagation();
    setSelectedOption(index);
    setIsRevealed(true);
    setHasSeenAnswer(true);
    setAnsweredMCQ(true);

    const isCorrect = index === shuffledOptions.correctIndex;
  
    // Track MCQ performance - will only be called once due to hasAnswered check
    if (onMCQAnswer) {
      onMCQAnswer(isCorrect);
    }
  };

  useEffect(() => {
    if (onQuestionChange) {
      onQuestionChange(flashcards[currentCardIndex] || null);
    }
  }, [currentCardIndex, flashcards, onQuestionChange]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative focus-visible:outline-none">
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
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 focus:outline-none"
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

              {/* Dividing Line */}
              <div className="w-full border-t border-gray-300 my-4" />

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
                        <div className="mt-4 text-[--theme-text-color]">
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
                        </div>
                      )}
                      {/* Show links if available */}
                      {flashcards[currentCardIndex]?.links?.length && (
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
            </animated.div>
          )}
          
          <div className="fixed bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
            <span className="mr-3">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Space</kbd> reveal
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">←→</kbd> answer
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardDeck;
 