import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";

interface TestListProps {
  items: (Test | UserTest)[];
  type: "upcoming" | "past";
  loading?: boolean;
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
}) => {
  const { theme } = useTheme();
  const [userScore, setUserScore] = useState<number | null>(null);
  const noTestsAvailable = userScore === 0;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserScore = async () => {
      try {
        const response = await fetch("/api/user-info");
        if (response.ok) {
          const data = await response.json();
          setUserScore(data.score);
        }
      } catch (err) {
        console.error("Error fetching user score:", err);
      }
    };

    fetchUserScore();
  }, []);

  const isUserTest = (item: Test | UserTest): item is UserTest => {
    return "test" in item;
  };

  const getTestTitle = (item: Test | UserTest): string => {
    if (type === "past" && "test" in item && isUserTest(item)) {
      return item.test?.title?.trim() || "Untitled";
    }
    return ("title" in item ? item.title?.trim() : "") || "Untitled";
  };

  const filteredItems =
    searchQuery.trim() === ""
      ? items
      : items.filter((item) => {
          const title = getTestTitle(item);
          return title.toLowerCase().includes(searchQuery.toLowerCase());
        });

  const getNoTestsMessage = () => {
    if (userScore === 0) {
      return "You need coins to take tests. Visit the Doctor's Office to earn more coins!";
    }
    return `Check back tomorrow for more tests!`;
  };

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
    <div className="w-full h-full">
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tests..."
          className={`border rounded-md p-2 w-full theme-box theme-${theme}`}
          style={{
            backgroundColor: "transparent",
            color: "var(--theme-text-color)",
            borderColor: "var(--theme-border-color)",
          }}
        />
      </div>

      <div 
        className="space-y-3 overflow-y-auto h-[calc(100vh-22rem)] px-4 pt-2"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          borderTop: '0.0925rem solid var(--theme-border-color)',
          borderBottom: '0.0925rem solid var(--theme-border-color)',
        }}
      >
        {type === "upcoming" && noTestsAvailable && (
          <div className="text-center text-sm text-gray-500 mb-4">
            {getNoTestsMessage()}
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center text-sm text-gray-500 mb-4">
            No results found for &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="w-full">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {type === "upcoming" && noTestsAvailable ? (
                        <div className="pointer-events-none">
                          <div
                            className="flex justify-between items-center bg-transparent rounded-lg px-3 py-2.5 cursor-not-allowed w-full h-16 opacity-50 transition-all duration-300"
                            style={{
                              backgroundColor: "var(--theme-adaptive-tutoring-color)",
                              color: "var(--theme-text-color)",
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-6 h-6 flex-shrink-0 relative">
                                <Image
                                  className="theme-svg opacity-50"
                                  src={"/computer.svg"}
                                  layout="fill"
                                  objectFit="contain"
                                  alt="icon"
                                />
                              </div>
                              <h2 className="text-sm xl:text-base font-normal truncate text-gray-500">
                                {"title" in item ? item.title : "Untitled"}
                              </h2>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              <h2 className="text-sm xl:text-base font-medium whitespace-nowrap text-gray-500">
                                {"difficulty" in item
                                  ? `Lvl ${item.difficulty}`
                                  : "N/A"}
                              </h2>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={
                            type === "past" && "score" in item
                              ? `/user-test/${item.id}`
                              : `/test/testquestions?id=${item.id}`
                          }
                          className="w-full"
                        >
                          <Button 
                            className="w-full" 
                            variant={noTestsAvailable ? "secondary" : "default"}
                            disabled={noTestsAvailable}
                          >
                            <div className="flex justify-between items-center w-full">
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
                                <h2 className="text-sm xl:text-base font-normal truncate">
                                  {getTestTitle(item)}
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
                          </Button>
                        </Link>
                      )}
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
                      ) : type === "upcoming" ? (
                        <p>Upcoming test for today</p>
                      ) : (
                        <p></p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestList;
