'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation'; // Updated import
import Link from 'next/link';
import Image from 'next/image'; // Added import

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
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [scoreStars, setScoreStars] = useState(0);
  const [timingStars, setTimingStars] = useState(0);
  const [techniqueStars, setTechniqueStars] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      if (audioRef.current) {
        if (score === 100) {
          audioRef.current.src = "/fanfare.mp3";
        } else if (score >= 60) {
          audioRef.current.src = "/levelup.mp3";
        } else {
          audioRef.current.src = "/sadfanfare.mp3";
        }
        audioRef.current.play();
      }

      // Animate the score percentage
      let currentScore = 0;
      const scoreInterval = setInterval(() => {
        if (currentScore < score) {
          currentScore += 1;
          setAnimatedScore(currentScore);
        } else {
          clearInterval(scoreInterval);
        }
      }, 20);

      // Animate stars for score
      let currentScoreStars = 0;
      const targetScoreStars = getStarCount(score);
      const scoreStarsInterval = setInterval(() => {
        if (currentScoreStars < targetScoreStars) {
          currentScoreStars += 0.1;
          setScoreStars(currentScoreStars);
        } else {
          clearInterval(scoreStarsInterval);
        }
      }, 50);

      // Animate stars for timing
      let currentTimingStars = 0;
      const targetTimingStars = getTimingStars(totalTimeTaken, totalQuestions);
      const timingStarsInterval = setInterval(() => {
        if (currentTimingStars < targetTimingStars) {
          currentTimingStars += 0.1;
          setTimingStars(currentTimingStars);
        } else {
          clearInterval(timingStarsInterval);
        }
      }, 50);

      // Animate stars for technique
      let currentTechniqueStars = 0;
      const targetTechniqueStars = getTechniqueStars(technique);
      const techniqueStarsInterval = setInterval(() => {
        if (currentTechniqueStars < targetTechniqueStars) {
          currentTechniqueStars += 0.1;
          setTechniqueStars(currentTechniqueStars);
        } else {
          clearInterval(techniqueStarsInterval);
        }
      }, 50);

      return () => {
        clearInterval(scoreInterval);
        clearInterval(scoreStarsInterval);
        clearInterval(timingStarsInterval);
        clearInterval(techniqueStarsInterval);
      };
    }
  }, [open, score, timing, technique, totalQuestions]);

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

  const getCupcakeImage = (point: number) => {
    const totalStars = Math.round(point * 3); // Convert average back to total stars
    if (totalStars >= 8) return "/gleamingcoin.gif";
    return null;
  };

  const getDialogContent = (point: number) => {
    if (point === 3) {
      return {
        title: "AMAZING!",
        description: "You won a studycoin!",
      };
    } else if (point === 2) {
      return {
        title: "GOOD!",
        description: "Keep practicing!",
      };
    } else {
      return {
        title: "DECENT!",
        description: "You'll get there!",
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

  const dialogContent = getDialogContent(Math.max(Math.round((scoreStars + timingStars + techniqueStars) / 3), 1));

  const handleReviewClick = () => {
    onOpenChange(false);
    if (userTestId) {
      router.push(`/user-test/${userTestId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <audio ref={audioRef} />
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
          {getCupcakeImage(Math.max(Math.round((scoreStars + timingStars + techniqueStars) / 3), 1)) && (
            <Image
              src={getCupcakeImage(Math.max(Math.round((scoreStars + timingStars + techniqueStars) / 3), 1))!}
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
              {animatedScore.toFixed(0)}%
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
