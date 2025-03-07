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
import { useUser } from '@/store/selectors';
import { useGame } from "@/store/selectors";

/* --- Types ----- */
interface ResourcesMenuProps {
  reportData: DoctorOfficeStats | null;
}

interface DaysStreakProps {
  days: number;
}

/* --- Helper Components ----- */
const DaysStreak = React.memo<DaysStreakProps>(({ days }) => {
  const getStreakMessage = React.useMemo(() => {
    return (days: number): string => {
      if (days < 3) return "Great start! Keep the momentum going!";
      if (days < 7) return "Impressive! You're building a solid habit!";
      if (days < 14) return "Wow! Your dedication is awesome!";
      if (days < 30) return "Incredible streak! You're unstoppable!";
      return "Legendary! Your consistency is truly inspiring!";
    };
  }, []);

  return (
    <div
      className="w-full max-w-md rounded-lg p-4 mt-6 mb-2 text-white shadow-lg"
      style={{
        background:
          "linear-gradient(to right, var(--theme-gradient-startstreak), var(--theme-gradient-endstreak))",
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Days Streak</h3>
          <p className="text-sm opacity-80">Keep it up!</p>
        </div>
        <div className="flex items-center">
          <span className="text-3xl font-bold mr-2">{days}</span>
          <FaFire className="text-4xl text-yellow-300 animate-pulse" />
        </div>
      </div>
      <div className="mt-2 text-sm">{getStreakMessage(days)}</div>
    </div>
  );
});

DaysStreak.displayName = 'DaysStreak';

/* --- Main Component ----- */
const ResourcesMenu: React.FC<ResourcesMenuProps> = ({
  reportData,
}) => {
  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("");
  const { profile } = useUser();
  // Get game state from Zustand store
  const { userRooms, totalPatients, patientsPerDay, streakDays } = useGame();
  // Get user state from Zustand store
  const { coins: totalCoins } = useUser();

  if (!reportData) {
    return (
      <div className="h-full flex flex-col bg-[--theme-leaguecard-color] text-[--theme-text-color] items-center justify-center rounded-lg p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--theme-hover-color]"></div>
        <p className="mt-4 text-lg">Loading clinic data...</p>
      </div>
    );
  }

  const playerLevel = calculatePlayerLevel(userRooms);
  const levelNumber = getLevelNumber(playerLevel);

  return (
    <div className="h-full">
      <div className="flex flex-col bg-[--theme-leaguecard-color] text-[--theme-text-color] items-center h-full rounded-lg p-4 overflow-auto relative scrollbar-gutter-stable">
        <style jsx global>{`
          .scrollbar-gutter-stable {
            scrollbar-gutter: stable;
          }
          
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

        <div className="flex flex-col items-center mb-1 w-full">
          <AnimatedProfileIcon 
            photoName={profile?.profilePhoto || 'doctor.png'}
          />
        </div>

        <DaysStreak days={streakDays} />

        <div className="w-full max-w-md mt-6">
          <Leaderboard 
            variant="resources"
            showAddFriend={true}
            className="w-full"
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

export default ResourcesMenu;

