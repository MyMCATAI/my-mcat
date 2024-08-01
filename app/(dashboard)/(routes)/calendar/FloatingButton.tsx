import React, { useState, useRef } from "react";
import clsx from "clsx";
import Image from "next/image";

interface FloatingButtonProps {
  onTabChange: (tab: string) => void;
}

interface ButtonPosition {
  top: number;
  left: number;
  tab: string;
  icon: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onTabChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Schedule");
  const hoverTimeout = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = window.setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  const buttonPositions: ButtonPosition[] = [
    { top: 0, left: 0, tab: "Schedule", icon: "/calendar.svg" },
    { top: 0, left: 0, tab: "Cards", icon: "/cards.svg" },
    { top: 0, left: 0, tab: "AdaptiveTutoring", icon: "/graduationcap.svg" },
    { top: 0, left: 0, tab: "KnowledgeProfile", icon: "/book.svg" },
  ];

  const inactivePositions = [
    { top: -65, left: 10 },
    { top: -35, left: 75 },
    { top: 30, left: 85 },
  ];

  const handleButtonClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  return (
    <>
      {isHovered && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}
      <span className="fixed bottom-[150px] left-[10px] z-50">
        <div
          className="relative group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {buttonPositions.map((pos, index) => {
            const isActive = activeTab === pos.tab;
            const activeIndex = buttonPositions.findIndex(p => p.tab === activeTab);
            const inactiveIndex = buttonPositions.filter(p => p.tab !== activeTab).findIndex(p => p.tab === pos.tab);

            const top = isActive ? 0 : isHovered ? inactivePositions[inactiveIndex].top : inactivePositions[activeIndex]?.top;
            const left = isActive ? 0 : isHovered ? inactivePositions[inactiveIndex].left : inactivePositions[activeIndex]?.left;

            return (
              <button
                key={index}
                className={clsx(
                  "w-14 h-14 bg-[#0E2247] border border-white text-white rounded-full shadow-lg focus:outline-none transition-all transform hover:scale-110 absolute flex justify-center items-center",
                  {
                    "w-20 h-20": isActive,
                    "opacity-100": isHovered || isActive,
                    "opacity-0 pointer-events-none": !isHovered && !isActive,
                  }
                )}
                style={{
                  top,
                  left,
                  transitionDelay: `${index * 50}ms`,
                }}
                onClick={() => handleButtonClick(pos.tab)}
              >
                <Image src={pos.icon} alt={pos.tab} width={30} height={30} />
              </button>
            );
          })}
        </div>
      </span>
    </>
  );
};

export default FloatingButton;
