import Image from "next/image";
import { useRef, useState } from "react";
import { PurchaseButton } from "@/components/purchase-button";
import ShoppingDialog, { ImageGroup } from "../ShoppingDialog";
import dynamic from 'next/dynamic';

// Dynamically import TutorialVidDialog
const TutorialVidDialog = dynamic(() => import('@/components/ui/TutorialVidDialog'), {
  ssr: false
});

/* --- Constants ----- */
/* ----- Types ---- */
interface ClinicHeaderProps {
  totalPatients: number;
  patientsPerDay: number; 
  userInfo: { score?: number; clinicRooms?: string } | null;
  userLevel: string | null;
  imageGroups: ImageGroup[];
  visibleImages: Set<string>;
  toggleGroup: (groupName: string) => Promise<void>;
  // Add new props for AdaptiveTutoring
  showAdaptiveTutoring?: boolean;
  toggleAdaptiveTutoring?: () => void;
}

const ClinicHeader = ({
  totalPatients,
  patientsPerDay,
  userInfo,
  userLevel,
  imageGroups,
  visibleImages,
  toggleGroup,
  // Add new props with default values
  showAdaptiveTutoring = false,
  toggleAdaptiveTutoring = () => {}
}: ClinicHeaderProps) => {
/* ---- State ----- */
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isFlashcardsTooltipOpen, setIsFlashcardsTooltipOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

/* ---- Refs --- */
  const marketplaceDialogRef = useRef<HTMLDialogElement>(null);

/* ----- Callbacks --- */
/* --- Animations & Effects --- */
/* ---- Event Handlers ----- */
/* ---- Render Methods ----- */

  return (
    <>
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 z-50 flex items-center">
        {/* Fellowship Level button with dropup */}
        <div className="relative group">
          <button className={`flex items-center justify-center px-2 py-2 sm:px-4 md:px-6 py-2 md:py-3
            bg-[--theme-doctorsoffice-accent]
            border-[--theme-border-color] 
            text-[--theme-text-color] 
            hover:text-[--theme-hover-text] 
            hover:bg-[--theme-hover-color] 
            transition-colors text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold uppercase 
            group-hover:text-[--theme-hover-text] 
            group-hover:bg-[--theme-hover-color]`}>
            <span>PREMEDLEY HQ</span>
          </button>
          {/* Modify the dropdown to be a dropup by changing positioning from top to bottom */}
          <div className="absolute bottom-full left-0 mb-2 w-full shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out"> 
            <div className="flex flex-col">
              <a
                href="#"
                className="clinic-header-tutorial-trigger w-full px-3 py-2 sm:px-4 md:px-6 sm:py-2 md:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
                onClick={(e) => {
                  e.preventDefault();
                  setIsTutorialOpen(true);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Tutorial
              </a>
              <a
                href="#"
                className="w-full px-3 py-2 sm:px-4 md:px-6 sm:py-2 md:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMarketplaceOpen(!isMarketplaceOpen);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Marketplace
              </a>
            </div>

            <div className="flex flex-col">
            {isMarketplaceOpen && (
              <ShoppingDialog
                imageGroups={imageGroups}
                visibleImages={visibleImages}
                toggleGroup={toggleGroup}
                userScore={userInfo?.score || 0}
                isOpen={isMarketplaceOpen}
                onOpenChange={setIsMarketplaceOpen}
                clinicRooms={userInfo?.clinicRooms || "[]"}
              />
            )}
            </div>
            <div className="flex flex-col">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFlashcardsTooltipOpen(!isFlashcardsTooltipOpen);
              }}
              onMouseLeave={() => setIsFlashcardsTooltipOpen(false)}
              className="w-full px-3 py-2 sm:px-4 md:px-6 sm:py-2 md:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
              Flashcards
            </button>
            </div>

            <div className="flex flex-col">
              {isFlashcardsTooltipOpen && (
                <div className="absolute bottom-0 left-0 mb-2 w-48 sm:w-56 md:w-64 bg-[--theme-leaguecard-color] text-[--theme-text-color] text-xs sm:text-sm rounded-lg p-2 sm:p-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50 border border-[--theme-border-color]">
                  <p className="mb-2">Coming soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add AdaptiveTutoring toggle button */}
      <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-50">
        <button 
          onClick={toggleAdaptiveTutoring}
          className="px-3 py-2 sm:px-4 md:px-6 sm:py-2 md:py-3 bg-[--theme-gradient-startstreak] text-white rounded-lg text-xs sm:text-sm md:text-base hover:bg-opacity-90 transition-colors"
        >
          {showAdaptiveTutoring ? "Return to Clinic" : "Adaptive Tutoring"}
        </button>
      </div>

      {/* Tutorial Dialog */}
      {isTutorialOpen && (
        <TutorialVidDialog
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          videoUrl="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MyMCATAnkiClinicVideo(1).mp4"
        />
      )}
    </>
  );
};

export default ClinicHeader; 