    import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Statistics from "@/components/Statistics";
import DonutChart from "./DonutChart";
import { toast } from "react-hot-toast";
import {
  Target,
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  DialogOverlay,
} from "@radix-ui/react-dialog";
import { OptionsDialog } from "@/components/home/OptionsDialog";
import { useClerk } from "@clerk/clerk-react";
import { SubscriptionButton } from "@/components/subscription-button";
import Tutorial from "./Tutorial";
import { UserInfo } from "@/types/user";

/* --- Constants ----- */
/* ----- Types ---- */
interface SummaryProps {
  handleSetTab: (tab: string) => void;
  isActive: boolean;
  chatbotRef: React.MutableRefObject<{
    sendMessage: (message: string, context?: string) => void;
  }>;
  userInfo: UserInfo | null
}

const Summary: React.FC<SummaryProps> = ({
  handleSetTab,
  userInfo,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [examScores, setExamScores] = useState<any[]>([]);
  const [showTargetScoreDialog, setShowTargetScoreDialog] = useState(false);
  const [targetScore, setTargetScore] = useState("500");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [runTutorial, setRunTutorial] = useState(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    return hasSeenTutorial === null || hasSeenTutorial === "false";
  });

  const userCoinCount = userInfo?.score

  /* ---- State ----- */
  /* ---- Refs --- */
  /* ----- Callbacks --- */
  /* --- Animations & Effects --- */
  // Initialize target score from userInfo prop
  useEffect(() => {
    if (userInfo?.onboardingInfo?.targetScore) {
      setTargetScore(userInfo.onboardingInfo.targetScore.toString());
    }
  }, [userInfo?.onboardingInfo?.targetScore]);

  useEffect(() => {
    if (userCoinCount === 0) {
      const purchaseButton = document.querySelector('.purchase-button');
      if (purchaseButton instanceof HTMLElement) {
        purchaseButton.click();
      }
    }
  }, [userCoinCount]);

  /* ---- Event Handlers ----- */
  const getScoreFeedback = () => {
    if (!examScores.length) return null;

    const sortedExams = [...examScores]
      .filter(exam => exam.calendarActivity?.scheduledDate) // Only include exams with valid calendar activities
      .sort((a, b) => 
        new Date(a.calendarActivity.scheduledDate).getTime() - new Date(b.calendarActivity.scheduledDate).getTime()
      );

    const recentScore = sortedExams[sortedExams.length - 1]?.score || 0
    const previousScore = sortedExams.length > 1 ? sortedExams[sortedExams.length - 2].score : recentScore;
    const isImproving = recentScore > previousScore;

    if (!isImproving || recentScore === previousScore) {
      return {
        text: "You haven't improved from your last exam. Schedule a meeting with a tutor",
        link: true
      };
    }

    if (recentScore <= 505) {
      return {
        text: "You're scoring low and need help. Schedule a meeting with a tutor",
        link: true
      };
    }

    if (recentScore >= 525) {
      return {
        text: "Please reach out to prynce@mymcat.ai if you're scoring this high.",
        link: false
      };
    }

    if (recentScore >= 520) {
      return {
        text: "You're getting into medical school with that score.",
        link: false
      };
    }

    if (recentScore >= 515) {
      return {
        text: "You're scoring above the average for admitted medical students.",
        link: false
      };
    }

    if (recentScore >= 510) {
      return {
        text: "You're scoring good enough to secure admission to medical school.",
        link: false
      };
    }

    return null;
  };

  // Add this useEffect for fetching exam scores
  useEffect(() => {
    const fetchExamScores = async () => {
      try {
        const response = await fetch('/api/full-length-exam/complete');
        if (response.ok) {
          const data = await response.json();
          setExamScores(data);
        }
      } catch (error) {
        console.error('Error fetching exam scores:', error);
      }
    };

    fetchExamScores();
  }, []);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (hasSeenTutorial === null || hasSeenTutorial === "false") {
      setRunTutorial(true);
    }
  }, []);

  // Update the form submission to use API instead of Clerk
  const handleTargetScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numValue = parseInt(targetScore);
    
    // Validate the score range on submit
    if (numValue < 472 || numValue > 528 || isNaN(numValue)) {
      toast.error('Please enter a score between 472 and 528');
      return;
    }

    try {
      const response = await fetch('/api/user-info/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetScore: numValue
        })
      });

      if (!response.ok) throw new Error('Failed to update target score');

      toast.success('Target score updated successfully!');
      setShowTargetScoreDialog(false);
    } catch (error) {
      console.error("Error updating target score:", error);
      toast.error('Failed to update target score');
    }
  };

  /* ---- Render Methods ----- */
  return (
    <div className="w-full relative">
      <Tutorial runTutorial={runTutorial} setRunTutorial={setRunTutorial} />
      {/* Main Container */}
      <div
        className="flex-grow h-[calc(100vh-7.2rem)] w-full rounded-lg p-2 flex flex-col relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(var(--theme-gradient-start), var(--theme-gradient-end)), var(--theme-interface-image)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "var(--theme-mainbox-color)",
          color: "var(--theme-text-color)",
          boxShadow: "var(--theme-box-shadow)",
        }}
      >
        {/* Target Score Button - Now in top right */}
        <div className="absolute top-3 right-3 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowTargetScoreDialog(true)}
                  className="group h-10 px-3 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                    border border-[--theme-border-color] 
                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                    shadow-md rounded-md transition flex items-center justify-center gap-1"
                >
                  <Target className="w-5 h-5 mr-1" />
                  <span className="text-xs font-medium">Target Score</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Set Target Score</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Content Container */}
        <div className="relative w-full h-full flex-grow overflow-auto">
          {/* Analytics View - now always visible */}
          <div className="absolute inset-0 flex flex-col overflow-auto">
            <div className="flex-grow flex flex-col">
              <AnimatePresence mode="wait">
                {!selectedSubject ? (
                  <motion.div
                    key="donut"
                    className="flex-grow flex justify-center items-center relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DonutChart onProgressClick={(label) => setSelectedSubject(label)} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="statistics"
                    className="flex-grow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Statistics onReturn={() => setSelectedSubject(null)} subject={selectedSubject} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Area - Only Score Feedback and Subscription Button */}
        <div className="mt-auto flex justify-between items-center gap-2 pt-2 mb-2 px-5">
          {/* Score Feedback */}
          {examScores.length > 0 && (
            <div>
              {(() => {
                const feedback = getScoreFeedback();
                if (!feedback) return null;

                return (
                  <div 
                    className="text-[--theme-text-color] text-sm font-medium p-2 rounded-lg max-w-[24rem]"
                    style={{
                      background: 'var(--theme-leaguecard-color)',
                      boxShadow: 'var(--theme-button-boxShadow)'
                    }}
                  >
                    {feedback.link ? (
                      <p>
                        {feedback.text}
                        <span 
                          className="text-blue-500 hover:text-blue-600 cursor-pointer underline ml-1"
                          onClick={() => handleSetTab("Schedule?view=tutors")}
                        >
                          here
                        </span>
                        .
                      </p>
                    ) : (
                      <p>{feedback.text}</p>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Target Score Dialog */}
      <Dialog open={showTargetScoreDialog} onOpenChange={setShowTargetScoreDialog}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
        <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-50">
          <DialogHeader>
            <DialogTitle className="text-center text-black">Set Target Score</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTargetScoreSubmit}>
            <div className="p-4 flex flex-col items-center gap-4">
              <input
                type="text"
                pattern="\d*"
                maxLength={3}
                value={targetScore}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty input for better UX
                  if (value === '') {
                    setTargetScore('');
                    return;
                  }
                  
                  // Only allow numbers
                  if (!/^\d+$/.test(value)) {
                    return;
                  }

                  setTargetScore(value);
                }}
                className="w-24 text-center text-3xl font-bold bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-black"
              />
              <p className="text-sm text-gray-500 text-center">
                Enter a score between 472 and 528
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowTargetScoreDialog(false)}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <OptionsDialog 
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        handleTabChange={handleSetTab}
        allWelcomeTasksCompleted={false}
      />
    </div>
  );
};

export default Summary; 