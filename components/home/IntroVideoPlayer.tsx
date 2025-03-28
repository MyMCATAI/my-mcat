"use client";

import { useRef, useState, type FC } from 'react';

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

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleWatchedClick = () => {
    onComplete();
  };

  return (
    <div className="h-full flex flex-col justify-center items-center text-black">
      <h2 className="text-3xl mb-4">Welcome to MyMCAT!</h2>
      
      <div className="relative w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden mb-8">
        <video 
          ref={videoRef}
          className="w-full h-full"
          src={firstTimeDemoVideo}
          controls
          onEnded={handleVideoEnd}
          aria-label="MyMCAT Introduction Video"
          // Add track for captions - this is a placeholder, replace with actual captions file
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
      
      <button 
        className={`p-3 ${videoEnded ? 'bg-green-500' : 'bg-gray-500'} rounded transition-colors duration-300 text-xl`}
        onClick={handleWatchedClick}
        disabled={!videoEnded}
        type="button"
        aria-label={videoEnded ? "Mark introduction video as watched" : "Please watch the video first"}
      >
        {videoEnded ? "I've watched the intro video" : "Please watch the video first"}
      </button>
    </div>
  );
};

export default IntroVideoPlayer; 