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
import { useUI } from "@/store/selectors";
import { useClerk } from '@clerk/nextjs';
import { motion } from "framer-motion";
import { Chart } from 'react-chartjs-2';
import { Brain, BookText, Atom, Activity } from 'lucide-react';
import Image from "next/image";
import type { ThemeType } from '@/store/slices/uiSlice';

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
  diagnosticScores?: {
    total: string;
    cp: string;
    cars: string;
    bb: string;
    ps: string;
  } | null;
}

// Map to connect DonutChart labels to diagnostic score keys
const labelToDiagnosticMap = {
  "CARs": "cars",
  "Psych/Soc": "ps",
  "Chem/Phys": "cp",
  "Bio/Biochem": "bb"
};

const DonutChart: React.FC<DonutChartProps> = ({ onProgressClick }) => {
  const { theme } = useUI();
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
          console.log("DEBUG - DonutChart - Fetched MCAT progress data:", data);
          console.log("DEBUG - DonutChart - Has diagnostic scores:", !!data.diagnosticScores);
          if (data.diagnosticScores) {
            console.log("DEBUG - DonutChart - Diagnostic scores content:", JSON.stringify(data.diagnosticScores, null, 2));
          }
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
    const themeColors: Record<ThemeType, string> = {
      cyberSpace: '#3b82f6',
      sakuraTrees: '#b85475',
      sunsetCity: '#ff6347',
      mykonosBlue: '#4cb5e6',
      cleanWhite: '#2ab2b0'
    };
    return themeColors[theme] || '#3b82f6';
  };

  // Define section icons
  const sectionIcons = {
    "CARs": BookText,
    "Psych/Soc": Brain,
    "Chem/Phys": Atom,
    "Bio/Biochem": Activity,
  };

  // Function to get score for a section
  const getScoreForSection = (label: string): string => {
    // First check if there are diagnostic scores available
    if (progressData?.diagnosticScores) {
      const diagnosticKey = labelToDiagnosticMap[label as keyof typeof labelToDiagnosticMap];
      const diagnosticScore = diagnosticKey && progressData.diagnosticScores[diagnosticKey as keyof typeof progressData.diagnosticScores];
      
      console.log(`DEBUG - DonutChart - Getting score for ${label}, diagnostic key: ${diagnosticKey}, value: ${diagnosticScore}`);
      
      if (diagnosticKey && diagnosticScore) {
        return diagnosticScore;
      }
    }

    // If no diagnostic scores or the specific score is missing, fall back to practice test averages
    if (progressData?.sectionAverages) {
      const sectionKey = label as keyof typeof progressData.sectionAverages;
      const avgScore = progressData.sectionAverages[sectionKey];
      console.log(`DEBUG - DonutChart - Falling back to practice test avg for ${label}: ${avgScore}`);
      
      if (avgScore !== null && avgScore !== undefined) {
        return avgScore.toString();
      }
    }
    
    return 'N/A';
  };

  // Check if we're using diagnostic scores or practice test scores
  const isUsingDiagnosticScores = !!progressData?.diagnosticScores && 
    Object.values(progressData.diagnosticScores).some(score => !!score);

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-4 lg:p-6">
      <h2 className="text-[--theme-text-color] text-xs mb-6 opacity-60 uppercase tracking-wide text-center">
        {user?.firstName || 'Student'}&apos;s MCAT Progress
        {isUsingDiagnosticScores && <span className="block mt-1 text-[0.6rem] font-light italic">Showing diagnostic scores</span>}
      </h2>

      <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 h-[calc(100%-1rem)]">
        {/* Chart Container */}
        <div className="relative flex-1 rounded-xl p-4 flex flex-col items-center justify-center" 
          style={{
            background: 'linear-gradient(135deg, var(--theme-leaguecard-color) 0%, var(--theme-leaguecard-accent) 100%)',
            boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
          }}>
          {progressData && progressData.chartData?.scores?.length > 0 ? (
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
                    grid: {
                      display: false,
                    },
                    border: {
                      display: false,
                    },
                    min: 472,
                    max: 528,
                    ticks: {
                      color: getThemeColor(),
                      font: {
                        size: 12,
                        weight: 'bold'
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              <Image 
                src="/kalypso/kalypsotyping.gif" 
                alt="Kalypso Working" 
                width={200} 
                height={200} 
                className="opacity-80"
              />
              <motion.p 
                className="text-lg font-black mt-4 text-center max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  background: 'linear-gradient(135deg, var(--theme-text-color) 0%, var(--theme-hover-color) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Kalypso&apos;s working really hard on his first practice test and so should you!
              </motion.p>
            </div>
          )}
        </div>

        {/* Subject Buttons - Updated Design */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6 lg:w-48">
          {labels.map((label) => {
            const scoreValue = getScoreForSection(label);
            const Icon = sectionIcons[label as keyof typeof sectionIcons];
            
            return (
              <motion.button
                key={label}
                className="relative group flex items-center gap-3 p-5 rounded-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(315deg, var(--theme-leaguecard-color) 0%, var(--theme-leaguecard-accent) 100%)',
                  boxShadow: hoveredButton === label
                    ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                    : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  border: `1px solid ${hoveredButton === label ? 'var(--theme-border-color)' : 'transparent'}`,
                  transition: 'all 0.3s ease-in-out',
                  borderLeft: `0.25rem solid ${hoveredButton === label 
                    ? 'var(--theme-hover-color)' 
                    : 'color-mix(in srgb, var(--theme-hover-color) 40%, transparent)'}`
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
                      <span className="text-2xl font-bold leading-none transition-all duration-300 drop-shadow-lg" style={{ 
                        color: hoveredButton === label 
                          ? 'var(--theme-hover-color)'
                          : 'var(--theme-text-color)',
                        opacity: hoveredButton === label ? 1 : 0.75,
                        transform: `scale(${hoveredButton === label ? 1.02 : 1})`,
                      }}>
                        {scoreValue}
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
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
