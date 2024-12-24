import React, { useState, useEffect, useRef, useCallback, ReactNode, forwardRef, useImperativeHandle } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import AnimatedStar from "./AnimatedStar";
import { Button } from "@/components/ui/button";
import { cleanQuestion } from './FlashcardDeck';
import { ScrollArea } from "@/components/ui/scroll-area";
import { animated, useSpring } from 'react-spring';
import ChatBot from "@/components/chatbot/ChatBotFlashcard";
import { useUser } from "@clerk/nextjs";

interface LargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string; 
  children?: ReactNode;
  userResponses: UserResponseWithCategory[];
  correctCount: number;
  wrongCount: number;
  largeDialogQuit: boolean;
  setLargeDialogQuit: (quit: boolean) => void;
}

interface FeedItem {
  id: number;
  type: string;
  content: any;
}

interface ConceptScore {
  [key: string]: [number, number, number]; // [correct_answers, incorrect_answers, total_attempts]
}

interface Category {
  id: string;
  subjectCategory: string;
  contentCategory: string;
  conceptCategory: string;
  generalWeight: number;
  section: string;
  color: string;
  icon: string;
}

interface Question {
  id: string;
  questionContent: string;
  questionOptions: string;
  questionAnswerNotes?: string;
  context?: string;
  category: Category;
  types: string
}

export interface UserResponseWithCategory {
  id: string;
  userId?: string | null;
  userTestId?: string | null;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  categoryId?: string | null;
  timeSpent?: number | null;
  weighting: number;
  userNotes?: string | null;
  reviewNotes?: string | null;
  answeredAt: Date;
  isReviewed?: boolean | null;
  flagged?: boolean | null;
  question: Question;
}

interface WrongCard {
  id: string;
  timestamp: string;
  question: string;
  answer: string;
  questionOptions: string[];
  isFlipped: boolean;
  types: string; // normal: multiple choice; flashcard: fill in the blank
}

interface Review {
  id: string;
  tier: number;
  rating: number;
  review: string;
  profilePicture: string;
}

const AfterTestFeed = forwardRef<{ setWrongCards: (cards: any[]) => void }, LargeDialogProps>(({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  userResponses, 
  correctCount, 
  wrongCount, 
  largeDialogQuit, 
  setLargeDialogQuit 
}, ref) => {
  const { user } = useUser();
  const score = correctCount/(correctCount+wrongCount) * 100;
  const [review, setReview] = useState<Review | null>(null);

  const getStarCount = (score: number): number => {
    if (score >= 100) return 5;
    if (score >= 80) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    if (score >= 20) return 1;
    return 0;
  };

  const fetchReview = async (rating: number): Promise<Review | null> => {
    try {
      const url = `/api/reviews?tier=1&rating=${rating}&count=1`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        return data[0];
      }
    } catch (error) {
      console.error("Error fetching review:", error);
    }
    return null;
  };

  useEffect(() => {
    if (open) {
      const starCount = getStarCount(score);
      fetchReview(starCount).then(reviewData => {
        if (reviewData) {
          setReview(reviewData);
        }
      });
    }
  }, [open, score]);

  const [showReviewFeed, setShowReviewFeed] = useState(false);
  const [mostMissed, setMostMissed] = useState<ConceptScore>({});
  const [mostCorrect, setMostCorrect] = useState<ConceptScore>({});

  const [conceptStats, setConceptStats] = useState<ConceptScore>({});

  // Add new state for wrong cards
  const [wrongCards, setWrongCards] = useState<WrongCard[]>([]);

  // Add spring animation
  const springs = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
  });

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Add new state for animation control
  const [showStats, setShowStats] = useState(false);

  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: "",
  });

  useImperativeHandle(ref, () => ({
    setWrongCards
  }));

  useEffect(() => {
    if (open) {
      // Reset states when dialog opens
      setShowReviewFeed(false);
      setShowStats(false);

      // Animate score first
      const animateScore = () => {
        const duration = 2000;
        const start = Date.now();

        const animate = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Show stats after score animation completes
            setTimeout(() => setShowStats(true), 500);
          }
        };

        animate();
      };

      animateScore();
    }
  }, [open]);

  const renderStars = () => {
    return (
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, i) => {
          const starProgress = Math.max(Math.min(score - i, 1), 0);
          const delay = i * 200; // Delay each star by 200ms

          return (
            <animated.div
              key={i}
              style={{
                opacity: starProgress,
                transform: starProgress ? 'scale(1)' : 'scale(0.5)',
                transition: `opacity 0.5s ${delay}ms, transform 0.5s ${delay}ms`,
              }}
            >
              <AnimatedStar
                progress={starProgress}
                uniqueId={`dialog-star-${i}`}
              />
            </animated.div>
          );
        })}
      </div>
    );
  };

  const renderPerformanceSummary = () => (
    <div className="mt-4 text-left">
      <p className="font-bold">Missed {wrongCount} Questions</p>
      <p className="font-semibold mt-2">Most missed concepts</p>
      <ul className="list-disc list-inside">
        {Object.keys(mostMissed).length === 0 ? (
          <li>No missed questions!</li>
        ) : (
          <>
            {Object.entries(mostMissed).slice(0, 4).map(([concept, [correct, incorrect, total]], index) => (
              <li key={concept}>{concept} ({incorrect}/{total})</li>
            ))}
          </>
        )}
      </ul>
      <p className="font-bold mt-4">Correct {correctCount} Questions</p>
      <p className="font-semibold mt-2">Most mastered concepts</p>
      <ul className="list-disc list-inside">
        {Object.keys(mostCorrect).length === 0 ? (
          <li>No mastered questions!</li>
        ) : (
          <>
            {Object.entries(mostCorrect).slice(0, 4).map(([concept, [correct, incorrect, total]], index) => (
              <li key={concept}>{concept} ({correct}/{total})</li>
            ))}
          </>
        )}
      </ul>
    </div>
  );

  const handleGoToReviewFeed = () => {
    setShowReviewFeed(true);
  };

  const cleanAnswer = (text: string): string => {
    const matches = [...text.matchAll(/{{c[^:]*::(.+?)(?=::|}})/g)];
    const result = matches.map(match => match[1]).join(', ');
    
    return result
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .trim();
  };

  const getAnswerContent = (response: UserResponseWithCategory): string => {
    if (!response.question) return '';
    
    try {
      const options = JSON.parse(response.question.questionOptions || '[]');
      if (response.question.types === 'normal') {
        return `${options[0]}`;
      }
      
      // For flashcard questions
      return cleanAnswer(response.question.questionContent);
    } catch (e) {
      console.error('Error parsing question options:', e);
      return cleanAnswer(response.question.questionContent);
    }
  };

  const parseUserResponses = useCallback((responses: UserResponseWithCategory[]) => {
    // Return empty stats if responses is undefined or empty
    if (!responses?.length) {
      return {};
    }

    const conceptStats: Record<string, {
      correct: number;
      incorrect: number;
      total: number;
    }> = {};

    const newWrongCards: WrongCard[] = [];

    responses.forEach(response => {
      // Access concept through the question's category
      const concept = response.question?.category?.conceptCategory;
      if (!concept) return;

      // Initialize concept stats if not exists
      if (!conceptStats[concept]) {
        conceptStats[concept] = {
          correct: 0,
          incorrect: 0,
          total: 0
        };
      }

      // Update stats
      if (response.isCorrect) {
        conceptStats[concept].correct += 1;
      } else {
        conceptStats[concept].incorrect += 1;
        
        newWrongCards.push({
          id: response.questionId,
          timestamp: new Date(response.answeredAt).toLocaleString(),
          question: cleanQuestion(response.question?.questionContent || ''),
          answer: getAnswerContent(response),
          questionOptions: response.question.types === 'normal' ? JSON.parse(response.question?.questionOptions || '[]') : [],
          isFlipped: false,
          types: response.question.types
        });
      }
      conceptStats[concept].total += 1;
    });

    setWrongCards(newWrongCards);

    return conceptStats;
  }, []);

  useEffect(() => {
    const stats = parseUserResponses(userResponses as UserResponseWithCategory[]);
    // Convert stats to ConceptScore format before setting state
    const convertedStats: ConceptScore = Object.entries(stats || {}).reduce((acc, [concept, data]) => {
      acc[concept] = [
        data?.correct || 0,
        data?.incorrect || 0,
        data?.total || 0
      ];
      return acc;
    }, {} as ConceptScore);
    setConceptStats(convertedStats || {});

    // Calculate mostCorrect using convertedStats
    const sortedByCorrect = Object.entries(convertedStats)
      .filter(([_, [correct]]) => correct > 0)
      .sort(([_c1, a], [_c2, b]) => b[0] - a[0])
      .reduce((acc, [concept, stats]) => {
        acc[concept] = stats;
        return acc;
      }, {} as ConceptScore);
    setMostCorrect(sortedByCorrect);

    // Calculate mostMissed using convertedStats
    const sortedByMissed = Object.entries(convertedStats)
      .filter(([_c1, [_c2, incorrect]]) => incorrect > 0)
      .sort(([_c1, a], [_c2, b]) => b[1] - a[1])
      .reduce((acc, [concept, stats]) => {
        acc[concept] = stats;
        return acc;
      }, {} as ConceptScore);
    setMostMissed(sortedByMissed);

    // Set isDataLoaded to true after all data processing is complete
    setIsDataLoaded(true);
  }, [userResponses, parseUserResponses, correctCount, wrongCount]);

  const [isFlipped, setIsFlipped] = useState(false);

  const renderFeedItem = (item: FeedItem) => {
    const baseCardStyle = "mb-8 p-6 rounded-xl backdrop-filter backdrop-blur-lg bg-[--theme-flashcard-color] text-[--theme-flashcard-text-color] transition-all duration-300 w-[95%] mx-auto hover:scale-[1.05] relative z-10";
    
    return (
      <div className="group p-4 -m-4">
        <div className={baseCardStyle}>
          {item.type === 'Flashcard' && (
            <div 
              className={`cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {!isFlipped ? (
                <p className="text-lg font-semibold">What are the essential amino acids?</p>
              ) : (
                <p className="text-lg">
                  The 9 essential amino acids are: Histidine, Isoleucine, Leucine, Lysine, Methionine, Phenylalanine, Threonine, Tryptophan, and Valine.
                </p>
              )}
            </div>
          )}
          {item.type === 'MultipleChoice' && (
            <div>
              <p className="text-lg font-semibold mb-4">{item.content.question}</p>
              {item.content.options.map((option: {
                option: string;
                text: string;
                isCorrect: boolean;
                explanation?: string;
              }, index: number) => (
                <div key={index} className={`p-2 rounded ${option.isCorrect ? 'bg-green-100' : ''}`}>
                  <p>{option.option}. {option.text}</p>
                  {option.isCorrect && (
                    <p className="text-sm text-green-700 mt-1">
                      Correct. {option.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {item.type === 'Practice Question' && (
            <div>
              <p className="text-lg font-semibold mb-4">{item.content.question}</p>
              {item.content.options.map((option: {
                option: string;
                text: string;
                isCorrect: boolean;
                explanation?: string;
              }, index: number) => (
                <div key={index} className={`p-2 rounded ${option.isCorrect ? 'bg-green-100' : ''}`}>
                  <p>{option.option}. {option.text}</p>
                  {option.isCorrect && option.explanation && (
                    <p className="text-sm text-green-700 mt-1">
                      Correct. {option.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {item.type === 'PassageQuestion' && (
            <div>
              <p className="text-lg font-semibold mb-4">Read the following passage:</p>
              <p className="mb-4">
                Gravity is a fundamental force of nature that attracts any two masses in the universe. It was first described mathematically by Sir Isaac Newton in the 17th century. Einstein later refined our understanding of gravity with his theory of general relativity, which describes gravity as a curvature of spacetime caused by mass and energy.
              </p>
              <p className="text-lg font-semibold mb-2">Question:</p>
              <p className="mb-4">{"According to the passage, how did Einstein's theory change our understanding of gravity?"}</p>
              <textarea 
                className="w-full p-2 border rounded text-black"
                rows={4}
                placeholder="Type your answer here..."
              ></textarea>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleExit = () => {
      onOpenChange(false);
      setLargeDialogQuit(true);
  };


  const handleCardFlip = (index: number) => {
    setWrongCards(cards => 
      cards.map((card, i) => 
        i === index ? { ...card, isFlipped: !card.isFlipped } : card
      )
    );
  };

  const renderReviewSection = () => (
    <ScrollArea className="h-[calc(90vh-6rem)]">
      <div className="space-y-4 pr-4 pb-4">
        {wrongCards.map((card, index) => (
          <animated.div 
            key={index}
            style={index === 0 ? springs : undefined}
            className={`
              p-4 border border-[--theme-border-color] rounded-md 
              bg-[--theme-gradient-end] cursor-pointer 
              transition-all duration-300 hover:shadow-lg
              h-[300px]
              ${card.isFlipped ? 'bg-opacity-90' : ''}
            `}
            onClick={() => handleCardFlip(index)}
          >
            <div className="h-full flex flex-col">
              <div className="text-sm text-gray-500 mb-2">{card.timestamp}</div>
              <div className="flex-1 overflow-y-auto">
                {!card.isFlipped ? (
                  <div className={`${card.types !== 'normal' ? 'h-full flex flex-col items-center justify-center' : ''}`}>
                    <div className={`font-semibold mb-2 ${card.types !== 'normal' ? 'text-center' : ''}`}>
                      {card.question}
                    </div>
                    {card.types === 'normal' && (
                      <div className="mt-2 space-y-2">
                        {card.questionOptions.map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className="p-2 rounded-md bg-opacity-50 bg-gray-100 text-sm"
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="text-sm mb-1 text-green-600">Correct Answer:</div>
                    <div className="text-green-600 font-medium text-center">{card.answer}</div>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-400 mt-4 pt-2 border-t border-gray-200">
                {card.isFlipped ? 'Click to hide answer' : 'Click to show answer'}
              </div>
            </div>
          </animated.div>
        ))}
        {wrongCards.length === 0 && (
          <div className="text-center text-gray-500 italic">
            No wrong answers to review
          </div>
        )}
      </div>
    </ScrollArea>
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if the active element is an input or textarea
      const isInputActive = document.activeElement?.tagName === 'INPUT' || 
                           document.activeElement?.tagName === 'TEXTAREA';

      // Only handle space for card flipping if we're not typing in an input
      if (e.code === 'Space' && wrongCards.length > 0 && !isInputActive) {
        e.preventDefault();
        // Flip the first visible card
        handleCardFlip(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [wrongCards.length]);

  const generateSummaryMessage = (conceptStats: ConceptScore): string => {
    const totalQuestions = correctCount + wrongCount;
    
    // Create a map to store category-specific analytics
    const categoryAnalytics = userResponses.reduce((acc, response) => {
      const category = response.question.category.conceptCategory;
      if (!acc[category]) {
        acc[category] = {
          totalTime: 0,
          questionCount: 0,
          correct: 0,
          incorrect: 0,
          types: new Set<string>(),
          avgTimePerQuestion: 0
        };
      }
      
      acc[category].totalTime += response.timeSpent || 0;
      acc[category].questionCount += 1;
      acc[category].types.add(response.question.types);
      if (response.isCorrect) {
        acc[category].correct += 1;
      } else {
        acc[category].incorrect += 1;
      }
      
      // Calculate average time per question for this category
      acc[category].avgTimePerQuestion = Math.round(acc[category].totalTime / acc[category].questionCount);
      
      return acc;
    }, {} as Record<string, {
      totalTime: number;
      questionCount: number;
      correct: number;
      incorrect: number;
      types: Set<string>;
      avgTimePerQuestion: number;
    }>);

    // Calculate overall stats
    const totalTime = userResponses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
    const avgTimePerQuestion = Math.round(totalTime / totalQuestions);
    
    // Start building the message
    let message = `You completed ${totalQuestions} questions in ${Math.round(totalTime)} seconds `;
    message += `(average ${avgTimePerQuestion} seconds per question). \n\n`;
    
    // Add category-specific performance
    Object.entries(categoryAnalytics)
      .sort((a, b) => b[1].correct/b[1].questionCount - a[1].correct/a[1].questionCount)
      .forEach(([category, stats]) => {
        const accuracy = Math.round((stats.correct / stats.questionCount) * 100);
        
        if (stats.questionCount >= 3) { // Only include categories with enough questions
          message += `${category}: ${accuracy}% accuracy (${stats.correct}/${stats.questionCount}), `;
          message += `avg ${stats.avgTimePerQuestion}s per question. `;
          
          // Add performance assessment
          if (accuracy >= 80) {
            message += `Strong performance! `;
          } else if (accuracy <= 60) {
            message += `Consider reviewing this topic. `;
          }
          message += '\n';
        }
      });

    // Add study recommendations
    const weakestCategories = Object.entries(categoryAnalytics)
      .filter(([_, stats]) => stats.questionCount >= 3)
      .sort((a, b) => (a[1].correct/a[1].questionCount) - (b[1].correct/b[1].questionCount))
      .slice(0, 2);

    if (weakestCategories.length > 0) {
      message += '\nRecommended focus areas:\n';
      weakestCategories.forEach(([category, stats]) => {
        const accuracy = Math.round((stats.correct / stats.questionCount) * 100);
        message += `• ${category} (${accuracy}% accuracy) - `;
        message += `Try practicing with ${Array.from(stats.types).join('/')} questions.\n`;
      });
    }

    return message;
  };

  const replaceNameInReview = (review: string) => {
    const userName = user
      ? user.firstName
        ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
        : "Doctor"
      : "Doctor";
    return review.replace(/\$NAME/g, userName);
  };

  const renderInitialScore = () => {
    const starCount = getStarCount(score);
    const percentage = Math.round((correctCount / (correctCount + wrongCount)) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {review && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[--theme-flashcard-color] p-6 rounded-xl shadow-lg border border-[--theme-border-color] max-w-2xl mx-auto mb-8"
          >
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[--theme-hover-color] flex items-center justify-center">
                    <span className="text-lg font-bold text-[--theme-text-color]">K</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-[--theme-text-color]">Kalypso</div>
                    <div className="text-sm opacity-70 text-[--theme-text-color]">AI Medical Assistant</div>
                  </div>
                </div>
                <p className="text-lg text-[--theme-text-color] leading-relaxed text-left">
                  {replaceNameInReview(review.review)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={review.profilePicture}
                  alt="Profile Picture" 
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <AnimatedStar
                key={i}
                progress={i < starCount ? 1 : 0}
                uniqueId={`score-star-${i}`}
              />
            ))}
          </div>
          <div className="text-4xl font-bold text-[--theme-text-color] mb-2">
            {percentage}%
          </div>
          <div className="text-lg text-[--theme-text-color] opacity-80">
            {correctCount} correct · {wrongCount} incorrect
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 gap-8 mt-8"
    >
      {/* Needs Review Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[--theme-flashcard-color] p-6 rounded-xl shadow-lg border border-[--theme-border-color]"
      >
        <h3 className="text-xl font-bold mb-4 text-[--theme-text-color]">
          Needs Review ({wrongCount})
        </h3>
        <ul className="space-y-2">
          {Object.entries(mostMissed).slice(0, 4).map(([concept, [_, incorrect, total]], index) => (
            <li key={concept} className="flex justify-between text-[--theme-text-color]">
              <span>{concept}</span>
              <span className="text-[--theme-text-color]">{incorrect}/{total}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Mastered Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[--theme-flashcard-color] p-6 rounded-xl shadow-lg border border-[--theme-border-color]"
      >
        <h3 className="text-xl font-bold mb-4 text-[--theme-hover-color]">
          Proficient ({correctCount})
        </h3>
        <ul className="space-y-2">
          {Object.entries(mostCorrect).slice(0, 4).map(([concept, [correct, _, total]], index) => (
            <li key={concept} className="flex justify-between text-[--theme-text-color]">
              <span>{concept}</span>
              <span className="text-[--theme-hover-color]">{correct}/{total}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );

  // Replace feedItems with a chat-like interface
  const renderChatInterface = () => (
    <ChatBot
      width="100%"
      height="100%"
      backgroundColor="var(--theme-mainbox-color)"
    />
  );

  useEffect(() => {
    const contextTitle = "Test Review Summary";
    const contextIntro = "I just completed a test. Here are the questions I got wrong:";
    const contextContent = wrongCards.map(card => {
      if (card.types === 'normal') {
        return `Question: ${card.question}\nOptions: ${card.questionOptions.join(' | ')}\nCorrect Answer: ${card.answer}`;
      } else {
        return `Question: ${card.question}\nAnswer: ${card.answer}`;
      }
    }).join('\n\n');

    setChatbotContext({
      contentTitle: contextTitle,
      context: contextIntro + contextContent,
    });
  }, [wrongCards]);


  if(userResponses.length === 0) {
    return null;
  }
  return (
    <Dialog open={open} onOpenChange={handleExit}>
      <DialogContent className="bg-[--theme-mainbox-color] text-center p-8 max-w-[95vw] w-[75rem] h-[90vh] border border-[--theme-border-color] shadow-lg">
        {!showReviewFeed ? (
          <div className="h-full flex flex-col justify-center space-y-8">
            {renderInitialScore()}
            {showStats && renderStats()}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleGoToReviewFeed}
                className="mt-8 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:bg-[--theme-hover-color] transition-colors duration-300"
                disabled={!isDataLoaded}
              >
                {!isDataLoaded ? 'Loading...' : 'Continue to Review'}
              </Button>
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Left Side - Review Section */}
            <div className="w-[35%] h-full border-r border-[--theme-border-color] pl-4">
              {renderReviewSection()}
            </div>

            {/* Right Side - Chat Interface */}
            <div className="w-[65%] h-full flex flex-col">
              <h2 className="text-2xl text-[--theme-text-color] font-bold mb-4">Interactive Review</h2>
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0">
                  <ChatBot
                    width="100%"
                    height="100%"
                    backgroundColor="var(--theme-mainbox-color)"
                    chatbotContext={chatbotContext}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
});

AfterTestFeed.displayName = 'AfterTestFeed';

export default AfterTestFeed;
