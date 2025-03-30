//components/home/GameStats.tsx 
"use client";
/* ----------------------------------------- Imports ----------------------------------------- */
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PurchaseButton } from "@/components/purchase-button";
import { calculatePlayerLevel, getPatientsPerDay, getLevelNumber, tierRooms } from "@/utils/calculateResourceTotals";
import { useUserInfo } from "@/hooks/useUserInfo";


/* ------------------------------------------ Types ------------------------------------------ */
interface UserReport {
  userScore: number;
  totalTestsTaken: number;
  testsCompleted: number;
  testsReviewed: number;
  completionRate: number;
  totalQuestionsAnswered: number;
  averageTestScore: number;
  averageTimePerQuestion: number;
  averageTimePerTest: number;
  categoryAccuracy: Record<string, number>;
  streak: number;
}

interface GameStatsProps {
  name?: string;
}

/* ---------------------------------------- Constants --------------------------------------- */
const ROOM_MESSAGES = {
  'PATIENT LEVEL': 'Visit the marketplace to unlock your first clinic room!',
  'INTERN LEVEL': 'Your intern room is up and running! We can handle 4 patients per day now.',
  'RESIDENT LEVEL': 'The resident room is making great progress! We can now treat 8 patients per day.',
  'FELLOWSHIP LEVEL': 'Your fellowship program is thriving with 10 patients per day!',
  'ATTENDING LEVEL': 'The attending room is really making patients happy! We can handle 16 patients per day now.',
  'PHYSICIAN LEVEL': 'Your physician level clinic is impressive, treating 24 patients daily!',
  'MEDICAL DIRECTOR LEVEL': 'Amazing! Your medical director status lets us treat 30 patients every day!'
} as const;

const LEVEL_IMAGES = {
  'PATIENT LEVEL': '/game-components/WaitingRoom0.png',
  'INTERN LEVEL': '/game-components/INTERNLEVEL.png',
  'RESIDENT LEVEL': '/game-components/RESIDENTLEVEL.png',
  'FELLOWSHIP LEVEL': '/game-components/FELLOWSHIPLEVEL.png',
  'ATTENDING LEVEL': '/game-components/ATTENDINGLEVEL.png',
  'PHYSICIAN LEVEL': '/game-components/PHYSICIANLEVEL.png',
  'MEDICAL DIRECTOR LEVEL': '/game-components/MEDICALDIRECTORLEVEL.png'
} as const;

const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}


/* ----------------------------------------------------------------------------------------- */
/* --------------------------------------- Component --------------------------------------- */
/* ----------------------------------------------------------------------------------------- */

export function GameStats({ name }: GameStatsProps) {
  /* ---------------------------------------- Hooks ---------------------------------------- */
  const router = useRouter();
  const { isSubscribed } = useUserInfo();
  /* ---------------------------------------- State ---------------------------------------- */
  const [clinicData, setClinicData] = useState<{ rooms: string[], score: number, totalPatientsTreated: number } | null>(null);
  const [reportData, setReportData] = useState<UserReport | null>(null);
  /* -------------------------------------- Effects --------------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clinicResponse, reportResponse] = await Promise.all([
          fetch("/api/clinic"),
          fetch("/api/user-report")
        ]);

        if (!clinicResponse.ok || !reportResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [clinicData, reportData] = await Promise.all([
          clinicResponse.json(),
          reportResponse.json()
        ]);

        setClinicData(clinicData);
        setReportData(reportData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  /* -------------------------------------- Handlers -------------------------------------- */
  const handleMouseEnter = useCallback(() => {
    // Prefetch the ankiclinic route when user hovers
    router.prefetch('/ankiclinic');
  }, [router]);

  const handleAnkiClinicClick = useCallback(() => {
    if (!isSubscribed) {
      router.push('/pricing');
    } else {
      router.push('/ankiclinic');
    }
  }, [isSubscribed, router]);

  /* -------------------------------------- Helpers --------------------------------------- */
  const playerLevel = clinicData ? calculatePlayerLevel(clinicData.rooms) : 'PATIENT LEVEL';
  const levelNumber = getLevelNumber(playerLevel);
  const patientsPerDay = getPatientsPerDay(levelNumber);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    return `${minutes} min`;
  };

  /* --------------------------------------- Render --------------------------------------- */
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
          <button
            onClick={() => router.push('/pricing')}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-900 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Upgrade to Gold
          </button>
        </div>
      </div>

      <div className="max-w-7xl w-full">
        {/* Main Content */}
        <div className="bg-[--theme-leaguecard-color] rounded-lg p-8">
          {/* Welcome Header - Full Width */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {`Welcome back, ${name}!`}
            </h1>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Clinic Progress */}
            <div className="space-y-6">
              {/* Level Display */}
              <div className="relative group">
                <button 
                  onMouseEnter={handleMouseEnter}
                  onClick={handleAnkiClinicClick}
                  className="w-full bg-[--theme-mainbox-color] rounded-lg p-6 hover:bg-[--theme-hover-color] transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <div className="relative aspect-[4/3] mb-4">
                    <Image
                      src={LEVEL_IMAGES[playerLevel as keyof typeof LEVEL_IMAGES]}
                      alt={playerLevel}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                    <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white">
                      <div className="text-sm font-krungthep">LEVEL {levelNumber}</div>
                      <div className="text-lg font-krungthep">{playerLevel}</div>
                    </div>
                  </div>

                  {/* Clinic Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-sm opacity-70">Daily Capacity</p>
                      <p className="text-2xl font-bold text-amber-500">{patientsPerDay}</p>
                      <p className="text-xs opacity-70">patients/day</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm opacity-70">Total Patients</p>
                      <p className="text-2xl font-bold text-amber-500">
                        {clinicData?.totalPatientsTreated || 0}
                      </p>
                      <p className="text-xs opacity-70">treated</p>
                    </div>
                  </div>
                </button>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg z-10">
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 
                    border-l-[8px] border-l-transparent 
                    border-t-[8px] border-t-[--theme-doctorsoffice-accent]
                    border-r-[8px] border-r-transparent">
                  </div>
                  Click to enter your clinic and treat patients! 🏥
                </div>
              </div>

              {/* Streak and Coins */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[--theme-mainbox-color] rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Study Streak</h3>
                  <p className="text-3xl font-bold text-amber-500">{reportData?.streak || 0}</p>
                  <p className="text-sm opacity-70">{"days"}</p>
                </div>
                <div className="relative group w-full">
                  <PurchaseButton className="w-full block">
                    <div className="w-full bg-[--theme-mainbox-color] rounded-lg p-6 text-center hover:bg-[--theme-hover-color] transition-all duration-200 cursor-pointer">
                      <h3 className="text-lg font-semibold mb-2">Coins</h3>
                      <p className="text-3xl font-bold text-amber-500">{reportData?.userScore || 0}</p>
                      <p className="text-sm opacity-70">earned</p>
                    </div>
                  </PurchaseButton>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg z-10">
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 
                      border-l-[8px] border-l-transparent 
                      border-t-[8px] border-t-[--theme-doctorsoffice-accent]
                      border-r-[8px] border-r-transparent">
                    </div>
                    Click to purchase more coins! 💰
                  </div>
                </div>
              </div>

              {/* Enter Clinic Button */}
              <button
                onMouseEnter={handleMouseEnter}
                onClick={handleAnkiClinicClick}
                className="w-full px-6 py-4 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] text-[--theme-text-color] rounded-lg transition-all duration-200 transform hover:scale-[1.02] font-bold text-lg"
              >
                Enter Anki Clinic →
              </button>
            </div>

            {/* Right Column - Study Progress */}
            <div className="space-y-6">
              {/* Kalypso with Chat Bubble */}
              <div className="bg-[--theme-mainbox-color] rounded-lg p-6 relative">
                <div className="flex items-center">
                  <div className="relative">
                    <Image
                      src="/kalypso/kalypsotalk.gif"
                      alt="Kalypso"
                      width={200}
                      height={200}
                      className="rounded-full"
                    />
                  </div>
                  <div className="ml-2 flex-1 bg-[--theme-doctorsoffice-accent] rounded-2xl p-4 relative animate-fadeIn">
                    {/* Triangle for chat bubble */}
                    <div className="absolute left-[-8px] top-4 w-0 h-0
                      border-t-[8px] border-t-transparent 
                      border-r-[8px] border-r-[--theme-doctorsoffice-accent] 
                      border-b-[8px] border-b-transparent">
                    </div>
                    <p className="text-sm leading-relaxed">
                      {ROOM_MESSAGES[playerLevel as keyof typeof ROOM_MESSAGES]}
                    </p>
                  </div>
                </div>
              </div>

              {/* Study Progress Stats */}
              <div className="bg-[--theme-mainbox-color] rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6 text-center">Study Progress</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-sm opacity-70">Questions Answered</p>
                    <p className="text-2xl font-bold text-amber-500">{reportData?.totalQuestionsAnswered || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-70">Tests Completed</p>
                    <p className="text-2xl font-bold text-amber-500">{reportData?.testsCompleted || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-70">Average Score</p>
                    <p className="text-2xl font-bold text-amber-500">
                      {reportData ? `${Math.round(reportData.averageTestScore)}%` : '0%'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm opacity-70">Avg. Time/Question</p>
                    <p className="text-2xl font-bold text-amber-500">
                      {reportData ? formatTime(reportData.averageTimePerQuestion) : '0 min'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Performance */}
              {reportData?.categoryAccuracy && Object.keys(reportData.categoryAccuracy).length > 0 && (
                <div className="bg-[--theme-mainbox-color] rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-6 text-center">Category Performance</h3>
                  <div className="space-y-4">
                    {Object.entries(reportData.categoryAccuracy).map(([category, accuracy]) => (
                      <div key={category}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm font-bold text-amber-500">{Math.round(accuracy)}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.round(accuracy)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 