import React, { useState, useEffect } from "react";
import Link from "next/link";

import Image from "next/image";
import { ReportData, Test, UserTest } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestList from "./TestList";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import { HelpCircle } from "lucide-react";
import TutorialVidDialog from "@/components/ui/TutorialVidDialog";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

// Update the dynamic import
const ChatBotWidgetNoChatBot = dynamic(
  () => import("@/components/chatbot/ChatBotWidgetNoChatBot"),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

// Add this constant at the top of the file, after the imports
const MAX_TESTS_PER_DAY = 2;

// Add this helper function at the top of the file (after imports)
const getDifficultyColor = (difficulty: number) => {
  if (difficulty < 3) return "text-green-500";
  if (difficulty >= 3 && difficulty < 4) return "text-yellow-500";
  return "text-red-500";
};

interface TestListingProps {
  tests: Test[];
  testsCompletedToday: number;
  onAssistantResponse: (message: string, dismissFunc: () => void) => void;
  onResetDailyTests: () => void;
}

const Exams: React.FC<TestListingProps> = ({ tests, onAssistantResponse, testsCompletedToday, onResetDailyTests }) => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('activeTab') || 'upcoming';
  const [userTests, setUserTests] = useState<UserTest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [welcomeAndTestMessage, setWelcomeAndTestMessage] = useState("");
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [dismissMessage, setDismissMessage] = useState<(() => void) | null>(null);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [isTutorialDialogOpen, setIsTutorialDialogOpen] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState("");
  const [kalypsoInteracted, setKalypsoInteracted] = useState(false);

  const openTutorialDialog = (videoUrl: string) => {
    setTutorialVideoUrl(videoUrl);
    setIsTutorialDialogOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsResponse, reportResponse] = await Promise.all([
          fetch("/api/user-test"),
          fetch("/api/user-report"),
        ]);

        if (!testsResponse.ok) throw new Error("Failed to fetch user tests");
        if (!reportResponse.ok) throw new Error("Failed to fetch user report");

        const testsData = await testsResponse.json();
        const reportData = await reportResponse.json();

        // Update this line to use the new structure
        const completedTests = testsData.userTests.filter(
          (test: { isCompleted: any }) => test.isCompleted
        ); // Filter completed tests
        setUserTests(completedTests); // Set only completed tests
        setReportData(reportData);
        // setUserTests(testsData.userTests);
        // setReportData(reportData);

      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const userName = user ? user.firstName || "there" : "there";
    const welcomeText = getWelcomeMessage(
      userName,
      reportData ? reportData.streak : 0,
      testsCompletedToday
    );

    if (tests.length > 0 && testsCompletedToday < MAX_TESTS_PER_DAY) {
      const fullText = welcomeText + (tests[0].description || "");
      let index = 0;

      const typingTimer = setInterval(() => {
        if (index <= fullText.length) {
          setWelcomeAndTestMessage(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(typingTimer);
          setWelcomeComplete(true); // Move this line here
        }
      }, 15);

      return () => clearInterval(typingTimer);
    } else {
      setWelcomeAndTestMessage(welcomeText);
      setWelcomeComplete(true);
    }
  }, [user, tests, reportData, testsCompletedToday]);

  const handleAssistantResponse = (
    message: string,
    dismissFunc: () => void
  ) => {
    onAssistantResponse(message, dismissFunc);
  };

  const closeOverlay = () => {
    if (dismissMessage) {
      dismissMessage();
    }
    setAssistantMessage(null);
    setDismissMessage(null);
  };

  const getWelcomeMessage = (userName: string, streak: number, testsCompletedToday: number) => {
    const name = userName.charAt(0).toUpperCase() + userName.slice(1);
    
    if (testsCompletedToday >= MAX_TESTS_PER_DAY) {
      return `Hey! You've reached your limit of ${MAX_TESTS_PER_DAY} tests for today. Come back tomorrow for more tests!`;
    }
    
    return `Hey ${name}! `;
  };

  const handleKalypsoInteraction = () => {
    setKalypsoInteracted(true);
    // Only trigger if this tutorial hasn't been played yet
    if (!localStorage.getItem("carsTutorialPlayed")) {
      localStorage.setItem("carsTutorialPlayed", "true");
    }
  };


  return (
    <div
      className="h-full flex flex-col p-3"
      style={{ color: "var(--theme-text-color)" }}
    >
      <div className="flex-grow grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="md:col-span-5 mr mb-4">
          <div
            className="h-[calc(100vh-8.3rem)] rounded-[10px] p-4 flex flex-col relative cars-overview"
            style={{
              backgroundImage: `linear-gradient(var(--theme-gradient-start), var(--theme-gradient-end)), var(--theme-interface-image)`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundColor: "var(--theme-mainbox-color)",
              boxShadow: "var(--theme-box-shadow)",
              color: "var(--theme-text-color)",
            }}
          >
            <div className="flex mb-4">
              <div 
                className="kalypso-portrait w-[8rem] h-[8rem] bg-[--theme-leaguecard-color] rounded-lg mr-4 flex-shrink-0 shadow-lg overflow-hidden relative"
                onClick={handleKalypsoInteraction}
              >
                <ChatBotWidgetNoChatBot
                  reportData={reportData}
                  onResponse={handleAssistantResponse}
                />
              </div>
              {assistantMessage && (
                <div className="ml-4 max-w-xs bg-blue-500 text-white rounded-lg p-3 relative animate-fadeIn">
                  <div className="typing-animation">{assistantMessage}</div>
                  <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -tran  slate-y-1/2 w-0 h-0 border-t-8 border-r-8 border-b-8 border-transparent border-r-blue-500"></div>
                  <button
                    onClick={closeOverlay}
                    className="absolute top-1 right-1 text-white hover:text-gray-200"
                    aria-label="Close"
                  >
                    &#10005;
                  </button>
                </div>
              )}
              <div
                className="flex-grow p-2 bg-[--theme-leaguecard-color] shadow-lg rounded-lg relative"
                style={{
                  color: "var(--theme-text-color)",
                }}
              >
                <div className="flex justify-between items-center h-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-16 cars-stats">
                  {[
                    {
                      icon: "/game-components/PixelHeart.png",
                      value: reportData ? `${reportData.averageTestScore.toFixed(2)}%` : "N/A",
                      label: "Score",
                      alt: "Heart"
                    },
                    {
                      icon: "/game-components/PixelWatch.png",
                      value: reportData ? `${(reportData.averageTimePerTest / 60000).toFixed(2)} min` : "N/A",
                      label: "Time",
                      alt: "Watch"
                    },
                    {
                      icon: "/game-components/PixelCupcake.png",
                      value: reportData ? reportData.userScore : "N/A",
                      label: "Coins",
                      alt: "Diamond"
                    },
                    {
                      icon: "/game-components/PixelBook.png",
                      value: reportData ? `${reportData.testsReviewed}/${reportData.testsCompleted}` : "N/A",
                      label: "Reviewed",
                      alt: "Flex"
                    }
                  ].map((stat, index) => (
                    <div key={index} className="flex flex-col items-center w-1/4 p-2 rounded-lg hover:bg-black/5 transition-all duration-200">
                      <div className="w-[2.5rem] h-[2.5rem] relative mb-1">
                        <Image
                          src={stat.icon}
                          alt={stat.alt}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                      <span className="text-sm font-medium">{stat.value}</span>
                      <span className="text-xs opacity-75">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div
                className="text-lg leading-[1.5rem] tracking-[0.025rem] flex-1 mt-8 ml-2"
                style={{ color: "var(--theme-text-color)" }}
              >
                {welcomeAndTestMessage}
              </div>
              {welcomeComplete && testsCompletedToday < MAX_TESTS_PER_DAY && tests.length > 0 && (
                <div className="flex flex-col mt-8 ml-2">
                  <Link href={`/test/testquestions?id=${tests[0].id}`} className="w-full max-w-[28rem]">
                    <Button className="w-full" variant="default">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-6 h-6 flex-shrink-0 relative">
                            <Image
                              className="theme-svg"
                              src="/computer.svg"
                              layout="fill"
                              objectFit="contain"
                              alt="Computer icon"
                            />
                          </div>
                          <div className="flex flex-col items-start">
                            <h2 className="text-sm xl:text-base font-normal truncate max-w-[20rem]">
                              {tests[0].title}
                            </h2>
                            <span className={`text-sm xl:text-base font-medium ${getDifficultyColor(tests[0].difficulty)}`}>
                              Lvl {tests[0].difficulty}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <span className="text-sm xl:text-base px-2 py-0.5 rounded-full border transition-colors bg-[--theme-leaguecard-color]"
                            style={{
                              borderColor: "var(--theme-border-color)",
                            }}>
                            Current
                          </span>
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div
            className="h-[calc(100vh-8.3rem)] rounded-lg p-4 bg-[#001226] relative"
            style={{
              backgroundImage: `linear-gradient(var(--theme-gradient-start), var(--theme-gradient-end)), var(--theme-interface-image)`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundColor: "var(--theme-mainbox-color)",
              boxShadow: "var(--theme-box-shadow)",
              color: "var(--theme-text-color)",
            }}
          >
            <h3
              className="text-m font-semibold mt-3 mb-3 text-center"
              style={{ color: "var(--theme-text-color)" }}
            >
              CARs Tests
            </h3>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList 
                className="grid w-full grid-cols-2 mb-6 bg-transparent" 
              >
                <TabsTrigger value="past">Past Tests</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
              <TabsContent value="past">
                <TestList items={userTests} type="past" loading={loading} />
              </TabsContent>
              <TabsContent value="upcoming">
                <TestList 
                  items={tests} 
                  type="upcoming" 
                  loading={loading} 
                  testsAvailableToday={MAX_TESTS_PER_DAY}
                  testsCompletedToday={testsCompletedToday}
                  onResetDailyTests={onResetDailyTests}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <TutorialVidDialog
        isOpen={isTutorialDialogOpen}
        onClose={() => setIsTutorialDialogOpen(false)}
        videoUrl={tutorialVideoUrl}
      />
    </div>
  );
};

export default Exams;