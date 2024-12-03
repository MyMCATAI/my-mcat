import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import FilterButton from "@/components/ui/FilterButton";
import Icon from "@/components/ui/icon";
import { RotateCw } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Option {
  id: string;
  label: string;
}

const options: Option[] = [
  // { id: "option1", label: "Can Kalypso ask you questions?" },
  // { id: "option2", label: "Want to change current categories?" },
  // { id: "option3", label: "Update Knowledge Profiles" },
];

const subjects = [
  { 
    name: "Chemistry", 
    icon: "atoms",
    progress: 45, 
    color: "#E6B800" 
  },
  { 
    name: "Biology", 
    icon: "evolution",
    progress: 30, 
    color: "#4CAF50" 
  },
  { 
    name: "Biochemistry", 
    icon: "dna_n_biotechnology",
    progress: 60, 
    color: "#2196F3" 
  },
  { 
    name: "Psychology", 
    icon: "cognition",
    progress: 25, 
    color: "#9C27B0" 
  },
  { 
    name: "Physics", 
    icon: "force",
    progress: 75, 
    color: "#800000" 
  },
  { 
    name: "Sociology", 
    icon: "soconcom",
    progress: 40, 
    color: "#FF5722" 
  }
];

interface ATSSettingContentProps {
  onClose?: () => void;
  checkedCategories: Category[];
  setCheckedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const ATSSettingContent: React.FC<ATSSettingContentProps> = ({
  onClose,
  checkedCategories,
  setCheckedCategories,
}) => {
  const { theme } = useTheme();
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjectFocus, setSubjectFocus] = useState({
    Biochemistry: false,
    Biology: false,
    Physics: false,
    Psychology: false,
    Sociology: false,
  });
  const [kalypsoInterruptions, setKalypsoInterruptions] =
    useState<string>("occasionally");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isUpdatingProfiles, setIsUpdatingProfiles] = useState(false);
  const [completedCategories, setCompletedCategories] = useState<Set<string>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showSubjectFilter, setShowSubjectFilter] = useState(false);
  const [selectedSubjectsForShuffle, setSelectedSubjectsForShuffle] = useState<Set<string>>(
    new Set(subjects.map(subject => subject.name))
  );

  useEffect(() => {
    audioRef.current = new Audio('/levelup.mp3');
  }, []);

  useEffect(() => {
    fetchCategories(searchQuery, selectedSubject, currentPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, currentPage]);

  useEffect(() => {
    // Set window size for confetti
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCategories = async (
    searchQuery: string,
    subject: string,
    page: number
  ) => {
    try {
      setIsLoading(true);
      const url = new URL("/api/category-search", window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("pageSize", "7");

      if (searchQuery) {
        url.searchParams.append("searchQuery", searchQuery);
      }

      if (subject && subject !== "") {
        url.searchParams.append("subject", subject);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Use totalPages directly from the API response
      setTotalPages(data.totalPages);

      // Preserve checked status when setting new categories
      const newCategories = data.items.map((category: Category) => ({
        ...category,
        isChecked: checkedCategories.some(
          (checked) => checked.id === category.id
        ),
      }));

      setCategories(newCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (optionId: string) => {
    setActiveOption(activeOption === optionId ? null : optionId);
  };

  const handleDone = () => {
    if (onClose) onClose();
  };

  // Save checked categories to local storage whenever they change
  const handleCategoryCheck = (categoryId: string) => {
    setCompletedCategories(prev => {
      const newCompleted = new Set(prev);
      if (!newCompleted.has(categoryId)) {
        newCompleted.add(categoryId);
        setShowConfetti(true);
        audioRef.current?.play();
        setTimeout(() => setShowConfetti(false), 3000);
      }
      return newCompleted;
    });
  };

  const handleUpdateKnowledgeProfiles = async () => {
    try {
      setIsUpdatingProfiles(true);
      const response = await fetch("/api/knowledge-profile/update", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to update knowledge profiles");
      }

    } catch (error) {
      console.error("Error updating knowledge profiles:", error);
    } finally {
      setIsUpdatingProfiles(false);
    }
  };

  const renderOptionContent = () => {
    switch (activeOption) {
      case "option2":
        return (
          <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-2 rounded-lg shadow-md">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-2">Please wait...</div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setCurrentPage(1);
                          fetchCategories(searchQuery, selectedSubject, 1);
                        }
                      }}
                      onClick={() => setShowSearchResults(true)}
                      placeholder="Search categories..."
                      className={`border rounded-md p-2 w-full theme-box theme-${theme}`}
                      style={{
                        backgroundColor: "var(--theme-background-color)",
                        color: "var(--theme-text-color)",
                        borderColor: "var(--theme-border-color)",
                      }}
                    />
                    <FilterButton
                      subjects={Object.keys(subjectFocus)}
                      selectedValue={selectedSubject}
                      onFilterChange={(subject) => {
                        const newSubject =
                          subject === "all subjects" ? "" : subject;
                        setSelectedSubject(newSubject);
                        setCurrentPage(1);
                        fetchCategories(searchQuery, newSubject, 1);
                      }}
                    />
                  </div>
                  {/* 
                  {showSearchResults && (
                    <CategorySearchResults
                      categories={categories}
                      onClose={() => setShowSearchResults(false)}
                    />
                  )} */}

                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-2 p-0.5"
                    >
                      <Checkbox
                        id={category.id}
                        checked={checkedCategories.some(
                          (c) => c.id === category.id
                        )}
                        onCheckedChange={(isChecked) =>
                          handleCategoryCheck(category.id)
                        }
                      />
                      <span className="text-[--theme-text-color] text-md">
                        {category.conceptCategory}
                      </span>
                    </div>
                  ))}

                  {limitMessage && (
                    <div className="text-red-500 text-sm mt-2">
                      {limitMessage}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setCheckedCategories([]);
                      // setCategories([]); // Also clear the displayed categories
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg 
                      bg-transparent text-[--theme-text-color]
                      hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                      transition duration-200"
                  >
                    <span>Reset Checked Categories</span>
                  </button>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        fetchCategories(
                          searchQuery,
                          selectedSubject,
                          Math.max(1, currentPage - 1)
                        );
                      }}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg 
      bg-transparent text-[--theme-text-color]
      hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
      transition duration-200 ${
        currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
      }`}
                    >
                      {currentPage - 1}/{totalPages} Previous
                    </button>

                    <button
                      onClick={() => {
                        setCurrentPage((prev) => prev + 1);
                        fetchCategories(
                          searchQuery,
                          selectedSubject,
                          currentPage + 1
                        );
                      }}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg 
      bg-transparent text-[--theme-text-color]
      hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
      transition duration-200 ${
        currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
      }`}
                    >
                      Next {currentPage + 1}/{totalPages}
                    </button>
                  </div>
                
                </>
              )}
            </div>
          </div>
        );
      case "option1":
        return (
          <div className="bg-[transparent] p-4 rounded-lg shadow-md">
            <div className="space-y-2">
              {["rarely", "occasionally", "frequently"].map((option) => (
                <button
                  key={option}
                  className={`w-full text-left px-3 py-2 rounded ${
                    kalypsoInterruptions === option
                      ? "bg-[--theme-doctorsoffice-accent] text-[--theme-text-color]"
                      : "bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-doctorsoffice-accent] hover:opacity-80"
                  } transition duration-200`}
                  onClick={() => setKalypsoInterruptions(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );

      {/* Temp Test Update Knowledge Profiles */} 
      case "option3":
        return (
          <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md">
            <p className="mb-4">
              {"Update your knowledge profiles based on your test responses"}
            </p>
            <Button
              onClick={handleUpdateKnowledgeProfiles}
              disabled={isUpdatingProfiles}
              className="w-full bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
            >
              {isUpdatingProfiles ? "Updating..." : "Update Profiles"}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="categories" className="flex-1">Current Categories</TabsTrigger>
          <TabsTrigger value="progress" className="flex-1">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-0">
          <div className="grid grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div 
                key={subject.name} 
                className="flex flex-col items-center p-2 rounded-lg bg-[--theme-leaguecard-color] min-h-[10rem]"
                style={{
                  boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="flex-1 flex items-center justify-center">
                  <Icon
                    name={subject.icon}
                    className="w-12 h-12 transform scale-75"
                    color={subject.color}
                  />
                </div>
                <span 
                  className="text-xs font-medium text-center block mb-4"
                  style={{ color: subject.color }}
                >
                  {subject.name}
                </span>
                <div className="w-full h-1 bg-[--theme-background-color] rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${subject.progress}%`,
                      backgroundColor: subject.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          {/* Checkable Categories List */}
          <div className="space-y-2 bg-[--theme-leaguecard-color] p-4 rounded-lg">
            {checkedCategories.slice(0, 6).map((category, index) => (
              <div 
                key={category.id}
                className="flex items-center justify-between gap-2 p-2 rounded transition-colors"
              >
                <span className="text-sm font-medium text-[--theme-text-color]">
                  {index + 1}. {category.conceptCategory}
                </span>
                <Checkbox
                  checked={completedCategories.has(category.id)}
                  onCheckedChange={() => handleCategoryCheck(category.id)}
                  className="h-5 w-5 border-2 border-[--theme-border-color]"
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mt-4">
            <button
              onClick={() => {
                setShowSubjectFilter(true);
              }}
              className="w-full py-2 px-4 rounded-lg 
                bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                border-2 border-[--theme-border-color] 
                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                shadow-md transition-colors duration-200"
            >
              Shuffle Categories
            </button>

            {showSubjectFilter && (
              <div className="mt-4 p-4 rounded-lg bg-[--theme-leaguecard-color] border-2 border-[--theme-border-color]">
                <h4 className="text-[--theme-text-color] text-base mb-4">
                  Do you want to focus on specific subjects?
                </h4>
                
                <div className="space-y-2 mb-4">
                  {subjects.map((subject) => (
                    <div 
                      key={subject.name}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        id={`shuffle-filter-${subject.name}`}
                        checked={selectedSubjectsForShuffle.has(subject.name)}
                        onCheckedChange={(checked) => {
                          setSelectedSubjectsForShuffle(prev => {
                            const newSet = new Set(prev);
                            if (checked) {
                              newSet.add(subject.name);
                            } else {
                              newSet.delete(subject.name);
                            }
                            return newSet;
                          });
                        }}
                        className="h-4 w-4"
                      />
                      <label 
                        htmlFor={`shuffle-filter-${subject.name}`}
                        className="text-sm font-medium"
                        style={{ color: subject.color }}
                      >
                        {subject.name}
                      </label>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    const filteredCategories = selectedSubjectsForShuffle.size > 0
                      ? checkedCategories.filter(cat => 
                          Array.from(selectedSubjectsForShuffle).some(subject => 
                            cat.subject === subject
                          )
                        )
                      : checkedCategories;

                    const shuffled = [...filteredCategories];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    setCheckedCategories(shuffled);
                    setShowSubjectFilter(false);
                    setSelectedSubjectsForShuffle(new Set());
                  }}
                  className="w-full bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                >
                  Done
                </Button>
              </div>
            )}

            <button
              onClick={() => setActiveOption("option2")}
              className="w-full py-2 px-4 rounded-lg 
                bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                border-2 border-[--theme-border-color] 
                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                shadow-md transition-colors duration-200"
            >
              Search For A Specific Topic
            </button>

            <button
              onClick={() => {
                // Logic for suggesting subjects based on weaknesses
              }}
              className="w-full py-2 px-4 rounded-lg 
                bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                border-2 border-[--theme-border-color] 
                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                shadow-md transition-colors duration-200"
            >
              Suggest Me Subjects for My Weaknesses
            </button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        {/* {options.map((option) => (
          <div key={option.id} className="relative">
            <button
              className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                activeOption === option.id
                  ? "bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] font-mono"
                  : "bg-transparent text-[--theme-text-color] font-mono hover:bg-[--theme-doctorsoffice-accent]"
              }`}
              onClick={() => handleOptionClick(option.id)}
            >
              <span>{option.label}</span>
            </button>
            {activeOption === option.id && (
              <div className="mt-2">
                {renderOptionContent()}
              </div>
            )}
          </div>
        ))} */}
      </div>
    </div>
  );
};

export default ATSSettingContent;
