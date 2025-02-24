'use client'

import { Check, AlertCircle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState, useMemo } from 'react';


/* -------------------------------------------- Types --------------------------------------------- */
interface CategoryPerformance {
  total: number;
  correct: number;
  incorrect: number;
  successRate: number;
  categoryId: string;
}

interface CategoryStats {
  [key: string]: CategoryPerformance;
}

interface FlashcardSummaryProps {
  categoryStats: CategoryStats;
  onClose: () => void;
}

interface VideoContent {
  id: string;
  title: string;
  link: string;
  minutes_estimate: number;
}

/* ------------------------------------------- Component ------------------------------------------- */
const FlashcardSummary = ({ categoryStats, onClose }: FlashcardSummaryProps) => {
  const [videoContent, setVideoContent] = useState<VideoContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate sorted categories and weakest category
  const { sortedCategories, weakestCategory, weakestStats } = useMemo(() => {
    const sorted = Object.entries(categoryStats).sort(([, a], [, b]) => 
      a.successRate - b.successRate
    );
    
    const weakest = sorted[0] || null;
    return {
      sortedCategories: sorted,
      weakestCategory: weakest ? weakest[0] : null,
      weakestStats: weakest ? weakest[1] : null
    };
  }, [categoryStats]);

  const isPerfectScore = weakestStats?.successRate === 100;
  
  useEffect(() => {
    const fetchVideoContent = async () => {
      if (!weakestStats?.categoryId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/video-content?categoryId=${weakestStats.categoryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch video content');
        }
        const data = await response.json();
        setVideoContent(data);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Could not load video content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoContent();
  }, [weakestStats?.categoryId]);

  // Helper function to get color based on performance
  const getPerformanceColor = (successRate: number) => {
    if (successRate >= 90) return 'bg-green-50 border-green-200 text-green-800';
    if (successRate >= 70) return 'bg-lime-50 border-lime-200 text-lime-800';
    if (successRate >= 50) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-orange-50 border-orange-200 text-orange-800';
  };

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  };
  
  return (
    <div className="max-w-4xl mx-auto w-full px-2 py-4 overflow-y-auto">
      {/* Move the congratulations message down to avoid the correctCount banner */}
      
      <div className="text-[--theme-text-color] text-xl font-semibold mb-4 text-center">
        {"🎉 Great work! You've completed this flashcard deck."}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Video Section - Only show when there's valid content */}
        {!error && !isLoading && videoContent?.link && (
          <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200">
            {/* Title inside video container */}
            <div className="bg-blue-600 p-2 text-white">
              <h3 className="text-base font-semibold mb-0">📹 Recommended Video</h3>
              <p className="text-xs opacity-90">
                {weakestCategory ? 
                  `Watch this video to strengthen your understanding of ${weakestCategory}` : 
                  "Watch this video to improve your understanding of this topic"}
              </p>
            </div>
            {/* Video iframe */}
            <div className="h-[300px]">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(videoContent.link)}`}
                title={videoContent.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Combined Performance Section */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {/* Perfect Score Message or Focus Area */}
          {isPerfectScore ? (
            <div className="bg-green-50 border-b border-green-200 p-3">
              <div className="flex items-center gap-3">
                <Trophy className="text-green-600 w-5 h-5" />
                <div>
                  <h3 className="font-medium text-green-800">Perfect Performance!</h3>
                  <p className="text-xs text-green-700 mt-1">
                    {"Outstanding work! You've mastered all categories in this deck."}
                  </p>
                </div>
              </div>
            </div>
          ) : weakestCategory && weakestStats && (
            <div className="bg-orange-50 border-b border-orange-200 p-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-orange-600 w-5 h-5" />
                <div>
                  <h3 className="font-medium text-orange-800">Focus Area: {weakestCategory}</h3>
                  <p className="text-xs text-orange-700 mt-1">
                    {weakestStats.correct} out of {weakestStats.total} correct ({Math.round(weakestStats.successRate)}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Category List */}
          <div className="divide-y divide-gray-200 max-h-[200px] overflow-y-auto">
            {sortedCategories.map(([category, stats]) => (
              <div 
                key={category}
                className={cn(
                  "p-2 flex items-center justify-between",
                  getPerformanceColor(stats.successRate)
                )}
              >
                <div className="text-sm font-medium">{category}</div>
                <div className="text-sm">
                  {Math.round(stats.successRate)}% ({stats.correct}/{stats.total})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 focus:outline-none"
        >
          <Check size={18} />
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default FlashcardSummary; 