import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoPlayerPopup from "./VideoPlayerPopup"; // Import the VideoPlayerPopup component

interface VideoRecommendation {
  id: string;
  title: string;
  link: string;
  minutes_estimate: number;
  thumbnail?: string | null;
  category: {
    conceptCategory: string;
  };
}

interface VideoRecommendationsProps {
  videos: VideoRecommendation[];
}

const VideoRecommendations = ({ videos }: VideoRecommendationsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  
  // State for the video popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoRecommendation | null>(null);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateScrollButtons);
      }
    };
  }, []);

  const scrollTo = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; 
      const targetScroll = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  // Handle video card click
  const handleVideoClick = (video: VideoRecommendation, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    setCurrentVideo(video);
    setIsPopupOpen(true);
  };

  // Handle popup close
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // Determine if we should show navigation controls
  const shouldShowControls = videos.length > 1;

  return (
    <div className="mt-4 relative">
      <div className="flex items-center gap-2 mb-4 ml-4">
        <h3 className="text-lg font-semibold text-[--theme-text-color]">Quick Video Reviews</h3>
        <span className="text-sm px-2 py-0.5 rounded-full bg-[--theme-doctorsoffice-accent] bg-opacity-20">
          {videos.length}
        </span>
      </div>
      
      {videos.length === 0 ? (
        <div className="text-center text-[--theme-text-color] opacity-60 py-4">
          No video recommendations available
        </div>
      ) : (
        <div className="relative">
          <div 
            ref={scrollContainerRef} 
            className="flex gap-3 overflow-x-auto scrollbar-none pb-4"
          >
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={(e) => handleVideoClick(video, e)}
                className="flex-shrink-0 w-72 p-4 bg-[--theme-doctorsoffice-accent] bg-opacity-5 
                         rounded-lg hover:bg-opacity-10 transition-all duration-200 cursor-pointer
                         border border-[--theme-border-color] hover:border-[--theme-hover-color]"
              >
                <div className="flex gap-4">
                  <div className="w-32 h-20 rounded overflow-hidden flex-shrink-0">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black/10 flex items-center justify-center">
                        <svg 
                          className="w-8 h-8 text-[--theme-text-color] opacity-40"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[--theme-text-color] line-clamp-2">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-[--theme-text-color] opacity-60">
                        {video.minutes_estimate} mins
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[--theme-doctorsoffice-accent] bg-opacity-20 text-[--theme-text-color]">
                        {video.category.conceptCategory}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {shouldShowControls && videos.length > 0 && (
            <>
              {showLeftButton && (
                <Button
                  onClick={() => scrollTo('left')}
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-[--theme-mainbox-color] rounded-full shadow-md z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {showRightButton && (
                <Button
                  onClick={() => scrollTo('right')}
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-[--theme-mainbox-color] rounded-full shadow-md z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Video Player Popup */}
      {currentVideo && (
        <VideoPlayerPopup
          videoId={currentVideo.link}
          title={currentVideo.title}
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default VideoRecommendations;