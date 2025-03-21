//components/ScoreDialog.tsx
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import Image from 'next/image';
import { useAudio } from '@/store/selectors';

interface ScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number; // Percentage score (0-100)
  timing: number; // Average time per question in seconds
  correctAnswer: number; // Number of correct answers
  technique: number; // Technique score out of 4
  totalQuestions: number; // Total number of questions
  userTestId: string | undefined; // User test ID
  totalTimeTaken: number; // Total time taken in seconds
  difficulty?: number; // Added difficulty prop
}

const ScoreDialog: React.FC<ScoreDialogProps> = ({
  open,
  onOpenChange,
  score,
  timing,
  correctAnswer,
  technique,
  totalQuestions,
  userTestId,
  totalTimeTaken, 
  difficulty
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [scoreStars, setScoreStars] = useState(0);
  const [timingStars, setTimingStars] = useState(0);
  const [techniqueStars, setTechniqueStars] = useState(0);
  const router = useRouter();
  const audio = useAudio();
  
  // Track animation intervals for cleanup
  const intervalsRef = useRef<Array<NodeJS.Timeout>>([]);
  // Flag to ensure sound is played only once
  const soundPlayedRef = useRef(false);
  // Dialog previous state 
  const wasOpenRef = useRef(false);

  // Cleanup function for intervals
  const cleanupIntervals = useCallback(() => {
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];
  }, []);

  // Play sound once when dialog opens
  useEffect(() => {
    // Only play sound when the dialog first opens
    if (open && !wasOpenRef.current && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      
      // Use setTimeout to ensure sound isn't played immediately during render loop
      setTimeout(() => {
        // Double check the flag hasn't changed
        if (soundPlayedRef.current && open) {
          // Play appropriate sound based on score
          if (score === 100) {
            audio.playSound('fanfare');
          } else if (score >= 60) {
            audio.playSound('levelup');
          } else {
            audio.playSound('sadfanfare');
          }
        }
      }, 100);
    }
    
    // Reset sound played flag when dialog closes
    if (!open && wasOpenRef.current) {
      soundPlayedRef.current = false;
    }
    
    // Update previous state
    wasOpenRef.current = open;
  }, [open, score, audio]);

  useEffect(() => {
    // Reset values when dialog opens
    if (open) {
      setAnimatedScore(0);
      setScoreStars(0);
      setTimingStars(0);
      setTechniqueStars(0);

      // Create all animations at once with a single timeout
      setTimeout(() => {
        startAnimations();
      }, 300);
    }

    return () => {
      cleanupIntervals();
    };
  }, [open, cleanupIntervals]);

  // Function to start all animations
  const startAnimations = () => {
    cleanupIntervals(); // Clear any existing intervals
    
    // Calculate target values
    const targetScore = score;
    const targetScoreStars = getStarCount(score);
    const targetTimingStars = getTimingStars(totalTimeTaken, totalQuestions);
    const targetTechniqueStars = getTechniqueStars(technique);
    
    // Use a single animation frame for all animations
    let frameCount = 0;
    const totalFrames = 12; // Complete all animations in 12 frames
    
    const animationInterval = setInterval(() => {
      frameCount++;
      
      if (frameCount >= totalFrames) {
        // Final frame - set exact values
        setAnimatedScore(targetScore);
        setScoreStars(targetScoreStars);
        setTimingStars(targetTimingStars);
        setTechniqueStars(targetTechniqueStars);
        cleanupIntervals();
        return;
      }
      
      // Calculate progress (0 to 1)
      const progress = frameCount / totalFrames;
      
      // Update all values based on progress
      const newScore = Math.floor(targetScore * progress);
      const newScoreStars = Math.min(targetScoreStars, Math.ceil(targetScoreStars * progress));
      const newTimingStars = Math.min(targetTimingStars, Math.ceil(targetTimingStars * progress));
      const newTechniqueStars = Math.min(targetTechniqueStars, Math.ceil(targetTechniqueStars * progress));
      
      setAnimatedScore(newScore);
      setScoreStars(newScoreStars);
      setTimingStars(newTimingStars);
      setTechniqueStars(newTechniqueStars);
    }, 80); // ~1 second total animation
    
    // Store interval for cleanup
    intervalsRef.current.push(animationInterval);
  };

  const getStarCount = (score: number) => {
    if (score === 100) return 3;
    if (score >= 80) return 2;
    return 1;
  };

  const getTimingStars = (totalTimeTaken: number, totalQuestions: number) => {
    // Convert total time to minutes
    const totalMinutes = totalTimeTaken / 60;

    if (totalMinutes <= 10) return 3;
    if (totalMinutes <= 12) return 2;
    return 1;
  };

  const getTechniqueStars = (technique: number) => {
    return technique;
  };

  const renderStars = (count: number) => {
    const safeCount = Math.max(0, Math.min(3, Math.floor(count)));
    return (
      <>
        {Array.from({ length: safeCount }).map((_, i) => (
          <Star key={i} className="text-yellow-400 fill-yellow-400" />
        ))}
        {Array.from({ length: 3 - safeCount }).map((_, i) => (
          <Star key={i + safeCount} className="text-gray-300" />
        ))}
      </>
    );
  };

  const getCupcakeImage = (totalStars: number) => {
    if (totalStars >= 6) return "/gleamingcoin.gif";
    return null;
  };

  const getDialogContent = (totalStars: number, difficulty?: number) => {
    if (totalStars === 9) {
        if (difficulty && difficulty >= 3) {
            return {
                title: "PERFECT!",
                description: "You earned 3 coins! Outstanding work on this difficult passage!",
            };
        }
        return {
            title: "PERFECT!",
            description: "You earned 2 coins! Amazing work!",
        };
    } else if (totalStars >= 6) {
        return {
            title: "WELL DONE!",
            description: "You earned 1 coin!",
        };
    } else {
        return {
            title: "KEEP PRACTICING!",
            description: "You need 6 stars to earn a coin.",
        };
    }
  };

  const getQuestionsRight = (correctAnswer: number, totalQuestions: number) => {
    return `${correctAnswer}/${totalQuestions}`;
  };

  const formatTotalTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getAverageTimingPerQuestion = (timing: number, totalQuestions: number) => {
    const averageSeconds = timing / totalQuestions;
    const minutes = Math.floor(averageSeconds / 60);
    const seconds = Math.floor(averageSeconds % 60);
    return `${minutes}m ${seconds}s`;
  };

  const getTechniqueDescription = (technique: number) => {
    if (technique === 3) return "Excellent";
    else if (technique === 2) return "Good";
    else return "Needs Improvement";
  };

  const dialogContent = getDialogContent(
    scoreStars + timingStars + techniqueStars,
    difficulty
  );

  const handleReviewClick = () => {
    onOpenChange(false);
    if (userTestId) {
      router.push(`/user-test/${userTestId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-black border-2 border-pink-600">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold text-pink-600 text-center">
            {dialogContent.title}
          </DialogTitle>
          <DialogDescription className="text-gray-700 text-center">
            {dialogContent.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mb-4">
          {getCupcakeImage(scoreStars + timingStars + techniqueStars) && (
            <Image
              src={getCupcakeImage(scoreStars + timingStars + techniqueStars)!}
              alt="Cupcake"
              width={200}
              height={200}
              className="h-[30vh] w-auto"
            />
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          {/* Score Section */}
          <div>
            <p className="text-xl font-semibold">Score</p>
            <p className="text-2xl font-bold text-pink-600">
              {animatedScore}%
            </p>
            <p className="text-lg">
              {getQuestionsRight(correctAnswer, totalQuestions)}
            </p>
            <div className="flex justify-center mt-2">
              {renderStars(scoreStars)}
            </div>
          </div>
          {/* Timing Section */}
          <div>
            <p className="text-xl font-semibold">Total Time</p>
            <p className="text-2xl font-bold text-pink-600">
              {formatTotalTime(totalTimeTaken)}
            </p>
            <div className="flex justify-center mt-2">
              {renderStars(timingStars)}
            </div>
          </div>
          {/* Technique Section */}
          <div>
            <p className="text-xl font-semibold">Technique</p>
            <p className="text-2xl font-bold text-pink-600">{technique}/3</p>
            <p className="text-lg">{getTechniqueDescription(technique)}</p>
            <div className="flex justify-center mt-2">
              {renderStars(techniqueStars)}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          {userTestId ? (
            <button
              onClick={handleReviewClick}
              className="bg-pink-600 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded"
            >
              Review
            </button>
          ) : (
            <button
              onClick={() => onOpenChange(false)}
              className="bg-pink-600 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreDialog;
