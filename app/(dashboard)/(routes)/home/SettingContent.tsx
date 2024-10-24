import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { StudyPlan } from "@/types";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Option {
  id: string;
  label: string;
}

const options: Option[] = [
  { id: "option1", label: "When is your test?" },
  { id: "option2", label: "When can you take full lengths?" },
  { id: "option3", label: "How many hours each day?" },
  { id: "option4", label: "What resources do you want to use?" },
];

const days: string[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const resources: string[] = ["UWorld", "AAMC", "Kaplan Books", "3rd Party FLs"];

interface SettingContentProps {
  onShowDiagnosticTest?: () => void;
  onStudyPlanSaved?: () => void;
  onToggleCalendarView?: () => void;
  onClose?: () => void; // New prop
}

const SettingContent: React.FC<SettingContentProps> = ({
  onShowDiagnosticTest,
  onStudyPlanSaved,
  onToggleCalendarView,
  onClose, // New prop
}) => {
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [calendarValue, setCalendarValue] = useState<Value>(new Date());
  const [hoursPerDay, setHoursPerDay] = useState<Record<string, string>>({});
  const [selectedResources, setSelectedResources] = useState<
    Record<string, boolean>
  >({});
  const [existingStudyPlan, setExistingStudyPlan] = useState<StudyPlan | null>(
    null
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [fullLengthDays, setFullLengthDays] = useState<Record<string, boolean>>(
    {
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
      Sunday: false,
    }
  );
  const [thirdPartyFLCount, setThirdPartyFLCount] = useState<number>(0);
  const [reviewPracticeBalance, setReviewPracticeBalance] =
    useState<number>(50);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(0);
  const [isNotSureDate, setIsNotSureDate] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchExistingStudyPlan();
  }, []);

  const fetchExistingStudyPlan = async () => {
    try {
      const response = await fetch("/api/study-plan");
      if (response.ok) {
        const data = await response.json();
        if (data.studyPlans && data.studyPlans.length > 0) {
          const plan = data.studyPlans[0];
          setExistingStudyPlan(plan);
          setCalendarValue(new Date(plan.examDate));
          setSelectedResources(
            plan.resources.reduce(
              (acc: any, resource: any) => ({ ...acc, [resource]: true }),
              {}
            )
          );
          setHoursPerDay(plan.hoursPerDay);
          setFullLengthDays(plan.fullLengthDays);
          setThirdPartyFLCount(plan.thirdPartyFLCount || 0);
          setReviewPracticeBalance(plan.reviewPracticeBalance || 50);
        }
      }
    } catch (error) {
      console.error("Error fetching existing study plan:", error);
    }
  };

  const handleOptionClick = (optionId: string) => {
    setActiveOption(activeOption === optionId ? null : optionId);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    const studyPlanData = {
      examDate: calendarValue,
      resources: Object.keys(selectedResources).filter(
        (key) => selectedResources[key]
      ),
      hoursPerDay,
      fullLengthDays,
      thirdPartyFLCount,
      reviewPracticeBalance,
    };

    try {
      const method = existingStudyPlan ? "PUT" : "POST";
      const body = existingStudyPlan
        ? JSON.stringify({ ...studyPlanData, id: existingStudyPlan.id })
        : JSON.stringify(studyPlanData);

      const response = await fetch("/api/study-plan", {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (response.ok) {
        const updatedPlan = await response.json();
        setExistingStudyPlan(updatedPlan);
        if (onToggleCalendarView) onToggleCalendarView();
        if (onClose) onClose(); // Close the settings window
      } else {
        // Create new study plan
        const response = await fetch("/api/study-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(studyPlanData),
        });
        if (response.ok) {
          const newPlan = await response.json();
          setExistingStudyPlan(newPlan);
          if (onStudyPlanSaved) onStudyPlanSaved();
          if (onShowDiagnosticTest) onShowDiagnosticTest();
          if (onToggleCalendarView) onToggleCalendarView();
          if (onClose) onClose(); // Close the settings window
        }
      }
    } catch (error) {
      console.error("Error saving study plan:", error);
      alert("Error saving study plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    setIsGenerating(true);
    const studyPlanData = {
      examDate: calendarValue,
      resources: {
        hasUWorld: selectedResources["UWorld"] || false,
        hasAAMC: selectedResources["AAMC"] || false,
        hasAdaptiveTutoringSuite: true, // Assuming this is always available
        hasAnki: true, // Assuming this is always available
      },
      hoursPerDay,
      fullLengthDays: Object.entries(fullLengthDays)
        .filter(([_, value]) => value)
        .map(([day]) => day),
      contentReviewRatio: reviewPracticeBalance / 100,
      useKnowledgeProfile: false, // You might want to add a toggle for this in the UI
      alternateStudyPractice: true, // You might want to add a toggle for this in the UI
      includeSpecificContent: false, // You might want to add a toggle for this in the UI
    };

    try {
      const response = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studyPlanData),
      });
      console.log("response", response);
      if (response.ok) {
        toast.success("Study plan generated successfully!");
        if (onStudyPlanSaved) onStudyPlanSaved();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate study plan");
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast.error("An error occurred while generating the study plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSliderMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleSliderMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleSliderMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setTooltipPosition(position);
  };

  const renderOptionContent = () => {
    switch (activeOption) {
      case "option1":
        return (
          <div className="flex flex-col items-center p-2 rounded-lg shadow-md">
            {!isNotSureDate && (
              <Calendar
                onChange={setCalendarValue}
                value={calendarValue}
                className="text-black bg-white mb-2"
              />
            )}
            <div className="flex items-center">
              <Checkbox
                id="notSureDate"
                checked={isNotSureDate}
                onCheckedChange={(checked) => {
                  setIsNotSureDate(checked as boolean);
                  if (checked) {
                    setCalendarValue(null);
                  }
                }}
              />
              <label
                htmlFor="notSureDate"
                className="ml-2 text-[--theme-text-color]"
              >
                Not sure
              </label>
            </div>
          </div>
        );
      case "option2":
        return (
          <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg shadow-md">
            {days.map((day) => (
              <div key={day} className="flex items-center justify-between mb-2">
                <span className="text-[--theme-text-color]">{day}</span>
                <input
                  type="checkbox"
                  checked={fullLengthDays[day] || false}
                  onChange={(e) =>
                    setFullLengthDays({
                      ...fullLengthDays,
                      [day]: e.target.checked,
                    })
                  }
                />
              </div>
            ))}
          </div>
        );
      case "option3":
        return (
          <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg shadow-md">
            {days.map((day) => (
              <div key={day} className="flex items-center justify-between mb-2">
                <span className="text-[--theme-text-color]">{day}</span>
                <input
                  type="number"
                  value={hoursPerDay[day] || ""}
                  onChange={(e) =>
                    setHoursPerDay({ ...hoursPerDay, [day]: e.target.value })
                  }
                  className="w-16 p-1 border rounded text-[--theme-text-color] bg-[--theme-leaguecard-color]"
                />
              </div>
            ))}
          </div>
        );
      case "option4":
        return (
          <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg shadow-md">
            {resources.map((resource) => (
              <div key={resource} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedResources[resource] || false}
                  onChange={(e) =>
                    setSelectedResources({
                      ...selectedResources,
                      [resource]: e.target.checked,
                    })
                  }
                />
                <span className="ml-2 text-[--theme-text-color]">
                  {resource}
                </span>
                {resource === "3rd Party FLs" &&
                  selectedResources[resource] && (
                    <div className="ml-4 flex items-center">
                      <button
                        className="px-2 py-1 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] rounded"
                        onClick={() =>
                          setThirdPartyFLCount(
                            Math.max(0, thirdPartyFLCount - 1)
                          )
                        }
                      >
                        -
                      </button>
                      <span className="mx-2 text-[--theme-text-color]">
                        {thirdPartyFLCount}
                      </span>
                      <button
                        className="px-2 py-1 bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] rounded"
                        onClick={() =>
                          setThirdPartyFLCount(thirdPartyFLCount + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-[--theme-leaguecard-color] rounded-lg border-[--theme-border-color] border-2 shadow-lg relative w-full max-w-md mx-auto h-[34rem]">
      <div className="bg-[--theme-leaguecard-color] rounded-lg overflow-hidden h-full flex flex-col">
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
                <div className="flex justify-between items-center">
                  <span>{option.label}</span>
                  {option.id === "option1" && (
                    <span className="text-sm font-medium">
                      {isNotSureDate
                        ? "Not sure"
                        : calendarValue instanceof Date
                        ? formatDate(calendarValue)
                        : ""}
                    </span>
                  )}
                </div>
              </button>
              {activeOption === option.id && (
                <div className="mt-2 bg-[--theme-leaguecard-color] p-3 rounded-lg shadow-md">
                  {renderOptionContent()}
                </div>
              )}
            </div>
          ))}

          {/* Updated slider section */}
          <TooltipProvider>
            <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg shadow-md relative">
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={reviewPracticeBalance}
                      onChange={(e) =>
                        setReviewPracticeBalance(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="bg-gray-800 text-white p-2 rounded"
                  >
                    <p>
                      We recommend doing more practice than review closer to
                      your test date.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[--theme-text-color] text-sm">
                  Review: {reviewPracticeBalance}%
                </span>
                <span className="text-[--theme-text-color] text-sm">
                  Practice: {100 - reviewPracticeBalance}%
                </span>
              </div>
            </div>
          </TooltipProvider>
        </div>

        <div className="p-4">
          <Button
            className="w-full text-[--theme-hover-text] bg-[--theme-hover-color] font-mono py-2 px-4 rounded-lg hover:opacity-80 transition duration-200 mb-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : existingStudyPlan
              ? "Update Study Plan"
              : "Save Study Plan"}
          </Button>
          
          <Button
            className="w-full text-[--theme-hover-text] bg-[--theme-doctorsoffice-accent] font-mono py-2 px-4 rounded-lg hover:opacity-80 transition duration-200"
            onClick={handleGenerateStudyPlan}
            disabled={isGenerating || !existingStudyPlan}
          >
            {isGenerating ? 'Generating...' : 'Generate Study Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingContent;
