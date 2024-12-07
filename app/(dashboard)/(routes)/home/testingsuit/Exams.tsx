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
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image
                        src="/game-components/PixelHeart.png"
                        alt="Heart"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">
                      {reportData
                        ? `${reportData.averageTestScore.toFixed(2)}%`
                        : "N/A"}
                    </span>
                    <span className="text-[2vw] sm:text-xs">score</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image
                        src="/game-components/PixelWatch.png"
                        alt="Watch"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">
                      {reportData
                        ? `${(reportData.averageTimePerTest / 60000).toFixed(
                            2
                          )} min`
                        : "N/A"}
                    </span>
                    <span className="text-[2vw] sm:text-xs">per passage</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image
                        src="/game-components/PixelCupcake.png"
                        alt="Diamond"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">
                      {reportData ? reportData.userScore : "N/A"}
                    </span>
                    <span className="text-[2vw] sm:text-xs">coins</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image
                        src="/game-components/PixelBook.png"
                        alt="Flex"
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">
                      {reportData
                        ? `${reportData.testsCompleted}/${reportData.totalTestsTaken}`
                        : "N/A"}
                    </span>
                    <span className="text-[2vw] sm:text-xs">tests</span>
                  </div>
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
                <div className="flex items-center mt-12 ml-2">
                  <Link
                    href={`/test/testquestions?id=${tests[0].id}`}
                    className="text-blue-500 transition-colors duration-200 flex items-center"
                  >
                    <div className="flex items-center mr-4">
                      <div className="w-7 h-7 relative theme-box mr-1">
                        <Image
                          src="/computer.svg"
                          layout="fill"
                          objectFit="contain"
                          alt="Computer icon"
                          className="theme-svg"
                        />
                      </div>
                    </div>
                    <span
                      className="animate-pulse text-xl"
                      style={{
                        color: "var(--theme-text-color)",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color =
                          "var(--theme-hover-color)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          "var(--theme-text-color)")
                      }
                    >
                      {tests && tests.length > 0
                        ? tests[0].title + " - Lvl " + tests[0].difficulty
                        : "Loading first test..."}
                    </span>
                  </Link>
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