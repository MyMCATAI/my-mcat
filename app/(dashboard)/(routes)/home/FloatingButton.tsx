'use client'

import React, { useState, useRef } from "react";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from 'next/navigation';

interface FloatingButtonProps {
  onTabChange: (tab: string) => void;
  currentPage: 'home' | 'doctorsoffice';
  initialTab: string; // Add this new prop
}

interface ButtonPosition {
  top: number;
  left: number;
  tab: string;
  icon: string;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onTabChange, currentPage, initialTab }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab); // Use initialTab here
  const hoverTimeout = useRef<number | null>(null);
  const router = useRouter();

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
    { top: 0, left: 0, tab: "doctorsoffice", icon: "/gamecontroller.svg" },
    { top: 0, left: 0, tab: "test", icon: "/book.svg" },
    { top: 0, left: 0, tab: "KnowledgeProfile", icon: "/graduationcap.svg" },
  ];

  const inactivePositions = [
    { top: -70, left: 10 },
    { top: -40, left: 80 },
    { top: 30, left: 100 },
  ];

  const handleButtonClick = (tab: string) => {
    if (tab === 'doctorsoffice') {
      if (currentPage === 'home') {
        router.push('/doctorsoffice');
      } else {
        router.push('/home');
      }
    } else {
      if (currentPage === 'doctorsoffice') {
        router.push('/home');
      }
      setActiveTab(tab);
      onTabChange(tab);
    }
  };

  return (
    <>
      {isHovered && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}
      <span className="fixed bottom-[8rem] left-[0.625rem] z-50">
        <div
          className="relative group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {buttonPositions.map((pos, index) => {
            const isActive = activeTab === pos.tab;
            const activeIndex = buttonPositions.findIndex(
              (p) => p.tab === activeTab
            );
            const inactiveIndex = buttonPositions
              .filter((p) => p.tab !== activeTab)
              .findIndex((p) => p.tab === pos.tab);

            const top = isActive
              ? 0
              : isHovered
              ? inactivePositions[inactiveIndex].top
              : inactivePositions[activeIndex]?.top;
            const left = isActive
              ? 0
              : isHovered
              ? inactivePositions[inactiveIndex].left
              : inactivePositions[activeIndex]?.left;

            return (
              <button
                key={index}
                className={clsx(
                  "w-16 h-16 bg-[var(--theme-navbutton-color)] border-2 border-white text-white rounded-full shadow-lg focus:outline-none transition-all transform hover:scale-110 absolute flex justify-center items-center",
                  {
                    "w-24 h-24": isActive,
                    "opacity-100": isHovered || isActive,
                    "opacity-0 pointer-events-none": !isHovered && !isActive,
                  }
                )}
                style={{
                  top,
                  left,
                  transitionDelay: `${index * 50}ms`,
                  color: 'var(--theme-navbutton-color)',
                }}
                onClick={() => handleButtonClick(pos.tab)}
              >
                <Image 
                  src={pos.icon} 
                  alt={pos.tab} 
                  width={isActive ? 44 : 32} 
                  height={isActive ? 44 : 32} 
                />
              </button>
            );
          })}
        </div>
      </span>
    </>
  );
};

export default FloatingButton;
