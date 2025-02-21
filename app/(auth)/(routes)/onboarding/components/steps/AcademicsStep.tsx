import { motion } from "framer-motion";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AcademicsStepProps {
  onSubmit: (data: {
    gpa: number | null;
    currentMcatScore: number | null;
    hasNotTakenMCAT: boolean;
    mcatAttemptNumber: string;
  }) => Promise<void>;
  initialValues?: {
    gpa?: number | null;
    currentMcatScore?: number | null;
    hasNotTakenMCAT?: boolean;
    mcatAttemptNumber?: string;
  };
}

export function AcademicsStep({ onSubmit, initialValues = {} }: AcademicsStepProps) {
  const [gpa, setGpa] = useState<string>(initialValues.gpa?.toString() || "");
  const [currentMcatScore, setCurrentMcatScore] = useState<string>(
    initialValues.currentMcatScore?.toString() || ""
  );
  const [hasNotTakenMCAT, setHasNotTakenMCAT] = useState(initialValues.hasNotTakenMCAT || false);
  const [mcatAttemptNumber, setMcatAttemptNumber] = useState(initialValues.mcatAttemptNumber || "1");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await onSubmit({
        gpa: gpa ? parseFloat(gpa) : null,
        currentMcatScore: hasNotTakenMCAT ? null : currentMcatScore ? parseInt(currentMcatScore) : null,
        hasNotTakenMCAT,
        mcatAttemptNumber,
      });
    } finally {
      setLoading(false);
    }
  };

  const validateGpa = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return Math.min(Math.max(num, 0), 4).toString();
  };

  const handleMcatScoreChange = (value: string) => {
    setCurrentMcatScore(value);
  };

  const isValidMcatScore = (value: string) => {
    const num = parseInt(value);
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
          Your Academic Background
        </h2>
        <p className="text-lg text-blue-200/80">
          Let&apos;s understand where you are in your MCAT journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <label htmlFor="gpa" className="block text-sm text-blue-200/80">
              What&apos;s your current GPA? (0.0 - 4.0)
            </label>
            <input
              type="number"
              id="gpa"
              step="0.01"
              min="0"
              max="4"
              value={gpa}
              onChange={(e) => setGpa(validateGpa(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 
                         rounded-xl text-white focus:outline-none focus:ring-2 
                         focus:ring-blue-500/50 transition-all"
              placeholder="Enter your GPA"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-3 text-white cursor-pointer group">
              <input
                type="checkbox"
                checked={hasNotTakenMCAT}
                onChange={(e) => setHasNotTakenMCAT(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 text-blue-500 
                           focus:ring-blue-500/50 bg-transparent"
                disabled={loading}
              />
              <span className="group-hover:text-blue-400 transition-colors">
                I haven&apos;t taken the MCAT yet
              </span>
            </label>
          </div>

          {!hasNotTakenMCAT && (
            <>
              <div className="space-y-4">
                <label htmlFor="mcatScore" className={`block text-sm ${
                  currentMcatScore && !isValidMcatScore(currentMcatScore) 
                    ? 'text-red-400' 
                    : 'text-blue-200/80'
                }`}>
                  What was your most recent MCAT score? (472 - 528)
                </label>
                <input
                  type="number"
                  id="mcatScore"
                  value={currentMcatScore}
                  onChange={(e) => handleMcatScoreChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 
                             rounded-xl text-white focus:outline-none focus:ring-2 
                             focus:ring-blue-500/50 transition-all"
                  placeholder="Enter your MCAT score"
                  required={!hasNotTakenMCAT}
                  disabled={loading}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm text-blue-200/80">
                  Which MCAT attempt was this?
                </label>
                <Select
                  value={mcatAttemptNumber}
                  onValueChange={setMcatAttemptNumber}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full bg-white/5 backdrop-blur-sm border border-white/10 
                             rounded-xl text-white focus:outline-none focus:ring-2 
                             focus:ring-blue-500/50 transition-all">
                    <SelectValue placeholder="Select attempt number" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border border-white/10 text-white">
                    <SelectItem value="1" className="focus:bg-white/10 focus:text-white">First attempt</SelectItem>
                    <SelectItem value="2" className="focus:bg-white/10 focus:text-white">Second attempt</SelectItem>
                    <SelectItem value="3" className="focus:bg-white/10 focus:text-white">Third attempt</SelectItem>
                    <SelectItem value="4" className="focus:bg-white/10 focus:text-white">Fourth attempt</SelectItem>
                    <SelectItem value="5+" className="focus:bg-white/10 focus:text-white">Fifth or more attempt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          type="submit"
          disabled={loading || 
            !gpa || 
            (!hasNotTakenMCAT && (!currentMcatScore || !isValidMcatScore(currentMcatScore)))
          }
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