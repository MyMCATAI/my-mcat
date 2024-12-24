import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DoctorOfficeStats, ReportData } from "@/types";
import { Progress } from "@/components/ui/progress";
import { FaFire } from "react-icons/fa";
import {
  calculatePlayerLevel,
  getPatientsPerDay,
  calculateTotalQC,
  getClinicCostPerDay,
  getLevelNumber,
} from "@/utils/calculateResourceTotals";
import { Plus, Globe, Headphones } from "lucide-react";
import TutorialVidDialog from "@/components/ui/TutorialVidDialog";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

// Dynamic import for ChatBotWidgetNoChatBot
// const ChatBotWidgetNoChatBot = dynamic(
//   () => import("@/components/chatbot/ChatBotWidgetDoctorsOffice"),
//   {
//     ssr: false,
//     loading: () => <div>Loading...</div>,
//   }
// );

// Mapping function to convert DoctorOfficeStats to ReportData
const mapDoctorOfficeStatsToReportData = (
  stats: DoctorOfficeStats
): ReportData => {
  return {
    userScore: stats.qualityOfCare * 50,
    totalTestsTaken: stats.patientsPerDay,
    testsCompleted: stats.patientsPerDay,
    testsReviewed: stats.patientsPerDay,
    completionRate: 100,
    totalQuestionsAnswered: stats.patientsPerDay * 10,
    averageTestScore: stats.qualityOfCare * 50,
    averageTimePerQuestion: 5,
    averageTimePerTest: 50,
    categoryAccuracy: {},
    streak: stats.streak,
  };
};

interface ResourcesMenuProps {
  reportData: DoctorOfficeStats | null;
  userRooms: string[];
  totalCoins: number;
  totalPatients: number;
  patientsPerDay: number;
}

// Add this interface near the top with other interfaces
interface LeaderboardEntry {
  id: number;
  name: string;
  title?: string;
  streak: number;
}

// Add this constant outside the component
const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    id: 1,
    name: "Prynce",
    title: "Inventor",
    streak: 15
  },
  {
    id: 2,
    name: "Josh",
    title: "CTO",
    streak: 12
  },
  {
    id: 3,
    name: "Armaan",
    title: "Developer",
    streak: 8
  },
  {
    id: 4,
    name: "Hanis",
    title: "Developer",
    streak: 5
  }
];

const ResourcesMenu: React.FC<ResourcesMenuProps> = ({
  reportData,
  userRooms,
  totalCoins,
  totalPatients,
  patientsPerDay,
}) => {
  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("");
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [isHeadphonesDropdownOpen, setIsHeadphonesDropdownOpen] = useState(false);
  const { isAutoPlay, setIsAutoPlay } = useMusicPlayer();

  const openTutorialDialog = (videoUrl: string) => {
    setTutorialVideoUrl(videoUrl);
    setIsTutorialDialogOpen(true);
  };

  const toggleAddFriendDropdown = () => {
    setIsAddFriendOpen(!isAddFriendOpen);
  };

  const handleAddFriend = () => {
    // Logic to add a friend using friendEmail
    console.log("Adding friend:", friendEmail);
    setFriendEmail("");
    setIsAddFriendOpen(false);
  };

  const showGlobalRankings = () => {
    // Logic to show global rankings
    console.log("Showing global rankings");
  };

  const toggleHeadphonesDropdown = () => {
    setIsHeadphonesDropdownOpen(!isHeadphonesDropdownOpen);
  };

  const handleAutoPlayChange = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  if (!reportData) {
    return <div>Loading...</div>;
  }

  const playerLevel = calculatePlayerLevel(userRooms);
  const levelNumber = getLevelNumber(playerLevel);

  const totalQC = calculateTotalQC(levelNumber, reportData.streak);
  const displayQC = Math.min(totalQC, 5); // Cap at 5
  const clinicCostPerDay = getClinicCostPerDay(levelNumber);

  const mappedReportData = mapDoctorOfficeStatsToReportData(reportData);

  return (
    <div className="h-full">
      <div className="flex flex-col bg-[--theme-leaguecard-color] text-[--theme-text-color] items-center h-full rounded-lg p-4 overflow-auto relative">
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Friend Leaderboard</h3>
            <div className="flex gap-2">
              <Plus
                className="cursor-pointer text-[--theme-hover-color] hover:opacity-50 transition-opacity duration-200"
                size={20}
                onClick={toggleAddFriendDropdown}
              />
              <Globe
                className="cursor-pointer text-[--theme-hover-color] hover:opacity-50 transition-opacity duration-200"
                size={20}
                onClick={showGlobalRankings}
              />
              <Headphones
                className="cursor-pointer text-[--theme-hover-color] hover:opacity-50 transition-opacity duration-200"
                size={20}
                onClick={toggleHeadphonesDropdown}
              />
              {isHeadphonesDropdownOpen && (
                <div className="absolute right-4 mt-6 bg-[--theme-doctorsoffice-accent] border border-[--theme-border-color] rounded-lg shadow-lg w-48 z-50">
                  <div 
                    className="p-3 cursor-pointer hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors duration-200 rounded-lg text-sm"
                    onClick={handleAutoPlayChange}
                  >
                    {isAutoPlay ? "Disable Auto Play" : "Enable Auto Play"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isAddFriendOpen && (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="Eventually you can add friends..."
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleAddFriend}
                className="bg-[--theme-hover-color] text-[--theme-hover-text] p-2 rounded hover:opacity-50 transition-opacity duration-200"
              >
                Send
              </button>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[--theme-doctorsoffice-accent] p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[--theme-border-color] flex items-center justify-center text-white">
                  1
                </div>
            </div>
          </div>

          {isAddFriendOpen && (
            <div className="mb-4 flex items-center gap-2">
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="Eventually you can add friends..."
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleAddFriend}
                className="bg-[--theme-hover-color] text-[--theme-hover-text] p-2 rounded hover:opacity-50 transition-opacity duration-200"
              >
                Send
              </button>
            </div>
          )}

          <div className="space-y-3">
            {LEADERBOARD_DATA.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between bg-[--theme-doctorsoffice-accent] p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[--theme-border-color] flex items-center justify-center text-white">
                    {entry.id}
                  </div>
                  <span className="font-medium">
                    {entry.name}
                    {entry.title && ` (${entry.title})`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaFire className="text-yellow-300" />
                  <span>{entry.streak} days</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-400/40 mt-4 text-center italic">
            {"You'll eventually be able to add friends, see their cards, and also check the global rankings."}
          </p>
        </div>
      </div>
      <TutorialVidDialog
        isOpen={isTutorialDialogOpen}
        onClose={() => setIsTutorialDialogOpen(false)}
        videoUrl={tutorialVideoUrl}
      />
    </div>
    </div>
  );
};

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  showDecimals?: boolean;
}

const StatBar: React.FC<StatBarProps> = ({
  label,
  value,
  max,
  showDecimals = false,
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {showDecimals ? value.toFixed(2) : value} / {max}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
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
