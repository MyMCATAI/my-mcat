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
}

const Exams: React.FC<TestListingProps> = ({ tests, onAssistantResponse, testsCompletedToday }) => {
  const { user } = useUser();
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
    let message = `Hey ${
      userName.charAt(0).toUpperCase() + userName.slice(1)
    }! \n\n`;

    if (streak > 0) {
      if (streak === 1) {
        message += "You've started your streak! Great job showing up today! ";
      } else {
        message += `You're on a ${streak}-day streak! Keep it up! `;
      }
    }

    if (testsCompletedToday >= MAX_TESTS_PER_DAY) {
      message += `\n\nCongratulations on completing ${testsCompletedToday} tests today! Make sure to review your tests to improve your learning and come back tomorrow for more.`;
    } else {
      message += "\n\n";
    }

    return message;
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
                className="kalypso-portrait w-[8rem] h-[8rem] bg-transparent border-2 border-[--theme-border-color] rounded-lg mr-4 flex-shrink-0 overflow-hidden relative"
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
                className="flex-grow p-2 bg-transparent border-2 rounded-lg relative"
                style={{
                  color: "var(--theme-text-color)",
                  borderColor: "var(--theme-border-color)",
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
                      value: reportData ? `${reportData.testsCompleted}/${reportData.totalTestsTaken}` : "N/A",
                      label: "Tests",
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
                className="text-lg leading-[1.5rem] tracking-[0.025rem] flex-1 mt-4 ml-2"
                style={{ color: "var(--theme-text-color)" }}
              >
                {welcomeAndTestMessage}
              </div>
              {welcomeComplete && testsCompletedToday < MAX_TESTS_PER_DAY && tests.length > 0 && (
                <div className="flex flex-col mt-12 ml-2">
                  <div 
                    className="flex items-center justify-between p-4 rounded-lg border-2 group theme-box hover:[background-color:var(--theme-hover-color)] transition-all duration-200"
                    style={{
                      borderColor: "var(--theme-border-color)",
                      color: "var(--theme-text-color)",
                    }}
                  >
                    <Link
                      href={`/test/testquestions?id=${tests[0].id}`}
                      className="flex-1"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-7 h-7 relative">
                          <Image
                            src="/computer.svg"
                            layout="fill"
                            objectFit="contain"
                            alt="Computer icon"
                            className="theme-svg"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className="text-xl group-hover:text-white transition-colors duration-200"
                          >
                            {tests[0].title}
                          </span>
                          <span className={`text-sm ${getDifficultyColor(tests[0].difficulty)}`}>
                            Level {tests[0].difficulty}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center">
                      <span 
                        className="text-sm px-2 py-1 rounded-full border group-hover:text-white transition-colors duration-200"
                        style={{
                          borderColor: "var(--theme-border-color)",
                        }}
                      >
                        Current
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div
            className="h-[calc(100vh-8.3rem)] overflow-y-auto rounded-lg p-4 bg-[#001226] relative"
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
            <Tabs defaultValue="past" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
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