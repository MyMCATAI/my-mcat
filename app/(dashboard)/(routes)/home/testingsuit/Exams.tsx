import React from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
import Image from "next/image";

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
  const getPercentageColor = (percentage: number) => {
    if (percentage < 50) return "text-red-500";
    if (percentage >= 50 && percentage <= 80) return "text-yellow-500";
    return "text-green-500";
  };
  console.log("test", tests);
  return (
    <div className="p-8 text-white justify-center">
      <div className="max-w-screen-xl w-full">
        <div className="rounded-[30px]">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-5">
            <div className="md:col-span-2">
              <div className="h-[400px] gradientbg rounded-[30px] p-4">
                <div className="flex justify-between mt-[-60px]">
                  <div className="">
                    <Image
                      className="mt-1"
                      src={"/summarycat.svg"}
                      width={100}
                      height={100}
                      alt="icon"
                    />
                  </div>
                  <div className=" flex justify-end items-end mb-2">
                    <p className="text-[#00C2FF] text-sm">
                      kalypso’s testing summary
                    </p>
                  </div>
                </div>
                <div className="h-[330px] bg-[#0E2247] rounded-[10px]  p-4 flex justify-center items-center">
                  <p className="text-white text-xs leading-[20px] tracking-[0.4px] ">
                    Hey-o! Congratulations on your score increase. We’re seeing
                    a great trend with your recent progress, but your last full
                    length shows that you tend to run out of time on C/P and
                    CARs. For your next exam, we suggest focus on keeping pace!
                    It took you 6 minutes to do question 14 on FL3 when you
                    could’ve flagged and moved on. According to your reports,
                    you also tend to guess a lot -- seems like you could benefit
                    from more content review!
                  </p>
                </div>
              </div>
            </div>
            <div className=" md:col-span-3  pb-10 h-[385px] overflow-auto p-2 mt-2 rounded-lg overflow-hidden">
              {tests.map((test) => (
                <div key={test.id} className="text-lg font-medium mb-2">
                  <div
                    className="flex justify-between bg-[#021226]  mb-4 text-center text-md text-white rounded-[15px] px-4 py-2 w-full"
                    style={{
                      boxShadow:
                        "rgba(61, 165, 233, 0.25) 0px 54px 55px, rgba(61, 165, 233, 0.12) 0px -12px 30px, rgba(61, 165, 233, 0.12) 0px 4px 6px, rgba(61, 165, 233, 0.17) 0px 12px 13px, rgba(61, 165, 233, 0.09) 0px -3px 5px",
                    }}
                  >
                    <div className="flex justify-center">
                      <div className="flex gap-1">
                        <Link href="#">
                          <Image
                            className="mt-1"
                            src={"/computer.svg"}
                            width={34}
                            height={34}
                            alt="icon"
                          />
                        </Link>
                        <Link href="#">
                          <Image
                            className="mt-1"
                            src={"/verticalbar.svg"}
                            width={34}
                            height={34}
                            alt="icon"
                          />
                        </Link>
                        <Link href="#">
                          <Image
                            className="mt-1"
                            src={"/clipboard.svg"}
                            width={34}
                            height={34}
                            alt="icon"
                          />
                        </Link>
                      </div>
                      <div>
                        <h2 className="text-md text-[#ffffff] font-normal  m-2">
                          {truncateTitle(test.title, 10)}
                        </h2>
                      </div>
                    </div>
                    <div>
                      <h2
                        className={`text-md font-medium mb-2 ${getPercentageColor(
                          512
                        )}`}
                      >
                        512
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exams;
