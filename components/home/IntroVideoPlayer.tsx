"use client";

import { useRef, useState, type FC } from 'react';
import { motion } from 'framer-motion';

// Define demo video URL directly in this component
const firstTimeDemoVideo = "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MyMCAT+Software+and+Mission-VEED.mp4";

interface IntroVideoPlayerProps {
  onComplete: () => void;
}

const IntroVideoPlayer: FC<IntroVideoPlayerProps> = ({ 
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 5 && !canSkip) {
      setCanSkip(true);
    }
  };

  const handleWatchedClick = () => {
    onComplete();
  };

  return (
    <div className="h-full flex flex-col justify-between px-4 py-8 
      bg-gradient-to-b from-[--theme-bg-accent] via-[--theme-bg-default] to-[--theme-bg-subtle]
      dark:from-[--theme-bg-accent] dark:via-[--theme-bg-default] dark:to-[--theme-bg-subtle]
      transition-colors duration-300"
    >
      <div className="flex-1 flex flex-col items-center min-h-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h2 className="text-4xl font-bold text-[--theme-text-default] mb-3">Welcome to MyMCAT!</h2>
          <p className="text-[--theme-text-subtle] text-lg max-w-2xl">
            Watch this quick introduction to get started with your MCAT preparation journey
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full max-w-4xl bg-[--theme-bg-card] rounded-xl shadow-lg overflow-hidden
            shadow-[--theme-shadow-md] flex-1 min-h-0"
        >
          <div className="h-full">
            <video 
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              src={firstTimeDemoVideo}
              controls
              onEnded={handleVideoEnd}
              onTimeUpdate={handleTimeUpdate}
              aria-label="MyMCAT Introduction Video"
            >
              <track 
                kind="captions" 
                src="/captions/intro-video-captions.vtt" 
                label="English" 
                srcLang="en" 
                default 
              />
            </video>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 items-center justify-center mt-6">
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`
            px-6 py-3 rounded-lg font-medium text-lg
            transform transition-all duration-200 ease-in-out
            border-2
            ${videoEnded 
              ? 'border-[--theme-accent-default] bg-[--theme-accent-default] hover:bg-[--theme-accent-emphasis] text-white hover:scale-105 active:scale-95' 
              : 'border-[--theme-bg-muted] bg-transparent text-[--theme-text-subtle] cursor-not-allowed'
            }
          `}
          onClick={handleWatchedClick}
          disabled={!videoEnded}
          type="button"
          aria-label={videoEnded ? "Mark introduction video as watched" : "Watch the MyMCAT intro"}
        >
          {videoEnded ? "Continue to Dashboard →" : "Watch the MyMCAT intro^"}
        </motion.button>

        {canSkip && !videoEnded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-2 rounded-lg text-[--theme-text-subtle] hover:text-[--theme-text-default] text-base
              transform transition-all duration-200 ease-in-out hover:bg-[--theme-bg-subtle]"
            onClick={onComplete}
            type="button"
            aria-label="Skip introduction video"
          >
            Skip Video
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default IntroVideoPlayer; 