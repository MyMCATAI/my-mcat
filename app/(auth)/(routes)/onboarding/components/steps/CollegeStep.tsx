import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { searchUniversities } from "@/utils/universities";

interface CollegeStepProps {
  onSubmit: (data: {
    college: string;
    isNonTraditional: boolean;
    isCanadian: boolean;
  }) => Promise<void>;
  firstName: string;
  initialValues?: {
    college?: string;
    isNonTraditional?: boolean;
    isCanadian?: boolean;
  };
}

export function CollegeStep({ onSubmit, firstName, initialValues = {} }: CollegeStepProps) {
  const [collegeQuery, setCollegeQuery] = useState(initialValues.college || "");
  const [isNonTraditional, setIsNonTraditional] = useState(initialValues.isNonTraditional || false);
  const [isCanadian, setIsCanadian] = useState(initialValues.isCanadian || false);
  const [suggestions, setSuggestions] = useState<Array<{ name: string; city: string; state: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (collegeQuery.length >= 3) {
        setIsSearching(true);
        try {
          const results = await searchUniversities(collegeQuery);
          setSuggestions(results);
          setShowSuggestions(true);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [collegeQuery]);

  // Handle input focus/blur
  const handleFocus = () => {
    setIsInputFocused(true);
    if (collegeQuery.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events to fire
    setTimeout(() => {
      setIsInputFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (college: { name: string; city: string; state: string }) => {
    setCollegeQuery(college.name);
    setShowSuggestions(false);
    setIsInputFocused(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    try {
      await onSubmit({
        college: isNonTraditional ? "Non-Traditional" : isCanadian ? "Canadian" : collegeQuery,
        isNonTraditional,
        isCanadian,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-light text-white">
          {`Welcome, ${firstName}! 👋`}
        </h2>
        <p className="text-lg text-blue-200/80">
          {"Let's get to know you better to personalize your MCAT journey"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-light text-white">
            Tell us about your college journey
          </h2>
          
          {!isNonTraditional && !isCanadian && (
            <div className="relative">
              <input
                type="text"
                name="college"
                value={collegeQuery}
                onChange={(e) => setCollegeQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Start typing your college name..."
                required={!isNonTraditional && !isCanadian}
                disabled={loading}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-white/60" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              )}
              {showSuggestions && suggestions.length > 0 && isInputFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-[#001226]/95 backdrop-blur-[2px] 
                             border border-white/10 rounded-xl shadow-lg max-h-60 overflow-auto 
                             scrollbar-thin scrollbar-thumb-white/20"
                >
                  {suggestions.map((college, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionSelect(college)}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 
                               transition-colors border-b border-white/5 last:border-b-0"
                      disabled={loading}
                    >
                      <div className="text-white/90 text-sm font-medium">{college.name}</div>
                      <div className="text-white/60 text-xs mt-0.5">
                        {college.city}, {college.state}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )}

          <div className="flex gap-6">
            <label className="flex items-center space-x-3 text-white cursor-pointer group">
              <input
                type="checkbox"
                checked={isNonTraditional}
                onChange={(e) => setIsNonTraditional(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 text-blue-500 focus:ring-blue-500/50 bg-transparent"
                disabled={loading}
              />
              <span className="group-hover:text-blue-400 transition-colors">Non-traditional</span>
            </label>

            <label className="flex items-center space-x-3 text-white cursor-pointer group">
              <input
                type="checkbox"
                checked={isCanadian}
                onChange={(e) => setIsCanadian(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 text-blue-500 focus:ring-blue-500/50 bg-transparent"
                disabled={loading}
              />
              <span className="group-hover:text-blue-400 transition-colors">Canadian</span>
            </label>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          type="submit"
          disabled={loading || (!collegeQuery.trim() && !isNonTraditional && !isCanadian)}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white 
                     px-6 py-3 rounded-xl transition-all duration-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Saving...</span>
            </div>
          ) : (
            "Continue"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
} 