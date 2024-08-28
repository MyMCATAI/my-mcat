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
import { Test } from "@/types";

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

  const examDescription = "Today, you're going to be doing the x exam. This is a tough passage & prynce will add a custom description here, with a lot of RBT/RWT/CMP.";

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

  const getPercentageColor = (percentage: number) => {
    if (percentage < 50) return "text-red-500";
    if (percentage >= 50 && percentage <= 80) return "text-yellow-500";
    return "text-green-500";
  };
  console.log("test", tests);

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
    <div className="h-full flex flex-col p-3 text-white">
      <div className="flex-grow grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="md:col-span-5 mr mb-4">
          <div 
            className="h-full bg-[#001226] rounded-[10px] p-4 flex flex-col relative" 
            style={{
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 18, 38, 0.9)), url('/circuitpattern2.png')",
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              boxShadow: '0 0 8px 2px rgba(0, 123, 255, 0.5), inset 0 0 15px rgba(0, 0, 246, 0.7)'
            }}
          >
            <div className="flex mb-4">
              <div className="w-[84px] h-[84px] bg-gray-300 rounded-lg mr-4 flex-shrink-0 overflow-hidden">
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
              <div className="flex-grow p-2 bg-transparent text-white border-blue-500 border rounded-lg">
                <div className="flex justify-center items-center h-full space-x-12">
                  <div className="flex flex-col items-center">
                    <Image src="/game-components/PixelHeart.png" alt="Heart" width={30} height={30} className="animate-float" />
                    <span className="text-xs mt-1">80%</span>
                    <span className="text-xs">score</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image src="/game-components/PixelWatch.png" alt="Watch" width={30} height={30} className="animate-float animation-delay-200" />
                    <span className="text-xs mt-1">15:30</span>
                    <span className="text-xs">time</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image src="/game-components/PixelDiamond.png" alt="Diamond" width={30} height={30} className="animate-float animation-delay-400" />
                    <span className="text-xs mt-1">50</span>
                    <span className="text-xs">reward</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image src="/game-components/PixelFlex.png" alt="Flex" width={30} height={30} className="animate-float animation-delay-600" />
                    <span className="text-xs mt-1">1/52</span>
                    <span className="text-xs">passages</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <pre className="text-white font-mono text-m leading-[20px] tracking-[0.4px] whitespace-pre-wrap flex-1 mt-4 ml-2">
                {typedText}
              </pre>
              {isTypingComplete && (
                <div className="flex items-center mt-6 ml-2">
                  <Link href="/test/testquestions" className="text-blue-500 hover:text-blue-200 transition-colors duration-200 flex items-center">
                    <div className="flex items-center mr-4">
                      <div className="group mr-1">
                        <Image
                          src="/computer.svg"
                          width={28}
                          height={28}
                          alt="Computer icon"
                          className="transition-colors duration-200 group-hover:filter group-hover:brightness-0 group-hover:invert-[39%] group-hover:sepia-[98%] group-hover:saturate-[2138%] group-hover:hue-rotate-[190deg]"
                        />
                      </div>
                      <div className="group">
                        <Image
                          src="/verticalbar.svg"
                          width={28}
                          height={28}
                          alt="Vertical bar icon"
                          className="transition-colors duration-200 group-hover:filter group-hover:brightness-0 group-hover:invert-[39%] group-hover:sepia-[98%] group-hover:saturate-[2138%] group-hover:hue-rotate-[190deg]"
                        />
                      </div>
                    </div>
                    <span>Click to begin.</span>
                  </Link>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 right-4 flex items-center">
              <span className="text-white mr-2 text-sm animate-pulse">Next Passage</span>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div 
            className="h-[625px] overflow-y-auto rounded-lg p-4 bg-[#001226]"
            style={{
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 18, 38, 0.7)), url('/circuitpattern2.png')",
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              boxShadow: '0 0 8px 2px rgba(0, 123, 255, 0.5), inset 0 0 15px rgba(0, 0, 246, 0.7)'
            }}
          >
            <h3 className="text-white text-m font-semibold mt-3 mb-2 text-center font-mono">Upcoming Passages</h3>
            {tests.map((test) => (
              <div key={test.id} className="mb-4 mt-4">
                <div
                  className="flex justify-between items-center bg-transparent border border-blue-500 opacity-100 rounded-[15px] px-3 py-2 hover:bg-white hover:opacity-100 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <Link href={`/test/testquestions?id=${test.id}`}>
                        <Image
                          className="mt-1 group-hover:filter group-hover:invert"
                          src={"/computer.svg"}
                          width={28}
                          height={28}
                          alt="icon"
                        />
                      </Link>
                      <Link href={`/test/testquestions?id=${test.id}`}>
                        <Image
                          className="mt-1 group-hover:filter group-hover:invert"
                          src={"/verticalbar.svg"}
                          width={28}
                          height={28}
                          alt="icon"
                        />
                      </Link>
                    </div>
                    <h2 className="text-sm text-white font-normal group-hover:text-black">
                      {truncateTitle(test.title, 10)}
                    </h2>
                  </div>
                  <h2 className={`text-md font-medium ${getPercentageColor(500)} group-hover:text-black`}>
                    0%
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;
