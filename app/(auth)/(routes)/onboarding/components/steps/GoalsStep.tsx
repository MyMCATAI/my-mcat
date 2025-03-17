import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MedicalSchool } from "@/types";

interface GoalsStepProps {
  onSubmit: (data: {
    targetScore: number;
    targetMedSchool: string;
  }) => Promise<void>;
  initialValues?: {
    targetScore?: number;
    targetMedSchool?: string;
  };
}

export function GoalsStep({ onSubmit, initialValues = {} }: GoalsStepProps) {
  const [targetScore, setTargetScore] = useState<string>(
    initialValues.targetScore?.toString() || ""
  );
  const [medSchoolQuery, setMedSchoolQuery] = useState(
    initialValues.targetMedSchool || ""
  );
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [medSchoolSuggestions, setMedSchoolSuggestions] = useState<MedicalSchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<MedicalSchool | null>(null);
  const [isMedSchoolInputFocused, setIsMedSchoolInputFocused] = useState(false);

  useEffect(() => {
    const fetchMedSchools = async () => {
      if (medSchoolQuery.length >= 3) {
        setIsSearching(true);
        try {
          const response = await fetch(
            `/api/medical-schools?query=${encodeURIComponent(medSchoolQuery)}`
          );
          const data = await response.json();
          setMedSchoolSuggestions(data.results);
        } finally {
          setIsSearching(false);
        }
      } else {
        setMedSchoolSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchMedSchools, 300);
    return () => clearTimeout(debounceTimer);
  }, [medSchoolQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    if (!selectedSchool) {
      alert("Please select a medical school from the dropdown list");
      return;
    }

    const scoreNum = parseInt(targetScore);
    if (isNaN(scoreNum) || scoreNum < 472 || scoreNum > 528) {
      alert("Please enter a valid MCAT score between 472 and 528");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        targetScore: scoreNum,
        targetMedSchool: selectedSchool.name,
      });
    } finally {
      setLoading(false);
    }
  };

  const isValidScore = (score: string) => {
    const num = parseInt(score);
    return !isNaN(num) && num >= 472 && num <= 528;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-light text-white">
          Set Your MCAT Goals
        </h2>
        <p className="text-lg text-blue-200/80">
          Let&apos;s aim high and make it happen!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label htmlFor="targetScore" className={`block text-sm ${
              targetScore && !isValidScore(targetScore)
                ? 'text-red-400'
                : 'text-blue-200/80'
            }`}>
              What&apos;s your target MCAT score? (472 - 528)
            </label>
            <input
              type="number"
              id="targetScore"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 
                         rounded-xl text-white focus:outline-none focus:ring-2 
                         focus:ring-blue-500/50 transition-all"
              placeholder="Enter your target score"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <label htmlFor="targetSchool" className="block text-sm text-blue-200/80">
              Which medical school is your top choice?
            </label>
            <div className="relative">
              <input
                type="text"
                id="targetSchool"
                value={medSchoolQuery}
                onChange={(e) => setMedSchoolQuery(e.target.value)}
                onFocus={() => setIsMedSchoolInputFocused(true)}
                onBlur={() => setTimeout(() => setIsMedSchoolInputFocused(false), 200)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 
                           rounded-xl text-white focus:outline-none focus:ring-2 
                           focus:ring-blue-500/50 transition-all"
                placeholder="Enter medical school name..."
                required
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
              {!isSearching && !selectedSchool && medSchoolQuery.length > 0 && medSchoolSuggestions.length === 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">
                  No schools found
                </div>
              )}
              {medSchoolSuggestions.length > 0 && isMedSchoolInputFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-[#001226]/95 backdrop-blur-[2px] 
                             border border-white/10 rounded-xl shadow-lg max-h-60 overflow-auto 
                             scrollbar-thin scrollbar-thumb-white/20"
                >
                  {medSchoolSuggestions.map((school, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedSchool(school);
                        setMedSchoolQuery(school.name);
                        setIsMedSchoolInputFocused(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 
                               transition-colors border-b border-white/5 last:border-b-0"
                      disabled={loading}
                    >
                      <div className="text-white/90 text-sm font-medium">{school.name}</div>
                      <div className="text-white/60 text-xs mt-0.5">{school.state}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Selected Medical School Card */}
          {selectedSchool && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm 
                         shadow-xl space-y-4 relative overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-700/10 pointer-events-none" />
              
              <h3 className="text-xl font-light text-white relative">
                {selectedSchool.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 relative">
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
                  <div className="text-sm text-blue-200/80 mb-1">
                    Average MCAT
                  </div>
                  <div className="text-white text-2xl font-light">
                    {selectedSchool.averageMCAT}
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-4 rounded-lg border border-white/10">
                  <div className="text-sm text-blue-200/80 mb-1">
                    Average GPA
                  </div>
                  <div className="text-white text-2xl font-light">
                    {selectedSchool.averageGPA}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300/90 text-sm leading-relaxed relative">
                {selectedSchool.description}
              </p>
            </motion.div>
          )}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          type="submit"
          disabled={loading || !selectedSchool || !targetScore || !isValidScore(targetScore)}
          className="w-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white hover:bg-white/20
                     px-6 py-3 rounded-xl transition-all duration-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
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