import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AnimatedStar from "./AnimatedStar";

interface ScoreRandomizerProps {
  onClose: () => void;
}

const ScoreRandomizer: React.FC<ScoreRandomizerProps> = ({ onClose }) => {
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [average, setAverage] = useState<number>(0);
  const [showAverage, setShowAverage] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const randomizeScore = (index: number): Promise<number> => {
      return new Promise((resolve) => {
        const targetScore = Math.floor(Math.random() * 5) + 1; // Final score between 1 and 5
        const duration = 2000 + Math.random() * 1000; // Duration between 2s and 3s

        const start = Date.now();

        const animate = () => {
          if (isCancelled) return;

          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const currentScore = progress * targetScore;

          setScores((prevScores) => {
            const newScores = [...prevScores];
            newScores[index] = currentScore;
            return newScores;
          });

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve(targetScore);
          }
        };

        animate();
      });
    };

    const startAnimations = async () => {
      const finalScores: number[] = [];
      for (let i = 0; i < 3; i++) {
        const score = await randomizeScore(i);
        finalScores[i] = score;
      }

      // Delay showing the average for effect
      setTimeout(() => {
        if (isCancelled) return;
        const avg = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
        setAverage(avg);
        setShowAverage(true);
      }, 500);
    };

    startAnimations();

    return () => {
      isCancelled = true;
    };
  }, []); // Changed dependency array to empty to run only once on mount

  const renderStars = (score: number, reviewIndex: number | string) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          const starProgress = Math.max(Math.min(score - i, 1), 0);
          return (
            <AnimatedStar
              key={i}
              progress={starProgress}
              uniqueId={`review-${reviewIndex}-star-${i}`}
            />
          );
        })}
      </div>
    );
  };

  const reviewTexts = [
    "Excellent care and service!",
    "Friendly staff and clean facilities.",
    "Quick appointment scheduling."
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[--theme-leaguecard-color] border-2 border-[--theme-border-color] text-[--theme-text-color] max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Patient Reviews</h2>
        <div className="space-y-4">
          {scores.map((score, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Review {index + 1}:</span>
                {renderStars(score, index)}
              </div>
              <p className="text-center text-[--theme-text-color]">{reviewTexts[index]}</p>
            </div>
          ))}
          {showAverage && (
            <div className="mt-6 p-4 bg-[--theme-hover-color] border border-[--theme-border-color] rounded-lg text-center text-[--theme-text-color] animate-pulse">
              <h3 className="text-xl font-bold">Average Rating</h3>
              <div className="flex justify-center mt-2">
                {renderStars(average, 'average')}
              </div>
              <p className="mt-2 text-lg font-semibold">
                {average.toFixed(1)} out of 5 stars
              </p>
            </div>
          )}
        </div>
        <Button 
          onClick={onClose} 
          className="mt-6 w-full bg-[--theme-doctorsoffice-accent] border-2 border-[--theme-border-color] text-[--theme-text-color] hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color] transition-colors"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreRandomizer;
