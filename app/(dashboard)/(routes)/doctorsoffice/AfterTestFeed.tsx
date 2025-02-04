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
import { GraduationCap, Cat } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { UpgradeToGoldButton } from "@/components/upgrade-to-gold-button";

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
  isSubscribed: boolean;
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
  setLargeDialogQuit,
  isSubscribed
}, ref) => {
  const { user } = useUser();
  const score = correctCount/(correctCount+wrongCount) * 100;
  const [review, setReview] = useState<Review | null>(null);
  const chatbotRef = useRef<{
    sendMessage: (message: string) => void;
  }>({ sendMessage: () => {} });

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

  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

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
            {Object.entries(mostMissed).slice(0, 3).map(([concept, [correct, incorrect, total]], index) => (
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
            {Object.entries(mostCorrect).slice(0, 3).map(([concept, [correct, incorrect, total]], index) => (
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
    <ScrollArea className="h-[calc(90vh-6rem)] scrollbar-none">
      <div className="space-y-4 pr-4 pb-4">
        {wrongCards.map((card, index) => (
          <animated.div 
            key={index}
            style={index === 0 ? springs : undefined}
            className={`
              p-4 border border-[--theme-border-color] rounded-md 
              bg-[--theme-flashcard-color] cursor-pointer 
              transition-all duration-300 hover:shadow-lg
              min-h-[14rem] max-h-[50rem]
              ${card.isFlipped ? 'bg-opacity-90' : ''}
            `}
            onClick={() => handleCardFlip(index)}
          >
            <div className="h-full flex flex-col">
              <div className="text-xs text-[--theme-text-color] opacity-50 mb-2">{card.timestamp.split(', ')[1]}</div>
              
              <div className="flex-1 overflow-y-auto scrollbar-none">
                {!card.isFlipped ? (
                  <div className={`${card.types !== 'normal' ? 'h-full flex items-center justify-center' : ''}`}>
                    <div className={`font-semibold mb-2 text-[--theme-text-color] ${card.types !== 'normal' ? 'text-center' : ''}`}>
                      {card.question}
                    </div>
                    {card.types === 'normal' && (
                      <div className="mt-2 space-y-2">
                        {card.questionOptions.map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className="p-2 rounded-md bg-[--theme-doctorsoffice-accent] bg-opacity-20 text-sm text-[--theme-text-color]"
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="text-sm mb-1 text-[--theme-text-color] opacity-70">Correct Answer:</div>
                    <div className="text-green-500 font-semibold mb-4">{card.answer}</div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card from flipping when clicking button
                        if (chatbotRef.current) {
                          const cardContext = `Question: ${card.question}\nAnswer: ${card.answer}`;
                          setChatbotContext(prev => ({
                            ...prev,
                            context: cardContext
                          }));
                          chatbotRef.current.sendMessage("Can you explain this flashcard to me?");
                        }
                      }}
                      className="h-7 bg-[--theme-doctorsoffice-accent] bg-opacity-10 text-[--theme-text-color] hover:bg-opacity-20 transition-all duration-200 rounded-full flex items-center gap-2 px-3"
                    >
                      <Cat className="h-4 w-4" />
                      <span className="text-xs">Explain</span>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-[--theme-text-color] opacity-40 mt-4 pt-2 border-t border-[--theme-border-color]">
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

  // Add new refs for audio elements
  const levelUpSound = useRef<HTMLAudioElement | null>(null);
  const fanfareSound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    levelUpSound.current = new Audio('/levelup.mp3');
    fanfareSound.current = new Audio('/fanfare.mp3');
  }, []);

  // Play sound effects when dialog opens based on score
  useEffect(() => {
    if (open) {
      const mcqResponses = userResponses.filter(r => r.question.types === 'normal');
      const mcqCorrect = mcqResponses.filter(r => r.isCorrect).length;
      const mcqTotal = mcqResponses.length;
      const mcqPercentage = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;

      if (mcqPercentage === 100) {
        fanfareSound.current?.play();
      } else if (mcqPercentage >= 70 && mcqPercentage < 100) {
        levelUpSound.current?.play();
      }
    }
  }, [open, userResponses]);

  useEffect(() => {
    const handleCoinReward = async () => {
      if (open) {
        const mcqResponses = userResponses.filter(r => r.question.types === 'normal');
        const mcqCorrect = mcqResponses.filter(r => r.isCorrect).length;
        const mcqTotal = mcqResponses.length;
        const mcqPercentage = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
        
        let coinsEarned = 0;
        if (mcqPercentage === 100) {
          coinsEarned = 2;
        } else if (mcqPercentage >= 70) {
          coinsEarned = 1;
        }

        if (coinsEarned > 0) {
          const response = await fetch("/api/user-info", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: coinsEarned }),
          });

          if (!response.ok) {
            throw new Error("Failed to increment coin");
          }

          toast.success(`You earned ${coinsEarned} coin(s) for your performance!`);
        } else if (mcqTotal > 0) {
          toast.error(`You need at least 70% correct MCQs to earn a coin. You got ${mcqPercentage.toFixed(1)}%`);
        }
      }
    };

    handleCoinReward();
  }, [open, userResponses]);

  const renderInitialScore = () => {
    const mcqResponses = userResponses.filter(r => r.question.types === 'normal');
    const mcqCorrect = mcqResponses.filter(r => r.isCorrect).length;
    const mcqTotal = mcqResponses.length;
    const mcqPercentage = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
    
    return (
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-6 p-5 max-w-5xl mx-auto"
      >
        {isSubscribed?"yes":"no"}
        {/* Updated header section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[--theme-text-color] text-center mb-2">
            {mcqPercentage >= 80 ? (
              "Today was so good we won a coin!"
            ) : (
              "It was just another day in clinic..."
            )}
          </h1>
          {mcqPercentage >= 80 && (
            <img 
              src="/game-components/PixelCupcake.png" 
              alt="Coin" 
              className="w-8 h-8 mb-2 object-contain"
            />
          )}
        </motion.div>

 
        {/* Top Section - Score and Review */}
        <div className="flex gap-6">
          {/* Left - Review Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-[--theme-flashcard-color] p-6 rounded-2xl shadow-lg flex items-center"
          >
            {review && (
              <div className="flex flex-col gap-4 w-full">
                {/* Review content */}
                <div className="flex gap-4 items-center">
                  <img 
                    src={review.profilePicture}
                    alt="Reviewer" 
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-[--theme-text-color] leading-relaxed text-base italic text-left">
                      {replaceNameInReview(review.review)}
                    </p>
                  </div>
                </div>

                {/* Stars centered at bottom */}
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <AnimatedStar
                      key={i}
                      progress={i < review.rating ? 1 : 0}
                      uniqueId={`review-star-${i}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right - Score Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-72 bg-[--theme-flashcard-color] p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-sm mb-4 text-center opacity-60 uppercase tracking-wide text-[--theme-text-color]">
              Test Results
            </h3>
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl font-bold text-[--theme-hover-color]">
                {mcqPercentage}%
              </div>
              <div className="w-full grid grid-cols-1 gap-4 mt-2">
                {/* MCQ Results */}
                <div className="text-center p-3 rounded-lg bg-[--theme-doctorsoffice-accent] bg-opacity-20">
                  <div className="text-sm text-[--theme-text-color] opacity-70">MCQ Results</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-xs text-[--theme-text-color] opacity-70">Correct</div>
                      <div className="text-lg font-semibold text-[--theme-text-color]">
                        {mcqCorrect}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[--theme-text-color] opacity-70">Incorrect</div>
                      <div className="text-lg font-semibold text-[--theme-text-color]">
                        {mcqTotal - mcqCorrect}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Performance Categories */}
        <div className="grid grid-cols-2 gap-6">
          {/* Needs Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[--theme-flashcard-color] p-6 rounded-2xl shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[--theme-text-color] flex items-center gap-2">
                <span>Needs Review</span>
                <span className="text-sm px-2 py-0.5 rounded-full bg-[--theme-doctorsoffice-accent] bg-opacity-20">
                  {wrongCount}
                </span>
              </h3>
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleNavigateToTutoring}
                  className="opacity-80 hover:opacity-100 transition-all duration-200 h-8 w-8"
                >
                  <GraduationCap className="h-4 w-4 text-[--theme-text-color] hover:text-[--theme-hover-color]" />
                </Button>
                <span className="absolute -bottom-8 right-0 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Review weaknesses
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {Object.entries(mostMissed).slice(0, 2).map(([concept, [_, incorrect, total]], index) => (
                <div key={concept} 
                  className="flex justify-between items-center p-3 rounded-lg bg-[--theme-doctorsoffice-accent] bg-opacity-10 hover:bg-opacity-20 transition-all"
                >
                  <span className="text-[--theme-text-color]">{concept}</span>
                  <span className="font-medium text-[--theme-text-color]">{incorrect}/{total}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Proficient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[--theme-flashcard-color] p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 text-[--theme-hover-color] flex items-center gap-2">
              <span>Proficient</span>
              <span className="text-sm px-2 py-0.5 rounded-full bg-[--theme-hover-color] bg-opacity-20 text-[--theme-hover-text]">
                {correctCount}
              </span>
            </h3>
            <div className="space-y-3">
              {Object.entries(mostCorrect).slice(0, 2).map(([concept, [correct, _, total]], index) => (
                <div key={concept} 
                  className="flex justify-between items-center p-3 rounded-lg bg-[--theme-hover-color] bg-opacity-10 hover:bg-opacity-20 transition-all"
                >
                  <span className="text-[--theme-text-color]">{concept}</span>
                  <span className="font-medium text-[--theme-hover-color]">{correct}/{total}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

       {/* Continue Button */}
       <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mt-4"
        >
          <Button
            onClick={handleGoToReviewFeed}
            className="bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-opacity-90 transition-all duration-300 px-8 py-3 text-lg rounded-xl shadow-lg border border-[--theme-border-color]"
            disabled={!isDataLoaded}
          >
            <div className="flex items-center gap-2">
              {!isDataLoaded ? 'Loading...' : 'Continue to Review'}
            </div>
          </Button>
        </motion.div>
      </motion.div>
    );
  };

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

  const router = useRouter();

  const handleNavigateToTutoring = () => {
    if (!isSubscribed) {
      setShowSubscriptionDialog(true);
      return;
    }

    // Get the top 4 most missed categories
    const weakestCategories = Object.entries(mostMissed)
      .slice(0, 6)
      .map(([concept]) => encodeURIComponent(concept));

    // Create the URL with the categories as a comma-separated list
    const url = `/home?tab=AdaptiveTutoringSuite&conceptCategories=${weakestCategories.join(',')}`;

    // Navigate to the tutoring page with the weak categories
    router.push(url);
  };

  if(userResponses.length === 0) {
    return null;
  }
  return (
    <>
      <Dialog open={open} onOpenChange={handleExit}>
        <DialogContent className="bg-[--theme-mainbox-color] text-center p-4 max-w-[95vw] w-[65rem] max-h-[95vh] overflow-y-auto shadow-lg border border-transparent">
          {showReviewFeed ? (
            <div className="flex-1 flex gap-4 relative">
              {/* Back Button - Subtle circular design */}
              <button
                onClick={() => setShowReviewFeed(false)}
                className="absolute top-4 left-4 z-50 w-8 h-8 rounded-full 
                  bg-[--theme-leaguecard-color] text-[--theme-text-color]
                  flex items-center justify-center
                  transition-all duration-300
                  hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>

              {/* Left Side - Review Section */}
              <div className="w-[35%] h-full pr-4">
                {renderReviewSection()}
              </div>

              {/* Right Side - Chat Interface */}
              <div className="w-[65%] h-full flex flex-col">
                <div className="flex-1 min-h-0">
                  <ChatBot
                    width="100%"
                    height="100%"
                    backgroundColor="var(--theme-mainbox-color)"
                    chatbotContext={chatbotContext}
                    chatbotRef={chatbotRef}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center">
              {renderInitialScore()}
            </div>
          )}
          {children}
        </DialogContent>
      </Dialog>
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="bg-[--theme-mainbox-color] p-6 rounded-lg border border-[--theme-border-color]">
          <div className="flex flex-col space-y-4">
            <h3 className="text-xl font-bold text-[--theme-text-color]">
              Unlock Personalized Learning
            </h3>
            <p className="text-[--theme-text-color] opacity-90">
              The Adaptive Tutoring Suite is a premium feature that provides:
            </p>
            <ul className="list-disc list-inside text-[--theme-text-color] space-y-2 opacity-80">
              <li>Personalized content based on your weak areas</li>
              <li>AI-powered learning recommendations</li>
              <li>Detailed performance analytics</li>
              <li>Curated study materials</li>
            </ul>
            <div className="pt-4">
              <UpgradeToGoldButton />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

AfterTestFeed.displayName = 'AfterTestFeed';

export default AfterTestFeed;
