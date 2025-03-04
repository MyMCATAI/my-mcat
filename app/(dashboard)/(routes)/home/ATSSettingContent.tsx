import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/types";
import { useUI } from "@/store/selectors";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface Option {
  id: string;
  label: string;
}

interface ATSSettingContentProps {
  checkedCategories: Category[];
  setCheckedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const subjects = [
  { name: "Chemistry", icon: "atoms", progress: 45, color: "#E6B800" },
  { name: "Biology", icon: "evolution", progress: 30, color: "#4CAF50" },
  {
    name: "Biochemistry",
    icon: "dna_n_biotechnology",
    progress: 60,
    color: "#2196F3",
  },
  { name: "Psychology", icon: "cognition", progress: 25, color: "#9C27B0" },
  { name: "Physics", icon: "force", progress: 75, color: "#800000" },
  { name: "Sociology", icon: "soconcom", progress: 40, color: "#FF5722" },
];

const ATSSettingContent: React.FC<ATSSettingContentProps> = ({
  checkedCategories,
  setCheckedCategories,
}) => {
  const { theme } = useUI();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSubjectsForShuffle, setSelectedSubjectsForShuffle] = useState<
    Set<string>
  >(() => {
    const savedSubjects = localStorage.getItem("selectedSubjects");
    return savedSubjects
      ? new Set(JSON.parse(savedSubjects))
      : new Set(subjects.map((subject) => subject.name));
  });

  const [showSettingsSteps, setShowSettingsSteps] = useState<boolean>(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenSettingsTutorial");
    return !hasSeenTutorial;
  });

  useEffect(() => {
    if (!showSettingsSteps) {
      localStorage.setItem("hasSeenSettingsTutorial", "true");
    }
  }, [showSettingsSteps]);

  useEffect(() => {
    // Load checked categories from localStorage on mount
    const savedCategories = localStorage.getItem("checkedCategories");
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      setCheckedCategories(parsedCategories);
    }
    
    // Fetch categories after setting checked categories
    fetchCategories(
      searchQuery,
      selectedSubject,
      currentPage,
      selectedSubjectsForShuffle
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "selectedSubjects",
      JSON.stringify(Array.from(selectedSubjectsForShuffle))
    );
  }, [selectedSubjectsForShuffle]);

  const fetchCategories = async (
    searchQuery: string,
    subject: string,
    page: number,
    selectedSubjects?: Set<string>
  ) => {
    try {
      setIsLoading(true);
      const url = new URL("/api/category-search", window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("pageSize", "8");

      const checkedIds = checkedCategories.map(cat => cat.id).join(',');
      if (checkedIds) {
        url.searchParams.append("checkedIds", checkedIds);
      }

      if (searchQuery) {
        url.searchParams.append("searchQuery", searchQuery);
      }

      if (selectedSubjects && selectedSubjects.size > 0) {
        url.searchParams.append(
          "subjects",
          Array.from(selectedSubjects).join(",")
        );
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      setTotalPages(data.totalPages);

      // Create a map of checked categories for quick lookup
      const checkedMap = new Map(
        checkedCategories.map((cat, index) => [cat.id, index])
      );

      // Sort the categories
      const sortedCategories = [...data.items].sort((a, b) => {
        const aCheckedIndex = checkedMap.get(a.id);
        const bCheckedIndex = checkedMap.get(b.id);
        
        // If both are checked, maintain their original order in checkedCategories
        if (aCheckedIndex !== undefined && bCheckedIndex !== undefined) {
          return aCheckedIndex - bCheckedIndex;
        }
        
        // If only one is checked, it should come first
        if (aCheckedIndex !== undefined) return -1;
        if (bCheckedIndex !== undefined) return 1;
        
        // For unchecked items, incomplete ones come before completed ones
        if (!a.isCompleted && b.isCompleted) return -1;
        if (a.isCompleted && !b.isCompleted) return 1;
        
        return 0;
      });

      const newCategories = sortedCategories.map((category: Category) => ({
        ...category,
        isChecked: checkedMap.has(category.id),
      }));

      setCategories(newCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryCheck = (category: Category, isChecked: boolean) => {
    if (isChecked) {
      let newCheckedCategories: Category[];
      
      if (checkedCategories.length >= 6) {
        // Remove the last category and add the new one at the beginning
        newCheckedCategories = [category, ...checkedCategories.slice(0, -1)];
        
        // If the removed category was selected, select the new category
        const removedCategory = checkedCategories[checkedCategories.length - 1];
        const lastSelectedCategory = localStorage.getItem("lastSelectedCategory");
        
        if (lastSelectedCategory === removedCategory.conceptCategory) {
          localStorage.setItem("lastSelectedCategory", category.conceptCategory);
        }
      } else {
        newCheckedCategories = [category, ...checkedCategories];
      }

      setCheckedCategories(newCheckedCategories);
      localStorage.setItem("checkedCategories", JSON.stringify(newCheckedCategories));

      // If this is the first category or no category is selected, select this one
      if (!localStorage.getItem("lastSelectedCategory") || checkedCategories.length === 0) {
        localStorage.setItem("lastSelectedCategory", category.conceptCategory);
      }
    } else {
      const newCheckedCategories = checkedCategories.filter(
        (c) => c.id !== category.id
      );
      setCheckedCategories(newCheckedCategories);
      localStorage.setItem("checkedCategories", JSON.stringify(newCheckedCategories));

      // If the unchecked category was selected, select the first remaining category
      const lastSelectedCategory = localStorage.getItem("lastSelectedCategory");
      if (lastSelectedCategory === category.conceptCategory && newCheckedCategories.length > 0) {
        localStorage.setItem(
          "lastSelectedCategory", 
          newCheckedCategories[0].conceptCategory
        );
      }
    }
  };

  const handleRandomize = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/category-search", window.location.origin);
      url.searchParams.append("random", "true");
      url.searchParams.append("pageSize", "10");
      url.searchParams.append("page", "1");
      url.searchParams.append("excludeCompleted", "true");

      if (selectedSubjectsForShuffle.size > 0) {
        url.searchParams.append(
          "subjects",
          Array.from(selectedSubjectsForShuffle).join(",")
        );
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      // Filter out any categories that might have completedAt set
      const incompleteCategories = data.items.filter(
        (category: Category & { knowledgeProfiles?: any[] }) =>
          !category.knowledgeProfiles?.[0]?.completedAt
      );

      // Take only the first 6 categories
      const newCheckedCategories = incompleteCategories.slice(0, 6);

      // Update state
      setCategories(incompleteCategories);
      setCheckedCategories(newCheckedCategories);
      setTotalPages(data.totalPages);
      setCurrentPage(1);

      // Persist to localStorage
      localStorage.setItem("checkedCategories", JSON.stringify(newCheckedCategories));

      // Set and persist the first category as selected
      if (newCheckedCategories.length > 0) {
        const firstCategory = newCheckedCategories[0].conceptCategory;
        localStorage.setItem("lastSelectedCategory", firstCategory);
      }

    } catch (error) {
      console.error("Failed to fetch random categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const SettingsContent = () => {
    return (
      <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-center h-10 flex-shrink-0 topic-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setCurrentPage(1);
                fetchCategories(
                  searchQuery,
                  selectedSubject,
                  1,
                  selectedSubjectsForShuffle
                );
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
        </div>

        <div className="flex-grow overflow-y-auto min-h-[12rem]">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(7)].map((_, index) => (
                <div key={index} className="flex items-center gap-2 h-8">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="w-3/4 h-5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2 h-8">
                  <Checkbox
                    id={category.id}
                    checked={checkedCategories.some(
                      (c) => c.id === category.id
                    )}
                    onCheckedChange={(isChecked) =>
                      handleCategoryCheck(category, isChecked as boolean)
                    }
                  />
                  <span className="text-[--theme-text-color] text-md flex items-center justify-between">
                    {category.conceptCategory}
                    {category.isCompleted && (
                      <span className="text-green-500 ml-2">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-10 flex justify-between">
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.max(1, prev - 1));
              fetchCategories(
                searchQuery,
                selectedSubject,
                Math.max(1, currentPage - 1),
                selectedSubjectsForShuffle
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
                currentPage + 1,
                selectedSubjectsForShuffle
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
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto p-4">
      <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md flex-shrink-0">
        <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide">
          Filter by Subjects
        </h3>
        <div className="max-h-[8rem] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {subjects.map((subject) => (
              <div
                key={subject.name}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[--theme-hover-color] transition-colors checkmark-button"
              >
                <Checkbox
                  id={`shuffle-filter-${subject.name}`}
                  checked={selectedSubjectsForShuffle.has(subject.name)}
                  onCheckedChange={(checked) => {
                    setSelectedSubjectsForShuffle((prev) => {
                      const newSet = new Set(prev);
                      if (checked) {
                        newSet.add(subject.name);
                      } else {
                        newSet.delete(subject.name);
                      }
                      localStorage.setItem(
                        "selectedSubjects",
                        JSON.stringify(Array.from(newSet))
                      );
                      return newSet;
                    });
                  }}
                  className="h-4 w-4"
                />
                <label
                  htmlFor={`shuffle-filter-${subject.name}`}
                  className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                  style={{ color: subject.color }}
                >
                  {subject.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRandomize}
          >
            Shuffle
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCheckedCategories([]);
              setSelectedSubjectsForShuffle(
                new Set(subjects.map((subject) => subject.name))
              );
              localStorage.removeItem("checkedCategories");
              localStorage.setItem(
                "selectedSubjects",
                JSON.stringify(subjects.map((subject) => subject.name))
              );
            }}
          >
            Reset All Categories
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">{SettingsContent()}</div>
      {/* <ATSSettingsTutorial 
        showSettingsSteps={showSettingsSteps}
        setShowSettingsSteps={setShowSettingsSteps}
      /> */}
    </div>
  );
};

export default ATSSettingContent;
