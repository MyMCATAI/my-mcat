import React, { useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  LineController
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";
import { calculateGrade, PerformanceMetrics } from "@/utils/gradeCalculator";
import { useClerk } from '@clerk/nextjs';
import { differenceInDays, format } from 'date-fns';
import { motion } from "framer-motion";
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface DonutChartProps {
  onProgressClick: (label: string) => void;
}

interface FullLengthExam {
  id: string;
  title: string;
  createdAt: string;
  score: number;
  dataPulses: Array<{
    name: string;
    positive: number;
    section: string;
  }>;
  calendarActivity: {
    scheduledDate: string;
  };
}

const DonutChart: React.FC<DonutChartProps> = ({ onProgressClick }) => {
  const { theme } = useTheme();
  const { user } = useClerk();
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [targetScore, setTargetScore] = React.useState(() => {
    return user?.unsafeMetadata?.targetScore?.toString() || "520";
  });
  const [examScores, setExamScores] = React.useState<FullLengthExam[]>([]);
  const [daysUntilExam, setDaysUntilExam] = React.useState<number | null>(null);

  // Fetch exam scores
  useEffect(() => {
    const fetchExamScores = async () => {
      try {
        const response = await fetch('/api/full-length-exam/complete');
        if (response.ok) {
          const data = await response.json();
          setExamScores(data);
        }
      } catch (error) {
        console.error('Error fetching exam scores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamScores();
  }, []);

  // Calculate average section scores
  const sectionAverages = React.useMemo(() => {
    if (!examScores.length) return {};

    const sectionScores = {
      "CARs": [] as number[],
      "Psych/Soc": [] as number[],
      "Chem/Phys": [] as number[],
      "Bio/Biochem": [] as number[]
    };

    examScores.forEach(exam => {
      exam.dataPulses.forEach(pulse => {
        if (pulse.name.includes("Critical Analysis")) {
          sectionScores["CARs"].push(pulse.positive);
        } else if (pulse.name.includes("Psychological")) {
          sectionScores["Psych/Soc"].push(pulse.positive);
        } else if (pulse.name.includes("Chemical")) {
          sectionScores["Chem/Phys"].push(pulse.positive);
        } else if (pulse.name.includes("Biological")) {
          sectionScores["Bio/Biochem"].push(pulse.positive);
        }
      });
    });

    return Object.entries(sectionScores).reduce((acc, [section, scores]) => {
      acc[section] = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : null;
      return acc;
    }, {} as Record<string, number | null>);
  }, [examScores]);

  // Process exam scores for the chart
  const chartData = React.useMemo(() => {
    if (!examScores.length) return null;

    const sortedExams = [...examScores].sort((a, b) => 
      new Date(a.calendarActivity.scheduledDate).getTime() - new Date(b.calendarActivity.scheduledDate).getTime()
    );

    return {
      labels: sortedExams.map(exam => format(new Date(exam.calendarActivity.scheduledDate), 'MMM d')),
      datasets: [
        {
          label: 'MCAT Score',
          data: sortedExams.map(exam => {
            // Calculate total score from section scores
            const totalScore = exam.dataPulses.reduce((sum, pulse) => sum + pulse.positive, 0);
            return totalScore;
          }),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(75, 192, 192)',
        },
        {
          label: 'Target Score',
          data: Array(sortedExams.length).fill(parseInt(targetScore)),
          borderColor: 'rgba(255, 99, 132, 0.5)',
          borderDash: [5, 5],
          tension: 0,
          fill: false,
          pointRadius: 0,
        },
      ],
    };
  }, [examScores, targetScore]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === 'Target Score') {
              return `Target Score: ${targetScore}`;
            }
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      },
      datalabels: {
        color: 'var(--theme-text-color)',
        anchor: 'start' as const,
        align: 'bottom' as const,
        offset: 10,
        font: {
          size: 12,
        },
        formatter: function(value: any, context: any) {
          // Only show labels for MCAT Score dataset
          return context.datasetIndex === 0 ? value : '';
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          padding: 30,
          color: 'var(--theme-text-color)',
          font: {
            size: 12,
          }
        },
        border: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        display: true,
        min: 472,
        max: 528,
        position: 'left' as const,
        ticks: {
          stepSize: 4,
          color: 'var(--theme-text-color)',
          font: {
            size: 12,
          },
          padding: 10,
        },
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false,
        },
        border: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    onClick: (event: any, elements: any[]) => {
      if (!elements.length) return;
      
      const element = elements[0];
      if (element.datasetIndex === 1) { // Target Score dataset
        const yValue = Math.round(element.chart.scales.y.getValueForPixel(event.y));
        const newTargetScore = Math.min(Math.max(yValue, 472), 528);
        setTargetScore(newTargetScore.toString());
      }
    },
    hover: {
      mode: 'index' as const,
      intersect: false
    },
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
      backgroundColor: "rgba(251, 192, 45, 0.4)", // Darker yellow with higher opacity
      hoverBackgroundColor: "rgba(251, 192, 45, 1)", // Full opacity darker yellow
    },
    "Bio/Biochem": {
      backgroundColor: "rgba(33, 150, 243, 0.15)", // Blue
      hoverBackgroundColor: "rgba(66, 165, 245)", // Hover Blue
    },
  };

  const labels = ["CARs", "Psych/Soc", "Chem/Phys", "Bio/Biochem"];

  const handleButtonClick = (label: string) => {
    setSelectedSubject(label);
    onProgressClick(label);
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
        width="1.5rem"
        height="1.5rem"
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

  const getScoreCategory = (score: number) => {
    if (score < 500) return { label: "Needs Work", color: "var(--theme-error-color)", animation: "pulse" };
    if (score <= 505) return { label: "Getting There", color: "var(--theme-warning-color)", animation: "glow" };
    if (score <= 510) return { label: "Good Progress", color: "var(--theme-info-color)", animation: "float" };
    if (score <= 515) return { label: "Great Work", color: "var(--theme-success-color)", animation: "bounce" };
    return { label: "Exceptional!", color: "var(--theme-gold-color, #FFD700)", animation: "sparkle" };
  };

  const ScoreDisplay = ({ score }: { score: number }) => {
    const category = getScoreCategory(score);
    
    return (
      <div className="flex flex-col items-center gap-2">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative font-bold text-2xl md:text-3xl lg:text-4xl ${category.animation}`}
          style={{ 
            color: 'var(--theme-text-color)',
            textShadow: `0 0 15px ${category.color}`,
          }}
        >
          {score}
          {/* Sparkle effect for exceptional scores */}
          {category.animation === 'sparkle' && (
            <div className="absolute -inset-4 opacity-50">
              <div className="absolute inset-0 animate-sparkle-1" style={{ background: `radial-gradient(circle, ${category.color} 0%, transparent 50%)` }} />
              <div className="absolute inset-0 animate-sparkle-2" style={{ background: `radial-gradient(circle, ${category.color} 0%, transparent 50%)` }} />
            </div>
          )}
        </motion.div>
        <span className="text-sm md:text-base font-medium" style={{ color: category.color }}>
          {category.label}
        </span>
      </div>
    );
  };

  // Add keyframes for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    @keyframes glow {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.2); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    @keyframes sparkle-1 {
      0%, 100% { transform: translate(0, 0) scale(0); opacity: 0; }
      25% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(50%, -50%) scale(0); opacity: 0; }
      75% { transform: translate(0, 50%) scale(1); opacity: 0.5; }
    }
    @keyframes sparkle-2 {
      0%, 100% { transform: translate(0, 0) scale(0); opacity: 0; }
      25% { transform: translate(50%, 50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, 50%) scale(0); opacity: 0; }
      75% { transform: translate(0, -50%) scale(1); opacity: 0.5; }
    }
    .pulse { animation: pulse 2s ease-in-out infinite; }
    .glow { animation: glow 2s ease-in-out infinite; }
    .float { animation: float 3s ease-in-out infinite; }
    .bounce { animation: bounce 2s ease-in-out infinite; }
    .sparkle { animation: float 3s ease-in-out infinite; }
  `;
  document.head.appendChild(style);

  const getThemeColor = () => {
    const themeColors = {
      cyberSpace: '#3b82f6',
      sakuraTrees: '#b85475',
      sunsetCity: '#ff6347',
      mykonosBlue: '#4cb5e6'
    };
    return themeColors[theme];
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-4 lg:p-6">
      <h2 className="text-[--theme-text-color] text-xs mb-6 opacity-60 uppercase tracking-wide text-center">
        {user?.firstName || 'Student'}&apos;s MCAT Progress
      </h2>

      <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 h-[calc(100%-1rem)]">
        {/* Chart Container */}
        <div className="relative flex-1 rounded-xl p-4" 
          style={{
            background: 'linear-gradient(135deg, var(--theme-leaguecard-color) 0%, var(--theme-leaguecard-accent) 100%)',
            boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
          }}>
          {chartData ? (
            <Chart 
              type="bar"
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    type: 'bar',
                    data: chartData.datasets[0].data,
                    backgroundColor: getThemeColor(),
                    hoverBackgroundColor: getThemeColor(),
                    borderRadius: 5,
                    barThickness: 30,
                  },
                  {
                    type: 'line',
                    label: 'Target Score',
                    data: Array(chartData.labels.length).fill(parseInt(targetScore)),
                    borderColor: 'rgba(255, 99, 132, 0.8)',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  datalabels: {
                    color: getThemeColor(),
                    anchor: 'end',
                    align: 'top',
                    offset: 8,
                    font: {
                      weight: 'bold',
                      size: 18
                    },
                    formatter: (value: number, context: any) => {
                      // Only show labels for bar dataset
                      if (context.datasetIndex === 0) {
                        return value.toString();
                      }
                      return '';
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    border: {
                      display: false,
                    },
                    ticks: {
                      color: getThemeColor(),
                      font: {
                        size: 12,
                        weight: 'bold'
                      }
                    }
                  },
                  y: {
                    min: 472,
                    max: 528,
                    grid: {
                      color: `${getThemeColor()}4D`,
                      display: true,
                      lineWidth: 0.5
                    },
                    border: {
                      display: false,
                    },
                    ticks: {
                      color: getThemeColor(),
                      font: {
                        size: 12,
                        weight: 'bold'
                      },
                      callback: function(value) {
                        return value.toString();
                      }
                    }
                  }
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white opacity-70">
              No exam scores available yet
            </div>
          )}
        </div>

        {/* Subject Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-5 lg:w-40">
          {labels.map((label) => {
            const avgScore = sectionAverages[label];
            return (
              <motion.button
                key={label}
                className="relative group flex flex-col items-center justify-center p-1.5 md:p-2 lg:p-3 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: hoveredButton === label 
                    ? colorMap[label].hoverBackgroundColor 
                    : colorMap[label].backgroundColor,
                  boxShadow: hoveredButton === label
                    ? 'var(--theme-button-boxShadow-hover)'
                    : 'var(--theme-button-boxShadow)'
                }}
                onHoverStart={() => setHoveredButton(label)}
                onHoverEnd={() => setHoveredButton(null)}
                onClick={() => handleButtonClick(label)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-[--theme-hover-color]" />
                  ) : (
                    <>
                      <span className="text-sm md:text-base lg:text-lg font-bold" style={{ 
                        color: hoveredButton === label ? 'white' : colorMap[label].hoverBackgroundColor 
                      }}>
                        {avgScore !== null ? avgScore : 'N/A'}
                      </span>
                      <span className="text-xs font-medium" style={{ 
                        color: hoveredButton === label ? 'white' : 'var(--theme-text-color)' 
                      }}>
                        {label}
                      </span>
                    </>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
