import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

interface FriendReferralProps {
  onComplete: (skipReferral?: boolean) => void;
  createReferral: (data: { friendEmail: string }) => Promise<void>;
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function FriendReferral({ onComplete, createReferral }: FriendReferralProps) {
  const [friendEmail, setFriendEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const emailIsValid = isValidEmail(friendEmail);

  const handleSubmitReferral = async () => {
    if (!emailIsValid) return;
    
    try {
      setIsLoading(true);
      await createReferral({ friendEmail });
      toast.success("Friend invited successfully! You'll get 5 bonus coins!");
      onComplete(false);
    } catch (error) {
      console.error('Error creating referral:', error);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center space-y-8"
    >
      <div className="space-y-4">
        <h2 className="text-3xl font-light text-white">
          {"Invite a Friend, Get 5 Bonus Coins!"}
        </h2>
        <p className="text-lg text-blue-200/80">
          {"Share MyMCAT with a fellow premed and earn extra coins to unlock more features"}
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">🎁</span>
          <div className="text-left">
            <p className="text-white text-xl font-light">{"Bonus Reward"}</p>
            <p className="text-blue-300/80">{"5 Extra Coins"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="Enter a fellow premed's email"
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 
                       rounded-xl text-white placeholder-white/40 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            {emailIsValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-full"
              >
                <svg 
                  className="w-5 h-5 text-green-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </motion.div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSubmitReferral}
              disabled={!emailIsValid || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                       py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending invitation..." : "Invite & Get Bonus"}
            </button>

            <button
              onClick={() => onComplete(true)}
              disabled={isLoading}
              className="flex-1 bg-white/10 text-white 
                       py-3 px-6 rounded-xl font-medium hover:bg-white/20 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"Skip for Now"}
            </button>
          </div>
        </div>
      </div>

      <p className="text-white/60 text-sm">
        {"We'll send them an invite when you're done with onboarding"}
      </p>
    </motion.div>
  );
} 