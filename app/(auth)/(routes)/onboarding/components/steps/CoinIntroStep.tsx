"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { useWindowSize } from "@/store/selectors";

interface CoinIntroStepProps {
  onSubmit: (data: { friendEmail?: string }) => Promise<void>;
  firstName: string;
}

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const FEATURES = [
  { icon: "🎯", title: "Daily Streaks", desc: "Study consistently to earn coins" },
  { icon: "🤝", title: "Friend Challenges", desc: "Compete and earn together" },
  { icon: "⭐", title: "Clinic Upgrades", desc: "Spend coins on special features" }
];

export function CoinIntroStep({ onSubmit, firstName }: CoinIntroStepProps) {
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const emailIsValid = isValidEmail(friendEmail);
  const windowSize = useWindowSize();

  const handleSubmit = async (skipReferral: boolean = false) => {
    if (!skipReferral && !emailIsValid) return;
    
    try {
      setLoading(true);
      await onSubmit(skipReferral ? {} : { friendEmail });
    } finally {
      setLoading(false);
    }
  };

  const renderFeatures = () => {
    if (!windowSize.isDesktop) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10
                   hover:bg-white/10 transition-colors space-y-4"
        >
          {FEATURES.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="text-2xl">{item.icon}</div>
              <div>
                <h3 className="text-white text-base font-medium mb-1">{item.title}</h3>
                <p className="text-blue-200/80 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      );
    }

    return (
      <div className="grid grid-cols-3 gap-4">
        {FEATURES.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10
                     hover:bg-white/10 transition-colors"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-white text-lg font-medium mb-2">{item.title}</h3>
            <p className="text-blue-200/80 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-24 h-24 mx-auto relative mb-6"
        >
          <Image
            src="/game-components/CupcakeCoin.gif"
            alt="Cupcake Coin"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
        
        <h2 className="text-3xl font-light text-white">
          {`Hey ${firstName}! Ready to earn some coins?`}
        </h2>
        <p className="text-lg text-blue-200/80">
          {"Unlock special features and compete with friends"}
        </p>
      </div>

      {renderFeatures()}

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">🎁</span>
          <div className="text-left">
            <p className="text-white text-xl font-light">{"Quick Bonus!"}</p>
            <p className="text-blue-300/80">{"Invite a friend for 10 coins"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="Enter a fellow premed's email"
              className={`w-full px-4 py-3 bg-white/5 backdrop-blur-sm 
                       rounded-xl text-white placeholder-white/40 focus:outline-none 
                       transition-all duration-200
                       ${emailIsValid 
                         ? "border-green-400 ring-1 ring-green-400/50" 
                         : "border border-white/10 focus:ring-2 focus:ring-blue-500/50"}`}
            />
            {emailIsValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-3 pointer-events-none"
              >
                <Check className="w-6 h-6 text-green-400" />
              </motion.div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleSubmit(false)}
              disabled={!emailIsValid || loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                       py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending invitation..." : "Invite & Get Bonus"}
            </button>

            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex-1 bg-white/10 text-white 
                       py-3 px-6 rounded-xl font-medium hover:bg-white/20 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {"Continue Without Inviting"}
            </button>
          </div>
        </div>
      </div>

      <p className="text-white/60 text-sm text-center">
        {"We'll send them an invite after you complete onboarding"}
      </p>
    </motion.div>
  );
} 