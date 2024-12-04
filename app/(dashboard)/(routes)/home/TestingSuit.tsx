import React, { useState, useRef, useEffect } from "react";
import { Test } from "@/types";
import Exams from "./testingsuit/Exams";
import { toast } from "@/components/ui/use-toast";
import CARsTutorial from "./testingsuit/CARsTutorial";
import { HelpCircle } from 'lucide-react';
import HelpContentCARs from './HelpContentCARs';


const TestingSuit: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(false);
  const [dismissAnimation, setDismissAnimation] = useState<(() => void) | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [tests, setTests] = useState<Test[]>([]);
  const [testsCompletedToday, setTestsCompletedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCARsTutorial, setShowCARsTutorial] = useState(() => {
    const tutorialPlayed = localStorage.getItem("carsTutorialPlayed");
    return tutorialPlayed === null || tutorialPlayed === "false";
  });
  const [kalypsoInteracted, setKalypsoInteracted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tutorialPlayed = localStorage.getItem("carsTutorialPlayed");
    if (tutorialPlayed === null) {
      setShowCARsTutorial(true);
    }
  }, []);

  const handleAssistantResponse = (message: string) => {
    setAssistantMessage(message);
    setIsOverlayVisible(true);
    setKalypsoInteracted(true);
    localStorage.setItem("carsTutorialPlayed", "true");
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

  const fetchTests = async (
    ordered: boolean = false,
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      setIsLoading(true);

      const queryParams = new URLSearchParams({
        ordered: ordered.toString(),
        page: page.toString(),
        pageSize: pageSize.toString(),
        CARSonly: "true",
      });

      const response = await fetch(`/api/test?${queryParams}`);

      if (!response.ok) throw new Error("Failed to fetch tests");

      const data = await response.json();
      setTests(data.tests);
      setTestsCompletedToday(data.testsCompletedToday);
    } catch (error) {
      console.error("Error fetching tests:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      toast({
        title: "Error",
        description: "Failed to fetch tests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests(true);
  }, []);

  const handleKalypsoInteraction = () => {
    setKalypsoInteracted(true);
    if (!localStorage.getItem("carsTutorialPlayed")) {
      localStorage.setItem("carsTutorialPlayed", "true");
    }
  };

  const toggleHelp = () => {
    setShowHelp((prev) => !prev);
  };

  const tabs = [
    { 
      label: "Exams", 
      content: (
        isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <Exams 
            tests={tests} 
            onAssistantResponse={handleAssistantResponse} 
            testsCompletedToday={testsCompletedToday}
          />
        )
      ) 
    },
  ];

  return (
    <div className="testing-suit h-full flex flex-col relative">
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleHelp}
          className={`help-button p-2 rounded-full shadow-md ${
            showHelp ? "bg-[--theme-hover-color]" : "bg-white"
          }`}
        >
          <HelpCircle 
            className="w-4 h-4" 
            fill="none"
            stroke={showHelp ? "white" : "#333"}
          />
        </button>
      </div>

      {showHelp && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleHelp}
          />
          <div
            ref={helpRef}
            className="absolute top-0 right-4 w-[26rem] bg-[--theme-leaguecard-color] rounded-lg border-[--theme-border-color] border-2 shadow-lg z-50 max-h-[80vh] flex flex-col"
          >
            <HelpContentCARs 
              onClose={toggleHelp}
              onResetTutorials={() => {
                setShowCARsTutorial(true);
                toggleHelp();
              }}
            />
          </div>
        </>
      )}

      <div className="tab-content flex-grow overflow-auto">
        {tabs[activeTab].content}
      </div>
      
      {/* Assistant Message Overlay */}
      {isOverlayVisible && assistantMessage && (
        <div 
          ref={overlayRef} 
          className="absolute left-[10rem] top-[4rem] z-50 bg-[--theme-userchatbox-color] text-white rounded-lg p-3 animate-fadeIn max-w-[20rem] max-h-[70vh] overflow-y-auto"
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
      <CARsTutorial 
        runTutorial={showCARsTutorial}
        setRunTutorial={setShowCARsTutorial}
        kalypsoInteracted={kalypsoInteracted}
      />
    </div>
  );
};

export default TestingSuit;