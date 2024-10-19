import React, { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from 'framer-motion';
import AnimatedStar from "./AnimatedStar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface LargeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string; 
  children?: ReactNode;
}

interface FeedItem {
  id: number;
  type: string;
  content: any;
}

const AfterTestFeed: React.FC<LargeDialogProps> = ({ open, onOpenChange, title, children }) => {
  const [score, setScore] = useState(0);
  const [showReviewFeed, setShowReviewFeed] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      id: 1,
      type: 'Reading',
      content: {
        title: 'Amino Acids Overview',
        text: 'Amino acids are organic compounds that combine to form proteins. They are key elements in the processes of neurotransmitter transport and biosynthesis. There are 20 standard amino acids, each with unique characteristics due to their side chains.'
      }
    },
    {
      id: 2,
      type: 'Flashcard',
      content: {
        question: 'What is the general structure of an amino acid?',
        answer: 'An amino acid consists of a central carbon atom (α-carbon) bonded to an amino group (-NH₂), a carboxyl group (-COOH), a hydrogen atom, and an R group (side chain) specific to each amino acid.'
      }
    },
    {
      id: 3,
      type: 'Practice Question',
      content: {
        question: 'Which of the following is a non-polar amino acid?',
        options: [
          { option: 'A', text: 'Serine', isCorrect: false, explanation: 'Serine is a polar amino acid due to its hydroxymethyl side chain.' },
          { option: 'B', text: 'Leucine', isCorrect: true, explanation: 'Leucine is a non-polar amino acid with an aliphatic isobutyl side chain.' },
          { option: 'C', text: 'Lysine', isCorrect: false, explanation: 'Lysine is a basic, polar amino acid with an amino side chain.' },
          { option: 'D', text: 'Glutamine', isCorrect: false, explanation: 'Glutamine is a polar amino acid due to its amide side chain.' },
        ],
        correctOption: 'B'
      }
    },
    // Additional dummy items can be added here
  ]);

  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (open) {
      // Reset states when dialog opens
      setScore(0);
      setShowReviewFeed(false);

      const animateScore = () => {
        const targetScore = Math.random() * 5;
        const duration = 2000 + Math.random() * 1000;
        const start = Date.now();

        const animate = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const currentScore = progress * targetScore;

          setScore(currentScore);

          if (progress < 1) {
            requestAnimationFrame(animate);
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
          return (
            <AnimatedStar
              key={i}
              progress={starProgress}
              uniqueId={`dialog-star-${i}`}
            />
          );
        })}
      </div>
    );
  };

  const renderPerformanceSummary = () => (
    <div className="mt-4 text-left">
      <p className="font-bold">Missed 12 Questions</p>
      <p className="font-semibold mt-2">Most missed categories</p>
      <ul className="list-disc list-inside">
        <li>Amino Acids (0/3)</li>
        <li>Motivation (0/3)</li>
        <li>Behavior (0/2)</li>
        <li>Gravity (0/5)</li>
      </ul>
      <p className="font-bold mt-4">Correct 12 Questions</p>
      <p className="font-semibold mt-2">Least missed</p>
      <ul className="list-disc list-inside">
        <li>Proteins (3/3)</li>
        <li>Social Institutions (2/3)</li>
      </ul>
    </div>
  );

  const handleGoToReviewFeed = () => {
    setShowReviewFeed(true);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process the question or add it to the feed
    if (userQuestion.trim() !== '') {
      const newItem = {
        id: feedItems.length + 1,
        type: 'Question',
        content: {
          question: userQuestion.trim()
        }
      };
      setFeedItems([newItem, ...feedItems]);
      setUserQuestion('');
    }
  };

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
    if (neverShowAgain) {
      onOpenChange(false);
    } else {
      setShowExitConfirmation(true);
    }
  };

  const handleConfirmExit = () => {
    if (neverShowAgain) {
      // Save this preference to local storage or user settings
      localStorage.setItem('neverShowExitConfirmation', 'true');
    }
    onOpenChange(false);
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  const renderAminoAcidOverview = () => (
    <div className="mb-10 p-6 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg bg-opacity-30 border border-opacity-20 bg-red-100 border-red-200 text-[--theme-text-color]">
      <h2 className="text-2xl font-bold mb-4">Amino Acid Overview</h2>
      <p className="mb-6 text-opacity-90">
        Amino acids are organic compounds that combine to form proteins. They are key elements in the processes of neurotransmitter transport and biosynthesis. There are 20 standard amino acids, each with unique characteristics due to their side chains.
      </p>
      <form onSubmit={handleQuestionSubmit} className="mt-6">
        <input
          type="text"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          placeholder="Ask a question about amino acids..."
          className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <Button
          type="submit"
          className="mt-3 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:bg-[--theme-hover-color] transition-colors duration-300"
        >
          Submit Question
        </Button>
      </form>
    </div>
  );

  const lastFeedItemRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        // Load more items here
        loadMoreItems();
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore]);

  const loadMoreItems = () => {
    // Simulating loading more items
    // In a real scenario, you'd fetch more items from an API
    const newItems: FeedItem[] = [
      // ... generate new items here ...
    ];
    setFeedItems(prevItems => [...prevItems, ...newItems]);
    if (newItems.length === 0) {
      setHasMore(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleExit}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <DialogContent 
          className="bg-[--theme-text-color] text-center p-8 bg-[--theme-leaguecard-color] border border-[--theme-border-color] rounded-xl max-w-[90vw] w-[1000px] max-h-[90vh] h-[800px] overflow-y-auto"
          closeButtonClassName="text-[--theme-text-color] hover:text-[--theme-text-color] focus:ring-[--theme-text-color]"
        >
          {!showReviewFeed ? (
            <div className="bg-[--theme-gradient-end] p-4 rounded-lg shadow-lg">
              {renderStars()}
              <p className="text-xl font-semibold text-[--theme-text-color] mt-2 mb-4">
                {"Insert review of performance here"}
              </p>
              {renderPerformanceSummary()}
              <Button
                onClick={handleGoToReviewFeed}
                className="mt-4 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:bg-[--theme-hover-color]"
              >
                Go to review feed?
              </Button>
            </div>
          ) : (
            <div className="text-[--theme-text-color] relative">
              <h2 className="text-2xl font-bold mb-4">Review Feed</h2>
              {renderAminoAcidOverview()}
              {/* Feed Items */}
              <div className="overflow-visible relative"> {/* Change overflow to visible */}
                {feedItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    ref={index === feedItems.length - 1 ? lastFeedItemRef : null}
                  >
                    {renderFeedItem(item)}
                  </div>
                ))}
                {hasMore && <div className="text-center py-4">Loading more...</div>}
                {!hasMore && (
                  <div className="text-center py-4">
                    <Button
                      onClick={handleExit}
                      className="bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:bg-[--theme-hover-color]"
                    >
                      Go to ATS
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          {showExitConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h3 className="text-xl font-bold mb-4 text-black">Confirm Exit</h3>
                <p className="mb-4 text-black">{"You won't be able to see this review page again. Are you sure?"}</p>
                <div className="flex items-center mb-4">
                  <Checkbox
                    id="neverShowAgain"
                    checked={neverShowAgain}
                    onCheckedChange={(checked) => setNeverShowAgain(checked as boolean)}
                  />
                  <label htmlFor="neverShowAgain" className="ml-2 text-sm text-black">
                    Never show this again
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button onClick={handleCancelExit} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmExit} variant="default">
                    Confirm
                  </Button>
                </div>
              </div>
            </div>
          )}
          {children}
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};

export default AfterTestFeed;
