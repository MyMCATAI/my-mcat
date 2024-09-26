import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { DoctorOfficeStats, ReportData } from '@/types';
import { Progress } from '@/components/ui/progress';
import { FaFire } from 'react-icons/fa';
import { calculatePlayerLevel, getPatientsPerDay, calculateTotalQC, getClinicCostPerDay } from '@/utils/calculateResourceTotals';

// Dynamic import for ChatBotWidgetNoChatBot
const ChatBotWidgetNoChatBot = dynamic(
  () => import('@/components/chatbot/ChatBotWidgetDoctorsOffice'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

// Mapping function to convert DoctorOfficeStats to ReportData
const mapDoctorOfficeStatsToReportData = (stats: DoctorOfficeStats): ReportData => {
  return {
    userScore: stats.qualityOfCare * 50,
    totalTestsTaken: stats.patientsPerDay,
    testsCompleted: stats.patientsPerDay,
    completionRate: 100,
    totalQuestionsAnswered: stats.patientsPerDay * 10,
    averageTestScore: stats.qualityOfCare * 50,
    averageTimePerQuestion: 5,
    averageTimePerTest: 50,
    categoryAccuracy: {},
    streak: stats.streak
  };
};

const ResourcesMenu: React.FC = () => {
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [dismissMessage, setDismissMessage] = useState<(() => void) | null>(null);
  const [reportData, setReportData] = useState<DoctorOfficeStats | null>(null);
  const [userRooms, setUserRooms] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportResponse, roomsResponse] = await Promise.all([
          fetch('/api/user-report'),
          fetch('/api/clinic')
        ]);

        if (!reportResponse.ok) throw new Error('Failed to fetch user report');
        if (!roomsResponse.ok) throw new Error('Failed to fetch user rooms');

        const reportData: DoctorOfficeStats = await reportResponse.json();
        const rooms: string[] = await roomsResponse.json();

        setReportData(reportData);
        setUserRooms(rooms);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleAssistantResponse = (message: string, dismissFunc: () => void) => {
    setAssistantMessage(message);
    setDismissMessage(() => dismissFunc);
  };

  const closeOverlay = () => {
    if (dismissMessage) {
      dismissMessage();
    }
    setAssistantMessage(null);
    setDismissMessage(null);
  };

  if (!reportData || userRooms.length === 0) {
    return <div>Loading...</div>;
  }

  const playerLevel = calculatePlayerLevel(userRooms);
  const patientsPerDay = getPatientsPerDay(playerLevel);
  const totalQC = calculateTotalQC(playerLevel, reportData.streak);
  const displayQC = Math.min(totalQC, 5); // Cap at 5
  const clinicCostPerDay = getClinicCostPerDay(playerLevel);

  const mappedReportData = mapDoctorOfficeStatsToReportData(reportData);

  return (
    <div className="h-full">
      <div className="flex flex-col bg-[--theme-leaguecard-color] text-[--theme-text-color] items-center h-full rounded-lg p-4 overflow-auto">
        <div className="flex flex-col items-center mb-1 w-full">
          <div className="w-48 h-48 bg-[--theme-doctorsoffice-accent] border-2 border-[--theme-border-color] rounded-lg mb-4 overflow-hidden relative">
            <ChatBotWidgetNoChatBot
              reportData={mappedReportData}
              onResponse={handleAssistantResponse}
            />
          </div>
          {assistantMessage && (
            <div className="max-w-xs bg-blue-500 text-white rounded-lg p-3 relative animate-fadeIn mt-2">
              <div className="typing-animation">{assistantMessage}</div>
              <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-blue-500"></div>
              <button
                onClick={closeOverlay}
                className="absolute top-1 right-1 text-white hover:text-gray-200"
                aria-label="Close"
              >
                &#10005;
              </button>
            </div>
          )}
        </div>

        <DaysStreak days={reportData.streak} />

        <div className="w-full max-w-md space-y-4 mt-6">
          <StatBar
            label="Patients Per Day"
            value={patientsPerDay}
            max={30}
          />
          <StatBar
            label="Quality of Care (QC)"
            value={displayQC}
            max={5}
            showDecimals={true}
          />
          <StatBar
            label="Clinic Cost Per Day"
            value={clinicCostPerDay}
            max={3}
          />
        </div>

        <div className="w-full max-w-md space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Average Star Rating</h3>
          {reportData.averageStarRating ? (
            <p>{reportData.averageStarRating.toFixed(1)} / 5.0</p>
          ) : (
            <p className="text-sm opacity-80">Not available</p>
          )}
        </div>
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

const StatBar: React.FC<StatBarProps> = ({ label, value, max, showDecimals = false }) => {
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
          'linear-gradient(to right, var(--theme-gradient-startstreak), var(--theme-gradient-endstreak))',
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
  if (days < 3) return 'Great start! Keep the momentum going!';
  if (days < 7) return "Impressive! You're building a solid habit!";
  if (days < 14) return "Wow! Your dedication is paying off!";
  if (days < 30) return "Incredible streak! You're unstoppable!";
  return 'Legendary! Your consistency is truly inspiring!';
};

export default ResourcesMenu;
