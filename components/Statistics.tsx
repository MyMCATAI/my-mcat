import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from '@/contexts/ThemeContext';

interface Profile {
  categoryName: string;
  subjectCategory: string;
  conceptMastery: number;
}

interface TestScore {
  date: string;
  finishedAt: string | null;
  score: number;
}

interface StatisticsData {
  conceptMastery: Record<string, number>;
  knowledgeProfiles: Profile[];
  testScores: TestScore[];
  streak: number;
  averageCorrect: number;
  testsCompleted: number;
  totalTestsTaken: number;
  averageTestScore: number;
  totalQuestionsAnswered: number;
  averageTimePerQuestion: number;
  averageTimePerTest: number;
  completedTasks: number;
  totalTasks: number;
  topProfiles: Profile[];
  bottomProfiles: Profile[];
}

interface StatisticsProps {
  statistics: StatisticsData;
  expandedGraph: string | null;
  toggleGraphExpansion: (graphId: string) => void;
  onReturn: () => void;
}

const Statistics = ({
  statistics,
  expandedGraph,
  toggleGraphExpansion,
  onReturn,
}: StatisticsProps) => {
  const { theme } = useTheme();
  console.log("Statistics prop:", statistics);
  console.log("Concept Mastery data:", statistics?.conceptMastery);

  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const subjectCategoryData = useMemo(() => {
    if (!statistics?.knowledgeProfiles) return {};

    return statistics.knowledgeProfiles.reduce<Record<string, Record<string, number>>>(
      (acc, profile) => {
        if (!acc[profile.subjectCategory]) {
          acc[profile.subjectCategory] = {};
        }
        acc[profile.subjectCategory][profile.categoryName] = profile.conceptMastery;
        return acc;
      },
      {}
    );
  }, [statistics?.knowledgeProfiles]);

  const chartColors = {
    primary: 'var(--theme-hover-color)',
    secondary: 'var(--theme-border-color)',
    background: 'var(--theme-leaguecard-color)',
    text: 'var(--theme-text-color)',
  };

  // Get theme-specific color
  const getThemeColor = () => {
    const themeColors = {
      cyberSpace: '#3b82f6',
      sakuraTrees: '#b85475',
      sunsetCity: '#ff6347',
      mykonosBlue: '#4cb5e6'
    };
    return themeColors[theme];
  };

  const barChartData = useMemo(() => {
    const selectedData =
      selectedSubject === "All"
        ? statistics?.conceptMastery
        : subjectCategoryData[selectedSubject] || {};

    const themeColor = getThemeColor();

    return {
      labels: Object.keys(selectedData),
      datasets: [
        {
          label: "Concept Mastery",
          data: Object.values(selectedData),
          backgroundColor: themeColor,
          borderColor: themeColor,
          borderWidth: 1,
          hoverBackgroundColor: themeColor,
          hoverBorderColor: themeColor,
        },
      ],
    };
  }, [selectedSubject, statistics?.conceptMastery, subjectCategoryData, theme]);

  console.log("Formatted bar chart data:", barChartData);

  const formattedTestData = useMemo(() => {
    return statistics?.testScores
      ?.filter((score: any) => score.finishedAt !== null)
      .map((score: any) => ({
        date: new Date(score.date).toLocaleDateString(),
        score: score.score,
      })) || [];
  }, [statistics?.testScores]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(this: any, value: number | string) {
            return `${(Number(value) * 100).toFixed(0)}%`;
          },
          color: chartColors.text,
        },
        grid: {
          color: `${chartColors.text}20`,
        },
      },
      x: {
        ticks: {
          color: chartColors.text,
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: `${chartColors.text}20`,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: chartColors.text,
        },
      },
      tooltip: {
        backgroundColor: chartColors.background,
        titleColor: chartColors.text,
        bodyColor: chartColors.text,
        borderColor: chartColors.secondary,
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `Mastery: ${(context.parsed.y * 100).toFixed(1)}%`;
          },
        },
      },
    },
  } as const;

  return (
    <div className="h-full w-full relative flex flex-col">
      {/* Main Statistics Content - Adjust container */}
      <div className="grid grid-cols-2 gap-4 p-4 overflow-y-auto h-full">
        {/* Subject Mastery Chart */}
        <motion.div
          className="bg-[--theme-leaguecard-color] p-4 rounded-lg cursor-pointer relative"
          style={{
            boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
          }}
          onClick={() => toggleGraphExpansion("studyTime")}
          layout
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-[--theme-text-color]">Subject Mastery</h3>
            <select
              className="px-3 py-1 border border-[--theme-border-color] rounded-md text-sm bg-[--theme-leaguecard-color] text-[--theme-text-color]"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            >
              <option value="All">All Subjects</option>
              {Object.keys(subjectCategoryData).map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
          <AnimatePresence>
            {expandedGraph === "studyTime" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[18.75rem]"
              >
                <Bar
                  data={barChartData}
                  options={chartOptions}
                />
              </motion.div>
            ) : (
              <div className="h-[12.5rem]">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                          callback: (value) =>
                            `${((value as number) * 100).toFixed(0)}%`,
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Test Scores Chart - Adjust height classes */}
        <motion.div
          className="bg-[--theme-leaguecard-color] p-4 rounded-lg cursor-pointer relative"
          style={{
            boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
          }}
          onClick={() => toggleGraphExpansion("practiceTest")}
          layout
        >
          <h3 className="text-lg font-semibold mb-2 text-[--theme-text-color]">Test Progress</h3>
          <AnimatePresence>
            {expandedGraph === "practiceTest" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[18.75rem]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedTestData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "var(--theme-text-color)" }}
                    />
                    <YAxis
                      tick={{ fill: "var(--theme-text-color)" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--theme-secondary-background)",
                        border: "1px solid var(--theme-border-color)",
                        color: "var(--theme-text-color)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={getThemeColor()}
                      dot={{
                        r: 4,
                        fill: getThemeColor(),
                        stroke: getThemeColor(),
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <div className="h-[12.5rem]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedTestData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={getThemeColor()}
                      dot={{
                        r: 4,
                        fill: getThemeColor(),
                        stroke: getThemeColor(),
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Statistics Summary */}
        <div className="col-span-2 grid grid-cols-3 gap-4">
          {/* Test Performance */}
          <div 
            className="bg-[--theme-leaguecard-color] p-4 rounded-lg"
            style={{
              boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
            }}
          >
            <h4 className="text-sm font-semibold mb-1 text-[--theme-text-color]">Current Streak</h4>
            <p className="text-2xl font-bold text-[--theme-text-color]">{statistics?.streak || 0} days</p>
          </div>

          <div 
            className="bg-[--theme-leaguecard-color] p-4 rounded-lg"
            style={{
              boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
            }}
          >
            <h4 className="text-sm font-semibold mb-1 text-[--theme-text-color]">Avg. Correct</h4>
            <p className="text-2xl font-bold text-[--theme-text-color]">
              {Math.round(statistics?.averageCorrect || 0)}%
            </p>
          </div>

          <div 
            className="bg-[--theme-leaguecard-color] p-4 rounded-lg"
            style={{
              boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
            }}
          >
            <h4 className="text-sm font-semibold mb-1 text-[--theme-text-color]">Tests Completed</h4>
            <p className="text-2xl font-bold text-[--theme-text-color]">
              {statistics?.testsCompleted || 0}/
              {statistics?.totalTestsTaken || 0}
            </p>
          </div>

          {/* Test Statistics */}
          {/* <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Tests Completed</h4>
            <p className="text-2xl font-bold">
              {statistics?.testsCompleted || 0}
            </p>
          </div> */}
          {/* <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Completion Rate</h4>
            <p className="text-2xl font-bold">
              {Math.round(statistics?.completionRate || 0)}%
            </p>
          </div> */}
          <div 
            className="bg-[--theme-leaguecard-color] p-4 rounded-lg"
            style={{
              boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
            }}
          >
            <h4 className="text-sm font-semibold mb-1 text-[--theme-text-color]">Avg. Test Score</h4>
            <p className="text-2xl font-bold text-[--theme-text-color]">
              {Math.round(statistics?.averageTestScore || 0)}
            </p>
          </div>

          <div 
            className="bg-[--theme-leaguecard-color] p-4 rounded-lg"
            style={{
              boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
            }}
          >
            <h4 className="text-sm font-semibold mb-1 text-[--theme-text-color]">Questions Answered</h4>
            <p className="text-2xl font-bold text-[--theme-text-color]">
              {statistics?.totalQuestionsAnswered || 0}
            </p>
          </div>

          {/* Time Metrics */}
          <div 
            className="bg-[--theme-leaguecard-color] p-4 rounded-lg"
            style={{
              boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
            }}
          >
            <h4 className="text-sm font-semibold mb-1 text-[--theme-text-color]">
              Avg. Time per Question
            </h4>
            <p className="text-2xl font-bold text-[--theme-text-color]">
              {Math.round(statistics?.averageTimePerQuestion || 0)}s
            </p>
          </div>
          <div 
            className="bg-[--theme-leaguecard-color] p-4 rounded-lg"
            style={{
              boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
            }}
          >
            <h4 className="text-sm font-semibold mb-1 text-[--theme-text-color]">Avg. Time per Test</h4>
            <p className="text-2xl font-bold text-[--theme-text-color]">
              {(statistics?.averageTimePerTest || 0).toFixed(1)}m
            </p>
          </div>
          <div 
            className="bg-[--theme-leaguecard-color] p-4 rounded-lg"
            style={{
              boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
            }}
          >
            <h4 className="text-sm font-semibold mb-1 text-[--theme-text-color]">Tasks Completed</h4>
            <p className="text-2xl font-bold text-[--theme-text-color]">
              {statistics?.completedTasks || 0}/{statistics?.totalTasks || 0}
            </p>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            {/* Top Profiles */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-2 text-[--theme-text-color]">
                Strongest Categories
              </h4>
              {statistics?.topProfiles?.map((profile: Profile, index: number) => (
                <div
                  key={String(profile.categoryName)}
                  className="bg-[--theme-leaguecard-color] p-3 rounded-lg shadow-md border-l-4 border-[--theme-hover-color]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[--theme-hover-color]">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-[--theme-text-color]">
                        {profile.categoryName}
                      </p>
                      <p className="text-xs text-[--theme-text-color] opacity-80">
                        {profile.subjectCategory}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[--theme-hover-color]">
                      {(profile.conceptMastery * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Profiles */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-2 text-[--theme-text-color]">Needs Improvement</h4>
              {statistics?.bottomProfiles?.map((profile: Profile, index: number) => (
                <div
                  key={String(profile.categoryName)}
                  className="bg-[--theme-leaguecard-color] p-3 rounded-lg shadow-md border-l-4 border-[--theme-hover-color]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[--theme-hover-color]">
                      #{statistics?.bottomProfiles?.length - index}
                    </span>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-[--theme-text-color]">
                        {profile.categoryName}
                      </p>
                      <p className="text-xs text-[--theme-text-color] opacity-80">
                        {profile.subjectCategory}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[--theme-hover-color]">
                      {(profile.conceptMastery * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Total Score</h4>
            <p className="text-2xl font-bold">{statistics?.userScore || 0}</p>
          </div> */}

          {/* Study Progress */}
          {/* <div className="col-span-3 bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-3">
              Study Hours by Subject
            </h4>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(statistics?.studyHoursBySubject || {}).map(
                ([subject, hours]) => (
                  <div key={subject} className="text-center">
                    <p className="text-lg font-bold">
                      {Math.round(hours as number)}h
                    </p>
                    <p className="text-xs text-gray-600">{subject}</p>
                  </div>
                )
              )}
            </div>
          </div> */}

          {/* Category Accuracy */}
          {/* <div className="col-span-3 bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-3">Category Accuracy</h4>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(statistics?.categoryAccuracy || {}).map(
                ([category, accuracy]) => (
                  <div key={category} className="text-center">
                    <p className="text-lg font-bold">
                      {Math.round(accuracy as number)}%
                    </p>
                    <p className="text-xs text-gray-600">{category}</p>
                  </div>
                )
              )}
            </div>
          </div> */}
        </div>
      </div>

      {/* Return Button - Adjust positioning */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <button
          onClick={onReturn}
          className="w-full py-3 px-2 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold shadow-md rounded-lg transition relative flex items-center justify-between text-md"
        >
          <svg
            className="w-6 h-6 rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span>Overview</span>
        </button>
      </div>
    </div>
  );
};

export default Statistics;
