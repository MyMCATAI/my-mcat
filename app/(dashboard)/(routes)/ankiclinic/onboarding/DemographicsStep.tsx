import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { searchUniversities } from "@/utils/universities";
import { toast } from "react-hot-toast";

/* --- Constants ----- */

/* ----- Types ---- */
interface DemographicsStepProps {
  onComplete: (data: {
    firstName: string;
    college: string;
    isNonTraditional: boolean;
    isCanadian: boolean;
    currentMcatScore: number | null;
    hasNotTakenMCAT: boolean;
    targetScore: number;
  }) => Promise<void>;
}

const DemographicsStep: React.FC<DemographicsStepProps> = ({ onComplete }) => {
  /* ---- State ----- */
  const [firstName, setFirstName] = useState("");
  const [collegeQuery, setCollegeQuery] = useState("");
  const [isNonTraditional, setIsNonTraditional] = useState(false);
  const [isCanadian, setIsCanadian] = useState(false);
  const [collegeSuggestions, setCollegeSuggestions] = useState<Array<{ name: string; city: string; state: string }>>([]);
  const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
  const [isCollegeInputFocused, setIsCollegeInputFocused] = useState(false);
  const [isCollegeSearching, setIsCollegeSearching] = useState(false);
  
  const [currentMcatScore, setCurrentMcatScore] = useState<string>("");
  const [hasNotTakenMCAT, setHasNotTakenMCAT] = useState(false);
  
  const [targetScore, setTargetScore] = useState<string>("");
  const [loading, setLoading] = useState(false);

  /* ---- Refs --- */

  /* ----- Callbacks --- */
  // College search effect
  useEffect(() => {
    const fetchCollegeSuggestions = async () => {
      if (collegeQuery.length >= 3) {
        setIsCollegeSearching(true);
        try {
          const results = await searchUniversities(collegeQuery);
          setCollegeSuggestions(results);
          setShowCollegeSuggestions(true);
        } finally {
          setIsCollegeSearching(false);
        }
      } else {
        setCollegeSuggestions([]);
        setShowCollegeSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchCollegeSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [collegeQuery]);



  /* --- Animations & Effects --- */

  /* ---- Event Handlers ----- */
  const handleCollegeFocus = () => {
    setIsCollegeInputFocused(true);
    if (collegeQuery.length >= 3 && collegeSuggestions.length > 0) {
      setShowCollegeSuggestions(true);
    }
  };

  const handleCollegeBlur = () => {
    setTimeout(() => {
      setIsCollegeInputFocused(false);
      setShowCollegeSuggestions(false);
    }, 200);
  };

  const handleCollegeSuggestionSelect = (college: { name: string; city: string; state: string }) => {
    setCollegeQuery(college.name);
    setShowCollegeSuggestions(false);
    setIsCollegeInputFocused(false);
  };



  const isValidMcatScore = (score: string) => {
    const num = parseInt(score);
    return !isNaN(num) && num >= 472 && num <= 528;
  };

  const isValidTargetScore = (score: string) => {
    const num = parseInt(score);
    return !isNaN(num) && num >= 472 && num <= 528;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    
    // Validation
    if (!firstName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!isNonTraditional && !isCanadian && !collegeQuery.trim()) {
      toast.error("Please enter your college or select Non-Traditional/Canadian");
      return;
    }
    
    if (!hasNotTakenMCAT && (!currentMcatScore || !isValidMcatScore(currentMcatScore))) {
      toast.error("Please enter a valid MCAT score (472-528) or check that you haven't taken it yet");
      return;
    }
    
    if (!targetScore || !isValidTargetScore(targetScore)) {
      toast.error("Please enter a valid target MCAT score (472-528)");
      return;
    }

    setLoading(true);
    try {
      await onComplete({
        firstName: firstName.trim(),
        college: isNonTraditional ? "Non-Traditional" : isCanadian ? "Canadian" : collegeQuery,
        isNonTraditional,
        isCanadian,
        currentMcatScore: hasNotTakenMCAT ? null : parseInt(currentMcatScore),
        hasNotTakenMCAT,
        targetScore: parseInt(targetScore),
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---- Render Methods ----- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight"
        >
          Tell Me About Yourself!
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg md:text-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium"
        >
          I love making new friends! And then, uh, cancelling plans with them to sleep on a keyboard.
        </motion.p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            What's your first name? *
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="Enter your first name"
            required
            disabled={loading}
          />
        </motion.div>

        {/* College Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            College Information *
          </label>
          
          {!isNonTraditional && !isCanadian && (
            <div className="relative">
              <input
                type="text"
                value={collegeQuery}
                onChange={(e) => setCollegeQuery(e.target.value)}
                onFocus={handleCollegeFocus}
                onBlur={handleCollegeBlur}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Start typing your college name..."
                required={!isNonTraditional && !isCanadian}
                disabled={loading}
              />
              {isCollegeSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              {showCollegeSuggestions && collegeSuggestions.length > 0 && isCollegeInputFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-auto"
                >
                  {collegeSuggestions.map((college, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCollegeSuggestionSelect(college)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      disabled={loading}
                    >
                      <div className="text-gray-900 dark:text-gray-100 text-sm font-medium">{college.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                        {college.city}, {college.state}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isNonTraditional}
                onChange={(e) => setIsNonTraditional(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500/50"
                disabled={loading}
              />
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Non-traditional</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isCanadian}
                onChange={(e) => setIsCanadian(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500/50"
                disabled={loading}
              />
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Canadian</span>
            </label>
          </div>
        </motion.div>

        {/* Previous MCAT Score Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Previous MCAT Experience
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={hasNotTakenMCAT}
              onChange={(e) => setHasNotTakenMCAT(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500/50"
              disabled={loading}
            />
            <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              I haven't taken the MCAT yet
            </span>
          </label>

          {!hasNotTakenMCAT && (
            <div className="space-y-2">
              <label htmlFor="currentMcatScore" className={`block text-sm ${
                currentMcatScore && !isValidMcatScore(currentMcatScore) 
                  ? 'text-red-500' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                What was your most recent MCAT score? (472 - 528) *
              </label>
              <input
                type="number"
                id="currentMcatScore"
                value={currentMcatScore}
                onChange={(e) => setCurrentMcatScore(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Enter your MCAT score"
                required={!hasNotTakenMCAT}
                disabled={loading}
              />
            </div>
          )}
        </motion.div>

        {/* Target Score Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-2"
        >
          <label htmlFor="targetScore" className={`block text-sm font-medium ${
            targetScore && !isValidTargetScore(targetScore)
              ? 'text-red-500'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            What's your target MCAT score? (472 - 528) *
          </label>
          <input
            type="number"
            id="targetScore"
            value={targetScore}
            onChange={(e) => setTargetScore(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="Enter your target score"
            required
            disabled={loading}
          />
        </motion.div>



        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Saving...</span>
            </div>
          ) : (
            "Save My Information"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default DemographicsStep; 