import React, { useState } from "react";
import { DoctorOfficeStats } from "@/types";
import { FaFire } from "react-icons/fa";
import {
  calculatePlayerLevel,
  getLevelNumber,
} from "@/utils/calculateResourceTotals";
import TutorialVidDialog from "@/components/ui/TutorialVidDialog";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import Leaderboard from "@/components/leaderboard/Leaderboard";

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

  if (!reportData) {
    return <div>Loading...</div>;
  }

  const playerLevel = calculatePlayerLevel(userRooms);
  const levelNumber = getLevelNumber(playerLevel);

  return (
    <div className="h-full">
      <div className="flex flex-col bg-[--theme-leaguecard-color] text-[--theme-text-color] items-center h-full rounded-lg p-4 overflow-auto relative scrollbar-gutter-stable">
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

        <div className="flex flex-col items-center mb-1 w-full">
          <div className="w-48 h-48 bg-[--theme-doctorsoffice-accent] border-2 border-[--theme-border-color] rounded-lg mb-4 overflow-hidden relative">
            <img
              src="/kalypsoend.gif"
              alt="Kalypso"
              className="w-full h-full object-cover transform scale-[1.8] translate-y-[40%]"
            />
          </div>
        </div>

        <DaysStreak days={reportData.streak} />

        <div className="w-full max-w-md mt-6">
          <Leaderboard 
            variant="resources"
            showAddFriend={true}
            className="w-full"
          />

          <p className="text-sm text-gray-400/40 mt-4 text-center italic">
            {"You'll eventually be able to add friends, see their scores, and also check the global rankings."}
          </p>
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
}

const DaysStreak: React.FC<DaysStreakProps> = ({ days }) => {
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
};

const getStreakMessage = (days: number): string => {
  if (days < 3) return "Great start! Keep the momentum going!";
  if (days < 7) return "Impressive! You're building a solid habit!";
  if (days < 14) return "Wow! Your dedication is paying off!";
  if (days < 30) return "Incredible streak! You're unstoppable!";
  return "Legendary! Your consistency is truly inspiring!";
};

export default ResourcesMenu;
