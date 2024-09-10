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

const data = [
  { name: "Page A", uv: 4000 },
  { name: "Page B", uv: 3000 },
  { name: "Page C", uv: 2000 },
  { name: "Page D" },
  { name: "Page E", uv: 1890 },
  { name: "Page F", uv: 2390 },
  { name: "Page G", uv: 3490 },
];
import { ReportData, Test, UserTest } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TestList from "./TestList";

interface TestListingProps {
  tests: Test[];
}


const truncateTitle = (title: string, maxLength: number) => {
  if (title.length > maxLength) {
    return `${title.substring(0, maxLength)}...`;
  }
  return title;
};


const Exams: React.FC<TestListingProps> = ({ tests }) => {
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [profileImage, setProfileImage] = useState("/kyle.png");
  const [userTests, setUserTests] = useState<UserTest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const examDescription = "Today, you're going to be doing the x exam. This is a tough passage & prynce will add a custom description here, with a lot of RBT/RWT/CMP.";

  const getPercentageColor = (percentage: number) => {
    if (percentage < 50) return "text-red-500";
    if (percentage >= 50 && percentage <= 80) return "text-yellow-500";
    return "text-green-500";
  };

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
    setTypedText('');
    setIsTypingComplete(false);

    let index = 0;
    const typingTimer = setInterval(() => {
      setTypedText(prev => examDescription.slice(0, prev.length + 1));
      index++;
      if (index > examDescription.length) {
        clearInterval(typingTimer);
        setIsTypingComplete(true);
      }
    }, 15);

    return () => {
      clearInterval(typingTimer);
    };
  }, []);

  useEffect(() => {
    const fetchUserTests = async () => {
      try {
        const response = await fetch('/api/user-test');
        if (!response.ok) throw new Error('Failed to fetch user tests');
        const data = await response.json();
        console.log(data);
        setUserTests(data.userTests);
      } catch (err) {
        setError('Error fetching user tests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };


    fetchUserTests();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
              <div className="w-[8rem] h-[8rem] bg-gray-300 rounded-lg mr-4 flex-shrink-0 overflow-hidden">
                <label htmlFor="profile-upload" className="cursor-pointer block w-full h-full">
                  <Image
                    src={profileImage}
                    alt="Upload profile picture"
                    width={84}
                    height={84}
                    className="object-cover w-full h-full"
                  />
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-grow p-2 bg-transparent border-2 rounded-lg" style={{ color: 'var(--theme-text-color)', borderColor: 'var(--theme-border-color)' }}>
                <div className="flex justify-between items-center h-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-16">
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image src="/game-components/PixelHeart.png" alt="Heart" layout="fill" objectFit="contain" className="animate-float" />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">{reportData ? `${reportData.averageTestScore.toFixed(2)}%` : 'N/A'}</span>
                    <span className="text-[2vw] sm:text-xs">score</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image src="/game-components/PixelWatch.png" alt="Watch" layout="fill" objectFit="contain" className="animate-float animation-delay-200" />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">{reportData ? `${reportData.averageTimePerQuestion.toFixed(2)}s` : 'N/A'}</span>
                    <span className="text-[2vw] sm:text-xs">avg time</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image src="/game-components/PixelCupcake.png" alt="Diamond" layout="fill" objectFit="contain" className="animate-float animation-delay-400" />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">{reportData ? reportData.totalQuestionsAnswered : 'N/A'}</span>
                    <span className="text-[2vw] sm:text-xs">questions</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-[5vw] h-[5vw] min-w-[30px] min-h-[30px] max-w-[2.5rem] max-h-[2.5rem] relative">
                      <Image src="/game-components/PixelBook.png" alt="Flex" layout="fill" objectFit="contain" className="animate-float animation-delay-600" />
                    </div>
                    <span className="text-[2vw] sm:text-xs mt-1">{reportData ? `${reportData.testsCompleted}/${reportData.totalTestsTaken}` : 'N/A'}</span>
                    <span className="text-[2vw] sm:text-xs">tests</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <pre className="font-mono text-m leading-[20px] tracking-[0.4px] whitespace-pre-wrap flex-1 mt-4 ml-2" style={{ color: 'var(--theme-text-color)' }}>
                {typedText}
              </pre>
              {isTypingComplete && (
                <div className="flex items-center mt-6 ml-2">
                  <Link href="/test/testquestions" className="text-blue-500 hover:text-blue-200 transition-colors duration-200 flex items-center">
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
                      <div className="w-7 h-7 relative theme-box">
                        <Image
                          src="/verticalbar.svg"
                          layout="fill"
                          objectFit="contain"
                          alt="Vertical bar icon"
                          className="theme-svg"
                        />
                      </div>
                    </div>
                    <span style={{ color: 'var(--theme-text-color)' }}>
                      {tests && tests.length > 0 ? (
                        <Link href={`/test/testquestions?id=${tests[0].id}`}>
                          Click to begin
                        </Link>
                      ) : (
                        "No tests available."
                      )}
                    </span>
                  </Link>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 right-4 flex items-center">
              <span className="mr-2 text-sm animate-pulse" style={{ color: 'var(--theme-text-color)' }}>Next Passage</span>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
