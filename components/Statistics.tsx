import React, { useEffect, useMemo, useState } from "react";
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

interface CategoryStats {
  categoryId: string;
  subjectCategory: string;
  conceptCategory: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  mastery: number;
}

interface SubjectStats {
  totalQuestions: number;
  correctAnswers: number;
  averageTime: number;
  averageMastery: number;
  categories: CategoryStats[];
  accuracy: number;
}

interface CategoryWithMastery {
  categoryId: string;
  name: string;
  subject: string;
  mastery: number;
}

interface StatsData {
  categoryStats: Record<string, CategoryStats>;
  subjectStats: Record<string, SubjectStats>;
  dailyProgress: DailyProgress[];
  overallStats: {
    totalQuestions: number;
    totalCorrect: number;
    averageTime: number;
    accuracy: number;
  };
  topCategories: CategoryStats[];
  bottomCategories: CategoryStats[];
  performanceOverTime: PerformanceOverTime[];
  categoriesWithMastery: CategoryWithMastery[];
}

interface DailyProgress {
  date: string;
  correct: number;
  total: number;
  accuracy: number;
}

interface PerformanceOverTime {
  date: string;
  cumulativeCorrect: number;
  cumulativeTotal: number;
  accuracy: number;
  averageTime: number;
}

interface StatisticsProps {
  onReturn: () => void;
  subject: string;
}

const Statistics = ({
  onReturn,
  subject,
}: StatisticsProps) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);

  // Fetch statistics when subject changes
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const subjects = getSubjectsForSection(subject);
        const queryParams = new URLSearchParams({
          subjects: subjects.join(',')
        });
        const response = await fetch(`/api/user-statistics?${queryParams.toString()}`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
      setLoading(false);
    };

    fetchStats();
  }, [subject]);

  const chartColors = {
    primary: 'var(--theme-hover-color)',
    secondary: 'var(--theme-border-color)',
    background: 'var(--theme-leaguecard-color)',
    text: 'var(--theme-text-color)',
  };

  const getThemeColor = () => {
    const themeColors = {
      cyberSpace: '#3b82f6',
      sakuraTrees: '#b85475',
      sunsetCity: '#ff6347',
      mykonosBlue: '#4cb5e6'
    };
    return themeColors[theme];
  };

  // Update the mastery chart data formatting
  const masteryChartData = useMemo(() => {
    if (!stats?.categoriesWithMastery) return {
      labels: [],
      datasets: [{
        label: "Concept Mastery",
        data: [],
        backgroundColor: getThemeColor(),
        borderColor: getThemeColor(),
        borderWidth: 1,
        barThickness: 40,
        barPercentage: 0.95,
        categoryPercentage: 0.95,
      }]
    };

    return {
      labels: stats.categoriesWithMastery.map(cat => cat.name),
      datasets: [{
        label: "Concept Mastery",
        data: stats.categoriesWithMastery.map(cat => cat.mastery),
        backgroundColor: getThemeColor(),
        borderColor: getThemeColor(),
        borderWidth: 1,
        barThickness: 40,
        barPercentage: 0.95,
        categoryPercentage: 0.95,
      }]
    };
  }, [stats?.categoriesWithMastery]);

  // New State for Top and Bottom Categories
  const topCategories = stats?.topCategories || [];
  const bottomCategories = stats?.bottomCategories || [];

  // Data for Performance Over Time Charts
  const performanceAccuracyData = stats?.performanceOverTime.map(item => ({
    date: item.date,
    accuracy: item.accuracy,
  })) || [];

  const performanceTimeData = stats?.performanceOverTime.map(item => ({
    date: item.date,
    averageTime: item.averageTime,
  })) || [];

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  if (!stats) {
    return <div>No statistics available</div>;
  }

  // Calculate aggregate statistics
  const aggregateStats = stats?.overallStats

  return (
    <div className="h-full w-full relative flex flex-col">
      {/* Subject Title */}
      {subject && (
        <h2 className="text-2xl font-bold text-[--theme-text-color] p-4 pb-0">
          {subject} Statistics
        </h2>
      )}
      
      {/* Main Statistics Content */}
      <div className="flex flex-col gap-4 p-4">
        {/* Content Mastery Chart - Temporarily Hidden
        <motion.div
          className="bg-[--theme-leaguecard-color] p-4 rounded-lg cursor-pointer relative h-96"
          style={{ boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)' }}
          layout
        >
          <h3 className="text-lg font-semibold text-[--theme-text-color]">Content Mastery</h3>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[calc(100%-2rem)]"
            >
              <div className="overflow-x-auto h-full">
                <div className="h-full" style={{ minWidth: `${stats?.categoriesWithMastery?.length * 100}px` }}>
                  <Bar 
                    data={masteryChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 1,
                          ticks: {
                            callback: (value) => `${(Number(value) * 100).toFixed(0)}%`,
                            color: chartColors.text,
                          },
                          grid: {
                            display: false,
                          },
                        },
                        x: {
                          ticks: {
                            color: chartColors.text,
                            autoSkip: true,
                            maxRotation: 30,
                            minRotation: 20,
                          },
                          grid: {
                            display: false,
                          },
                        },
                      },
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          titleColor: chartColors.text,
                          bodyColor: chartColors.text,
                          callbacks: {
                            label: (context) => {
                              const value = context.raw as number;
                              return `Mastery: ${(value * 100).toFixed(1)}%`;
                            },
                            title: (tooltipItems) => {
                              const index = tooltipItems[0].dataIndex;
                              const category = stats?.categoriesWithMastery[index];
                              return `${category?.name} (${category?.subject})`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        */}

        {/* Key Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            title="Questions Answered"
            value={aggregateStats.totalQuestions}
          />
          <StatCard
            title="Accuracy"
            value={`${Math.round(aggregateStats.accuracy)}%`}
          />
          <StatCard
            title="Avg. Time per Question"
            value={`${Math.round(aggregateStats.averageTime)}s`}
          />
        </div>
      </div>

      {/* Top Categories */ }
      {/* <div className="p-4">
        <h3 className="text-lg font-semibold text-[--theme-text-color]">
          Top Performing Categories
        </h3>
        <CategoryTable 
          categories={topCategories.filter(cat => cat.totalQuestions > 0)} 
        />
      </div> */}

      {/* Bottom Categories */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-[--theme-text-color]">
          Focus Areas for Improvement
        </h3>
        
        {bottomCategories.length > 0 ? (
          <>
            <p className="text-[--theme-text-color] mb-4">
              {`Based on your performance, ${bottomCategories.slice(0, 3).map(cat => cat.conceptCategory).join(', ')} ${bottomCategories.length <= 3 ? 'are' : 'are among'} your most challenging areas. 
              These categories show an average accuracy of ${(bottomCategories.slice(0, 3).reduce((acc, cat) => acc + cat.accuracy, 0) / Math.min(bottomCategories.length, 3)).toFixed(1)}% 
              and an average response time of ${(bottomCategories.slice(0, 3).reduce((acc, cat) => acc + cat.averageTime, 0) / Math.min(bottomCategories.length, 3)).toFixed(1)} seconds. 
              I recommend dedicating extra study time to these topics, focusing on understanding core concepts and practicing with varied question types. Remember, it's normal to have areas that need more attention - let's work on turning these into your strengths!`}
            </p>
            <CategoryTable 
              categories={bottomCategories.filter(cat => cat.totalQuestions > 0)} 
            />
          </>
        ) : (
          <p className="text-[--theme-text-color] py-4">Keep practicing to identify areas for improvement!</p>
        )}
      </div>
      <h3 className="text-lg font-semibold text-[--theme-text-color] p-4 pb-0">Daily Progress</h3>

      {/* Performance Over Time Charts */}
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Accuracy Over Time */}
        <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-[--theme-text-color]">Question Accuracy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceAccuracyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke={getThemeColor()}
                dot={{ r: 4, fill: getThemeColor(), stroke: getThemeColor() }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Average Time Over Time */}
        <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-[--theme-text-color]">Average Time to Answer</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="averageTime"
                stroke={getThemeColor()}
                dot={{ r: 4, fill: getThemeColor(), stroke: getThemeColor() }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Return Button */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={onReturn}
          className="py-3 px-2 bg-[--theme-leaguecard-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold rounded-lg transition flex items-center gap-2"
        >
          <svg
            className="w-6 h-6 rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
  <div className="bg-[--theme-leaguecard-color] p-3 rounded-lg [box-shadow:var(--theme-adaptive-tutoring-boxShadow)] flex flex-col justify-center min-h-[5rem]">
    <h4 className="text-sm font-semibold text-[--theme-text-color]">{title}</h4>
    <p className="text-4xl font-bold text-[--theme-text-color] text-center">{value}</p>
  </div>
);
const getSubjectsForSection = (section: string): string[] => {
  switch (section) {
    case "CARs":
      return ["CARs"];
    case "Psych/Soc":
      return ["Psychology", "Sociology"];
    case "Chem/Phys":
      return ["Chemistry", "Physics"];
    case "Bio/Biochem":
      return ["Biology", "Biochemistry"];
    default:
      return [];
  }
};

// CategoryTable Component
const CategoryTable = ({ categories }: { categories: CategoryStats[] }) => (
  <div className="overflow-x-auto">
    {categories.length > 0 ? (
      <table className="min-w-full bg-[--theme-leaguecard-color] text-[--theme-text-color]">
        <thead>
          <tr>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Accuracy</th>
            <th className="px-4 py-2">Questions Answered</th>
            <th className="px-4 py-2">Avg. Time (s)</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.categoryId}>
              <td className="border px-4 py-2">{category.conceptCategory}</td>
              <td className="border px-4 py-2">{category.accuracy.toFixed(2)}%</td>
              <td className="border px-4 py-2">{category.totalQuestions}</td>
              <td className="border px-4 py-2">{category.averageTime.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="text-[--theme-text-color] py-4">No data available yet</p>
    )}
  </div>
);

export default Statistics;
