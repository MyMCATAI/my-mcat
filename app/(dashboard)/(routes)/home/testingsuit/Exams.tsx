import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import { ReportData, Test, UserTest } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestList from "./TestList";
import { useUser } from "@clerk/nextjs";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";

// Update the dynamic import
const ChatBotWidgetNoChatBot = dynamic(
  () => import('@/components/chatbot/ChatBotWidgetNoChatBot'),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

interface TestListingProps {
  tests: Test[];
  onAssistantResponse: (message: string, dismissFunc: () => void) => void;
}

const truncateTitle = (title: string, maxLength: number) => {
  if (title.length > maxLength) {
    return `${title.substring(0, maxLength)}...`;
  }
  return title;
};

const Exams: React.FC<TestListingProps> = ({ tests, onAssistantResponse }) => {
  const { user } = useUser();
  const [userTests, setUserTests] = useState<UserTest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [welcomeAndTestMessage, setWelcomeAndTestMessage] = useState('');
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [dismissMessage, setDismissMessage] = useState<(() => void) | null>(null);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [marketplaceText, setMarketplaceText] = useState("Doctor&apos;s Office ->");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsResponse, reportResponse] = await Promise.all([
          fetch('/api/user-test'),
          fetch('/api/user-report')
        ]);

        if (!testsResponse.ok) throw new Error('Failed to fetch user tests');
        if (!reportResponse.ok) throw new Error('Failed to fetch user report');

        const testsData = await testsResponse.json();
        const reportData = await reportResponse.json();

        // Update this line to use the new structure
        setUserTests(testsData.userTests);
        setReportData(reportData);

        console.log('User Tests:', testsData.userTests);
        console.log('Report Data:', reportData);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const userName = user ? user.firstName || 'there' : 'there';
    const welcomeText = getWelcomeMessage(userName, reportData ? reportData.streak : 0);
    
    if (tests.length > 0) {
      const fullText = welcomeText + tests[0].description;
      let index = 0;
  
      const typingTimer = setInterval(() => {
        if (index <= fullText.length) {
          setWelcomeAndTestMessage(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(typingTimer);
          setWelcomeComplete(true);
        }
      }, 15);
  
      return () => clearInterval(typingTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tests, reportData]);

  const handleAssistantResponse = (message: string, dismissFunc: () => void) => {
    onAssistantResponse(message, dismissFunc);
  };

  const closeOverlay = () => {
    if (dismissMessage) {
      dismissMessage();
    }
    setAssistantMessage(null);
    setDismissMessage(null);
  };

  const handleDoctorsOfficeClick = () => {
    setMarketplaceText("Welcome to the Doctor&apos;s Office!");
  };


  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 5) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  };
  
  const getWelcomeMessage = (userName: string, streak: number) => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const timeOfDay = getTimeOfDay();
    
    let message = `Hey ${userName.charAt(0).toUpperCase() + userName.slice(1)}! \n\n\n`;

    // Time-specific greetings
    const timeGreetings = {
      morning: "Rise and shine! ",
      afternoon: "Hope your day's going well. ",
      evening: "Good evening! ",
      night: "Burning the midnight oil, huh? "
    };
    message += timeGreetings[timeOfDay];

    // Streak message
    if (streak > 0) {
      if (streak === 1) {
        const oneDayStreakMessages = [
          "You've started your streak! Great job showing up today!",
          "Day one of your streak! Let's keep this momentum going!",
          "First day of your study streak! Every journey begins with a single step.",
          "You've begun your streak! One day down, many more to go!",
          "Day 1 of your streak! Remember, consistency is key in MCAT prep."
        ];
        message += oneDayStreakMessages[Math.floor(Math.random() * oneDayStreakMessages.length)] + " ";
      } else {
        const streakMessages = [
          `You're on a ${streak}-day streak! Keep it up!`,
          `Wow, ${streak} days in a row! You're on fire!`,
          `${streak} days of consistent study - that's impressive!`,
          `Your ${streak}-day streak shows real commitment. Great job!`,
          `${streak} days and counting! Your future self thanks you.`
        ];
        message += streakMessages[Math.floor(Math.random() * streakMessages.length)] + " ";
      }
    }

    // Special time-based messages
    if (day === 5 && hour >= 20) {
      message += ["Impressive dedication, studying on a Friday night! ",
                  "Friday night MCAT prep? Your commitment is admirable! ",
                  "Choosing MCAT over Friday night fun? That's the spirit! "][Math.floor(Math.random() * 3)];
    } else if (hour >= 0 && hour < 5) {
      message += ["Just remember, a well-rested brain retains more info. ",
                  "Don't forget to catch some Z's between study sessions. ",
                  "Night owl mode, activated! Just balance it with proper rest. "][Math.floor(Math.random() * 3)];
    }

    // Day-specific encouragement
    const dayMessages = [
      "Fresh start to the week - let's make it count!",
      "An orange friend of mine hates Mondays, but we'll conquer the MCAT anyway!",
      "Tuesday's momentum can carry you through the week.",
      "Midweek already? You're making great progress!",
      "Weekend's in sight, but stay focused on your goals.",
      "Last push before the weekend - you've got this!",
      "Weekend warrior mode: ON. Your dedication is impressive!"
    ];
    message += dayMessages[day] + " ";

    // MCAT-specific encouragement
    const mcatMessages = [
      "Every study session brings you one step closer to MCAT success.",
      "Remember, consistent effort is key to mastering the MCAT.",
      "The MCAT may be tough, but you're tougher!",
      "Keep pushing - your future patients will thank you for this hard work.",
      "Tackling the MCAT is a marathon, not a sprint. Pace yourself!",
      "Each question you practice sharpens your MCAT skills.",
      "Your dedication to MCAT prep today will pay off in your future medical career."
    ];
    message += mcatMessages[Math.floor(Math.random() * mcatMessages.length)] + " ";

    // Closing encouragement
    const closingMessages = [
      "Let's gooooooo!",
      "I'm here to help you ace this test. Ready to rumble?",
      "Together, we'll rock your MCAT prep one step at a time.",
      "Remember, every bit of effort brings you closer to your goals.",
      "You've got this!"
    ];
    message += closingMessages[Math.floor(Math.random() * closingMessages.length)];

    return message + "\n\n";
  };

  return (
    <div className="h-full flex flex-col p-3" style={{ color: 'var(--theme-text-color)' }}>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="md:col-span-5 mr mb-4">
          <div 
            className="h-[calc(100vh-8.3rem)] rounded-[10px] p-4 flex flex-col relative" 
            style={{
              backgroundImage: `linear-gradient(var(--theme-gradient-start), var(--theme-gradient-end)), var(--theme-interface-image)`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundColor: 'var(--theme-mainbox-color)',
              boxShadow: 'var(--theme-box-shadow)',
              color: 'var(--theme-text-color)'
            }}
          >
            <div className="flex mb-4">
              <div className="w-[8rem] h-[8rem] bg-transparent border-2 border-[--theme-border-color] rounded-lg mr-4 flex-shrink-0 overflow-hidden relative">
                <ChatBotWidgetNoChatBot
                  reportData={reportData}
                  onResponse={handleAssistantResponse}
                />
              </div>
              {assistantMessage && (
                <div className="ml-4 max-w-xs bg-blue-500 text-white rounded-lg p-3 relative animate-fadeIn">
                  <div className="typing-animation">{assistantMessage}</div>
                  <div className="absolute left-0 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-r-8 border-b-8 border-transparent border-r-blue-500"></div>
                  <button
                    onClick={closeOverlay}
                    className="absolute top-1 right-1 text-white hover:text-gray-200"
                    aria-label="Close"
                  >
                    &#10005;
                  </button>
                </div>
              )}
              <div className="flex-grow p-2 bg-transparent border-2 rounded-lg" style={{ color: 'var(--theme-text-color)', borderColor: 'var(--theme-border-color)' }}>
                <div className="flex justify-between items-center h-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-16">
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image src="/game-components/PixelHeart.png" alt="Heart" layout="fill" objectFit="contain" />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">{reportData ? `${reportData.averageTestScore.toFixed(2)}%` : 'N/A'}</span>
                    <span className="text-[2vw] sm:text-xs">score</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image src="/game-components/PixelWatch.png" alt="Watch" layout="fill" objectFit="contain" />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">{reportData ? `${reportData.averageTimePerTest.toFixed(2)}s` : 'N/A'}</span>
                    <span className="text-[2vw] sm:text-xs">avg time</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image src="/game-components/PixelCupcake.png" alt="Diamond" layout="fill" objectFit="contain" />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">{reportData ? reportData.userScore : 'N/A'}</span>
                    <span className="text-[2vw] sm:text-xs">coins</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image src="/game-components/PixelBook.png" alt="Flex" layout="fill" objectFit="contain" />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">{reportData ? `${reportData.testsCompleted}/${reportData.totalTestsTaken}` : 'N/A'}</span>
                    <span className="text-[2vw] sm:text-xs">tests</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <pre className="font-mono text-m leading-[20px] tracking-[0.4px] whitespace-pre-wrap flex-1 mt-4 ml-2" style={{ color: 'var(--theme-text-color)' }}>
                {welcomeAndTestMessage}
              </pre>
              {welcomeComplete && tests.length > 0 && (
                <div className="flex items-center mt-6 ml-2">
                  <Link href={`/test/testquestions?id=${tests[0].id}`} className="text-blue-500 transition-colors duration-200 flex items-center">
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
                      className="animate-pulse"
                      style={{ 
                        color: 'var(--theme-text-color)',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-hover-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-color)'}
                    >
                      {tests && tests.length > 0 ? tests[0].title : "Loading first test..."}
                    </span>
                  </Link>
                </div>
              )}
              <div className="absolute bottom-4 right-4">
                <Link href="/doctorsoffice">
                  <span 
                    className="animate-pulse text-lg cursor-pointer"
                    style={{ 
                      color: 'var(--theme-text-color)',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-hover-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-text-color)'}
                  >
                    Doctor&apos;s Office -&gt;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div 
            className="h-[calc(100vh-8.3rem)] overflow-y-auto rounded-lg p-4 bg-[#001226]"
            style={{
              backgroundImage: `linear-gradient(var(--theme-gradient-start), var(--theme-gradient-end)), var(--theme-interface-image)`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundColor: 'var(--theme-mainbox-color)',
              boxShadow: 'var(--theme-box-shadow)',
              color: 'var(--theme-text-color)'
            }}
          >
            <h3 className="text-m font-semibold mt-3 mb-3 text-center font-mono" style={{ color: 'var(--theme-text-color)' }}>CARs Tests</h3>
            <Tabs defaultValue="past" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent">
                <TabsTrigger value="past">Past Tests</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
              <TabsContent value="past">
                <TestList items={userTests} type="past" loading={loading} />
              </TabsContent>
              <TabsContent value="upcoming">
                <TestList items={tests} type="upcoming" loading={loading} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Exams;
