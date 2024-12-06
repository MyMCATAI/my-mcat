import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";
import FilterButton from "@/components/ui/FilterButton";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Option {
  id: string;
  label: string;
}

interface ATSSettingContentProps {
  onClose?: () => void;
  checkedCategories: Category[];
  setCheckedCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const subjects = [
  { name: "Chemistry", icon: "atoms", progress: 45, color: "#E6B800" },
  { name: "Biology", icon: "evolution", progress: 30, color: "#4CAF50" },
  { name: "Biochemistry", icon: "dna_n_biotechnology", progress: 60, color: "#2196F3" },
  { name: "Psychology", icon: "cognition", progress: 25, color: "#9C27B0" },
  { name: "Physics", icon: "force", progress: 75, color: "#800000" },
  { name: "Sociology", icon: "soconcom", progress: 40, color: "#FF5722" }
];

const ATSSettingContent: React.FC<ATSSettingContentProps> = ({
  onClose,
  checkedCategories,
  setCheckedCategories,
}) => {
  const { theme } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(1);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSubjectsForShuffle, setSelectedSubjectsForShuffle] = useState<Set<string>>(
    new Set(subjects.map(subject => subject.name))
  );

  useEffect(() => {
    fetchCategories(searchQuery, selectedSubject, currentPage, selectedSubjectsForShuffle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, currentPage, selectedSubjectsForShuffle]);

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

      if (searchQuery) {
        url.searchParams.append("searchQuery", searchQuery);
      }

      if (selectedSubjects && selectedSubjects.size > 0) {
        url.searchParams.append("subjects", Array.from(selectedSubjects).join(','));
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

  const handleDone = () => {
    if (onClose) onClose();
  };

  const handleCategoryCheck = (category: Category, isChecked: boolean) => {
    if (isChecked) {
      if (checkedCategories.length >= 6) {
        setCheckedCategories((prev) => [category, ...prev.slice(0, -1)]);
      } else {
        setCheckedCategories((prev) => [category, ...prev]);
      }
    } else {
      setCheckedCategories((prev) => prev.filter((c) => c.id !== category.id));
    }
  };

  const handleRandomize = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/category-search", window.location.origin);
      url.searchParams.append("random", "true");
      url.searchParams.append("pageSize", "10");
      url.searchParams.append("page", "1");
      
      if (selectedSubjectsForShuffle.size > 0) {
        url.searchParams.append("subjects", Array.from(selectedSubjectsForShuffle).join(','));
      }

      const response = await fetch(url.toString());
      const data = await response.json();
      setCategories(data.items);
      setCheckedCategories(data.items.slice(0, 6));
      setTotalPages(data.totalPages);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch random categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const SettingsContent = () => {
    return (
      <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md">
        <div className="space-y-2">
          <div className="flex items-center justify-center h-14">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentPage(1);
                  fetchCategories(searchQuery, selectedSubject, 1, selectedSubjectsForShuffle);
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

          <div className="h-12">
            <button onClick={handleRandomize} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-transparent text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition duration-200">
              <span>Shuffle</span>
            </button>
          </div>

          <div className="h-[300px] overflow-y-auto">
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
                      checked={checkedCategories.some((c) => c.id === category.id)}
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

          <div className="h-12">
            <button
              onClick={() => setCheckedCategories([])}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg 
                bg-transparent text-[--theme-text-color]
                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                transition duration-200"
            >
              <span>Reset Checked Categories</span>
            </button>
          </div>

          <div className="h-12 flex justify-between">
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
      </div>
    );
  };

  const SubjectsList = () => {
    return (
      <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md mt-4">
        <h3 className="text-lg font-medium mb-3">Filter by Subjects</h3>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((subject) => (
            <div 
              key={subject.name} 
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[--theme-hover-color] transition-colors"
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
                className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                style={{ color: subject.color }}
              >
                {subject.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="p-4 space-y-4 flex-grow overflow-y-auto">
        {SettingsContent()}
        <SubjectsList />
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