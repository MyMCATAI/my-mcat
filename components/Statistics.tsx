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

interface StatisticsProps {
  statistics: any;
  expandedGraph: string | null;
  toggleGraphExpansion: (graphId: string) => void;
}

const Statistics = ({
  statistics,
  expandedGraph,
  toggleGraphExpansion,
}: StatisticsProps) => {
  console.log("Statistics prop:", statistics);
  console.log("Concept Mastery data:", statistics?.conceptMastery);

  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  const subjectCategoryData = useMemo(() => {
    if (!statistics?.knowledgeProfiles) return {};

    return statistics.knowledgeProfiles.reduce(
      (
        acc: any,
        profile: {
          subjectCategory: string | number;
          categoryName: string | number;
          conceptMastery: any;
        }
      ) => {
        if (!acc[profile.subjectCategory]) {
          acc[profile.subjectCategory] = {};
        }
        acc[profile.subjectCategory][profile.categoryName] =
          profile.conceptMastery;
        return acc;
      },
      {}
    );
  }, [statistics?.knowledgeProfiles]);

  const barChartData = useMemo(() => {
    const selectedData =
      selectedSubject === "All"
        ? statistics?.conceptMastery
        : subjectCategoryData[selectedSubject] || {};

    return {
      labels: Object.keys(selectedData),
      datasets: [
        {
          label: "Concept Mastery",
          data: Object.values(selectedData),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  }, [selectedSubject, statistics?.conceptMastery, subjectCategoryData]);

  console.log("Formatted bar chart data:", barChartData);

  const formattedTestData =
    statistics?.testScores
      ?.filter((score: any) => score.finishedAt !== null)
      .map((score: any) => ({
        date: new Date(score.date).toLocaleDateString(),
        score: score.score,
      })) || [];

  return (
    <div className="h-full w-full relative flex flex-col">
      <div className="grid grid-cols-2 gap-4 p-4">
        {/* Subject Mastery Chart */}
        <motion.div
          className={`bg-white p-4 rounded-lg shadow cursor-pointer ${
            expandedGraph === "studyTime" ? "col-span-2" : ""
          }`}
          onClick={() => toggleGraphExpansion("studyTime")}
          layout
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Subject Mastery</h3>
            <select
              className="px-3 py-1 border rounded-md text-sm"
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
                className="h-[300px]"
              >
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
                      x: {
                        ticks: {
                          autoSkip: false,
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: "top",
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) =>
                            `Mastery: ${(context.parsed.y * 100).toFixed(1)}%`,
                        },
                      },
                    },
                  }}
                />
              </motion.div>
            ) : (
              <div className="h-[200px]">
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

        {/* Test Scores Chart */}
        <motion.div
          className={`bg-white p-4 rounded-lg shadow cursor-pointer ${
            expandedGraph === "practiceTest" ? "col-span-2" : ""
          }`}
          onClick={() => toggleGraphExpansion("practiceTest")}
          layout
        >
          <h3 className="text-lg font-semibold mb-2">Test Progress</h3>
          <AnimatePresence>
            {expandedGraph === "practiceTest" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResponsiveContainer width="100%" height={300}>
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
                      stroke="#4BC0C0"
                      dot={{
                        r: 4,
                        fill: "#4BC0C0",
                        stroke: "#4BC0C0",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={formattedTestData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4BC0C0"
                    dot={{
                      r: 4,
                      fill: "#4BC0C0",
                      stroke: "#4BC0C0",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Statistics Summary */}
        <div className="col-span-2 grid grid-cols-3 gap-4">
          {/* Test Performance */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Current Streak</h4>
            <p className="text-2xl font-bold">{statistics?.streak || 0} days</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Avg. Correct</h4>
            <p className="text-2xl font-bold">
              {Math.round(statistics?.averageCorrect || 0)}%
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Tests Completed</h4>
            <p className="text-2xl font-bold">
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
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Avg. Test Score</h4>
            <p className="text-2xl font-bold">
              {Math.round(statistics?.averageTestScore || 0)}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Questions Answered</h4>
            <p className="text-2xl font-bold">
              {statistics?.totalQuestionsAnswered || 0}
            </p>
          </div>

          {/* Time Metrics */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">
              Avg. Time per Question
            </h4>
            <p className="text-2xl font-bold">
              {Math.round(statistics?.averageTimePerQuestion || 0)}s
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Avg. Time per Test</h4>
            <p className="text-2xl font-bold">
              {(statistics?.averageTimePerTest || 0).toFixed(1)}m
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Tasks Completed</h4>
            <p className="text-2xl font-bold">
              {statistics?.completedTasks || 0}/{statistics?.totalTasks || 0}
            </p>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-4">
            {/* Top Profiles */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-2">
                Strongest Categories
              </h4>
              {statistics?.topProfiles?.map(
                (
                  profile: {
                    categoryName:
                      | boolean
                      | React.ReactElement<
                          any,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | Promise<React.AwaitedReactNode>
                      | React.Key
                      | null
                      | undefined;
                    subjectCategory:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          any,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<React.AwaitedReactNode>
                      | null
                      | undefined;
                    conceptMastery: number;
                  },
                  index: number
                ) => (
                  <div
                    key={String(profile.categoryName)}
                    className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-base font-semibold">
                          {profile.categoryName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {profile.subjectCategory}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-green-600">
                        {(profile.conceptMastery * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Bottom Profiles */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold mb-2">Needs Improvement</h4>
              {statistics?.bottomProfiles?.map(
                (
                  profile: {
                    categoryName:
                      | boolean
                      | React.ReactElement<
                          any,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | Promise<React.AwaitedReactNode>
                      | React.Key
                      | null
                      | undefined;
                    subjectCategory:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          any,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<React.AwaitedReactNode>
                      | null
                      | undefined;
                    conceptMastery: number;
                  },
                  index: number
                ) => (
                  <div
                    key={String(profile.categoryName)}
                    className="bg-white p-3 rounded-lg shadow border-l-4 border-red-500"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">
                        #{statistics?.bottomProfiles?.length - index}
                      </span>
                      <div className="flex-1">
                        <p className="text-base font-semibold">
                          {profile.categoryName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {profile.subjectCategory}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-red-600">
                        {(profile.conceptMastery * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )
              )}
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
    </div>
  );
};

export default Statistics;
