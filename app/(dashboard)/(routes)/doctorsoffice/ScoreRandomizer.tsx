import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AnimatedStar from "./AnimatedStar";
import axios from 'axios'; // Make sure to import axios

interface ScoreRandomizerProps {
  onClose: () => void;
  playerLevel: number;
  streakDays: number;
  patientsPerDay: number;
  qualityOfCare: number;
  averageStarRating: number | null;
  clinicCostPerDay: number;
}

const ScoreRandomizer: React.FC<ScoreRandomizerProps> = ({
  onClose,
  playerLevel,
  streakDays,
  patientsPerDay,
  qualityOfCare,
  averageStarRating,
  clinicCostPerDay,
}) => {
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [finalScores, setFinalScores] = useState<number[]>([]); // New state to track final scores
  const [average, setAverage] = useState<number>(0);
  const [showAverage, setShowAverage] = useState<boolean>(false);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  
  useEffect(() => {
    let isCancelled = false;

    // Level QC values based on player level (max 2.0)
    const levelQCValues: { [level: number]: number } = {
      1: 1.0,
      2: 1.2,
      3: 1.4,
      4: 1.6,
      5: 1.8,
      6: 2.0,
    };

    // Streak modifier values based on streak days (max 2.5)
    const streakModifiers: { [days: number]: number } = {
      1: 1.0,
      2: 1.1,
      3: 1.2,
      4: 1.3,
      5: 1.4,
      6: 1.5,
      7: 2.0,  // Bigger jump at 7 days
      8: 2.1,
      9: 2.2,
      10: 2.3,
      11: 2.4,
      12: 2.5,
      13: 2.5,
      14: 2.5,
    };

    // Calculate Level QC and Streak Modifier
    const levelQC = levelQCValues[playerLevel] || 1.0;
    const streakModifier = streakDays >= 14 ? 2.5 : (streakModifiers[streakDays] || 1.0);

    // Total QC is the product of Level QC and Streak Modifier
    const totalQC = levelQC * streakModifier;

    // Calculate Quality Score (QS)
    const QS = totalQC - 1; // QS now ranges from 0 to 4

    // Base probabilities at minimum QC (1x), now including 0 stars
    const baseProbabilities: { [key: number]: number } = {
      0: 0.05,
      1: 0.10,
      2: 0.15,
      3: 0.33,
      4: 0.27,
      5: 0.10
    };

    // Adjust probabilities based on streak days
    if (streakDays >= 7 && streakDays < 14) {
      baseProbabilities[0] = 0;
      // Redistribute probability from 0 stars to other ratings
      const redistributeProb = 0.10 / 5;
      for (let i = 1; i <= 5; i++) {
        baseProbabilities[i] += redistributeProb;
      }
    } else if (streakDays >= 14 && streakDays < 30) {
      baseProbabilities[0] = 0;
      baseProbabilities[1] = 0;
      // Redistribute probability from 0 and 1 stars to other ratings
      const redistributeProb = 0.25 / 4;
      for (let i = 2; i <= 5; i++) {
        baseProbabilities[i] += redistributeProb;
      }
    } else if (streakDays >= 30) {
      baseProbabilities[0] = 0;
      baseProbabilities[1] = 0;
      baseProbabilities[2] = 0;
      // Redistribute probability from 0, 1, and 2 stars to other ratings
      const redistributeProb = 0.45 / 3;
      for (let i = 3; i <= 5; i++) {
        baseProbabilities[i] += redistributeProb;
      }
    }

    const adjustmentRate = 0.03; // 3% per QS point
    const fiveStarAdjustmentRate = 0.02; // 2% per QS point for 5-star ratings

    // Adjust probabilities based on QC
    let adjustedProbabilities = { ...baseProbabilities };

    for (let i = 0; i <= 3; i++) {
      adjustedProbabilities[i] -= QS * adjustmentRate;
    }
    adjustedProbabilities[4] += QS * adjustmentRate * 2.5; // Increase 4-star probability
    adjustedProbabilities[5] += QS * fiveStarAdjustmentRate * 2; // Increase 5-star probability more

    // Ensure probabilities are within 0% to 100%
    for (let i = 0; i <= 5; i++) {
      adjustedProbabilities[i] = Math.max(0, Math.min(1, adjustedProbabilities[i]));
    }

    // Normalize probabilities to ensure they sum to 1
    const totalProb = Object.values(adjustedProbabilities).reduce((sum, prob) => sum + prob, 0);
    for (let i = 0; i <= 5; i++) {
      adjustedProbabilities[i] /= totalProb;
    }

    // Function to get a random star rating based on adjusted probabilities
    const getRandomStarRating = (probabilities: { [key: number]: number }): number => {
      const rand = Math.random();
      let cumulative = 0;

      for (let star = 5; star >= 0; star--) {
        cumulative += probabilities[star];
        if (rand <= cumulative) {
          return star;
        }
      }
      return 0; // Default to 0 star if all else fails
    };

    // Function to animate score randomization
    const randomizeScore = (index: number): Promise<number> => {
      return new Promise((resolve) => {
        const targetScore = getRandomStarRating(adjustedProbabilities);
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
            setFinalScores((prev) => {
              const newFinalScores = [...prev];
              newFinalScores[index] = targetScore;
              return newFinalScores;
            });
            resolve(targetScore);
          }
        };

        animate();
      });
    };

    // Start animations for each review
    const startAnimations = async () => {
      const finalScores: number[] = [];
      for (let i = 0; i < 3; i++) {
        const score = await randomizeScore(i);
        finalScores[i] = score;
      }

      // Calculate and display average rating
      setTimeout(() => {
        if (isCancelled) return;
        const avg = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
        setAverage(avg);
        setShowAverage(true);

        // Update user score based on average rating
        let coinsToAdd = 0;
        if (avg === 5) {
          coinsToAdd = 3;
        } else if (avg >= 4.0) {
          coinsToAdd = 1;
        } else if (avg < 2) {
          coinsToAdd = -1;
        }

        if (coinsToAdd !== 0) {
          updateUserScore(coinsToAdd);
        }
      }, 500);
    };

    // Function to simulate multiple runs
    const simulateRatings = (iterations: number) => {
      const results: { [key: number]: number } = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0};

      for (let i = 0; i < iterations; i++) {
        const rating = getRandomStarRating(adjustedProbabilities);
        results[rating]++;
      }

      console.log(`Simulation Results for Level ${playerLevel}, Streak ${streakDays}:`);
      console.log('Raw counts:', results);
      
      // Calculate percentages
      const total = Object.values(results).reduce((sum, count) => sum + count, 0);
      const percentages = Object.entries(results).reduce((acc, [star, count]) => {
        acc[star] = ((count / total) * 100).toFixed(2);
        return acc;
      }, {} as { [key: string]: string });
      
      console.log('Percentages:', percentages);
      
      // Calculate average rating
      const averageRating = Object.entries(results).reduce((sum, [star, count]) => {
        return sum + (Number(star) * count);
      }, 0) / total;
      
      console.log('Average Rating:', averageRating.toFixed(2));
    };

    // Run the simulation
    simulateRatings(10000);

    startAnimations();

    return () => {
      isCancelled = true;
    };
  }, [playerLevel, streakDays, patientsPerDay, qualityOfCare, averageStarRating, clinicCostPerDay]);

  // Function to render stars with animation (update to handle 0 stars)
  const renderStars = (score: number, reviewIndex: number) => {
    const isFinal = finalScores[reviewIndex] !== undefined;
    const finalScore = finalScores[reviewIndex];

    return (
      <div className="flex">
        {isFinal && finalScore === 0 ? (
          <span className="text-red-500 font-bold">No Stars</span>
        ) : (
          [...Array(5)].map((_, i) => {
            const starProgress = Math.max(Math.min(score - i, 1), 0);
            return (
              <AnimatedStar
                key={i}
                progress={starProgress}
                uniqueId={`review-${reviewIndex}-star-${i}`}
              />
            );
          })
        )}
      </div>
    );
  };

  // Update sample review texts to include a 0-star review
  const reviewTexts = [
    "Terrible experience, avoid at all costs!",
    "Excellent care and service!",
    "Friendly staff and clean facilities.",
    "Quick appointment scheduling.",
  ];

  // Add this function to update the user's score
  const updateUserScore = async (amount: number) => {
    try {
      const response = await axios.put('/api/user-info/', { amount });
      if (response.data) {
        console.log('User score updated:', response.data.score);
        setCoinsEarned(amount);
      }
    } catch (error) {
      console.error('Error updating user score:', error);
    }
  };

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
                {renderStars(average, scores.length)}
              </div>
              <p className="mt-2 text-lg font-semibold">
                {average.toFixed(1)} out of 5 stars
              </p>
              {coinsEarned !== 0 && (
                <p className="mt-2 text-lg font-semibold">
                  {coinsEarned > 0 ? `You earned ${coinsEarned} coin${coinsEarned > 1 ? 's' : ''}!` : 'You lost 1 coin.'}
                </p>
              )}
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
