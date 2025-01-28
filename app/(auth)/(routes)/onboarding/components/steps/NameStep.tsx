import { motion } from "framer-motion";
import { useState } from "react";

interface NameStepProps {
  onSubmit: (firstName: string) => Promise<void>;
  initialValue?: string;
}

export function NameStep({ onSubmit, initialValue = "" }: NameStepProps) {
  const [firstName, setFirstName] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(firstName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto">
      <div className="text-center space-y-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-5xl text-white bg-300% animate-gradient relative py-1"
        >
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            Meowdy there, partner!
          </motion.span>
          <motion.span 
            initial={{ rotate: -45 }}
            animate={{ rotate: 0 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            className="ml-2 inline-block"
          >
            🤠
          </motion.span>
        </motion.h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="peer w-full px-4 py-4 pr-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            placeholder="Enter your first name"
            required
          />
          <label
            htmlFor="firstName"
            className="absolute left-4 -top-6 text-sm text-blue-200/80 transition-all
                     peer-placeholder-shown:text-base peer-placeholder-shown:text-white/60 
                     peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:text-sm 
                     peer-focus:text-blue-200/80 opacity-0 peer-placeholder-shown:opacity-100"
          >
            First, enter your name!
          </label>
          <button
            type="submit"
            disabled={loading || !firstName.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full 
                      bg-gradient-to-r from-blue-400 to-blue-500 
                      hover:scale-110 transition-transform disabled:opacity-50 
                      disabled:hover:scale-100"
          >
            {loading ? (
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
            ) : (
              <svg 
                className="w-5 h-5 text-white transform rotate-90" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 