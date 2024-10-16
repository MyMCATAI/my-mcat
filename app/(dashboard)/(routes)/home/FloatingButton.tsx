'use client'

import React, { useState, useRef, useEffect } from "react";
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

// Updated Typewriter component
const Typewriter: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 10); // Adjust this value to control typing speed (lower = faster)

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

const FloatingButton: React.FC<FloatingButtonProps> = ({ onTabChange, currentPage, initialTab }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const hoverTimeout = useRef<number | null>(null);
  const router = useRouter();
  const [showTutoringMessage, setShowTutoringMessage] = useState(false);

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
    if (tab === 'KnowledgeProfile') {
      setShowTutoringMessage(true);
      setTimeout(() => setShowTutoringMessage(false), 3000); // Hide message after 3 seconds
    } else if (tab === 'doctorsoffice') {
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

  // Mapping of tab names to descriptive texts
  const labelTexts: Record<string, string> = {
    "Schedule": "Dashboard",
    "doctorsoffice": "The Anki Clinic",
    "test": "Daily CARs Suite",
    "KnowledgeProfile": "Tutoring Suite",
  };

  // Updated Helper function to determine label position
  const getLabelPosition = (index: number) => {
    switch (index) {
      case 0: // Schedule
        return { top: '-5.5rem', left: '10rem' };
      case 1: // doctorsoffice
        return { top: '-1.2rem', left: '15.5rem' };
      case 2: // test
        return { top: '4rem', left: '16.5rem' };
      default: // KnowledgeProfile or any other
        return { top: '2rem', left: '12.5rem' };
    }
  };

  return (
    <>
      {isHovered && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}
      {showTutoringMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black p-4 rounded-lg shadow-lg z-50">
          You don't have enough coins to unlock the tutoring suite! Head to Anki Clinic to earn it.
        </div>
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
              ? inactivePositions[inactiveIndex]?.top
              : inactivePositions[activeIndex]?.top;

            const left = isActive
              ? 0
              : isHovered
              ? inactivePositions[inactiveIndex]?.left
              : inactivePositions[activeIndex]?.left;

            const labelPosition = getLabelPosition(inactiveIndex);
            const labelText = labelTexts[pos.tab] || pos.tab;

            return (
              <div key={index} className="relative">
                <button
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
                {/* Label */}
                <span
                  className="absolute"
                  style={{
                    top: labelPosition.top,
                    left: labelPosition.left,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 60,
                  }}
                >
                  {isHovered && !isActive && (
                    <span
                      className="bg-transparent text-white text-2xl px-2 py-1 rounded overflow-hidden"
                      style={{
                        display: 'inline-block',
                        width: '150px',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                      }}
                    >
                      <Typewriter text={labelText} delay={0} />
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </span>
    </>
  );
};

export default FloatingButton;
