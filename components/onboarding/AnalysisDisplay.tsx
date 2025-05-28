import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/store/selectors';

/* --- Constants ----- */
// Sample MCAT-related weaknesses based on voice input with priority levels
const MCAT_WEAKNESSES = [
  {
    category: "Amino Acids",
    issues: ["Memorizing 20 standard amino acids", "Understanding side chain properties"],
    icon: "🧬",
    priority: "High",
    priorityColor: "from-red-500 to-red-600",
    priorityBg: "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30"
  },
  {
    category: "Enzymes", 
    issues: ["Enzyme kinetics and mechanisms", "Competitive vs non-competitive inhibition"],
    icon: "⚗️",
    priority: "High",
    priorityColor: "from-red-500 to-red-600",
    priorityBg: "from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30"
  },
  {
    category: "Kinetics",
    issues: ["Rate laws and reaction orders", "Activation energy concepts"],
    icon: "📈",
    priority: "Medium",
    priorityColor: "from-yellow-500 to-orange-500",
    priorityBg: "from-yellow-50 to-orange-100 dark:from-yellow-900/30 dark:to-orange-800/30"
  },
  {
    category: "Others",
    issues: ["Basic organic chemistry reactions", "Fundamental physics principles"],
    icon: "📚",
    priority: "Low",
    priorityColor: "from-green-500 to-green-600",
    priorityBg: "from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30"
  }
];

/* ----- Types ---- */
interface AnalysisDisplayProps {
  onComplete: () => void;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ onComplete }) => {
  /* ---- State ----- */
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  /* ---- Refs --- */
  const isPlayingVoiceRef = useRef(false);
  const { playSound } = useAudio();

  /* ----- Callbacks --- */
  const mcatWeaknesses = useMemo(() => MCAT_WEAKNESSES, []);

  // Function to play Kalypso's voice - using the same pattern as KalypsoOnboarding
  const playKalypsoVoice = useCallback(() => {
    // Prevent playing if already playing
    if (isPlayingVoiceRef.current) return;
    
    try {
      isPlayingVoiceRef.current = true;
      const audioElement = new Audio('/kalypso/KalypsoVoice1.mp3');
      audioElement.volume = 0.7; // Set volume to 70%
      
      // Reset the flag when audio ends or errors
      audioElement.onended = () => {
        isPlayingVoiceRef.current = false;
      };
      audioElement.onerror = () => {
        console.error('Error playing Kalypso voice');
        isPlayingVoiceRef.current = false;
      };
      
      audioElement.play().catch(error => {
        console.error('Error playing Kalypso voice:', error);
        isPlayingVoiceRef.current = false;
      });
      
      // Also play a click sound effect
      playSound('click');
    } catch (error) {
      console.error('Error creating audio element:', error);
      isPlayingVoiceRef.current = false;
    }
  }, [playSound]);

  /* --- Animations & Effects --- */
  useEffect(() => {
    // Simulate analysis time
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  /* ---- Render Methods ----- */
  if (isAnalyzing) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center space-y-8 py-12"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent text-center"
        >
          Analyzing Your Input 🧠
        </motion.div>
        <div className="w-20 h-20 border-4 border-gradient-to-r from-blue-500 to-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Fetching that for you...
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 px-8 py-4 rounded-xl">
          Analyzing your input and identifying key areas for MCAT improvement
        </p>
      </motion.div>
    );
  }

  if (analysisComplete) {
    return (
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div 
            className="text-lg md:text-xl text-gray-900 dark:text-gray-100 mb-8 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 p-8 rounded-2xl border border-orange-200 dark:border-orange-700/50 font-medium cursor-pointer hover:shadow-lg transition-all duration-200 relative group leading-relaxed"
            onClick={playKalypsoVoice}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <p className="text-center leading-8 tracking-wide">
              <span className="font-bold text-orange-600 dark:text-orange-400">Paw-some!</span> I can see you're just getting started with the MCAT. 
              <br className="hidden sm:block" />
              <span className="block mt-2 sm:mt-0 sm:inline">Let me help you <span className="font-semibold text-orange-600 dark:text-orange-400">claw your way to success!</span> 🐾</span>
            </p>
            
            {/* Audio indicator */}
            <motion.div 
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              animate={isPlayingVoiceRef.current ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: isPlayingVoiceRef.current ? Infinity : 0, duration: 1 }}
            >
              {isPlayingVoiceRef.current ? (
                <span className="text-2xl">🔊</span>
              ) : (
                <span className="text-2xl">🎵</span>
              )}
            </motion.div>
            
            {/* Click hint */}
            <motion.div 
              className="absolute bottom-3 right-3 text-xs text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-md"
            >
              Click to hear Kalypso!
            </motion.div>
          </motion.div>
        </motion.div>
        
        <div className="space-y-5">
          {mcatWeaknesses.map((weakness, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
              className={`bg-gradient-to-r ${weakness.priorityBg} rounded-2xl p-6 border-l-4 border-gray-300 dark:border-gray-500 shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md">{weakness.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-xl text-gray-900 dark:text-white bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {weakness.category}
                    </h4>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${weakness.priorityColor} shadow-md`}>
                      {weakness.priority} Priority
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {weakness.issues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="text-gray-700 dark:text-gray-300 flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                        <span className="font-medium">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="px-12 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-200 text-xl font-bold shadow-xl"
          >
            Create My Study Plan
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return null;
};

export default AnalysisDisplay; 