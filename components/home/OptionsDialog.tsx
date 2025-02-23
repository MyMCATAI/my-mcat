import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "react-hot-toast";

interface OptionsDialogProps {
  showOptionsModal: boolean;
  setShowOptionsModal: (show: boolean) => void;
  handleTabChange: (tab: string) => void;
  allWelcomeTasksCompleted: boolean;
}

export const OptionsDialog = ({ 
  showOptionsModal, 
  setShowOptionsModal, 
  handleTabChange,
  allWelcomeTasksCompleted
}: OptionsDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [hasUnlocks, setHasUnlocks] = useState(false);
  const [tutorialsCompleted, setTutorialsCompleted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkTutorials = () => {
      const tutorial1 = localStorage.getItem('tutorial1-completed');
      const tutorial2 = localStorage.getItem('tutorial2-completed');
      const tutorial3 = localStorage.getItem('tutorial3-completed');
      const tutorial4 = localStorage.getItem('tutorial4-completed');
      
      return !!(tutorial1 && tutorial2 && tutorial3 && tutorial4);
    };

    setTutorialsCompleted(checkTutorials());
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user-info");
        if (!response.ok) throw new Error("Failed to fetch user info");
        const data = await response.json();
        setUserScore(data.score);
        
        const unlocks = Array.isArray(data.unlocks) ? data.unlocks : [];
        setHasUnlocks(unlocks.length === 0);
        
        if (unlocks.length === 0) {
          setShowOptionsModal(false);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Failed to fetch user info");
      }
    };

    fetchUserInfo();
  }, [setShowOptionsModal]);

  const handleStartOption = async (option: any) => {
    const cost = 5; // Since both options cost 5 coins
    if (userScore < cost) {
      toast.error("You don't have enough coins!");
      return;
    }

    try {
      const unlockType = option.title === "ANKI GAME" ? "game" : "ts";
      const response = await fetch("/api/user-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          unlockGame: true,
          decrementScore: cost,
          unlockType: unlockType
        }),
      });

      if (!response.ok) throw new Error("Failed to deduct coins");

      const data = await response.json();
      setUserScore(data.score);

      if (option.title === "ANKI GAME") {
        router.push('/ankiclinic');
      } else if (option.title === "ADAPTIVE TUTORING") {
        handleTabChange("AdaptiveTutoringSuite");
      }

      setShowOptionsModal(false);
      toast.success(`${option.title} unlocked! ${cost} coins deducted`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to start option");
    }
  };

  const options = [
    {
      title: "ADAPTIVE TUTORING",
      image: "/kalypsocalendar.png",
      alt: "Calendar",
      cost: "5 coins",
      tab: "Schedule",
      videoUrl: "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/ATSAdvertisement.mp4"
    },
    {
      title: "ANKI GAME",
      image: "/kalypsodiagnostic.png",
      alt: "Flashcards",
      cost: "5 coins",
      tab: "flashcards",
      videoUrl: "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/AnkiClinicAdvertisement.mp4"
    },
    {
      title: "TEST REVIEW",
      image: "/kalypotesting.png",
      alt: "Testing",
      cost: "25 coins",
      tab: "KnowledgeProfile",
      isPremium: true,
      videoUrl: "https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/TestingSuiteAdvertisement.mp4"
    }
  ];

  return (
    <Dialog open={showOptionsModal && hasUnlocks && tutorialsCompleted && allWelcomeTasksCompleted} onOpenChange={() => {}}>
      <DialogContent className={"max-w-4xl bg-[--theme-mainbox-color] text-[--theme-text-color] border-2 border-transparent"}>
        <h2 className={"text-[--theme-text-color] text-xs mb-6 opacity-60 uppercase tracking-wide text-center"}>
          {selectedOption ? selectedOption : "Choose Your Study Path"}
        </h2>

        {!selectedOption ? (
          <>
            <div className={"grid grid-cols-1 md:grid-cols-3 gap-6 p-4"}>
              {options.map((option, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    setSelectedOption(option.title);
                  }}
                  className={`rounded-lg p-6 flex flex-col items-center space-y-4 transition-all relative h-full w-full hover:scale-[1.02] hover:-translate-y-1
                    ${option.isPremium 
                      ? "bg-gradient-to-br from-[--theme-gradient-start] via-[--theme-gradient-end] to-[--theme-doctorsoffice-accent] shadow-xl shadow-[--theme-doctorsoffice-accent]/30 hover:shadow-2xl hover:shadow-[--theme-doctorsoffice-accent]/40" 
                      : "bg-[--theme-leaguecard-color]"}`}
                  style={{ 
                    boxShadow: 'var(--theme-button-boxShadow)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--theme-button-boxShadow-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--theme-button-boxShadow)';
                  }}
                >
                  {option.isPremium && (
                    <div className={"absolute -top-3 -right-3 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] px-3 py-1 rounded-full text-sm font-bold shadow-lg transform rotate-12"}>
                      Premium
                    </div>
                  )}
                  <img 
                    src={option.image} 
                    alt={option.alt} 
                    className={`w-32 h-32 object-contain mb-3 pointer-events-none ${
                      option.isPremium ? "scale-110 transition-transform duration-300 group-hover:scale-125" : ""
                    }`}
                  />
                  <span className="text-center font-bold text-[--theme-text-color] pointer-events-none">{option.title}</span>
                  <span className="text-sm text-[--theme-text-color] pointer-events-none">({option.cost})</span>
                </button>
              ))}
            </div>
            <p className={"text-m text-[--theme-text-color] mb-2 leading-relaxed text-center ml-4"}>
               Congratulations on starting your MCAT Journey!
            </p>
            <p className={"text-m text-[--theme-text-color] mb-4 leading-relaxed text-center ml-4"}>
               Click one of these options to get started in either LEARNING content, PRACTICING content, or TEST REVIEW.
            </p>
          </>
        ) : (
          <>
            <div className={"relative pb-[56.25%] h-0"}>
              <iframe
                className={"absolute top-0 left-0 w-full h-full rounded-lg"}
                src={options.find(opt => opt.title === selectedOption)?.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {selectedOption === "TEST REVIEW" && (
              <p className={"text-m text-[--theme-text-color] mt-4 text-left ml-10"}>
                Test review is still in production. AI will summarize why you got questions wrong and suggest strategic improvements. Prices will double next month so get it now.
              </p>
            )}
            <div className={"flex gap-4 mt-4"}>
              <button
                onClick={() => setSelectedOption(null)}
                className={"flex-1 py-2 px-4 bg-[--theme-leaguecard-color] hover:bg-[--theme-hover-color] text-[--theme-text-color] rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Options
              </button>
              <button
                onClick={() => {
                  const option = options.find(opt => opt.title === selectedOption);
                  if (option && !option.isPremium) {
                    handleStartOption(option);
                  }
                }}
                disabled={options.find(opt => opt.title === selectedOption)?.isPremium}
                className={`flex-1 py-2 px-4 ${
                  options.find(opt => opt.title === selectedOption)?.isPremium 
                    ? "bg-gray-500 cursor-not-allowed" 
                    : "bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color]"
                } text-[--theme-text-color] rounded-lg transition-colors duration-200`}
              >
                {options.find(opt => opt.title === selectedOption)?.isPremium 
                  ? "Coming Soon" 
                  : `Start ${selectedOption}`}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};