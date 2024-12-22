import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface OptionsDialogProps {
  showOptionsModal: boolean;
  setShowOptionsModal: (show: boolean) => void;
  handleTabChange: (tab: string) => void;
}

export const OptionsDialog = ({ 
  showOptionsModal, 
  setShowOptionsModal, 
  handleTabChange 
}: OptionsDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

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
      videoUrl: "https://www.youtube.com/embed/YOUR_ANKI_VIDEO_ID"
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
    <Dialog open={showOptionsModal} onOpenChange={setShowOptionsModal}>
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
            <p className={"text-m text-[--theme-text-color] mb-4 leading-relaxed text-left ml-4"}>
              Begin your learning journey with adaptive tutoring or flashcards, both accessible with your coins. The more you study, the more coins you can earn.
              If you&apos;re nearing your test date, consider purchasing coins to gain early access to our advanced test review suite at a discounted rate.
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
                  if (option) {
                    setShowOptionsModal(false);
                    handleTabChange(option.tab);
                  }
                }}
                className={"flex-1 py-2 px-4 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color] rounded-lg transition-colors duration-200"}
              >
                Start {selectedOption}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};