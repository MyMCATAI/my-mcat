"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { useWindowSize } from "@/store/selectors";

interface CoinIntroStepProps {
  onSubmit: (data: { friendEmail?: string }) => Promise<void>;
  firstName: string;
  isLoading?: boolean;
}

const isValidEmail = (email: string) => {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email);
};

const FEATURES = [
  { icon: "🎯", title: "Daily Streaks", desc: "Study consistently to earn coins" },
  { icon: "🤝", title: "Friend Challenges", desc: "Compete and earn together" },
  { icon: "⭐", title: "Clinic Upgrades", desc: "Spend coins on special features" }
];

export function CoinIntroStep({ onSubmit, firstName, isLoading }: CoinIntroStepProps) {
  const [friendEmail, setFriendEmail] = useState("");
  const emailIsValid = isValidEmail(friendEmail);
  const windowSize = useWindowSize();

  const handleSubmit = async (skipReferral: boolean = false) => {

    console.log('skipReferral', skipReferral);
    console.log('emailIsValid', emailIsValid);
    if (!skipReferral && !emailIsValid) return;
    
    await onSubmit(skipReferral ? {} : { friendEmail });
  };

  const renderFeatures = () => {
    if (!windowSize.isDesktop) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-gray-100 border border-gray-200 shadow-sm
                   hover:bg-gray-200 transition-colors space-y-4"
        >
          {FEATURES.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="text-2xl">{item.icon}</div>
              <div>
                <h3 className="text-gray-900 text-base font-medium mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
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
            className="p-6 rounded-xl bg-gray-100 border border-gray-200 shadow-sm
                     hover:bg-gray-200 transition-colors"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="text-gray-900 text-lg font-medium mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
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
        
        <h2 className="text-3xl font-light text-gray-900">
          {`Hey ${firstName}! Ready to earn some coins?`}
        </h2>
        <p className="text-lg text-gray-600">
          {"Unlock special features and compete with friends"}
        </p>
      </div>

      {renderFeatures()}

      <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl">🎁</span>
          <div className="text-left">
            <p className="text-gray-900 text-xl font-light">{"Quick Bonus!"}</p>
            <p className="text-blue-600">{"Invite a friend for 10 coins"}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="Enter a fellow premed's email"
              className={`w-full px-4 py-3 bg-white border 
                       rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none 
                       transition-all duration-200
                       ${emailIsValid 
                         ? "border-green-500 ring-1 ring-green-500/50" 
                         : "border-gray-300 focus:ring-2 focus:ring-blue-500"}`}
            />
            {emailIsValid && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-3 pointer-events-none"
              >
                <Check className="w-6 h-6 text-green-500" />
              </motion.div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleSubmit(false)}
              disabled={!emailIsValid || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                       py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    {/* Spinner */}
                  </svg>
                  "Sending invitation..."
                </>
               ) : "Invite & Get Bonus" }
            </button>

            <button
              onClick={() => handleSubmit(true)}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 
                       py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-gray-700" viewBox="0 0 24 24">
                    {/* Spinner */}
                  </svg>
                  "Continuing..."
                </>
              ) : "Continue Without Inviting"}
            </button>
          </div>
        </div>
      </div>

      <p className="text-gray-500 text-sm text-center">
        {"We'll send them an invite after you complete onboarding"}
      </p>
    </motion.div>
  );
} 