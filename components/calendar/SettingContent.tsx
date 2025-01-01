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
import { toast } from "react-hot-toast";
import "@/components/styles/CustomCalendar.css";
import { showLoadingToast } from "@/components/calendar/loading-toast";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Option {
  id: string;
  label: string;
}

const options: Option[] = [
  { id: "option1", label: "How many hours can you study each day?" },
  { id: "option2", label: "Which days can you take 8-hour full-length exams?" },
  { id: "option3", label: "When is your test?" },
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

const resources: string[] = ["UWorld", "AAMC", "3rd Party FLs"];

const TEST_DATES = [
  "January 10", 
  "January 11", 
  "January 16", 
  "January 24", 
  "March 8", 
  "March 21", 
  "April 4", 
  "April 5", 
  "April 25", 
  "April 26", 
  "May 3", 
  "May 9", 
  "May 10", 
  "May 15", 
  "May 23", 
  "May 31", 
  "June 13", 
  "June 14", 
  "June 27", 
  "June 28", 
  "July 12", 
  "July 25", 
  "August 1", 
  "August 16", 
  "August 22", 
  "August 23", 
  "September 4", 
  "September 5", 
  "September 12", 
  "September 13"
];

interface SettingContentProps {
  onStudyPlanSaved?: () => void;
  onToggleCalendarView?: () => void;
  onClose?: () => void;
  onActivitiesUpdate?: () => void;
  isInitialSetup?: boolean;
}

const SettingContent: React.FC<SettingContentProps> = ({
  onStudyPlanSaved,
  onToggleCalendarView,
  onClose,
  onActivitiesUpdate,
  isInitialSetup = false,
}) => {
  // default date is 3 months from now
  const defaultDate = new Date();
  defaultDate.setMonth(defaultDate.getMonth() + 3);
  
  const [activeOptions, setActiveOptions] = useState<string[]>([]);
  const [calendarValue, setCalendarValue] = useState<Value>(defaultDate);
  const [hoursPerDay, setHoursPerDay] = useState<Record<string, string>>(() => {
    // Initialize with 3 hours for each day
    return days.reduce((acc, day) => ({
      ...acc,
      [day]: "3"
    }), {});
  });
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
  const [isRecommending, setIsRecommending] = useState(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchExistingStudyPlan();
  }, []);

  const fetchExistingStudyPlan = async () => {
    try {
      const response = await fetch('/api/study-plan');
      if (response.ok) {
        const data = await response.json();
        if (data.studyPlans && data.studyPlans.length > 0) {
          // Get the most recent study plan (should be first due to orderBy desc)
          const plan = data.studyPlans[0];
          setExistingStudyPlan(plan);
          
          // Update exam date
          setCalendarValue(new Date(plan.examDate));
          
          // Update resources with all options
          const resources = plan.resources as {
            hasAAMC: boolean;
            hasAnki: boolean;
            hasUWorld: boolean;
            hasAdaptiveTutoringSuite: boolean;
            hasKaplanBooks?: boolean;
            hasThirdPartyFLs?: boolean;
          };
          setSelectedResources({
            'UWorld': resources.hasUWorld,
            'AAMC': resources.hasAAMC,
            '3rd Party FLs': resources.hasThirdPartyFLs || false,
          });
          
          setHoursPerDay(plan.hoursPerDay as Record<string, string>);
          
          // Update full length days
          const fullLengthDaysObj = days.reduce((acc, day) => ({
            ...acc,
            [day]: (plan.fullLengthDays as string[]).includes(day)
          }), {});
          setFullLengthDays(fullLengthDaysObj);
        }
      }
    } catch (error) {
      console.error("Error fetching existing study plan:", error);
      toast.error("Failed to load study plan");
    }
  };

  const handleOptionClick = (optionId: string) => {
    setActiveOptions(prev => 
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
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
      resources: {
        hasUWorld: true, // i temporarily set this to true along with aamc
        hasAAMC: true,
        hasAdaptiveTutoringSuite: true,
        hasAnki: true,
      },
      hoursPerDay,
      fullLengthDays: Object.entries(fullLengthDays)
        .filter(([_, value]) => value)
        .map(([day]) => day),
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
    
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    if (calendarValue && calendarValue < today) {
      toast.error("Exam date cannot be in the past");
      setIsGenerating(false);
      return;
    }

    if (calendarValue && calendarValue > oneYearFromNow) {
      toast.error("Exam date cannot be more than 1 year in the future");
      setIsGenerating(false);
      return;
    }
    
    // Show the loading toast and store its ID
    const loadingToastId = showLoadingToast();
    
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
      
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);
      
      if (response.ok) {
        // Add a 2-second delay before showing success message and running callbacks
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success("Study plan generated successfully!");
        if (onStudyPlanSaved) onStudyPlanSaved();
        if (onActivitiesUpdate) onActivitiesUpdate();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to generate study plan");
      }
    } catch (error) {
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);
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

  const handleRecommendTestDate = () => {
    const totalHoursPerWeek = Object.values(hoursPerDay)
      .reduce((sum, hours) => sum + Number(hours), 0);

    if (totalHoursPerWeek === 0) {
      toast.error("Please set your study hours first");
      return;
    }

    // Get today's date
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Create dates for both current and next year
    const possibleDates = TEST_DATES.flatMap(dateStr => [
      new Date(`${dateStr}, ${currentYear}`),
      new Date(`${dateStr}, ${currentYear + 1}`)
    ]).filter(date => date > today);

    if (possibleDates.length === 0) {
      toast.error("No future test dates available. Please check back later.");
      return;
    }

    // Calculate target weeks (aiming for ~250 hours)
    const weeksNeeded = Math.ceil(250 / totalHoursPerWeek);
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + (weeksNeeded * 7));

    // Find the closest future date to our target
    let closestDate = possibleDates[0];
    let smallestDiff = Math.abs(targetDate.getTime() - closestDate.getTime());
    
    possibleDates.forEach(date => {
      const diff = Math.abs(targetDate.getTime() - date.getTime());
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestDate = date;
      }
    });

    setCalendarValue(closestDate);
    
    const weeksBetween = Math.round((closestDate.getTime() - today.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const totalHours = weeksBetween * totalHoursPerWeek;
    
    toast.success(
      `Based on your ${totalHoursPerWeek} hours per week, ` +
      `we recommend taking the test on ${formatDate(closestDate)}. ` +
      `This gives you ${weeksBetween} weeks (approximately ${totalHours} total study hours)`
    );
  };

  const renderOptionContent = (optionId: string) => {
    switch (optionId) {
      case "option1":
        return (
          <div className="bg-[--theme-leaguecard-color] p-4 rounded-lg shadow-md">
            {days.map((day) => (
              <div key={day} className="flex items-center justify-between mb-2">
                <span className="text-[--theme-text-color]">{day}</span>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hoursPerDay[day] || "3"}
                  onChange={(e) => {
                    const value = Math.min(24, Math.max(0, Number(e.target.value)));
                    setHoursPerDay({ ...hoursPerDay, [day]: value.toString() });
                  }}
                  className="w-16 p-1 border rounded text-[--theme-text-color] bg-[--theme-leaguecard-color]"
                />
              </div>
            ))}
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
          <div className="flex flex-col items-center p-2 rounded-lg shadow-md">
            <Calendar
              onChange={setCalendarValue}
              value={calendarValue}
              className="text-black bg-white mb-2"
              formatMonthYear={(locale, date) => {
                return date.toLocaleString('default', { month: 'long' });
              }}
              maxDate={(() => {
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                return oneYearFromNow;
              })()}
            />
            <div className="flex items-center mt-4 w-full">
              <button
                onClick={handleRecommendTestDate}
                className="w-full bg-[--theme-leaguecard-color] border-2 border-[--theme-border-color] text-[--theme-text-color] py-3 rounded-xl hover:bg-[--theme-hover-color] transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-[1rem] flex items-center justify-center gap-2"
              >
                <span>Get Recommended Test Date</span>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`
        ${isInitialSetup 
          ? 'w-full bg-[transparent]' 
          : 'bg-[--theme-leaguecard-color] rounded-2xl shadow-xl absolute right-[2rem] w-[40rem] h-[40rem]'
        }
      `}
    >
      <div 
        className={`
          ${isInitialSetup 
            ? 'flex flex-col h-[48rem]' 
            : 'rounded-2xl overflow-hidden flex flex-col h-full'
          }
          ${isInitialSetup ? 'bg-transparent' : 'bg-[--theme-leaguecard-color]'}
        `}
      >
        {isInitialSetup && (
          <div className="text-center py-8">
            <h2 className="text-4xl font-bold text-[--theme-text-color] mb-4">Welcome to MyMCAT.ai!</h2>
            <p className="text-[--theme-text-color] opacity-80 text-xl">Let's set up your personalized study plan. Please answer a few questions to get started.</p>
          </div>
        )}
        
        <div className={`
          ${isInitialSetup ? 'w-full px-6' : 'px-6'} 
          flex-1 overflow-y-auto scrollbar-hide
        `}>
          <div className="space-y-6 pb-6">
            {options.map((option) => (
              <div key={option.id} className="relative">
                <button
                  className={`w-full text-left p-5 rounded-xl transition-all duration-200 ${
                    activeOptions.includes(option.id)
                      ? "bg-[--theme-doctorsoffice-accent] text-[--theme-text-color] shadow-lg"
                      : "bg-[--theme-leaguecard-color]/50 text-[--theme-text-color] hover:bg-[--theme-doctorsoffice-accent]/70"
                  }`}
                  onClick={() => handleOptionClick(option.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-medium">{option.label}</span>
                    {option.id === "option3" && calendarValue instanceof Date && (
                      <span className="text-lg font-medium">
                        {formatDate(calendarValue)}
                      </span>
                    )}
                  </div>
                </button>
                {activeOptions.includes(option.id) && (
                  <div className="mt-4 bg-[--theme-leaguecard-color]/30 p-5 rounded-xl backdrop-blur-sm">
                    {renderOptionContent(option.id)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`
          ${isInitialSetup ? 'w-full' : ''} 
          p-6 bg-[--theme-leaguecard-color]/30 backdrop-blur-sm mt-auto
        `}>
          {existingStudyPlan ? (
            <Button
              className="w-full text-[--theme-hover-text] bg-[--theme-hover-color] py-4 px-6 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-lg font-medium"
              onClick={() => {
                handleSave();
                handleGenerateStudyPlan();
              }}
              disabled={isSaving}
            >
              {isSaving && (
                <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin" />
              )}
              {isSaving ? "Saving..." : isInitialSetup ? "Create Study Plan" : "Update Study Plan"}
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full text-[--theme-hover-text] bg-[--theme-hover-color] py-4 px-6 rounded-xl hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg text-lg font-medium"
                    onClick={handleGenerateStudyPlan}
                    disabled={isGenerating}
                  >
                    {isGenerating && (
                      <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin" />
                    )}
                    {isGenerating ? 'Generating...' : isInitialSetup ? 'Create Study Plan' : 'Generate Study Plan'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-800 text-white p-2 rounded-xl">
                  <p>Generation may take a few minutes. Please wait while we create your personalized study plan.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingContent;
