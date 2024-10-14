import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Test, UserTest, Passage } from "@/types"; // Ensure Passage is imported
import { useTheme } from "next-themes";
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
  const [hasSearched, setHasSearched] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the dropdown and not on the search input/button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, searchInputRef]);

  // State for search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Test[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery) return;

    setHasSearched(true);
    setLoadingResults(true);

    try {
      const response = await fetch(
        `/api/search-tests?search=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch tests");
      }
      if (response === null) {
        throw new Error("No test by that name");
      }
      const results = await response.json();
      setSearchResults(results.tests);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
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
  // Filter search results based on the type
  const filteredSearchResults = searchResults.filter((result: Test) => {
    const userTests = result.userTests || [];
    if (type === "upcoming") {
      // Return tests that have not been taken by the user
      return userTests.every(
        (userTest: UserTest) => userTest.finishedAt === null
      );
    } else if (type === "past") {
      // Return tests that have been taken by the user
      return userTests.some(
        (userTest: UserTest) => userTest.finishedAt !== null
      );
    }
    return false;
  });

  return (
    <div className="w-full space-y-3">
      {/* Search Input and Button */}
      <div className="flex items-center mb-4">
        {isSearchVisible ? (
          <>
            <input
              // ref={searchInputRef} // Attach ref to the search input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tests..."
              className="border rounded-l-md p-2 w-full"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              className="bg-blue-500 text-white rounded-r-md px-4 hover:bg-blue-600 transition"
            >
              Search
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsSearchVisible(true)}
            className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition"
          >
            Search
          </button>
        )}
      </div>

      {isSearchVisible && (
        <div
          className="absolute bg-white border rounded-md shadow-lg z-10 w-full"
          // ref={dropdownRef}
        >
          {loadingResults ? (
            <div className="p-2">Loading...</div>
          ) : hasSearched && filteredSearchResults.length === 0 ? (
            <div className="p-2">Not found</div>
          ) : (
            filteredSearchResults.map((result: Test) => {
              // Filter userTests based on the type
              const filteredUserTests = result.userTests?.filter(
                (userTest: UserTest) => {
                  return type === "upcoming"
                    ? userTest.finishedAt === null
                    : userTest.finishedAt !== null;
                }
              );

              return (
                // <Link
                //   key={result.id}
                //   href={`/test/testquestions?id=${result.id}`}
                // >
                //   <div className="p-2 hover:bg-gray-200 cursor-pointer">
                //     <h3 className="font-semibold">
                //       {result.title || "Untitled"}
                //     </h3>
                //   </div>
                // </Link>
                <Link
                  key={result.id}
                  href={`/test/testquestions?id=${result.id}`}
                >
                  <div
                    className="flex justify-between items-center bg-transparent border-2 opacity-100 rounded-[0.9375rem] px-3 py-2.5 hover:opacity-100 transition-all duration-300 group w-full h-[4rem] hover:[background-color:var(--theme-hover-color)] theme-box"
                    style={{
                      borderColor: "var(--theme-border-color)",
                      color: "var(--theme-text-color)",
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-6 h-6 flex-shrink-0 relative">
                        <Image
                          className="theme-svg"
                          src={"/computer.svg"} // Replace with the appropriate icon if needed
                          layout="fill"
                          objectFit="contain"
                          alt="icon"
                        />
                      </div>
                      <h2 className="text-sm xl:text-base font-normal group-hover:[color:var(--theme-hover-text)] truncate">
                        {result.title || "Untitled"}
                      </h2>
                    </div>
                    {type === "past" &&
                      filteredUserTests &&
                      filteredUserTests.length > 0 && (
                        <div className="flex-shrink-0 ml-2 flex items-center">
                          <h2 className="text-sm xl:text-base font-medium whitespace-nowrap text-red-500">
                            {filteredUserTests[0].score !== null &&
                            filteredUserTests[0].score !== undefined
                              ? `${Math.round(filteredUserTests[0].score)}%`
                              : "N/A"}
                          </h2>
                        </div>
                      )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {type === "upcoming" && noTestsAvailable && (
        <div className="text-center text-sm text-gray-500 mb-4">
          {`You've completed ${testsCompletedToday} out of ${testsAvailableToday} tests today. Check back tomorrow for more tests!`}
        </div>
      )}

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
                  className={
                    type === "upcoming" && noTestsAvailable
                      ? "pointer-events-none"
                      : ""
                  }
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
      ))}
      {type === "upcoming" && !noTestsAvailable && (
        <div
          className="flex items-center justify-center mt-3 text-sm cursor-pointer text-muted-foreground hover:text-primary transition-colors"
          onClick={handleUpdateKnowledgeProfile}
        ></div>
      )}
    </div>
  );
};

export default TestList;
