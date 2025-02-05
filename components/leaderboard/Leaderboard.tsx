import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Globe } from 'lucide-react';
import { FaUserInjured } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useUserInfo } from '@/hooks/useUserInfo';

interface LeaderboardEntry {
  id: number;
  name: string;
  patientsTreated: number;
}

type LeaderboardType = 'global' | 'friends';

interface LeaderboardProps {
  variant?: 'sidebar' | 'resources';
  showAddFriend?: boolean;
  className?: string;
  compact?: boolean;
  defaultTab?: LeaderboardType;
}

const LeaderboardSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex items-center justify-between bg-[--theme-doctorsoffice-accent] p-3 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[--theme-border-color] opacity-50" />
          <div className="h-4 w-32 bg-[--theme-border-color] rounded opacity-50" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-[--theme-border-color] rounded opacity-50" />
        </div>
      </div>
    ))}
  </div>
);

const Leaderboard: React.FC<LeaderboardProps> = ({
  variant = 'resources',
  showAddFriend = true,
  className = '',
  compact = false,
  defaultTab = 'global'
}) => {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>(defaultTab);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const { referrals, userInfo, createReferral } = useUserInfo();
  const userId = userInfo?.userId;

  const fetchGlobalLeaderboard = async () => {
    if (globalLeaderboard.length > 0) return; // Don't fetch if we already have data
    setIsLoadingGlobal(true);
    try {
      const response = await fetch('/api/global-leaderboard');
      const data = await response.json();
      setGlobalLeaderboard(data);
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      toast.error('Failed to load global leaderboard');
    } finally {
      setIsLoadingGlobal(false);
    }
  };

  const fetchFriendsLeaderboard = useCallback(async () => {
    setIsLoadingFriends(true);
    try {
      const response = await fetch('/api/friend-leaderboard');
      const data = await response.json();
      setFriendsLeaderboard(data);
    } catch (error) {
      console.error('Error fetching friends leaderboard:', error);
      toast.error('Failed to load friends leaderboard');
    } finally {
      setIsLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalLeaderboard();
  }, []);

  useEffect(() => {
    if (userInfo && userId && referrals && leaderboardType === 'friends') {
      fetchFriendsLeaderboard();
    }
  }, [userInfo, userId, referrals, fetchFriendsLeaderboard, leaderboardType]);

  const handleAddFriend = useCallback(async () => {
    try {
      if (!userInfo || !userId) {
        toast.error('Please try again in a moment');
        return;
      }

      if (!friendEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(friendEmail)) {
        toast.error('Invalid email address');
        return;
      }

      await createReferral({
        friendEmail: friendEmail,
      });

      await fetchFriendsLeaderboard();
      toast.success('Friend invitation sent!');
      setFriendEmail('');
      setIsAddFriendOpen(false);
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to send friend invitation');
    }
  }, [userInfo, userId, friendEmail, createReferral, fetchFriendsLeaderboard]);

  const currentLeaderboard = leaderboardType === 'global' ? globalLeaderboard : friendsLeaderboard;
  const isLoading = leaderboardType === 'global' ? isLoadingGlobal : isLoadingFriends;
  const shouldShowLeaderboard = leaderboardType === 'global' || friendsLeaderboard.length > 1;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {leaderboardType === 'global' ? 'Global Leaderboard' : 'Friends Leaderboard'}
        </h3>
        <div className="flex gap-2">
          {showAddFriend && (
            <Plus
              className="cursor-pointer text-[--theme-hover-color] hover:opacity-50 transition-opacity duration-200"
              size={20}
              onClick={() => setIsAddFriendOpen(!isAddFriendOpen)}
            />
          )}
          <Globe
            className={`cursor-pointer hover:opacity-50 transition-opacity duration-200 ${
              leaderboardType === 'global' ? 'text-[--theme-hover-color]' : 'text-[--theme-text-color]'
            }`}
            size={20}
            onClick={() => setLeaderboardType(leaderboardType === 'global' ? 'friends' : 'global')}
          />
        </div>
      </div>

      {isAddFriendOpen && showAddFriend && (
        <div className="mb-4 flex items-center gap-2">
          <input
            type="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="Enter friend's email..."
            className="w-full p-2 border rounded bg-[--theme-mainbox-color] text-[--theme-text-color]"
          />
          <button
            onClick={handleAddFriend}
            className="bg-[--theme-hover-color] text-[--theme-hover-text] p-2 rounded hover:opacity-50 transition-opacity duration-200"
          >
            Send
          </button>
        </div>
      )}

      <div className={`space-y-3 ${compact ? 'text-sm' : ''}`}>
        {isLoading ? (
          <LeaderboardSkeleton count={5} />
        ) : shouldShowLeaderboard ? (
          <>
            {currentLeaderboard.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-[--theme-doctorsoffice-accent] p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[--theme-border-color] flex items-center justify-center text-white select-none">
                    {entry.id}
                  </div>
                  <span className="font-medium">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUserInjured className="text-yellow-300" />
                  <span>{entry.patientsTreated}</span>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="text-center italic text-sm">
            {leaderboardType as LeaderboardType === 'global' ? 'No global rankings available' : 'No friends added'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard; 