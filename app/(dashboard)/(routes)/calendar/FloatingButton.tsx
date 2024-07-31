import React, { useState, useRef } from "react";
import clsx from "clsx";
import Image from "next/image";

interface FloatingButtonProps {
  onTabChange: (tabIndex: number) => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onTabChange }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef<number | undefined>(undefined);

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
  const buttonPositions = [
    { top: -65, left: 10, tabIndex: 0, icon: "/cards.svg" },
    { top: -25, left: 65, tabIndex: 1, icon: "/graduationcap.svg" },
    { top: 40, left: 65, tabIndex: 0, icon: "/book.svg" },
  ];

  return (
    <span className="absolute bottom-[-3px] left-[-20px] ">
      <div
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="w-16 h-16 bg-[#0E2247] text-white border border-white rounded-full shadow-lg focus:outline-none transition-transform transform hover:scale-110 flex justify-center items-center">
          <Image src={"/calendar.svg"} alt="Profile" width={30} height={30} />
        </button>

    {buttonPositions.map((pos, index) => (
      <button
        key={index}
        className={clsx(
          "w-14 h-14 bg-[#0E2247] border border-white text-white rounded-full shadow-lg focus:outline-none transition-all transform hover:scale-110 absolute flex justify-center items-center",
          {
            "opacity-100": isHovered,
            "opacity-0 pointer-events-none": !isHovered,
          }
        )}
        style={{
          top: isHovered ? pos.top : 0,
          left: isHovered ? pos.left : 0,
          transitionDelay: `${index * 50}ms`,
        }}
        onClick={() => onTabChange(pos.tabIndex)}
      >
        <Image src={pos.icon} alt="Profile" width={30} height={30} />
      </button>
    ))}
  </div>
</span>
  );
};

export default FloatingButton;