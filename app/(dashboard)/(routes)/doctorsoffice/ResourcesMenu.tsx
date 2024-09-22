import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ReportData } from "@/types";
import { Progress } from "@/components/ui/progress";
import { FaFire } from 'react-icons/fa'; // Import the fire icon

// Dynamic import for ChatBotWidgetNoChatBot
const ChatBotWidgetNoChatBot = dynamic(
  () => import('@/components/chatbot/ChatBotWidgetDoctorsOffice'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

const ResourcesMenu: React.FC = () => {
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [dismissMessage, setDismissMessage] = useState<(() => void) | null>(null);

  // Mock report data - replace this with actual data fetching logic
  const mockReportData: ReportData = {
    averageTestScore: 85,
    averageTimePerQuestion: 45,
    testsCompleted: 5,
    totalTestsTaken: 7,
    totalQuestionsAnswered: 100,
    userScore: 500,
    completionRate: 0.8, // Added completionRate (80% completion rate)
    categoryAccuracy: { // Added categoryAccuracy
      'Biology': 0.75,
      'Chemistry': 0.80,
      'Physics': 0.70,
      'Psychology': 0.85
    },
    averageTimePerTest: 900,
    streak:1
  };

  // Mock streak data - replace with actual data
  const streakDays = 7;

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

  return (
    <div className="h-full">
      <div className="flex flex-col bg-gradient-to-b from-[--theme-gradient-start] to-[--theme-gradient-end] border-2 border-[--theme-border-color] text-[--theme-text-color] items-center h-full rounded-lg p-4 overflow-auto">
        <div className="flex flex-col items-center mb-1 w-full">
          <div className="w-48 h-48 bg-[--theme-doctorsoffice-accent] border-2 border-[--theme-border-color] rounded-lg mb-4 overflow-hidden relative">
            <ChatBotWidgetNoChatBot
              reportData={mockReportData}
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

        <DaysStreak days={streakDays} />

        <div className="w-full max-w-md space-y-4 mt-6">
          <StatBar label="Average Test Score" value={mockReportData.averageTestScore} max={100} />
          <StatBar label="Tests Completed" value={mockReportData.testsCompleted} max={mockReportData.totalTestsTaken} />
          <StatBar label="Questions Answered" value={mockReportData.totalQuestionsAnswered} max={200} />
          <StatBar label="User Score" value={mockReportData.userScore} max={1000} />
          <StatBar label="Completion Rate" value={mockReportData.completionRate * 100} max={100} />
        </div>

        <div className="w-full max-w-md space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Category Accuracy</h3>
          {Object.entries(mockReportData.categoryAccuracy).map(([category, accuracy]) => (
            <StatBar key={category} label={category} value={accuracy * 100} max={100} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface StatBarProps {
  label: string;
  value: number;
  max: number;
}

const StatBar: React.FC<StatBarProps> = ({ label, value, max }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value.toFixed(1)} / {max}</span>
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
    <div className="w-full max-w-md rounded-lg p-4 mt-6 mb-2 text-white shadow-lg" style={{
      background: 'linear-gradient(to right, var(--theme-gradient-startstreak), var(--theme-gradient-endstreak))'
    }}>
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
      <div className="mt-2 text-sm">
        {getStreakMessage(days)}
      </div>
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
