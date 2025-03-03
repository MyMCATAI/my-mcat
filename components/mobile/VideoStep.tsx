import { useState } from "react";
import { CustomVideo } from "./CustomVideo";

/* --- Constants ----- */
const PITCH_VIDEO_URL = "thbssEpeK9Y"; // YouTube video ID

/* ----- Types ---- */
interface VideoStepProps {
  onNext: () => void;
}

const VideoStep = ({ onNext }: VideoStepProps) => {
  /* ---- State ----- */
  const [isShortVideo, setIsShortVideo] = useState(true);

  /* ---- Render Methods ----- */
  return (
    <div className="text-center space-y-8">
      <div className="relative">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 mb-4 animate-gradient-x">
          DONT SMOKE PASSIVES
        </h1>
        <div className="absolute -inset-1 blur-xl bg-gradient-to-r from-blue-500/20 via-white/20 to-blue-500/20 -z-10"></div>
      </div>
      <p className="text-xl md:text-2xl text-white/90 tracking-wide font-light">
        {isShortVideo ? "One-minute overview of our software" : "Watch our 4-minute short film to see what kills MCAT scores"}
      </p>
      
      <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)] 
        bg-gradient-to-br from-black/60 to-black/40 border border-white/20 backdrop-blur-xl relative group
        transform transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <CustomVideo
          src={isShortVideo 
            ? "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MyMCAT+Software+Alone-VEED.mp4"
            : "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MobileVid.mp4"
          }
          poster={isShortVideo ? undefined : "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/DSP.png"}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
        <button
          onClick={() => setIsShortVideo(!isShortVideo)}
          className={`group relative px-8 py-4 rounded-xl font-medium text-lg text-white overflow-hidden
            ${isShortVideo 
              ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90'
              : 'bg-gradient-to-r from-blue-500/90 to-blue-700/90'
            }
            transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative">
            {isShortVideo ? "Watch our 4-min short film instead" : "Show me the software demo"}
          </span>
        </button>
        <button
          onClick={onNext}
          className="group relative px-8 py-4 rounded-xl font-medium text-lg text-white overflow-hidden
            bg-gradient-to-r from-gray-500/90 to-gray-700/90 hover:from-green-500 hover:to-blue-500
            transition-all duration-500 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <span className="relative">Next</span>
        </button>
      </div>
    </div>
  );
};

export default VideoStep; 