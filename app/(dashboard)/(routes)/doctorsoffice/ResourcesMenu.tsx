import React, { useState, useEffect, useCallback } from "react";
import { DoctorOfficeStats } from "@/types";
import { Progress } from "@/components/ui/progress";
import { FaFire, FaUserInjured } from "react-icons/fa";
import {
  calculatePlayerLevel,
  calculateTotalQC,
  getLevelNumber,
} from "@/utils/calculateResourceTotals";
import { Plus, Globe, Headphones } from "lucide-react";
import TutorialVidDialog from "@/components/ui/TutorialVidDialog";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { toast } from "react-hot-toast";
import { useUserInfo } from "@/hooks/useUserInfo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResourcesMenuProps {
  reportData: DoctorOfficeStats | null;
  userRooms: string[];
  totalCoins: number;
  totalPatients: number;
  patientsPerDay: number;
}

interface LeaderboardEntry {
  id: number;
  name: string;
  patientsTreated: number;
}

const ResourcesMenu: React.FC<ResourcesMenuProps> = ({
  reportData,
  userRooms,
}) => {
  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("");
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [isHeadphonesDropdownOpen, setIsHeadphonesDropdownOpen] = useState(false);
  const { isAutoPlay, setIsAutoPlay } = useMusicPlayer();
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<"global" | "friends">("global");
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { referrals, userInfo, createReferral } = useUserInfo();
  const userId = userInfo?.userId;

  const toggleAddFriendDropdown = () => {
    setIsAddFriendOpen(!isAddFriendOpen);
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/global-leaderboard');
      const data = await response.json();
      setGlobalLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchFriendsLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/friend-leaderboard');
      const data = await response.json();
      setFriendsLeaderboard(data);
    } catch (error) {
      console.error("Error fetching friends leaderboard:", error);
      toast.error("Failed to load leaderboard");
    }
  }, [userInfo, userId, referrals]);

  const handleAddFriend = useCallback(async () => {
    try {
      if (!userInfo || !userId) {
        toast.error("Please try again in a moment");
        return;
      }

      if (!friendEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
        toast.error("Invalid email address");
        return;
      }

      await createReferral({
        friendEmail: friendEmail,
      });

      await fetchFriendsLeaderboard();
      toast.success("Friend invitation sent!");
      setFriendEmail("");
      setIsAddFriendOpen(false);
    } catch (error) {
      console.error("Error adding friend:", error);
      toast.error("Failed to send friend invitation");
    }
  }, [
    userInfo, 
    userId, 
    referrals, 
    friendEmail, 
    createReferral, 
    fetchFriendsLeaderboard, 
    setFriendEmail, 
    setIsAddFriendOpen
  ]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (userInfo && userId && referrals) {
      fetchFriendsLeaderboard();
    }
  }, [userInfo, userId, referrals]);

  const showGlobalRankings = async () => {
    setLeaderboardType("global");
  };

  const showFriendsRankings = () => {
    setLeaderboardType("friends");
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/global-leaderboard');
        const data = await response.json();
        setGlobalLeaderboard(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setGlobalLeaderboard([]);
      }
    };
    fetchLeaderboard();
  }, []);

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
          <div className="flex justify-between items-center mb-4">
            {leaderboardType === "global" ? (
              <h3 className="text-lg font-semibold">Global Leaderboard</h3>
            ) : (
              <h3 className="text-lg font-semibold">Friends Leaderboard</h3>
            )}
            {/* todo: add friend leaderboard */}
            <div className="flex gap-2">
              <Plus
                className="cursor-pointer text-[--theme-hover-color] hover:opacity-50 transition-opacity duration-200"
                size={20}
                onClick={toggleAddFriendDropdown}
              />
              <Globe
                className={`cursor-pointer hover:opacity-50 transition-opacity duration-200 ${
                  leaderboardType === "global" ? "text-[--theme-hover-color]" : "text-[--theme-text-color]"
                }`}
                size={20}
                onClick={leaderboardType === "global" ? showFriendsRankings : showGlobalRankings}
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
            {leaderboardType === "global" ? (
              globalLeaderboard.map((entry) => (
                <TooltipProvider key={entry.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-center justify-between bg-[--theme-doctorsoffice-accent] p-3 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[--theme-border-color] flex items-center justify-center text-white">
                            {entry.id}
                          </div>
                          <span className="font-medium">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUserInjured className="text-yellow-300" />
                          <span>{entry.patientsTreated}</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{`${entry.name}'s clinic has treated ${entry.patientsTreated} patients so far!`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))
            ) : (
              friendsLeaderboard.map((entry) => (
                <TooltipProvider key={entry.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex items-center justify-between bg-[--theme-doctorsoffice-accent] p-3 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[--theme-border-color] flex items-center justify-center text-white">
                            {entry.id}
                          </div>
                          <span className="font-medium">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUserInjured className="text-yellow-300" />
                          <span>{entry.patientsTreated}</span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{`${entry.name}'s clinic has treated ${entry.patientsTreated} patients so far!`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))
            )}
          </div>

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
