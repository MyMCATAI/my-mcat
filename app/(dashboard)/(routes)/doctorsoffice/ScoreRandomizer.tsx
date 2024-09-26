import React, { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ScoreRandomizerProps {
  onClose: () => void;
  playerLevel: number;
  streakDays: number;
  patientsPerDay: number;
  qualityOfCare: number;
  averageStarRating: number | null;
  clinicCostPerDay: number;
}

interface Review {
  id: number;
  review: string;
  rating: number;
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
  const [isFinal, setIsFinal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const fetchReviews = useCallback(async () => {
    try {
      const tier = Math.min(Math.ceil(playerLevel / 2), 3);
      const response = await fetch(`/api/reviews?tier=${tier}&count=3`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data: Review[] = await response.json();
      setReviews(data);
      console.log('Fetched reviews:', data); // Print results
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    }
  }, [playerLevel]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isFinal) {
      interval = setInterval(() => {
        setScores(scores.map(() => Math.floor(Math.random() * 5) + 1));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isFinal, scores]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFinal(true);
      // Calculate final scores based on player stats
      const baseScore = Math.min(Math.max(Math.round(qualityOfCare * 5), 1), 5);
      const streakBonus = Math.min(streakDays / 10, 1); // Max 1 star bonus for 10-day streak
      const patientFactor = Math.min(patientsPerDay / 10, 1); // Max 1 star bonus for 10 patients per day
      
      const finalScores = Array(3).fill(0).map(() => {
        const score = baseScore + (Math.random() * streakBonus) + (Math.random() * patientFactor);
        return Math.min(Math.max(Math.round(score), 1), 5);
      });
      
      setScores(finalScores);
    }, 3000);

    return () => clearTimeout(timer);
  }, [qualityOfCare, streakDays, patientsPerDay]);

  const renderStars = (review: Review, index: number) => {
    return (
      <div className="flex flex-col items-center">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={24}
              fill={star <= review.rating ? 'gold' : 'none'}
              stroke={star <= review.rating ? 'gold' : 'gray'}
            />
          ))}
        </div>
        <p className="text-center text-[--theme-text-color] mt-2">
          {review.review.slice(0, 300)}
          {review.review.length > 300 ? '...' : ''}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[--theme-leaguecard-color] p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-[--theme-text-color]">{"Today's Reviews"}</h2>
        <div className="space-y-4">
          {reviews.map((review, index) => renderStars(review, index))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-[--theme-doctorsoffice-accent] border-2 border-[--theme-border-color] text-[--theme-text-color] hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ScoreRandomizer;
