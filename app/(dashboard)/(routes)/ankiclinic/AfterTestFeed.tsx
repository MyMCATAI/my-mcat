//app/(dashboard)/(routes)/ankiclinic/AfterTestFeed.tsx
import React, { useState, useEffect, useRef, useCallback, ReactNode, forwardRef, useImperativeHandle, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import AnimatedStar from "./AnimatedStar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { animated, useSpring } from 'react-spring';
import ChatBot from "@/components/chatbot/ChatBotFlashcard";
import { useUser } from "@clerk/nextjs";
import { GraduationCap, Cat } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import type { UserResponseWithCategory } from "@/types";
import VideoRecommendations from './components/VideoRecommendations';
import { useAudio } from '@/store/selectors';
import { useGame } from '@/store/selectors';
import { useUserInfo } from '@/hooks/useUserInfo';
import { ATS_ANKI_THRESHOLDS } from '@/lib/coin/constants';
import { calculateAnkiReward } from '@/lib/coin/utils';

/* ------------------------------------------ Types ------------------------------------------ */
interface LargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string; 
  children?: ReactNode;
  largeDialogQuit: boolean;
  setLargeDialogQuit: (quit: boolean) => void;
}

interface ConceptData {
  correct: number;
  incorrect: number;
  total: number;
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
  types: string;
}

interface WrongCard {
  id: string;
  timestamp: string;
  question: string;
  answer: string;
  questionOptions: string[];
  isFlipped: boolean;
  types: string;
}

interface Review {
  id: string;
  tier: number;
  rating: number;
  review: string;
  profilePicture: string;
}

interface TestResponse {
  createdAt: string | Date;
  questionId: string;
  answeredAt: Date;
  question?: Question;
}

interface VideoRecommendation {
  id: string;
  title: string;
  link: string;
  minutes_estimate: number;
  thumbnail: string;
  category: {
    conceptCategory: string;
  };
}

/* ---------------------------------------- Constants --------------------------------------- */
const STAR_THRESHOLDS = {
  PERFECT: 100,
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 20,
} as const;

const LOADING_REVIEW_MESSAGES: string[] = [
  "Paws... Kalypso is carefully preparing your review 🐾...",
  "Kalypso is giving your review a thorough cat scan 🏥🐱...",
  "Kalypso is consulting the Great Book of Meowdicine 📖🐾...",
  "Kalypso is running a full diagnostic—complete with purrfect analysis 😺💉...",
  "Kalypso is double-checking with the lab rats 🐭🔬...",
  "Kalypso is preparing a meowvaluation 🏥🐾..."
];

/* ----------------------------------------------------------------------------------------- */
/* --------------------------------------- Component --------------------------------------- */
/* ----------------------------------------------------------------------------------------- */

const AfterTestFeed = forwardRef<{ setWrongCards: (cards: any[]) => void }, LargeDialogProps>(({ 
  open, 
  onOpenChange, 
  title, 
  children, 
  largeDialogQuit, 
  setLargeDialogQuit
}, ref) => {
  /* ---------------------------------------- Hooks ---------------------------------------- */
  const audio = useAudio();
  const router = useRouter();
  const { user } = useUser();
  const { isSubscribed, updateScore } = useUserInfo();
  const { userResponses, correctCount, wrongCount, isGameInProgress } = useGame();
  
  // Only keep refs that need to persist between renders without triggering re-renders
  const chatbotRef = useRef<{
    sendMessage: (message: string) => void;
  }>({ sendMessage: () => {} });
  const videoScrollContainerRef = useRef<HTMLDivElement>(null);

  /* --------------------------------------- State ---------------------------------------- */
  const [review, setReview] = useState<Review | null>(null);
  const [showReviewFeed, setShowReviewFeed] = useState(false);
  const [mostMissed, setMostMissed] = useState<ConceptScore>({});
  const [mostCorrect, setMostCorrect] = useState<ConceptScore>({});
  const [conceptStats, setConceptStats] = useState<ConceptScore>({});
  const [wrongCards, setWrongCards] = useState<WrongCard[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(() => 
    LOADING_REVIEW_MESSAGES[Math.floor(Math.random() * LOADING_REVIEW_MESSAGES.length)]
  );
  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: "",
  });
  const [recommendedVideos, setRecommendedVideos] = useState<VideoRecommendation[]>([]);
  // Convert ref flags to state
  const [hasAwardedCoins, setHasAwardedCoins] = useState(false);
  const [hasFetchedReview, setHasFetchedReview] = useState(false);
  const [hasProcessedResponses, setHasProcessedResponses] = useState(false);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  /* ------------------------------------ Expose Methods ---------------------------------- */
  useImperativeHandle(ref, () => ({
    setWrongCards: (cards: any[]) => {
      setWrongCards(cards);
    }
  }));

  /* ------------------------------------ Computed Values --------------------------------- */
  const score = useMemo(() => {
    if (correctCount + wrongCount === 0) return 0;
    return correctCount/(correctCount+wrongCount) * 100;
  }, [correctCount, wrongCount]);

  /* ------------------------------------ Animations ------------------------------------- */
  const springs = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
  });

  /* ------------------------------------ Callbacks ------------------------------------- */
  const handleGoToReviewFeed = useCallback(() => {
    setShowReviewFeed(true);
  }, []);

  const handleExit = useCallback(() => {
    onOpenChange(false);
    setLargeDialogQuit(true);
    setHasAwardedCoins(false);
    setHasFetchedReview(false);
    setHasProcessedResponses(false);
  }, [onOpenChange, setLargeDialogQuit]);

  const handleCardFlip = useCallback((index: number) => {
    setWrongCards(cards => 
      cards.map((card, i) => 
        i === index ? { ...card, isFlipped: !card.isFlipped } : card
      )
    );
  }, []);

  const handleNavigateToTutoring = useCallback(() => {
    if (!isSubscribed) {
      router.push('/pricing');
      return;
    }

    const weakestCategories = Object.entries(mostMissed)
      .slice(0, 6)
      .map(([concept]) => encodeURIComponent(concept));

    const url = `/home?tab=AdaptiveTutoringSuite&conceptCategories=${weakestCategories.join(',')}`;
    router.push(url);
  }, [isSubscribed, mostMissed, router]);

  const handleScroll = useCallback(() => {
    if (videoScrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = videoScrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);
  
  const scrollTo = useCallback((direction: 'left' | 'right') => {
    if (videoScrollContainerRef.current) {
      const scrollAmount = 300;  
      const newScrollLeft = videoScrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      videoScrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  }, []);

  /* -------------------------------------- Helpers --------------------------------------- */
  const getStarCount = useCallback((score: number): number => {
    if (score >= STAR_THRESHOLDS.PERFECT) return 5;
    if (score >= STAR_THRESHOLDS.EXCELLENT) return 4;
    if (score >= STAR_THRESHOLDS.GOOD) return 3;
    if (score >= STAR_THRESHOLDS.FAIR) return 2;
    if (score >= STAR_THRESHOLDS.POOR) return 1;
    return 0;
  }, []);

  const cleanAnswer = useCallback((text: string): string => {
    const matches = [...text.matchAll(/{{c[^:]*::(.+?)(?=::|}})/g)];
    const result = matches.map(match => match[1]).join(', ');
    
    return result
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
  }, []);

  const getAnswerContent = useCallback((response: UserResponseWithCategory): string => {
    if (!response.question) return '';
    
    try {
      const options = JSON.parse(response.question.questionOptions || '[]');
      if (response.question.types === 'normal') {
        return `${options[0]}`;
      }
      
      return cleanAnswer(response.question.questionContent);
    } catch (e) {
      console.error('Error parsing question options:', e);
      return cleanAnswer(response.question.questionContent);
    }
  }, [cleanAnswer]);

  const fetchReview = useCallback(async (rating: number): Promise<Review | null> => {
    try {
      const url = `/api/reviews?tier=1&rating=${rating}&count=1`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Review fetch failed:', response.status, response.statusText);
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
  }, []);

  const parseUserResponses = useCallback((responses: UserResponseWithCategory[]) => {
    if (!responses?.length) return {};

    const conceptStats: Record<string, ConceptData> = {};
    const newWrongCards: WrongCard[] = [];

    responses.forEach(response => {
      const concept = response.question?.category?.conceptCategory;
      if (!concept) return;

      if (!conceptStats[concept]) {
        conceptStats[concept] = { correct: 0, incorrect: 0, total: 0 };
      }

      if (response.isCorrect) {
        conceptStats[concept].correct += 1;
      } else {
        conceptStats[concept].incorrect += 1;
        
        if (response.question) {
          newWrongCards.push({
            id: response.questionId,
            timestamp: new Date(response.answeredAt ?? new Date()).toLocaleString(),
            question: response.question.questionContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim(),
            answer: getAnswerContent(response),
            questionOptions: response.question.types === 'normal' ? 
              JSON.parse(response.question?.questionOptions || '[]') : [],
            isFlipped: false,
            types: response.question.types || 'normal'
          });
        }
      }
      conceptStats[concept].total += 1;
    });

    return { conceptStats, newWrongCards };
  }, [getAnswerContent]);

  const replaceNameInReview = useCallback((review: string): string => {
    const userName = user
      ? user.firstName
        ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)
        : "Doctor"
      : "Doctor";
    return review.replace(/\$NAME/g, userName);
  }, [user]);

  const handleCoinReward = useCallback(async () => {
    // If coins have already been awarded or there are no responses, return early
    if (hasAwardedCoins || !userResponses.length) return;

    // Mark coins as awarded immediately to prevent multiple executions
    setHasAwardedCoins(true);

    try {
      const mcqResponses = userResponses.filter(r => r.question?.types === 'normal');
      const mcqCorrect = mcqResponses.filter(r => r.isCorrect).length;
      const mcqTotal = mcqResponses.length;
      
      if (!mcqTotal) return;

      const mcqPercentage = Math.round((mcqCorrect / mcqTotal) * 100);
      const coinsEarned = calculateAnkiReward(mcqPercentage);

      if (!coinsEarned) return;

      await updateScore(coinsEarned);

      if (coinsEarned > 0) {
        if (mcqPercentage >= ATS_ANKI_THRESHOLDS.GREAT) {
          audio.playSound('fanfare');
          toast.success(`Congratulations! You earned ${coinsEarned} coins for a perfect score! 🎉`);
        } else if (mcqPercentage >= ATS_ANKI_THRESHOLDS.GOOD) {
          audio.playSound('levelup');
          toast.success(`Congratulations! You earned ${coinsEarned} coins for your excellent performance! 🎉`);
        } else if (mcqPercentage >= ATS_ANKI_THRESHOLDS.OKAY) {
          toast.success(`You earned ${coinsEarned} coin for scoring above ${ATS_ANKI_THRESHOLDS.OKAY}%! 🎉`);
        }
      } else {
        toast.error(`You lost ${Math.abs(coinsEarned)} coin due to low performance. Don't worry, Kalypso is here to help you improve!`);
      }
    } catch (error) {
      console.error('Error in coin reward process:', error);
      toast.error("Failed to update coins");
    }
  }, [userResponses, updateScore, audio]);

  /* ------------------------------------ Effects -------------------------------------- */
  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setShowReviewFeed(false);
      setShowStats(false);
      setReview(null);
      setMostMissed({});
      setMostCorrect({});
      setConceptStats({});
      setWrongCards([]);
      setIsDataLoaded(false);
      setHasAwardedCoins(false);
      setHasFetchedReview(false);
      setHasProcessedResponses(false);
    }
  }, [open]);

  // Process user responses
  useEffect(() => {
    if (userResponses.length > 0 && !hasProcessedResponses) {
      setHasProcessedResponses(true);
      const { conceptStats: newConceptStats = {}, newWrongCards = [] } = parseUserResponses(userResponses) || {};
      const convertedStats: ConceptScore = Object.entries(newConceptStats).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: [value.correct, value.incorrect, value.total]
      }), {});
      setConceptStats(convertedStats);
      setWrongCards(newWrongCards);
    }
  }, [userResponses, hasProcessedResponses, parseUserResponses]);

  // Process concept stats for most missed/correct
  useEffect(() => {
    if (Object.keys(conceptStats).length > 0) {
      // Proficient: Only topics with 100% correct answers
      const proficient = Object.entries(conceptStats)
        .filter(([concept, [correct, incorrect]]) => incorrect === 0)
        .sort(([concept1, stats1], [concept2, stats2]) => stats2[0] - stats1[0]) // Sort by number of correct answers
        .reduce((acc, [concept, stats]) => {
          acc[concept] = stats;
          return acc;
        }, {} as ConceptScore);
      setMostCorrect(proficient);

      // Needs Review: Any topic with incorrect answers
      const needsReview = Object.entries(conceptStats)
        .filter(([concept, [correct, incorrect]]) => incorrect > 0)
        .sort(([concept1, stats1], [concept2, stats2]) => stats2[1] - stats1[1]) // Sort by number of incorrect answers
        .reduce((acc, [concept, stats]) => {
          acc[concept] = stats;
          return acc;
        }, {} as ConceptScore);
      setMostMissed(needsReview);
    }
  }, [conceptStats]);

  // Fetch review data
  useEffect(() => {
    if (open) {
      const starCount = getStarCount(score);
      fetchReview(starCount)
        .then(reviewData => {
          if (reviewData) {
            setReview(reviewData);
            setIsDataLoaded(true);
          } else {
            setIsDataLoaded(true);
          }
        })
        .catch(error => {
          console.error('Error fetching review:', error);
          setIsDataLoaded(true);
        });
    }
  }, [open, score, getStarCount, fetchReview]);

  // Handle coin rewards
  useEffect(() => {
    if (isDataLoaded && !hasAwardedCoins) {
      handleCoinReward();
    }
  }, [isDataLoaded, hasAwardedCoins, handleCoinReward]);

  // Handle chatbot context
  useEffect(() => {
    if (isDataLoaded) {
      setChatbotContext({
        contentTitle: "Test Results",
        context: `Score: ${score}%, Correct: ${correctCount}, Wrong: ${wrongCount}`
      });
    }
  }, [isDataLoaded, score, correctCount, wrongCount]);

  // Handle video recommendations
  useEffect(() => {
    if (isDataLoaded) {
      const fetchRecommendedVideos = async () => {
        if (!userResponses.length) return;
        
        const categories = [...new Set(userResponses
          .map(r => r.question?.category?.conceptCategory)
          .filter(Boolean))];

        try {
          const response = await fetch(`/api/videos/recommendations?categories=${categories.join(',')}&maxDuration=300`);
          if (!response.ok) throw new Error('Failed to fetch videos');
          const videos = await response.json();
          setRecommendedVideos(videos);
        } catch (error) {
          console.error('Error fetching recommended videos:', error);
        }
      };

      fetchRecommendedVideos();
    }
  }, [isDataLoaded, userResponses]);

  // Handle game state changes
  useEffect(() => {
    if (!isGameInProgress && open) {
      onOpenChange(false);
      setLargeDialogQuit(true);
    }
  }, [isGameInProgress, open, onOpenChange, setLargeDialogQuit]);

  // Handle scroll events
  useEffect(() => {
    const scrollContainer = videoScrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); 
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isInputActive = document.activeElement?.tagName === 'INPUT' || 
                           document.activeElement?.tagName === 'TEXTAREA';

      if (e.code === 'Space' && wrongCards.length > 0 && !isInputActive) {
        e.preventDefault();
        handleCardFlip(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [wrongCards.length, handleCardFlip]);

  // Only show loading state if we have no responses and data hasn't been loaded yet
  if (userResponses.length === 0 && !isDataLoaded) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            <p className="mt-4 text-lg font-medium">Loading your results...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ------------------------------------ Render Methods ------------------------------------ */
  const renderReviewSection = () => (
    <ScrollArea className="h-[calc(95vh-6rem)] scrollbar-none">
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
                        {card.questionOptions.map((option, optIndex) => {
                          const isCorrectAnswer = option === card.answer;
                          return (
                            <div 
                              key={optIndex}
                              className={`p-2 rounded-md ${isCorrectAnswer ? 'bg-green-500/20' : 'bg-[--theme-doctorsoffice-accent] bg-opacity-20'} text-sm text-[--theme-text-color] relative`}
                            >
                              {option}
                              {isCorrectAnswer && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[--theme-text-color] opacity-50">
                                  ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="text-sm mb-1 text-[--theme-text-color] opacity-70">Correct Answer:</div>
                    <div className="text-green-500 font-semibold mb-4">{card.answer}</div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
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

  const renderInitialScore = () => {
    const mcqResponses = userResponses.filter(r => r.question?.types === 'normal');
    const mcqCorrect = mcqResponses.filter(r => r.isCorrect).length;
    const mcqTotal = mcqResponses.length;
    const mcqPercentage = mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-6 p-5 max-w-5xl mx-auto"
      >
        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-[--theme-text-color] text-center mb-2">
            {mcqPercentage >= 80 ? (
              "The checkup went so well, we earned coins!"
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

        {/* Score and Review */}
        <div className="flex gap-6">
          {/* Review Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 bg-[--theme-flashcard-color] p-6 rounded-2xl shadow-lg flex items-center"
          >
            {review ? (
              <div className="flex flex-col gap-4 w-full">
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[--theme-text-color]">{loadingMessage}</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[--theme-text-color]" />
                </div>
              </div>
            )}
          </motion.div>

          {/* Score Card */}
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

        {/* Performance Categories */}
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
                  {Object.keys(mostMissed).length}
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
            <ScrollArea className="h-[100px] pr-4" showScrollbar={true}>
              <div className="space-y-3">
                {Object.entries(mostMissed).length > 0 ? (
                  Object.entries(mostMissed).map(([concept, [_, incorrect, total]], index) => (
                    <div key={concept} 
                      className="flex justify-between items-center p-3 rounded-lg bg-[--theme-doctorsoffice-accent] bg-opacity-10 hover:bg-opacity-20 transition-all"
                    >
                      <span className="text-[--theme-text-color]">{concept}</span>
                      <span className="font-medium text-[--theme-text-color]">{incorrect}/{total}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[--theme-text-color] opacity-70 italic">
                    No topics need review
                  </div>
                )}
              </div>
            </ScrollArea>
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
                {Object.keys(mostCorrect).length}
              </span>
            </h3>
            <ScrollArea className="h-[100px] pr-4" showScrollbar={true}>
              <div className="space-y-3">
                {Object.entries(mostCorrect).map(([concept, [correct, _, total]], index) => (
                  <div key={concept} 
                    className="flex justify-between items-center p-3 rounded-lg text-[--theme-text-color] bg-[--theme-hover-color] bg-opacity-10 hover:bg-opacity-20 transition-all"
                  >
                    <span>{concept}</span>
                    <span className="font-medium">{correct}/{total}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
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

  /* ------------------------------------ Main Render ------------------------------------- */
  if(!open) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleExit}>
        <DialogContent className="bg-[--theme-mainbox-color] text-center p-4 max-w-[95vw] w-[55rem] max-h-[90vh] overflow-hidden shadow-lg border border-transparent">
          {showReviewFeed ? (
            <div className="flex relative w-full h-full">
              {/* Back Button */}
              <button
                onClick={() => setShowReviewFeed(false)}
                className="absolute left-4 z-50 w-8 h-8 rounded-full 
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

              {/* Main Content Container */}
              <div className="flex w-full h-full">
                {/* Left Side - Review Section */}
                <div className="w-1/3 min-w-[300px] h-full">
                  {renderReviewSection()}
                </div>

                {/* Right Side - Chat Interface and Video Reviews */}
                <div className="w-2/3 h-full flex flex-col relative">
                  <div className="absolute top-0 bottom-0 left-0 right-0 bottom-[29%] overflow-hidden">
                    <ChatBot 
                      width="100%"
                      height="100%"
                      backgroundColor="var(--theme-mainbox-color)"
                      chatbotContext={chatbotContext}
                      chatbotRef={chatbotRef}
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-[26%] bg-[--theme-mainbox-color]">
                    <VideoRecommendations videos={recommendedVideos} />
                  </div>
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
    </>
  );
});

AfterTestFeed.displayName = 'AfterTestFeed';

export default AfterTestFeed;