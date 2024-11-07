import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { useTheme } from "@/contexts/ThemeContext";

ChartJS.register(ArcElement, Tooltip);

interface DonutChartProps {
  onProgressClick: () => void;
}

const DonutChart: React.FC<DonutChartProps> = ({ onProgressClick }) => {
  const [hoveredSegment, setHoveredSegment] = React.useState<number | null>(null);
  const [targetScore, setTargetScore] = React.useState(() => 
    localStorage.getItem('targetScore') || '520'
  );
  const { theme } = useTheme();

  const getBorderColor = () => {
    const themeClasses = {
      cyberSpace: '#0162ff',
      sakuraTrees: '#ff0080',
      sunsetCity: '#ff6347',
      mykonosBlue: '#4cb5e6'
    };
    return themeClasses[theme];
  };

  const data = {
    labels: ["CARs", "Psych/Soc", "Chem/Phys", "Bio/Biochem"],
    datasets: [
      {
        data: [25, 25, 25, 25],
        backgroundColor: [
          "rgba(76, 175, 80, 0.12)",
          "rgba(156, 39, 176, 0.12)",
          "rgba(255, 235, 59, 0.12)",
          "rgba(33, 150, 243, 0.12)",
        ],
        hoverBackgroundColor: [
          "rgba(102, 187, 106)",
          "rgba(186, 104, 200)",
          "rgba(255, 235, 59)",
          "rgba(66, 165, 245)",
        ],
        borderWidth: 3,
        borderColor: Array(4).fill(getBorderColor()),
        hoverBorderColor: Array(4).fill(getBorderColor()),
        hoverOffset: 50,
        hoverBorderWidth: [3, 3, 3, 3],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    layout: {
      padding: {
        top: 36,
        bottom: 36,
        left: 36,
        right: 36
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Disable tooltips
      },
      datalabels: {
        display: false, // Disable data labels
      },
    },
    hover: {
      mode: 'index',
      intersect: true,
      animationDuration: 300,
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
    onHover: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        setHoveredSegment(elements[0].index);
        event.native.target.style.cursor = elements[0].index === 0 ? 'pointer' : 'default';
      } else {
        setHoveredSegment(null);
        event.native.target.style.cursor = 'default';
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && elements[0].index === 0) {
        onProgressClick();
      }
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTargetScore(value);
    localStorage.setItem('targetScore', value);
  };

  const getGradeInfo = (segmentIndex: number | null) => {
    const grades = [
      { grade: 'C', color: '#4CAF50', trend: 'up' },    // CARs - Green
      { grade: 'B', color: '#9C27B0', trend: 'down' },  // PS - Purple
      { grade: 'A', color: '#b3bc00', trend: 'flat' },  // CP - Yellow
      { grade: 'A', color: '#2196F3', trend: 'up' }     // BB - Blue
    ];
    return segmentIndex !== null ? grades[segmentIndex] : null;
  };

  const TrendIcon = ({ trend, color }: { trend: string, color: string }) => {
    const paths = {
      up: "M3 17L9 11L13 15L21 7",
      down: "M3 7L9 13L13 9L21 17",
      flat: "M3 12L9 12L13 12L21 12"
    };

    return (
      <svg width="3vh" height="3vh" viewBox="0 0 24 24" fill="none" strokeWidth="2">
        <path
          d={paths[trend as keyof typeof paths]}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="relative w-[70vh] h-[70vh] flex items-center justify-center">
      <Doughnut data={data} options={options} />
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
                trend={getGradeInfo(hoveredSegment)?.trend || 'flat'} 
                color={getGradeInfo(hoveredSegment)?.color || '#000'} 
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
            <h2 className="text-[3vh] font-medium">I Want A</h2>
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
              <p className="text-[3vh] text-[--theme-text-color]">5 points away</p>
              <p className="text-[3vh] text-[--theme-border-color]">23 days left</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonutChart;
