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
import { useTheme } from "@/contexts/ThemeContext";
import { useClerk } from '@clerk/nextjs';
import { motion } from "framer-motion";
import { Chart } from 'react-chartjs-2';
import { Brain, BookText, Atom, Activity } from 'lucide-react';

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

interface MCATProgressData {
  chartData: {
    labels: string[];
    scores: number[];
    targetScore: number;
  };
  sectionAverages: {
    "CARs": number | null;
    "Psych/Soc": number | null;
    "Chem/Phys": number | null;
    "Bio/Biochem": number | null;
  };
}

const DonutChart: React.FC<DonutChartProps> = ({ onProgressClick }) => {
  const { theme } = useTheme();
  const { user } = useClerk();
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [progressData, setProgressData] = React.useState<MCATProgressData | null>(null);

  // Fetch MCAT progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await fetch('/api/mcat-progress');
        if (response.ok) {
          const data = await response.json();
          setProgressData(data);
        }
      } catch (error) {
        console.error('Error fetching MCAT progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  // Define color map for subjects with more subtle hover states
  const colorMap: { [key: string]: { backgroundColor: string; hoverBackgroundColor: string } } = {
    "CARs": {
      backgroundColor: "rgba(76, 175, 80, 0.08)", // More subtle green
      hoverBackgroundColor: "rgba(76, 175, 80, 0.18)", // Slightly more intense on hover
    },
    "Psych/Soc": {
      backgroundColor: "rgba(156, 39, 176, 0.08)", // More subtle purple
      hoverBackgroundColor: "rgba(156, 39, 176, 0.18)", // Slightly more intense on hover
    },
    "Chem/Phys": {
      backgroundColor: "rgba(251, 192, 45, 0.08)", // More subtle yellow
      hoverBackgroundColor: "rgba(251, 192, 45, 0.18)", // Slightly more intense on hover
    },
    "Bio/Biochem": {
      backgroundColor: "rgba(33, 150, 243, 0.08)", // More subtle blue
      hoverBackgroundColor: "rgba(33, 150, 243, 0.18)", // Slightly more intense on hover
    },
  };

  const labels = ["CARs", "Psych/Soc", "Chem/Phys", "Bio/Biochem"];

  const handleButtonClick = (label: string) => {
    setSelectedSubject(label);
    onProgressClick(label);
  };

  const getScoreCategory = (score: number) => {
    if (score < 500) return { label: "Needs Work", color: "var(--theme-error-color)", animation: "pulse" };
    if (score <= 505) return { label: "Getting There", color: "var(--theme-warning-color)", animation: "glow" };
    if (score <= 510) return { label: "Good Progress", color: "var(--theme-info-color)", animation: "float" };
    if (score <= 515) return { label: "Great Work", color: "var(--theme-success-color)", animation: "bounce" };
    return { label: "Exceptional!", color: "var(--theme-gold-color, #FFD700)", animation: "sparkle" };
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

  // Define section icons
  const sectionIcons = {
    "CARs": BookText,
    "Psych/Soc": Brain,
    "Chem/Phys": Atom,
    "Bio/Biochem": Activity,
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
          {progressData ? (
            <Chart 
              type="bar"
              data={{
                labels: progressData.chartData.labels,
                datasets: [
                  {
                    type: 'bar',
                    data: progressData.chartData.scores,
                    backgroundColor: getThemeColor(),
                    hoverBackgroundColor: getThemeColor(),
                    borderRadius: 5,
                    barThickness: 30,
                  },
                  {
                    type: 'line',
                    label: 'Target Score',
                    data: Array(progressData.chartData.labels.length).fill(progressData.chartData.targetScore),
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

        {/* Subject Buttons - Updated Design */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:w-48">
          {labels.map((label) => {
            const avgScore = progressData?.sectionAverages[label as keyof typeof progressData.sectionAverages];
            const Icon = sectionIcons[label as keyof typeof sectionIcons];
            
            return (
              <motion.button
                key={label}
                className="relative group flex items-center gap-3 p-3 rounded-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, var(--theme-leaguecard-color) 0%, var(--theme-leaguecard-accent) 100%)',
                  boxShadow: hoveredButton === label
                    ? 'var(--theme-button-boxShadow-hover)'
                    : 'var(--theme-button-color)',
                  border: `1px solid ${hoveredButton === label ? 'var(--theme-border-color)' : 'transparent'}`,
                  transition: 'all 0.3s ease-in-out'
                }}
                onHoverStart={() => setHoveredButton(label)}
                onHoverEnd={() => setHoveredButton(null)}
                onClick={() => handleButtonClick(label)}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Icon Container */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300
                  ${hoveredButton === label ? 'bg-[--theme-hover-color]/10' : 'bg-[--theme-hover-color]/5'}`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300
                    ${hoveredButton === label 
                      ? 'text-[--theme-hover-color]' 
                      : 'text-[--theme-text-color]'}`} 
                    style={{
                      opacity: hoveredButton === label ? 0.9 : 0.6
                    }}
                  />
                </div>

                {/* Score and Label */}
                <div className="flex flex-col items-start">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[--theme-hover-color]" />
                  ) : (
                    <>
                      <span className="text-lg font-bold leading-none transition-all duration-300" style={{ 
                        color: hoveredButton === label 
                          ? 'var(--theme-hover-color)'
                          : 'var(--theme-text-color)',
                        opacity: hoveredButton === label ? 1 : 0.75,
                        transform: `scale(${hoveredButton === label ? 1.02 : 1})`,
                      }}>
                        {avgScore !== null ? avgScore : 'N/A'}
                      </span>
                      <span className="text-xs font-medium mt-0.5 transition-all duration-300" style={{ 
                        color: 'var(--theme-text-color)',
                        opacity: hoveredButton === label ? 0.8 : 0.5
                      }}>
                        {label}
                      </span>
                    </>
                  )}
                </div>

                {/* Hover Indicator */}
                <motion.div
                  className="absolute right-2 w-0.5 h-8 rounded-full"
                  animate={{
                    opacity: hoveredButton === label ? 0.2 : 0,
                    backgroundColor: hoveredButton === label ? 'var(--theme-hover-color)' : 'transparent',
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
