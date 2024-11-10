import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Test, UserTest } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TestListProps {
  items: (Test | UserTest)[];
  type: "upcoming" | "past";
  loading?: boolean;
  testsAvailableToday?: number; // Changed to number
  testsCompletedToday?: number;
}

const getDifficultyColor = (difficulty: number) => {
  if (difficulty < 3) return "text-green-500";
  if (difficulty >= 3 && difficulty < 4) return "text-yellow-500";
  return "text-red-500";
};

const getScoreColor = (score: number | undefined) => {
  if (!score) return "text-gray-500";
  if (score < 60) return "text-red-500";
  if (score >= 60 && score < 80) return "text-yellow-500";
  return "text-green-500";
};

const TestList: React.FC<TestListProps> = ({
  items,
  type,
  loading = false,
  testsAvailableToday = 2,
  testsCompletedToday = 0,
}) => {
  const { theme } = useTheme();
  const noTestsAvailable = testsCompletedToday >= testsAvailableToday;
  const [searchQuery, setSearchQuery] = useState("");

  const isUserTest = (item: Test | UserTest): item is UserTest => {
    return "test" in item;
  };

  const filteredItems = items.filter((item) => {
    const title =
      type === "past" && "test" in item && isUserTest(item)
        ? (item as UserTest).test?.title
        : (item as Test).title;
    
    if (!title) return false;
    
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="w-full space-y-3">
        {[...Array(10)].map((_, index) => (
          <Skeleton
            key={index}
            className="w-full h-[42px] rounded-[15px]"
            style={{ backgroundColor: "var(--theme-border-color)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-center mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tests..."
          className={`border rounded-md p-2 w-full theme-box theme-${theme}`}
          style={{
            backgroundColor: "var(--theme-background-color)",
            color: "var(--theme-text-color)",
            borderColor: "var(--theme-border-color)",
          }}
        />
      </div>

      {type === "upcoming" && noTestsAvailable && (
        <div className="text-center text-sm text-gray-500 mb-4">
          {`You've completed ${testsCompletedToday} out of ${testsAvailableToday} tests today. Check back tomorrow for more tests!`}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center text-sm text-gray-500 mb-4">
          No results found for &quot;{searchQuery}&quot;
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="w-full">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={
                      type === "past" && "score" in item
                        ? `/user-test/${item.id}`
                        : `/test/testquestions?id=${item.id}`
                    }
                    className={`${
                      type === "upcoming" && noTestsAvailable
                        ? "pointer-events-none text-gray-500"
                        : ""
                    }`}
                  >
                    <div
                      className={`flex justify-between items-center bg-transparent border-2 opacity-100 rounded-[0.9375rem] px-3 py-2.5 hover:opacity-100 transition-all duration-300 group w-full h-[4rem] hover:[background-color:var(--theme-hover-color)] theme-box ${theme} ${
                        type === "upcoming" && noTestsAvailable
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      style={{
                        borderColor: "var(--theme-border-color)",
                        color: "var(--theme-text-color)",
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 flex-shrink-0 relative">
                          <Image
                            className="theme-svg"
                            src={"/computer.svg"}
                            layout="fill"
                            objectFit="contain"
                            alt="icon"
                          />
                        </div>
                        <h2 className="text-sm xl:text-base font-normal group-hover:[color:var(--theme-hover-text)] truncate">
                          {type === "past" && "test" in item
                            ? item.test?.title
                            : "title" in item
                            ? item.title
                            : "Untitled"}
                        </h2>
                      </div>
                      <div className="flex-shrink-0 ml-2 flex items-center">
                        <h2
                          className={`text-sm xl:text-base font-medium whitespace-nowrap ${
                            type === "past" && "score" in item
                              ? getScoreColor(item.score)
                              : "difficulty" in item
                              ? getDifficultyColor(item.difficulty as number)
                              : ""
                          }`}
                        >
                          {type === "past" && "score" in item
                            ? item.score !== null && item.score !== undefined
                              ? `${Math.round(item.score)}%`
                              : "N/A"
                            : "difficulty" in item
                            ? `Lvl ${item.difficulty}`
                            : "N/A"}
                        </h2>
                        {type === "past" &&
                          "reviewedResponses" in item &&
                          "totalResponses" in item &&
                          item.reviewedResponses === item.totalResponses && (
                            <CheckCircle className="w-4 h-4 ml-1 text-green-500" />
                          )}
                      </div>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  {type === "past" && "score" in item ? (
                    <div>
                      <p>Taken: {new Date(item.startedAt).toLocaleString()}</p>
                      <p>
                        Score:{" "}
                        {item.score !== null && item.score !== undefined
                          ? `${Math.round(item.score)}%`
                          : "N/A"}
                      </p>
                      <p>
                        Questions Reviewed: {item.reviewedResponses || 0}/
                        {item.totalResponses || 0}
                      </p>
                    </div>
                  ) : type === "upcoming" && noTestsAvailable ? (
                    <p>{`You've reached the daily test limit of {testsAvailableToday}. Check back tomorrow!`}</p>
                  ) : (
                    <p>
                      Upcoming test ({testsCompletedToday + 1}/
                      {testsAvailableToday} for today)
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))
      )}
    </div>
  );
};

export default TestList;
