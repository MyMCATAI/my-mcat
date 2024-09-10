import React, { useEffect, useRef, useState } from 'react';
import { Star, StarHalf } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  timing: number;
  correctAnswer: number;
  technique: number;
}

const ScoreDialog: React.FC<ScoreDialogProps> = ({
  open,
  onOpenChange,
  score,
  timing,
  correctAnswer,
  technique
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedStars, setAnimatedStars] = useState(0);

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
      
      let currentScore = 0;
      const scoreInterval = setInterval(() => {
        if (currentScore < score) {
          currentScore += 1;
          setAnimatedScore(currentScore);
        } else {
          clearInterval(scoreInterval);
        }
      }, 20);

      let currentStars = 0;
      const starsInterval = setInterval(() => {
        if (currentStars < getStarCount(score)) {
          currentStars += 0.1;
          setAnimatedStars(currentStars);
        } else {
          clearInterval(starsInterval);
        }
      }, 50);

      return () => {
        clearInterval(scoreInterval);
        clearInterval(starsInterval);
      };
    }
  }, [open, score]);

  const getStarCount = (score: number) => {
    if (score === 100) return 3;
    if (score >= 60) return 2;
    return 1;
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

  const getCupcakeImage = (score: number) => {
    if (score === 100) return "/threecupcakes.png";
    if (score >= 60) return "/twocupcakes.png";
    return "/onecupcake.png";
  };

  const getDialogContent = (score: number) => {
    if (score === 100) {
      return {
        title: "AMAZING!",
        description: "You won three cupcakes!"
      };
    } else if (score >= 60) {
      return {
        title: "GOOD!",
        description: "You got two cupcakes!"
      };
    } else {
      return {
        title: "DECENT!",
        description: "You won one cupcake!"
      };
    }
  };

  const dialogContent = getDialogContent(score);

  const getQuestionsRight = (score: number) => {
    if (score === 0) return "0/5";
    if (score <= 20) return "1/5";
    if (score <= 40) return "2/5";
    if (score <= 60) return "3/5";
    if (score <= 80) return "4/5";
    return "5/5";
  };

  const getTotalTiming = (timing: number) => {
    return `${timing.toFixed(2)}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <audio ref={audioRef} />
      <DialogContent className="bg-white text-black border-2 border-pink-600">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold text-pink-600 text-center">{dialogContent.title}</DialogTitle>
          <DialogDescription className="text-gray-700 text-center">
            {dialogContent.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mb-4">
          <img src={getCupcakeImage(score)} alt="Cupcakes" className="h-[20vh] w-auto" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className="text-xl font-semibold">Score</p>
            <p className="text-2xl font-bold text-pink-600">{animatedScore.toFixed(2)}%</p>
            <p className="text-lg">{getQuestionsRight(score)}</p>
            <div className="flex justify-center mt-2">{renderStars(animatedStars)}</div>
          </div>
          <div>
            <p className="text-xl font-semibold">Timing</p>
            <p className="text-2xl font-bold text-pink-600">{getTotalTiming(timing)}</p>
            <p className="text-lg">Average</p>
            <div className="flex justify-center mt-2">{renderStars(timing)}</div>
          </div>
          <div>
            <p className="text-xl font-semibold">Technique</p>
            <p className="text-2xl font-bold text-pink-600">{technique}/3</p>
            <p className="text-lg">Good</p>
            <div className="flex justify-center mt-2">{renderStars(technique)}</div>
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={() => onOpenChange(false)}
            className="bg-pink-600 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded"
          >
            Review
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreDialog;