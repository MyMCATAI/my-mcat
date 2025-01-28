"use client";

import { useUserInfo } from "@/hooks/useUserInfo";
import { UpgradeToGoldButton } from "@/components/upgrade-to-gold-button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { calculatePlayerLevel, getPatientsPerDay, getLevelNumber, tierRooms } from "@/utils/calculateResourceTotals";

const ROOM_MESSAGES = {
  'PATIENT LEVEL': 'Visit the marketplace to unlock your first clinic room!',
  'INTERN LEVEL': 'Your intern room is up and running! We can handle 4 patients per day now.',
  'RESIDENT LEVEL': 'The resident room is making great progress! We can now treat 8 patients per day.',
  'FELLOWSHIP LEVEL': 'Your fellowship program is thriving with 10 patients per day!',
  'ATTENDING LEVEL': 'The attending room is really making patients happy! We can handle 16 patients per day now.',
  'PHYSICIAN LEVEL': 'Your physician level clinic is impressive, treating 24 patients daily!',
  'MEDICAL DIRECTOR LEVEL': 'Amazing! Your medical director status lets us treat 30 patients every day!'
} as const;

export function GameStats() {
  const { userInfo } = useUserInfo();
  const router = useRouter();

  // Get the current player level and patients per day using utility functions
  const playerLevel = userInfo?.clinicRooms ? calculatePlayerLevel(userInfo.clinicRooms.split(',')) : 'PATIENT LEVEL';
  const levelNumber = getLevelNumber(playerLevel);
  const patientsPerDay = getPatientsPerDay(levelNumber);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Upgrade Card - Subtle version in top right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-[--theme-leaguecard-color] rounded-lg p-3 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
          <Image
            src="/MD_Premium_Pro.png"
            alt="Gold"
            width={32}
            height={32}
            className="rounded"
          />
          <UpgradeToGoldButton size="sm" variant="subtle">
            Upgrade to Gold
          </UpgradeToGoldButton>
        </div>
      </div>

      <div className="max-w-2xl w-full space-y-8">
        {/* Game Stats Section */}
        <div className="bg-[--theme-leaguecard-color] rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/kalypsoend.gif"
                alt="Kalypso"
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {userInfo?.firstName || 'future doctor'}!
            </h1>
            <p className="text-[--theme-text-color] opacity-80">
              {ROOM_MESSAGES[playerLevel as keyof typeof ROOM_MESSAGES]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-[--theme-mainbox-color] rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Study Streak</h3>
              <p className="text-4xl font-bold text-amber-500">{userInfo?.streak || 0}</p>
              <p className="text-sm opacity-70 mt-1">days</p>
            </div>
            <div className="text-center p-6 bg-[--theme-mainbox-color] rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Coins</h3>
              <p className="text-4xl font-bold text-amber-500">{userInfo?.score || 0}</p>
              <p className="text-sm opacity-70 mt-1">coins earned</p>
            </div>
          </div>

          {/* Clinic Stats */}
          <div className="mb-8">
            <div className="text-center p-6 bg-[--theme-mainbox-color] rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Daily Capacity</h3>
                <span className="text-amber-500 font-bold">
                  {patientsPerDay} patients/day
                </span>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Total Patients</h3>
                <span className="text-amber-500 font-bold">
                  {userInfo?.patientRecord?.patientsTreated || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => router.push('/doctorsoffice')}
              className="px-6 py-3 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color] rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Enter Anki Clinic →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 