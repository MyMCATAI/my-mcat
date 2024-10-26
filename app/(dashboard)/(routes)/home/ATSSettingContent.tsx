import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, RefreshCw } from "lucide-react";
import { Category } from "@/types";

interface Option {
  id: string;
  label: string;
}

const options: Option[] = [
  { id: "option1", label: "Can Kalypso ask you questions?" },
  { id: "option2", label: "Want to change current categories?" },
  { id: "option3", label: "Want to ignore a specific subject?" },
];

interface ATSSettingContentProps {
  onClose?: () => void;
}

const ATSSettingContent: React.FC<ATSSettingContentProps> = ({ onClose }) => {
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [contentPreferences, setContentPreferences] = useState({
    videos: true,
    readings: true,
    quizzes: true,
  });
  const [quizDifficulty, setQuizDifficulty] = useState<string>("medium");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjectFocus, setSubjectFocus] = useState({
    Biochemistry: true,
    Biology: true,
    GenChem: true,
    OChem: true,
    Physics: true,
    Psychology: true,
    Sociology: true,
  });
  const [kalypsoInterruptions, setKalypsoInterruptions] = useState<string>("occasionally");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const url = new URL("/api/category", window.location.origin);
      url.searchParams.append("page", "1");
      url.searchParams.append("pageSize", "6");
      url.searchParams.append("useKnowledgeProfiles", "true");

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

  const handleOptionClick = (optionId: string) => {
    setActiveOption(activeOption === optionId ? null : optionId);
  };

  const randomizeCategories = () => {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    setCategories(shuffled.slice(0, 6)); // Keep only the first 6 categories
  };

  const handleDone = () => {
    if (onClose) onClose();
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
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center gap-2 p-0.5">
                      <button className="p-1 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200">
                        <Search size={16} className="text-[--theme-text-color]" />
                      </button>
                      <span className="text-[--theme-text-color] text-md">{category.conceptCategory}</span>
                    </div>
                  ))}
                  <button
                    onClick={randomizeCategories}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg 
                      bg-transparent text-[--theme-text-color]
                      hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                      transition duration-200"
                  >
                    <RefreshCw size={16} />
                    <span>Regenerate all content categories</span>
                  </button>
                </>
              )}
            </div>
          </div>
        );
      case "option3":
        return (
          <div className="bg-[--theme-leaguecard-color] text-[--theme-text-color] p-4 rounded-lg shadow-md">
            <div className="space-y-2">
              {Object.entries(subjectFocus).map(([subject, isChecked]) => (
                <div key={subject} className="flex items-center">
                  <Checkbox
                    id={subject}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      setSubjectFocus({ ...subjectFocus, [subject]: checked as boolean })
                    }
                  />
                  <label htmlFor={subject} className="ml-2 capitalize">
                    {subject.replace('_', ' ')}
                  </label>
                </div>
              ))}
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
              <div className="mt-2">
                {renderOptionContent()}
              </div>
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
