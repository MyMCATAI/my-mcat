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
    // Trim whitespace from name before submitting
    const trimmedFirstName = firstName.trim();
    if (!trimmedFirstName) return; // Prevent submitting empty names
    
    setLoading(true);
    try {
      await onSubmit(trimmedFirstName);
      // No need to setLoading(false) here, component might unmount
    } catch (error) {
      // If onSubmit fails (e.g., network error during refresh), stop loading
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto min-h-[250px] flex flex-col justify-center">
      {loading ? (
        // Loading State Content
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center text-center space-y-4 p-8"
        >
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" viewBox="0 0 24 24">
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
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome, {firstName.trim()}!
          </h2>
          <p className="text-gray-600">
            Setting up your profile... you've taken the first step towards acing the MCAT!
          </p>
        </motion.div>
      ) : (
        // Form Content (wrapped in a fragment for conditional rendering)
        <motion.div 
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center space-y-6 mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl md:text-5xl text-gray-900 font-semibold relative py-1"
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
                className="peer w-full px-4 py-4 pr-12 bg-gray-100 border border-gray-300 rounded-xl text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your first name"
                required
              />
              <label
                htmlFor="firstName"
                className="absolute left-4 -top-6 text-sm text-gray-600 transition-all
                         peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                         peer-placeholder-shown:top-4 peer-focus:-top-6 peer-focus:text-sm 
                         peer-focus:text-gray-600 opacity-0 peer-placeholder-shown:opacity-100"
              >
                Enter your name!
              </label>
              {/* Button doesn't need internal loading state anymore */}
              <button
                type="submit"
                disabled={!firstName.trim()} // Disable only if name is empty/whitespace
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full 
                          bg-gradient-to-r from-blue-500 to-blue-600 
                          hover:scale-110 transition-transform disabled:opacity-50 
                          disabled:hover:scale-100 text-white"
              >
                  <svg 
                    className="w-5 h-5 text-white" 
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
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
} 