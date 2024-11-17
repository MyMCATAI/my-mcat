import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
// import { StrikethroughCheckbox } from "@/components/ui/StrikethroughCheckbox";
// import CategorySearchResults from "./CategorySearchResults";
import FilterButton from "@/components/ui/FilterButton";

interface Option {
  id: string;
  label: string;
}

const options: Option[] = [
  { id: "option1", label: "Can Kalypso ask you questions?" },
  // { id: "option3", label: "Want to ignore a specific subject?" },
  { id: "option2", label: "Want to change current categories?" },
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
  // const [contentPreferences, setContentPreferences] = useState({
  //   videos: true,
  //   readings: true,
  //   quizzes: true,
  // });
  // // const [quizDifficulty, setQuizDifficulty] = useState<string>("medium");
  // const [isSaving, setIsSaving] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjectFocus, setSubjectFocus] = useState({
    Biochemistry: false,
    Biology: false,
    // GenChem: false,
    // OChem: false,
    // TODO ^ add these back in with right filtering?
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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const url = new URL("/api/category-search", window.location.origin);
  //       url.searchParams.append("page", "1");
  //       url.searchParams.append("pageSize", "7");
  //       url.searchParams.append("useKnowledgeProfiles", "true");

  //       // const excludeSubjects = Object.entries(subjectFocus)
  //       //   .filter(([_, isChecked]) => isChecked)
  //       //   .map(([subject]) => subject);

  //       // console.log(excludeSubjects);

  //       // if (excludeSubjects.length > 0) {
  //       //   url.searchParams.append("excludeSubjects", excludeSubjects.join(","));
  //       // }

  //       const response = await fetch(url.toString());
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //       const data = await response.json();
  //       setCategories(data.items);
  //     } catch (error) {
  //       console.error("Error fetching categories:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [subjectFocus]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    fetchCategories(searchQuery, selectedSubject, currentPage);
  }, [selectedSubject, currentPage]);

  // useEffect(() => {
  //   fetchCategories(searchQuery, selectedSubject, currentPage);
  // }, [selectedSubject, currentPage]);

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

  const randomizeCategories = async () => {
    try {
      setIsLoading(true);
      const url = new URL("/api/category-search", window.location.origin);
      url.searchParams.append("page", "1");
      url.searchParams.append("pageSize", "7");
      url.searchParams.append("useKnowledgeProfiles", "true");
      url.searchParams.append("random", "true");

      // const excludeSubjects = Object.entries(subjectFocus)
      //   .filter(([_, isChecked]) => isChecked)
      //   .map(([subject]) => subject);

      // if (excludeSubjects.length > 0) {
      //   url.searchParams.append("excludeSubjects", excludeSubjects.join(","));
      // }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setCategories(data.items);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    if (onClose) onClose();
  };

  // Save checked categories to local storage whenever they change
  const handleCategoryCheck = (category: Category, isChecked: boolean) => {
    if (isChecked && checkedCategories.length >= 7) {
      setLimitMessage("Maximum limit of 7 categories reached.");
      return;
    }
    setLimitMessage(null);
    setCheckedCategories((prev) =>
      isChecked ? [category, ...prev] : prev.filter((c) => c.id !== category.id)
    );
  };

  const renderOptionContent = () => {
    switch (activeOption) {
      case "option2":
        return (
          <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md">
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
                          handleCategoryCheck(category, isChecked as boolean)
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
                  {/* <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg 
                      bg-transparent text-[--theme-text-color]
                      hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                      transition duration-200"
                  >
                    <RefreshCw size={16} />
                    <span>Next Page of Categories</span>
                  </button> */}
                </>
              )}
            </div>
          </div>
        );
      // case "option3":
      //   return (
      //     <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md">
      //       <div className="space-y-2">
      //         {Object.entries(subjectFocus).map(([subject, isChecked]) => (
      //           <div key={subject} className="flex items-center">
      //             <Checkbox
      //               id={subject}
      //               checked={isChecked}
      //               onCheckedChange={(checked) =>
      //                 setSubjectFocus({
      //                   ...subjectFocus,
      //                   [subject]: checked as boolean,
      //                 })
      //               }
      //             />
      //             <label
      //               htmlFor={subject}
      //               className={`ml-2 capitalize ${
      //                 isChecked ? "line-through" : ""
      //               }`}
      //             >
      //               {subject.replace("_", " ")}
      //             </label>
      //           </div>
      //         ))}
      //       </div>
      //     </div>
      //   );
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
      default:
        return null;
    }
  };

  return (
    <>
      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        {options.map((option) => (
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
              <div className="mt-2">{renderOptionContent()}</div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4">
        <Button
          className="w-full text-[--theme-text-color] bg-transparent font-mono py-2 px-4 rounded-lg 
            hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
            transition duration-200"
          onClick={handleDone}
        >
          DONE
        </Button>
      </div>
    </>
  );
};

export default ATSSettingContent;
