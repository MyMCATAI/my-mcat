// components/TestListing.tsx
import React from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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
import { Passage } from "@/types";

interface TestListingProps {
  passages: Passage[];
}

const TestListing: React.FC<TestListingProps> = ({ passages }) => {
  const { user } = useUser();

  const items = [
    {
      id: 1,
      title: "CARs: Otherkin, Kanye West, and The Walking Dead.",
      percentage: 45,
      attemptedQuestions: 6,
      totalQuestions: 15,
    },
    {
      id: 2,
      title: "CARs: Project 2025, Nero & His Femboy, Machine Learning",
      percentage: 56,
      attemptedQuestions: 11,
      totalQuestions: 15,
    },
    {
      id: 3,
      title:
        "CARs: Materialistic Darwinism, Pow-chicka-wow-Wow, and Dante’s Inferno.",
      percentage: 85,
      attemptedQuestions: 13,
      totalQuestions: 15,
    },
  ];

  const getPercentageColor = (percentage: number) => {
    if (percentage < 50) return "text-red-500";
    if (percentage >= 50 && percentage <= 80) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="bg-[#001326] min-h-screen p-8 text-white flex justify-center">
      <div className="max-w-screen-xl w-full">
        <div className="bg-[#021226] p-6 rounded-[30px]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">
              Welcome {user?.firstName ?? ""} to the Diagnostic Quiz
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 mt-5">
            <div>
              <ResponsiveContainer
                width="100%"
                height={340}
                className={"bg-sky-500 p-2 rounded-lg"}
              >
                <LineChart
                  width={500}
                  height={200}
                  data={data}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: "white" }} />
                  <YAxis tick={{ fill: "white" }} />
                  <Tooltip contentStyle={{ backgroundColor: "black" }} />
                  <Line
                    connectNulls
                    type="monotone"
                    dataKey="uv"
                    stroke="#ffffff"
                    fill="#ffffff"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="w-full aspect-video">
                <iframe
                  className="w-full h-full rounded-[20px]"
                  src="https://www.youtube.com/embed/njEqnfyzYjI?si=hShf98dN5kOMwAU2"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          <div className="bg-[#0e2247] py-2 text-center my-10 rounded-[20px]">
            <h1 className="text-2xl font-bold text-white my-1 ">
              The Free Passage Bundle
            </h1>
            <h1 className="text-md font-medium text-white my-1 ">
              Codename: Kibble
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5 pb-10">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#021226] border-2 border-sky-500 text-md text-white rounded-[30px] shadow-md p-4 w-full"
                style={{ boxShadow: "rgba(61, 165, 233,0.4) 0px 7px 29px 0px" }}
              >
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-md text-[#3da5e9] font-medium mb-2">
                      CARS - Set {item.id}
                    </h2>
                  </div>
                </div>

                <div className="min-h-[80px]">
                  <Link
                    href="/test/testquestions"
                    className="text-lg font-medium mb-2"
                  >
                    {item.title}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-md font-medium mb-2 text-gray-400">
                      July 22
                    </h2>
                  </div>
                  <div>
                    <h2
                      className={`text-md font-medium mb-2 ${getPercentageColor(
                        (item.attemptedQuestions / item.totalQuestions) * 100
                      )}`}
                    >
                      {(
                        (item.attemptedQuestions / item.totalQuestions) *
                        100
                      ).toFixed(2)}
                      %
                    </h2>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestListing;