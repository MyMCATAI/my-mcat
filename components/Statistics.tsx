import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";

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
  const barChartData = {
    labels: statistics ? Object.keys(statistics.subjectMastery) : [],
    datasets: [
      {
        label: "Subject Mastery",
        data: statistics ? Object.values(statistics.subjectMastery) : [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const lineChartData = {
    labels: statistics
      ? statistics.testScores.map((score: any) =>
          new Date(score.date).toLocaleDateString()
        )
      : [],
    datasets: [
      {
        label: "Test Scores",
        data: statistics
          ? statistics.testScores.map((score: any) => score.score)
          : [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

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
          <h3 className="text-lg font-semibold mb-2">Subject Mastery</h3>
          <AnimatePresence>
            {expandedGraph === "studyTime" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </motion.div>
            ) : (
              <Bar data={barChartData} />
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
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </motion.div>
            ) : (
              <Line data={lineChartData} />
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
          {/* <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Questions Answered</h4>
            <p className="text-2xl font-bold">
              {statistics?.totalQuestionsAnswered || 0}
            </p>
          </div> */}
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
              {Math.round((statistics?.averageTimePerTest || 0) / 60)}m
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-semibold mb-1">Tasks Completed</h4>
            <p className="text-2xl font-bold">
              {statistics?.completedTasks || 0}/{statistics?.totalTasks || 0}
            </p>
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
