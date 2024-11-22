'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { searchUniversities } from '@/utils/universities';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerk } from '@clerk/nextjs';
import axios from "axios";

interface MedicalSchool {
  name: string;
  state: string;
  averageMCAT: string;
  averageGPA: string;
  description: string;
}

const Tooltip = ({ message, topPosition }: { message: string; topPosition?: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    className="absolute bg-blue-500 text-white px-4 py-3 rounded-lg text-md w-[16rem] whitespace-normal"
    style={{ top: topPosition ?? 0 }}
  >
    {message}
  </motion.div>
);

// Add this email validation function
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function OnboardingPage() {
  const { user } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isNonTraditional, setIsNonTraditional] = useState(false);
  const [collegeQuery, setCollegeQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{name: string, city: string, state: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [step, setStep] = useState(1); 
  const [gpaMessage, setGpaMessage] = useState('');
  const [scoreMessage, setScoreMessage] = useState('');
  const [attemptMessage, setAttemptMessage] = useState('');
  const [hasNotTakenMCAT, setHasNotTakenMCAT] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showMedSchoolSearch, setShowMedSchoolSearch] = useState(false);
  const [medSchoolQuery, setMedSchoolQuery] = useState('');
  const [medSchoolSuggestions, setMedSchoolSuggestions] = useState<MedicalSchool[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<MedicalSchool | null>(null);
  const [isMedSchoolInputFocused, setIsMedSchoolInputFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showKalypso, setShowKalypso] = useState(false);
  const [kalypsoMessage, setKalypsoMessage] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [targetScore, setTargetScore] = useState<string>('');
  const [highScoreMessage, setHighScoreMessage] = useState('');
  const [isCanadian, setIsCanadian] = useState(false);
  const [gpaValue, setGpaValue] = useState<string>('');
  const [diagnosticValue, setDiagnosticValue] = useState<string>('');
  const [attemptValue, setAttemptValue] = useState<string>('');

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
          const response = await fetch(`/api/medical-schools?query=${encodeURIComponent(medSchoolQuery)}`);
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

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGpaMessage('');
    setScoreMessage('');
    setAttemptMessage('');
    setHighScoreMessage('');
    setStep(2);
  };

  const handleOnboardingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            college: isNonTraditional ? 'Non-Traditional' : isCanadian ? 'Canadian' : collegeQuery,
            isCanadian: isCanadian,
            gpa: gpaValue ? parseFloat(gpaValue) : null,
            diagnosticScore: hasNotTakenMCAT ? null : (diagnosticValue ? parseInt(diagnosticValue) : null),
            attemptNumber: attemptValue || null,
            targetScore: targetScore ? parseInt(targetScore) : null,
            onboardingComplete: true
          }
        });
      }
      
      setStep(3);
      setShowKalypso(true);
      setKalypsoMessage(`Hi, I'm Kalypso. I'm going to be your friend throughout your journey so we can get you that ${targetScore}.`);
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGPAChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGpaValue(value);
    
    const gpa = parseFloat(value);
    clearTimeout(window.gpaTimeout);
    window.gpaTimeout = setTimeout(() => {
      if (gpa >= 3.7) {
        setGpaMessage("That's a great GPA! You're a rockstar! 🌟");
        setTimeout(() => setGpaMessage(''), 1500);
      } else if (gpa < 3.6) {
        setGpaMessage("Good thing you're going to offset your GPA with a GREAT MCAT score! We'll make sure of that. 💪");
        setTimeout(() => setGpaMessage(''), 2500);
      } else {
        setGpaMessage('');
      }
    }, 1000);
  }, []);

  const handleScoreChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiagnosticValue(value);
    
    const score = parseInt(value);
    clearTimeout(window.scoreTimeout);
    
    window.scoreTimeout = setTimeout(() => {
      if (score >= 510) {
        setScoreMessage("I know 528 potential when I see it! 🎯");
        setTimeout(() => setScoreMessage(''), 1500);
      } else {
        setScoreMessage("Don't beat yourself up over it. We're just beginning!");
        setTimeout(() => setScoreMessage(''), 2500);
      }
    }, 1000);
  }, []);

  const handleAttemptChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setAttemptValue(value);
    
    if (parseInt(value) > 1) {
      setAttemptMessage("Oooo, I love a good comeback story!");
      setTimeout(() => setAttemptMessage(''), 1200);
    } else {
      setAttemptMessage('');
    }
  }, []);

  const handleKalypsoDialogue = useCallback(() => {
    if (kalypsoMessage === '') {
      setKalypsoMessage(`Hi-ya! I'm Kalypso. I'm your MCAT friend throughout your journey. Let's get you that ${targetScore}.`);
    } else if (kalypsoMessage.includes("Hi, I'm Kalypso")) {
      setKalypsoMessage("Kaplan charges $3000 for an MCAT journey. For how little they offer, that's way too much. We do more than they do, and we use a more equitable financial model: coins.");
    } else if (kalypsoMessage.includes("equitable financial model")) {
      setKalypsoMessage("You buy coins to access features. Overtime, you can earn coins and access more features. However, if you slack off, you lose coins. We force you to be accountable!");
    } else if (kalypsoMessage.includes("slack off")) {
      setKalypsoMessage("Ten coins get you started. And I can get you a discount for half, but you gotta invite a friend! 🤝");
    } else {
      setStep(4);
      setKalypsoMessage('');
    }
  }, [kalypsoMessage, targetScore]);

  const handleTargetScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetScore(value);
    
    const score = parseInt(value);
    if (score > 519) {
      setHighScoreMessage("Ambitious, aren't we?");
      setTimeout(() => setHighScoreMessage(''), 1500);
    } else {
      setHighScoreMessage('');
    }
  };

  const onPurchase = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/stripe/checkout", {
        priceType: isValidEmail(friendEmail) ? 'discount' : 'default',
        ...(isValidEmail(friendEmail) && { friendEmail })
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const emailIsValid = isValidEmail(friendEmail)

  return (
    <div className="flex items-center justify-center min-h-screen relative">
      {(step === 3 || step === 4) && (
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: '0%' }}
          transition={{ type: "spring", duration: 1 }}
          className="fixed -bottom-24 right-10 translate-y-1/4 z-50"
        >
          <div className="w-[48rem] h-[48rem] relative">
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl p-8 rounded-lg border border-[#5F7E92] bg-[#001226] relative"
      >
        <div className="absolute right-0 translate-x-[calc(100%+2rem)] h-full top-0">
          <AnimatePresence>
            {gpaMessage && (
              <Tooltip message={gpaMessage} topPosition={160} />
            )}
            {scoreMessage && (
              <Tooltip message={scoreMessage} topPosition={252} />
            )}
            {attemptMessage && (
              <Tooltip message={attemptMessage} topPosition={370} />
            )}
            {highScoreMessage && (
              <Tooltip message={highScoreMessage} topPosition={440} />
            )}
          </AnimatePresence>
        </div>

        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            {/* College Selection */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium">What college do you attend?</label>
              {!isNonTraditional && !isCanadian ? (
                <div className="relative">
                  <input
                    type="text"
                    name="college"
                    value={collegeQuery}
                    onChange={(e) => setCollegeQuery(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsInputFocused(false), 200);
                    }}
                    className="w-full px-3 py-2 bg-transparent border border-[#5F7E92] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Start typing your college name..."
                    required={!isNonTraditional && !isCanadian}
                  />
                  {showSuggestions && suggestions.length > 0 && isInputFocused && (
                    <div className="absolute z-10 w-full mt-1 bg-[#001226] border border-[#5F7E92] rounded-md shadow-lg max-h-60 overflow-auto">
                      {suggestions.map((school, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-2 text-left text-white hover:bg-[#1a2b3c] focus:outline-none"
                          onClick={() => {
                            setCollegeQuery(school.name);
                            setShowSuggestions(false);
                            setIsInputFocused(false);
                          }}
                        >
                          <div className="text-sm">{school.name}</div>
                          <div className="text-xs text-gray-400">{school.city}, {school.state}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="nonTraditional"
                    checked={isNonTraditional}
                    onChange={(e) => setIsNonTraditional(e.target.checked)}
                    className="rounded border-[#5F7E92]"
                  />
                  <label htmlFor="nonTraditional" className="text-white text-sm">
                    Non-traditional
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isCanadian"
                    checked={isCanadian}
                    onChange={(e) => setIsCanadian(e.target.checked)}
                    className="rounded border-[#5F7E92]"
                  />
                  <label htmlFor="isCanadian" className="text-white text-sm">
                    Canadian
                  </label>
                </div>
              </div>
            </div>

            {/* GPA */}
            <div className="space-y-2 relative">
              <label className="block text-white text-sm font-medium">What is your undergraduate GPA?</label>
              <div className="relative">
                <input
                  type="number"
                  name="gpa"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={gpaValue}
                  onChange={handleGPAChange}
                  className="w-full px-3 py-2 bg-transparent border border-[#5F7E92] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your GPA (e.g., 3.50)"
                  required
                />
              </div>
            </div>

            {/* Diagnostic Score */}
            <div className="space-y-2 relative">
              <label className="block text-white text-sm font-medium">{"What's your most recent score?"}</label>
              <div className="relative">
                <input
                  type="number"
                  name="diagnosticScore"
                  min="472"
                  max="528"
                  value={diagnosticValue}
                  onChange={handleScoreChange}
                  className="w-full px-3 py-2 bg-transparent border border-[#5F7E92] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your diagnostic score (472-528)"
                  required={!hasNotTakenMCAT}
                  disabled={hasNotTakenMCAT}
                />
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="hasNotTakenMCAT"
                  checked={hasNotTakenMCAT}
                  onChange={(e) => setHasNotTakenMCAT(e.target.checked)}
                  className="rounded border-[#5F7E92]"
                />
                <label htmlFor="hasNotTakenMCAT" className="text-white text-sm">{"Haven't taken it yet"}</label>
              </div>
            </div>

            {/* Attempt Number */}
            <div className="space-y-2 relative">
              <label className="block text-white text-sm font-medium">Which attempt are you on in your MCAT prep?</label>
              <div className="relative">
                <select
                  name="attemptNumber"
                  value={attemptValue}
                  onChange={handleAttemptChange}
                  className="w-full px-3 py-2 bg-transparent border border-[#5F7E92] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select attempt number</option>
                  <option value="1">First attempt</option>
                  <option value="2">Second attempt</option>
                  <option value="3">Third attempt</option>
                  <option value="4+">Fourth or more</option>
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            {/* Medical School Search */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium">
                What medical school do you see yourself in?
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={medSchoolQuery}
                  onChange={(e) => setMedSchoolQuery(e.target.value)}
                  onFocus={() => setIsMedSchoolInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsMedSchoolInputFocused(false), 200)}
                  className="w-full px-3 py-2 bg-transparent border border-[#5F7E92] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter medical school name..."
                />
                {medSchoolSuggestions.length > 0 && isMedSchoolInputFocused && (
                  <div className="absolute z-10 w-full mt-1 bg-[#001226] border border-[#5F7E92] rounded-md shadow-lg max-h-60 overflow-auto">
                    {isSearching ? (
                      <div className="px-4 py-2 text-gray-400">Searching...</div>
                    ) : (
                      medSchoolSuggestions.map((school, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-2 text-left text-white hover:bg-[#1a2b3c] focus:outline-none"
                          onClick={() => {
                            setSelectedSchool(school);
                            setMedSchoolQuery(school.name);
                            setIsMedSchoolInputFocused(false);
                          }}
                        >
                          <div className="text-sm">{school.name}</div>
                          <div className="text-xs text-gray-400">{school.state}</div>
                        </button>
                      ))
                    )}
                    {medSchoolQuery.length >= 3 && !isSearching && medSchoolSuggestions.length === 0 && isMedSchoolInputFocused && (
                      <div className="absolute z-10 w-full mt-1 bg-[#001226] border border-[#5F7E92] rounded-md shadow-lg">
                        <div className="px-4 py-2 text-gray-400">No medical schools found</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Medical School Card */}
            {selectedSchool && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 border border-[#5F7E92] rounded-lg bg-[#001226]/50 space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">{selectedSchool.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0A1A2F] p-3 rounded-md">
                    <div className="text-xs text-gray-400 mb-1">Average MCAT</div>
                    <div className="text-white font-medium text-lg">{selectedSchool.averageMCAT}</div>
                  </div>
                  <div className="bg-[#0A1A2F] p-3 rounded-md">
                    <div className="text-xs text-gray-400 mb-1">Average GPA</div>
                    <div className="text-white font-medium text-lg">{selectedSchool.averageGPA}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedSchool.description}</p>
              </motion.div>
            )}

            {/* Target Score */}
            <div className="space-y-2">
              <label className="block text-white text-sm font-medium">{"What's your target score?"}</label>
              <input
                type="number"
                name="targetScore"
                min="472"
                max="528"
                value={targetScore}
                onChange={handleTargetScoreChange}
                className="w-full px-3 py-2 bg-transparent border border-[#5F7E92] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your target score (472-528)"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        )}

        {(step === 3 || step === 4) && kalypsoMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border rounded-lg border-transparent min-h-[12rem] flex flex-col justify-between"
          >
            <p className="text-white text-lg">{kalypsoMessage}</p>
            <div className="flex justify-center">
              <button 
                onClick={handleKalypsoDialogue}
                className="mt-4 border text-white px-6 py-2 rounded-md hover:bg-blue-900 transition-colors"
              >
                Okay!
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && !kalypsoMessage && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Get Your Coins</h2>
            <div className="bg-[#0A1A2F] p-6 rounded-lg mb-6 relative">
              {emailIsValid && (
                <div className="absolute -top-3 right-3 bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                  50% OFF!
                </div>
              )}
              <div className="flex justify-center items-center gap-3">
                {emailIsValid && (
                  <p className="text-3xl font-bold text-gray-400 line-through">$19.00</p>
                )}
                <p className="text-3xl font-bold text-white">${emailIsValid ? '9.50' : '19.00'}</p>
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <p className="text-gray-400">10 Coins</p>
                <span className="text-yellow-400">✨</span>
              </div>
            </div>
            <div className="space-y-4">
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder={"Friend's email for 50% discount"}
                className="w-full px-3 py-2 bg-transparent border border-[#5F7E92] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={onPurchase}
                disabled={loading || (friendEmail.length > 0 && !emailIsValid)}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Purchase Coins"}
              </button>
            </div>
          </div>
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
