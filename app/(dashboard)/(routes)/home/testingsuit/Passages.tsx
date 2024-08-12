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

interface TestListingProps {
  tests: Test[];
}

const truncateTitle = (title: string, maxLength: number) => {
  if (title.length > maxLength) {
    return `${title.substring(0, maxLength)}...`;
  }
  return title;
};

const Passages: React.FC<TestListingProps> = ({ tests }) => {
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
              <ResponsiveContainer
                width="100%"
                height={350}
                className="bg-[#021226] p-2 border-4 border-[#007AFF]"
                style={{
                  boxShadow:
                    "rgba(61, 165, 233, 0.25) 0px 14px 28px, rgba(61, 165, 233, 0.22) 0px 10px 10px",
                }}
              >
                <LineChart
                  width={500}
                  height={350}
                  data={data}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
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
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-10 h-[350px] overflow-auto p-2">
              {tests.map((test) => (
                <Link
                  key={test.id}
                  href={`/test/testquestions?id=${test.id}`}
                  className="text-lg font-medium mb-2"
                >
                  <div
                    className="bg-[#021226] border-4 text-center border-[#007AFF] text-md text-white rounded-[30px] px-4 py-2 w-full"
                    style={{
                      boxShadow:
                        "rgba(61, 165, 233, 0.25) 0px 54px 55px, rgba(61, 165, 233, 0.12) 0px -12px 30px, rgba(61, 165, 233, 0.12) 0px 4px 6px, rgba(61, 165, 233, 0.17) 0px 12px 13px, rgba(61, 165, 233, 0.09) 0px -3px 5px",
                    }}
                  >
                    <div className="flex justify-center">
                      <div>
                        <h2 className="text-md text-[#3da5e9] font-medium mb-2">
                          {truncateTitle(test.title, 5)}
                        </h2>
                      </div>
                    </div>
                    <div>
                      <h2
                        className={`text-md font-medium mb-2 ${getPercentageColor(
                          70
                        )}`}
                      >
                        {(70.0).toFixed(2)}%
                      </h2>
                    </div>
                    <div className="flex justify-center">
                      <div>
                        <h2 className="text-sm mb-2 text-white">10 min avg</h2>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Passages;
