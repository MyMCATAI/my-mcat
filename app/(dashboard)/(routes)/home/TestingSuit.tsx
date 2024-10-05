import React, { useState, useRef, useEffect } from "react";
import { Test } from "@/types";
import Exams from "./testingsuit/Exams";

interface TestListingProps {
  tests: Test[];
  testsCompletedToday: number;
}

const TestingSuit: React.FC<TestListingProps> = ({ tests, testsCompletedToday }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
  const [dismissAnimation, setDismissAnimation] = useState<(() => void) | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleAssistantResponse = (message: string, dismissFunc: () => void) => {
    setAssistantMessage(message);
    setIsOverlayVisible(true);
    setDismissAnimation(() => dismissFunc);
  };

  const closeOverlay = () => {
    setIsOverlayVisible(false);
    setAssistantMessage(null);
    if (dismissAnimation) {
      dismissAnimation();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        closeOverlay();
      }
    };

    if (isOverlayVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOverlayVisible]);

  const tabs = [
    { label: "Exams", content: <Exams tests={tests} onAssistantResponse={handleAssistantResponse} testsCompletedToday={testsCompletedToday}/> },
  ];

  return (
    <div className="testing-suit h-full flex flex-col relative">
      <div className="tab-content flex-grow overflow-auto">
        {tabs[activeTab].content}
      </div>
      
      {/* Assistant Message Overlay */}
      {isOverlayVisible && assistantMessage && (
        <div 
          ref={overlayRef} 
          className="absolute left-[10rem] top-[4rem] z-50 bg-[--theme-hover-color] text-[--theme-hover-text] rounded-lg p-3 animate-fadeIn max-w-[20rem] max-h-[70vh] overflow-y-auto"
        >
          <div className="whitespace-pre-wrap break-words text-sm">{assistantMessage}</div>
          <button
            onClick={closeOverlay}
            className="absolute top-1 right-1 text-white hover:text-gray-200"
            aria-label="Close"
          >
            &#10005;
          </button>
          <div className="absolute left-0 top-4 transform -translate-x-1/2 w-0 h-0 border-t-8 border-r-8 border-b-8 border-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default TestingSuit;