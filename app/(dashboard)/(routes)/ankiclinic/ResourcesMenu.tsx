import React, { useState, useEffect } from "react";
import { DoctorOfficeStats } from "@/types";
import { FaFire } from "react-icons/fa";
import {
  calculatePlayerLevel,
  getLevelNumber,
} from "@/utils/calculateResourceTotals";
import TutorialVidDialog from "@/components/ui/TutorialVidDialog";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import Leaderboard from "@/components/leaderboard/Leaderboard";
import AnimatedProfileIcon from '@/components/ui/AnimatedProfileIcon';
import { useProfileContext } from '@/contexts/UserProfileContext';

interface ResourcesMenuProps {
  reportData: DoctorOfficeStats | null;
  userRooms: string[];
  totalCoins: number;
  totalPatients: number;
  patientsPerDay: number;
}

const ResourcesMenu: React.FC<ResourcesMenuProps> = ({
  reportData,
  userRooms,
}) => {
  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("");
  const { profile } = useProfileContext();
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  if (!reportData) {
    return <div>Loading...</div>;
  }

  const playerLevel = calculatePlayerLevel(userRooms);
  const levelNumber = getLevelNumber(playerLevel);

  return (
    <div className="h-full">
      <div className={`flex flex-col bg-[--theme-leaguecard-color] text-[--theme-text-color] items-center h-full rounded-lg ${isMobile ? 'p-2' : 'p-4'} overflow-auto relative scrollbar-gutter-stable`}>
        {/* Prevent layout shift when scrollbar appears/disappears */}
        <style jsx global>{`
          .scrollbar-gutter-stable {
            scrollbar-gutter: stable;
          }
          
          /* Optional: Style the scrollbar to make it less obtrusive */
          .scrollbar-gutter-stable::-webkit-scrollbar {
            width: 8px;
          }
          
          .scrollbar-gutter-stable::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .scrollbar-gutter-stable::-webkit-scrollbar-thumb {
            background-color: rgba(155, 155, 155, 0.5);
            border-radius: 4px;
          }
        `}</style>

        <div className={`flex flex-col items-center ${isMobile ? 'mb-0' : 'mb-1'} w-full`}>
          <AnimatedProfileIcon 
            photoName={profile?.profilePhoto || 'doctor.png'}
            size={isMobile ? 120 : 192}
          />
        </div>

        <DaysStreak days={reportData.streak} isMobile={isMobile} />

        <div className={`w-full max-w-md ${isMobile ? 'mt-2' : 'mt-6'}`}>
          <Leaderboard 
            variant="resources"
            showAddFriend={!isMobile}
            className="w-full"
            compact={isMobile}
          />
        </div>
      </div>
      <TutorialVidDialog
        isOpen={isTutorialDialogOpen}
        onClose={() => setIsTutorialDialogOpen(false)}
        videoUrl={tutorialVideoUrl}
      />
    </div>
  );
};

interface DaysStreakProps {
  days: number;
  isMobile?: boolean;
}

const DaysStreak: React.FC<DaysStreakProps> = ({ days, isMobile = false }) => {
  return (
    <div
      className={`w-full max-w-md rounded-lg ${isMobile ? 'p-2 mt-2 mb-1 text-sm' : 'p-4 mt-6 mb-2'} text-white shadow-lg`}
      style={{
        background:
          "linear-gradient(to right, var(--theme-gradient-startstreak), var(--theme-gradient-endstreak))",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Days Streak</h3>
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-80`}>Keep it up!</p>
        </div>
        <div className="flex items-center">
          <span className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold mr-2`}>{days}</span>
          <FaFire className={`${isMobile ? 'text-2xl' : 'text-4xl'} text-yellow-300 animate-pulse`} />
        </div>
      </div>
      <div className={`${isMobile ? 'mt-1 text-xs' : 'mt-2 text-sm'}`}>{getStreakMessage(days)}</div>
    </div>
  );
};

const getStreakMessage = (days: number): string => {
  if (days < 3) return "Great start! Keep the momentum going!";
  if (days < 7) return "Impressive! You're building a solid habit!";
  if (days < 14) return "Wow! Your dedication is awesome!";
  if (days < 30) return "Incredible streak! You're unstoppable!";
  return "Legendary! Your consistency is truly inspiring!";
};

export default ResourcesMenu;
