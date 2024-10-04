import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Test, UserTest } from "@/types";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { handleUpdateKnowledgeProfile } from "@/components/util/apiHandlers";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle } from "lucide-react";
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
}

const truncateTitle = (title: string | undefined, maxLength: number) => {
  if (!title) return "";
  if (title.length > maxLength) {
    return `${title.substring(0, maxLength)}...`;
  }
  return title;
};

const getReviewProgressColor = (
  reviewedResponses: number,
  totalResponses: number
) => {
  const percentage = (reviewedResponses / totalResponses) * 100;
  if (percentage < 50) return "text-red-500";
  if (percentage >= 50 && percentage <= 80) return "text-yellow-500";
  return "text-green-500";
};

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
      {items.map((item) => (
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
                >
                  <div
                    className={`flex justify-between items-center bg-transparent border-2 opacity-100 rounded-[0.9375rem] px-3 py-2.5 hover:opacity-100 transition-all duration-300 group w-full h-[4rem] hover:[background-color:var(--theme-hover-color)] theme-box ${theme}`}
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
                          ? item.test.title
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
                    <p>Score: {item.score !== null && item.score !== undefined ? `${Math.round(item.score)}%` : "N/A"}</p>
                    <p>Questions Reviewed: {item.reviewedResponses || 0}/{item.totalResponses || 0}</p>
                  </div>
                ) : (
                  <p>Upcoming test</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
      {type === "upcoming" && (
        <div
          className="flex items-center justify-center mt-3 text-sm cursor-pointer text-muted-foreground hover:text-primary transition-colors"
          onClick={handleUpdateKnowledgeProfile}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          <span>Regenerate</span>
        </div>
      )}
    </div>
  );
};

export default TestList;
