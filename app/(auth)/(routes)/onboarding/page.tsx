"use client";

import { useState, useEffect, useCallback } from "react";
import { searchUniversities } from "@/utils/universities";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useClerk } from "@clerk/nextjs";
import axios from "axios";
import { MedicalSchool } from "@/types";
import { Tooltip } from "./Tooltip";

// Add this email validation function
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function OnboardingPage() {
  const { user } = useClerk();
  const [loading, setLoading] = useState(false);
  const [isNonTraditional, setIsNonTraditional] = useState(false);
  const [collegeQuery, setCollegeQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ name: string; city: string; state: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [step, setStep] = useState(1);
  const [attemptMessage, setAttemptMessage] = useState("");
  const [hasNotTakenMCAT, setHasNotTakenMCAT] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [medSchoolQuery, setMedSchoolQuery] = useState("");
  const [medSchoolSuggestions, setMedSchoolSuggestions] = useState<
    MedicalSchool[]
  >([]);
  const [selectedSchool, setSelectedSchool] = useState<MedicalSchool | null>(
    null
  );
  const [isMedSchoolInputFocused, setIsMedSchoolInputFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [kalypsoMessage, setKalypsoMessage] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [targetScore, setTargetScore] = useState<string>("");
  const [isCanadian, setIsCanadian] = useState(false);
  const [gpaValue, setGpaValue] = useState<string>("");
  const [diagnosticValue, setDiagnosticValue] = useState<string>("");
  const [attemptValue, setAttemptValue] = useState<string>("");
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (collegeQuery.length >= 3) {
        const results = await searchUniversities(collegeQuery);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [collegeQuery]);

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

  const handleNextStep = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 1) {
      setLoading(true);
      try {
        const response = await fetch("/api/user-info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create user info");
        }
      } catch (error) {
        console.error("Error creating user info:", error);
        return;
      } finally {
        setLoading(false);
      }
    }

    setAttemptMessage("");
    setStep(step + 1);
  };

  const handleOnboardingSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            college: isNonTraditional
              ? "Non-Traditional"
              : isCanadian
                ? "Canadian"
                : collegeQuery,
            isCanadian: isCanadian,
            gpa: gpaValue ? parseFloat(gpaValue) : null,
            diagnosticScore: hasNotTakenMCAT
              ? null
              : diagnosticValue
                ? parseInt(diagnosticValue)
                : null,
            attemptNumber: attemptValue || null,
            targetScore: targetScore ? parseInt(targetScore) : null,
            onboardingComplete: true,
          },
        });
      }

      setStep(4);
      setKalypsoMessage(
        `Hi-ya ${firstName}! I'm Kalypso. I'm your MCAT friend throughout your journey. And we'll get you that ${targetScore}!`
      );
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGPAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGpaValue(value);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiagnosticValue(value);
  };

  const handleAttemptChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setAttemptValue(value);

      if (parseInt(value) > 1) {
        setAttemptMessage("Oooo, I love a good comeback story!");
        setTimeout(() => setAttemptMessage(""), 2000);
      } else {
        setAttemptMessage("");
      }
    },
    []
  );

  const handleKalypsoDialogue = useCallback(() => {
    if (kalypsoMessage.includes("Hi")) {
      setKalypsoMessage(
        "We don't charge thousands like test prep companies do. Our model is more equitable: coins."
      );
    } else if (kalypsoMessage.includes("equitable financial model")) {
      setKalypsoMessage(
        "You buy coins to access features. Overtime, you can earn coins and access more features. However, if you slack off, you lose coins and have to buy more. We force you to be accountable!"
      );
    } else if (kalypsoMessage.includes("slack off")) {
      setKalypsoMessage(
        "I've been saving (a LOT) and I can get 9 coins for free. All you have to do is invite a friend and get the word out about MyMCAT.ai :) 🤝"
      );
    } else {
      setKalypsoMessage("");
    }
  }, [kalypsoMessage]);

  const handleTargetScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetScore(value);
  };

  const onPurchase = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceType: isValidEmail(friendEmail) ? "discount" : "default",
          ...(isValidEmail(friendEmail) && { friendEmail }),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const emailIsValid = isValidEmail(friendEmail);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#001226]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-4xl px-4 md:px-8 py-6 md:py-12"
      >
        <AnimatePresence>
          {attemptMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-8 py-4 rounded-xl shadow-lg text-lg z-50"
            >
              {attemptMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 && (
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
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-4"
              >
              </motion.div>
            </div>

            <form onSubmit={handleNextStep} className="space-y-6">
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
        )}

        {step === 2 && (
          <form onSubmit={handleNextStep} className="max-w-2xl mx-auto space-y-12">
            {/* College Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-light text-white">
                Great to have you here, {firstName}! 
                <span className="block mt-2 text-lg text-gray-400 font-light">
                  Let's talk about your college journey.
                </span>
              </h2>
              
              {!isNonTraditional && !isCanadian && (
                <div className="relative">
                  <input
                    type="text"
                    name="college"
                    value={collegeQuery}
                    onChange={(e) => setCollegeQuery(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Start typing your college name..."
                    required={!isNonTraditional && !isCanadian}
                  />
                  {showSuggestions && suggestions.length > 0 && isInputFocused && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-2 bg-[#001226]/95 backdrop-blur-[2px] 
                                 border border-white/10 rounded-xl shadow-lg max-h-60 overflow-auto 
                                 scrollbar-thin scrollbar-thumb-white/20"
                    >
                      {suggestions.map((school, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                          onClick={() => {
                            setCollegeQuery(school.name);
                            setShowSuggestions(false);
                            setIsInputFocused(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-white/5 
                                   transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <div className="text-white/90 text-sm font-medium">{school.name}</div>
                          <div className="text-white/60 text-xs mt-0.5">
                            {school.city}, {school.state}
                          </div>
                        </motion.button>
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
                  />
                  <span className="group-hover:text-blue-400 transition-colors">Non-traditional</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isCanadian}
                    onChange={(e) => setIsCanadian(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 text-blue-500 focus:ring-blue-500/50 bg-transparent"
                  />
                  <span className="group-hover:text-blue-400 transition-colors">Canadian</span>
                </label>
              </div>
            </motion.div>

            {/* GPA & MCAT Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-8"
            >
              <div className="space-y-3">
                <label className="block text-sm text-gray-400">Undergraduate GPA</label>
                <input
                  type="number"
                  name="gpa"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={gpaValue}
                  onChange={handleGPAChange}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="e.g., 3.50"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm text-gray-400">Recent MCAT Score</label>
                <input
                  type="number"
                  name="diagnosticScore"
                  min="472"
                  max="528"
                  value={diagnosticValue}
                  onChange={handleScoreChange}
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="472-528"
                  required={!hasNotTakenMCAT}
                  disabled={hasNotTakenMCAT}
                />
                <label className="flex items-center space-x-3 text-white cursor-pointer group mt-2">
                  <input
                    type="checkbox"
                    checked={hasNotTakenMCAT}
                    onChange={(e) => setHasNotTakenMCAT(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 text-blue-500 focus:ring-blue-500/50 bg-transparent"
                  />
                  <span className="text-sm group-hover:text-blue-400 transition-colors">Haven't taken it yet</span>
                </label>
              </div>
            </motion.div>

            {/* Attempt Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <label className="block text-sm text-gray-400">MCAT Attempt</label>
              <div className="flex items-end gap-4">
                <select
                  name="attemptNumber"
                  value={attemptValue}
                  onChange={handleAttemptChange}
                  className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                  required
                >
                  <option value="">Select attempt number</option>
                  <option value="1">First attempt</option>
                  <option value="2">Second attempt</option>
                  <option value="3">Third attempt</option>
                  <option value="4+">Fourth or more</option>
                </select>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  type="submit"
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white 
                             px-6 py-3 rounded-xl transition-all duration-300 
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            {/* Medical School Search */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="space-y-3">
                <h2 className="text-2xl font-light text-white">
                  What medical school do you see yourself in?
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    value={medSchoolQuery}
                    onChange={(e) => setMedSchoolQuery(e.target.value)}
                    onFocus={() => setIsMedSchoolInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsMedSchoolInputFocused(false), 200)}
                    className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 
                               rounded-xl text-white focus:outline-none focus:ring-2 
                               focus:ring-blue-500/50 transition-all"
                    placeholder="Enter medical school name..."
                  />
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

              {/* Target Score */}
              <div className="space-y-3">
                <h2 className="text-2xl font-light text-white">
                  What's your target score?
                </h2>
                <div className="flex items-end gap-4">
                  <input
                    type="number"
                    name="targetScore"
                    min="472"
                    max="528"
                    value={targetScore}
                    onChange={handleTargetScoreChange}
                    className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 
                               rounded-xl text-white focus:outline-none focus:ring-2 
                               focus:ring-blue-500/50 transition-all"
                    placeholder="Enter your target score (472-528)"
                    required
                  />
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    type="submit"
                    disabled={loading}
                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white 
                               px-6 py-3 rounded-xl transition-all duration-300 
                               focus:outline-none focus:ring-2 focus:ring-blue-500/50
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Next"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </form>
        )}

        {step === 4 && kalypsoMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm 
               max-w-2xl mx-auto space-y-6 relative overflow-hidden"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
            
            <p className="text-white text-xl font-light relative">
              {kalypsoMessage}
            </p>

            <div className="flex justify-end relative">
              <motion.button
                onClick={handleKalypsoDialogue}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white 
                   px-6 py-2.5 rounded-xl transition-all duration-300 
                   focus:outline-none focus:ring-2 focus:ring-blue-500/50
                   border border-white/10"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 4 && !kalypsoMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center space-y-8"
          >
            <div className="space-y-4">
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">🎁</span>
                <div className="text-left">
                  <p className="text-white text-xl font-light">Kalypso's Gift</p>
                  <p className="text-blue-300/80">9 Coins • Starter Pack</p>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      ✅
                    </motion.div>
                  )}
                </div>

                <button
                  onClick={onPurchase}
                  disabled={loading || !emailIsValid}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                           py-3 px-6 rounded-xl font-medium hover:opacity-90 transition-opacity
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Get Started"
                  )}
                </button>
              </div>
            </div>

            <p className="text-white/60 text-sm">
              We'll send them an invite when you're done with onboarding
            </p>
          </motion.div>
        )}

        {kalypsoMessage && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            transition={{ type: "spring", duration: 1 }}
            className="fixed bottom-0 right-0 md:right-8 transform translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="w-[20rem] h-[36rem] md:w-[32rem] md:h-[32rem] lg:w-[48rem] lg:h-[48rem] relative">
              <Image
                src="/kalypsoend.gif"
                alt="Kalypso"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Add this to your global.d.ts file or declare it at the top of your file
declare global {
  interface Window {
    gpaTimeout: NodeJS.Timeout;
    scoreTimeout: NodeJS.Timeout;
  }
}
