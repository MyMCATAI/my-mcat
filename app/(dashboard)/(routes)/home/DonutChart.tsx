import React, { useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useTheme } from "@/contexts/ThemeContext";
import { calculateGrade, PerformanceMetrics } from "@/utils/gradeCalculator";
import { useClerk } from '@clerk/nextjs';
import { differenceInDays } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  onProgressClick: (label: string) => void;
}

const DonutChart: React.FC<DonutChartProps> = ({ onProgressClick }) => {
  const { user } = useClerk();
  const [hoveredSegment, setHoveredSegment] = React.useState<number | null>(null);
  const [targetScore, setTargetScore] = React.useState(() => {
    return user?.unsafeMetadata?.targetScore?.toString() || "520";
  });

  const [performanceMetrics, setPerformanceMetrics] =
    React.useState<{ [subject: string]: PerformanceMetrics }>({});
  const { theme } = useTheme();
  const [daysUntilExam, setDaysUntilExam] = React.useState<number | null>(null);

  useEffect(() => {
    // Fetch performance metrics for all subjects
    const fetchPerformanceMetrics = async () => {
      try {
        const subjects = ["CARs", "Psych/Soc", "Chem/Phys", "Bio/Biochem"];
        const metrics: { [subject: string]: PerformanceMetrics } = {};

        for (const subject of subjects) {
          const subjectQuery = encodeURIComponent(subject);
          const response = await fetch(
            `/api/user-statistics?subjects=${subjectQuery}`
          );
          if (response.ok) {
            const data = await response.json();

            const totalQuestions = data.overallStats.totalQuestions;
            const accuracy = data.overallStats.accuracy; // Already in percentage
            const averageTime = data.overallStats.averageTime;

            metrics[subject] = {
              questionsAnswered: totalQuestions,
              accuracy: accuracy,
              averageTime: averageTime,
            };
          } else {
            console.error(`Failed to fetch data for ${subject}`);
          }
        }

        setPerformanceMetrics(metrics);
      } catch (error) {
        console.error("Error fetching performance metrics:", error);
      }
    };

    fetchPerformanceMetrics();
  }, []);

  useEffect(() => {
    const fetchExamDate = async () => {
      try {
        const response = await fetch('/api/study-plan?examDate=true');
        if (!response.ok) {
          console.error('Failed to fetch exam date');
          return;
        }

        const data = await response.json();
        if (data.examDate) {
          const examDate = new Date(data.examDate);
          const today = new Date();
          const days = differenceInDays(examDate, today);
          setDaysUntilExam(Math.max(0, days)); // Ensure we don't show negative days
        }
      } catch (error) {
        console.error("Error fetching exam date:", error);
      }
    };

    fetchExamDate();
  }, []);

  const getBorderColor = () => {
    const themeClasses = {
      cyberSpace: "#0162ff",
      sakuraTrees: "#ff0080",
      sunsetCity: "#ff6347",
      mykonosBlue: "#4cb5e6",
    };
    return themeClasses[theme];
  };

  // Define color map for subjects
  const colorMap: { [key: string]: { backgroundColor: string; hoverBackgroundColor: string } } = {
    "CARs": {
      backgroundColor: "rgba(76, 175, 80, 0.15)", // Green
      hoverBackgroundColor: "rgba(102, 187, 106)", // Hover Green
    },
    "Psych/Soc": {
      backgroundColor: "rgba(156, 39, 176, 0.15)", // Purple
      hoverBackgroundColor: "rgba(186, 104, 200)", // Hover Purple
    },
    "Chem/Phys": {
      backgroundColor: "rgba(255, 235, 59, 0.15)", // Yellow
      hoverBackgroundColor: "rgba(255, 235, 59)", // Hover Yellow
    },
    "Bio/Biochem": {
      backgroundColor: "rgba(33, 150, 243, 0.15)", // Blue
      hoverBackgroundColor: "rgba(66, 165, 245)", // Hover Blue
    },
  };

  const getColorForLabel = (label: string): string => {
    return colorMap[label]?.hoverBackgroundColor || "#000";
  };

  const labels = ["CARs", "Psych/Soc", "Chem/Phys", "Bio/Biochem"];

  const data = {
    labels: labels,
    datasets: [
      {
        data: [25, 25, 25, 25],
        backgroundColor: labels.map((label) => colorMap[label]?.backgroundColor),
        hoverBackgroundColor: labels.map(
          (label) => colorMap[label]?.hoverBackgroundColor
        ),
        borderWidth: 3,
        borderColor: Array(4).fill(getBorderColor()),
        hoverBorderColor: Array(4).fill(getBorderColor()),
        hoverOffset: 50,
        hoverBorderWidth: [3, 3, 3, 3],
      },
    ],
  };

  // Calculate grades for each subject
  const gradeInfo = React.useMemo(() => {
    return labels.map((label) => {
      const metrics = performanceMetrics[label];
      if (metrics && metrics.questionsAnswered > 0) {
        const gradeResult = calculateGrade(metrics, []); // Empty historical scores for now
        return {
          grade: gradeResult.grade,
          color: getColorForLabel(label),
          trend: gradeResult.trend,
        };
      } else {
        return {
          grade: "TBD",
          color: getColorForLabel(label),
          trend: "flat",
        };
      }
    });
  }, [performanceMetrics]);

  const getGradeInfo = (segmentIndex: number | null) => {
    return segmentIndex !== null ? gradeInfo[segmentIndex] : null;
  };

  type DonutChartOptions = ChartOptions<"doughnut"> & {
    onHover?: (event: any, elements: any[]) => void;
    onClick?: (event: any, elements: any[]) => void;
  };

  const options: DonutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    layout: {
      padding: {
        top: 36,
        bottom: 36,
        left: 36,
        right: 36,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    hover: {
      mode: "nearest" as const,
      intersect: true,
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
    onHover(event, elements) {
      if (elements.length > 0) {
        setHoveredSegment(elements[0].index);
        event.native.target.style.cursor = "pointer";
      } else {
        setHoveredSegment(null);
        event.native.target.style.cursor = "default";
      }
    },
    onClick(event, elements) {
      if (elements.length > 0) {
        const selectedLabel = data.labels[elements[0].index];
        onProgressClick(selectedLabel);
      }
    },
  };

  const handleScoreChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetScore(value);
    
    // Update the user metadata when target score changes
    try {
      await user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          targetScore: parseInt(value)
        }
      });
    } catch (error) {
      console.error("Error updating target score:", error);
    }
  };

  const TrendIcon = ({
    trend,
    color,
  }: {
    trend: string;
    color: string;
  }) => {
    const paths = {
      up: "M3 17L9 11L13 15L21 7",
      down: "M3 7L9 13L13 9L21 17",
      flat: "M3 12L9 12L13 12L21 12",
    };

    return (
      <svg
        width="3vh"
        height="3vh"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
      >
        <path
          d={paths[trend as keyof typeof paths]}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Calculate points away based on diagnostic score and target score
  const getScoreMetrics = React.useMemo(() => {
    const diagnosticScore = Number(user?.unsafeMetadata?.diagnosticScore) || 0;
    const target = parseInt(targetScore);
    
    return {
      pointsGained: 0, // We'll implement this later
      pointsAway: target - diagnosticScore, 
    };
  }, [targetScore, user?.unsafeMetadata?.diagnosticScore]);

  return (
    <div className="relative w-[50rem] h-[50rem] flex items-center justify-center">
      <div className="absolute inset-0">
        <Doughnut data={data} options={options} />
      </div>
      <div className="absolute text-center">
        {hoveredSegment !== null ? (
          <div className="transition-all duration-300 ease-in-out flex flex-col items-center">
            <span
              className="text-[12vh] font-bold leading-none"
              style={{ color: getGradeInfo(hoveredSegment)?.color }}
            >
              {getGradeInfo(hoveredSegment)?.grade}
            </span>
            <div className="flex items-center">
              <TrendIcon
                trend={getGradeInfo(hoveredSegment)?.trend || "flat"}
                color={getGradeInfo(hoveredSegment)?.color || "#000"}
              />
            </div>
            <span
              className="text-[3vh] font-semibold"
              style={{ color: getGradeInfo(hoveredSegment)?.color }}
            >
              {data.labels[hoveredSegment]}
            </span>
          </div>
        ) : (
          <>
            <h2 className="text-[3vh] font-medium">{"I Want A"}</h2>
            <div className="flex items-center justify-center gap-[0.5vh] mb-[0.5vh]">
              <input
                type="text"
                value={targetScore}
                onChange={handleScoreChange}
                className="w-[15vh] text-center text-[5vh] font-bold bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
                maxLength={3}
              />
            </div>
            <div className="flex flex-col gap-[0.25vh]">
              <p className="text-[2vh] text-[--theme-hover-color]">
                {getScoreMetrics.pointsGained} points gained
              </p>
              <p className="text-[2vh] text-[--theme-text-color]">
                {getScoreMetrics.pointsAway} points away
              </p>
              {daysUntilExam !== null && (
                <p className="text-[2vh] text-[--theme-text-color]">
                  {daysUntilExam} {daysUntilExam === 1 ? "day" : "days"} left
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonutChart;
