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
  className?: string;
  onTriggerOnboarding?: () => void;
}

const ClinicHeader = ({
  totalPatients,
  patientsPerDay,
  userInfo,
  userLevel,
  imageGroups,
  visibleImages,
  toggleGroup,
  className = '',
  onTriggerOnboarding,
}: ClinicHeaderProps) => {
/* ---- State ----- */
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

/* ---- Refs --- */
  const marketplaceDialogRef = useRef<HTMLDialogElement>(null);

/* ----- Callbacks --- */
/* --- Animations & Effects --- */
/* ---- Event Handlers ----- */
/* ---- Render Methods ----- */

  return (
    <>
      <div className={`absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 z-50 flex items-center gap-2 ${className}`}>
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="flex items-center justify-center px-2 py-2 sm:px-4 md:px-6 md:py-3
          bg-[--theme-doctorsoffice-accent]
          border-[--theme-border-color]
          text-[--theme-text-color]
          hover:text-[--theme-hover-text]
          hover:bg-[--theme-hover-color]
          transition-colors text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold uppercase rounded-md shadow-md"
        >
          <span>TUTORING FIRM HQ</span>
        </button>
        
        {onTriggerOnboarding && (
          <button
            onClick={onTriggerOnboarding}
            className="flex items-center justify-center px-2 py-2 sm:px-3 md:px-4 md:py-2
            bg-gradient-to-r from-blue-500 to-purple-500
            text-white
            hover:from-blue-600 hover:to-purple-600
            transition-all text-sm sm:text-base md:text-lg font-bold rounded-md shadow-md"
          >
            <span>🎯 Start Tour</span>
          </button>
        )}
      </div>
      
      {isTutorialOpen && (
        <TutorialVidDialog
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          videoUrl="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/MyMCATAnkiClinicVideo(1).mp4"
        />
      )}

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
    </>
  );
};

export default ClinicHeader; 