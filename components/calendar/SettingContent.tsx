import React, { useState, useEffect } from "react";
import { StudyPlan } from "@/types";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";
import { showLoadingToast } from "@/components/calendar/loading-toast";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Option {
  id: string;
  label: string;
}

const options: Option[] = [
  { id: "option3", label: "When is your test?" },
  { id: "option1", label: "How many hours can you study per week?" },
  { id: "option2", label: "Which days can you take 8-hour full-length exams?" },
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
  const [weeklyHours, setWeeklyHours] = useState<number>(21); // Default 3 hours * 7 days
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
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  const steps = [
    {
      title: "Study Time",
      subtitle: "Let's figure out your weekly commitment"
    },
    {
      title: "Full Length Exams",
      subtitle: "Select days for practice tests"
    },
    {
      title: "Test Date",
      subtitle: "Choose when you'll take the MCAT"
    }
  ];

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
    
    if (!calendarValue || !(calendarValue instanceof Date)) {
      toast.error("Please select a valid exam date");
      setIsGenerating(false);
      return;
    }

    // Ensure we're working with dates at the start of the day to avoid timezone issues
    const examDateStartOfDay = new Date(calendarValue.setHours(0, 0, 0, 0));
    const todayStartOfDay = new Date(today.setHours(0, 0, 0, 0));

    if (examDateStartOfDay < todayStartOfDay) {
      toast.error("Exam date cannot be in the past");
      setIsGenerating(false);
      return;
    }

    if (examDateStartOfDay > oneYearFromNow) {
      toast.error("Exam date cannot be more than 1 year in the future");
      setIsGenerating(false);
      return;
    }

    // Validate full length days are selected
    const selectedFullLengthDays = Object.entries(fullLengthDays)
      .filter(([_, value]) => value)
      .map(([day]) => day);

    if (selectedFullLengthDays.length === 0) {
      toast.error("Please select at least one day for full-length exams");
      setIsGenerating(false);
      return;
    }
    
    // Show the loading toast and store its ID
    const loadingToastId = showLoadingToast();
    
    const studyPlanData = {
      examDate: examDateStartOfDay.toISOString(),
      resources: {
        hasUWorld: true,  // Always true for now
        hasAAMC: true,    // Always true for now
        hasAdaptiveTutoringSuite: true,
        hasAnki: true,
      },
      hoursPerDay,
      fullLengthDays: selectedFullLengthDays,
    };

    try {
      const response = await fetch('/api/generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studyPlanData),
      });
      
      // Dismiss the loading toast
      toast.dismiss(loadingToastId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate study plan");
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success("Study plan generated successfully!");
        if (onStudyPlanSaved) onStudyPlanSaved();
        if (onActivitiesUpdate) onActivitiesUpdate();
      } else {
        throw new Error("Failed to generate study plan");
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error('Error generating study plan:', error);
      toast.error(error instanceof Error ? error.message : "An error occurred while generating the study plan");
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
    if (weeklyHours === 0) {
      toast.error("Please set your weekly study hours first");
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
    const weeksNeeded = Math.ceil(250 / weeklyHours);
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
    const totalHours = weeksBetween * weeklyHours;
    
    toast.success(
      `Based on your ${weeklyHours} hours per week, ` +
      `we recommend taking the test on ${formatDate(closestDate)}. ` +
      `This gives you ${weeksBetween} weeks (approximately ${totalHours} total study hours)`
    );
  };

  const handleWeeklyHoursChange = (value: number) => {
    const validValue = Math.min(168, Math.max(0, value));
    setWeeklyHours(validValue);
    
    // Distribute hours across days, prioritizing weekdays
    const weekdayHours = Math.min(5, Math.floor(validValue / 7));
    const weekendHours = Math.min(8, Math.floor((validValue - (weekdayHours * 5)) / 2));
    
    const newHoursPerDay = {
      Monday: weekdayHours.toString(),
      Tuesday: weekdayHours.toString(),
      Wednesday: weekdayHours.toString(),
      Thursday: weekdayHours.toString(),
      Friday: weekdayHours.toString(),
      Saturday: weekendHours.toString(),
      Sunday: weekendHours.toString(),
    };
    
    setHoursPerDay(newHoursPerDay);
  };

  const renderStep = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl text-[--theme-text-color] ml-4">How many hours a week can you study?</h3>
            </div>
            <div className="w-full max-w-md bg-transparent p-8 rounded-2xl flex flex-col items-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-48">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={weeklyHours}
                    onChange={(e) => handleWeeklyHoursChange(Number(e.target.value) || 0)}
                    className="w-full text-6xl font-bold text-center bg-transparent border-b-2 border-[--theme-border-color] text-[--theme-text-color] focus:outline-none focus:border-[--theme-hover-color] transition-all py-2"
                    placeholder="0"
                  />
                </div>
                <span className="text-xl text-[--theme-text-color] text-center">hours per week</span>
              </div>
              {weeklyHours < 12 && (
                <p className="text-sm text-[--theme-text-color] opacity-70 mt-4 text-center">
                  Your test better be in a few months.
                </p>
              )}
              {weeklyHours >= 12 && weeklyHours <= 21 && (
                <p className="text-sm text-[--theme-text-color] opacity-70 mt-4 text-center">
                  This is the optimal study time.
                </p>
              )}
              {weeklyHours >= 22 && weeklyHours <= 29 && (
                <p className="text-sm text-[--theme-text-color] opacity-70 mt-4 text-center">
                  Don't lie to yourself.
                </p>
              )}
              {weeklyHours >= 30 && (
                <p className="text-sm text-[--theme-text-color] opacity-70 mt-4 text-center">
                  Please be realistic.
                </p>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center space-y-2">
            </div>
            <div className="w-full max-w-5xl p-8 rounded-2xl">
              <div className="flex items-start justify-end gap-12">
                <div className="flex flex-col justify-center space-y-4 w-3/5 text-center">
                  <h4 className="text-2xl text-[--theme-text-color] translate-y-[8.5rem]">What days can you take practice exams?</h4>
                </div>
                
                <div className="w-1/2 gap-3 min-w-[20rem]">
                  {days.map((day) => (
                    <div key={day} 
                      className="flex items-center p-3 rounded-xl transition-all"
                      style={{ minHeight: '3.5rem' }}
                    >
                      <input
                        type="checkbox"
                        id={`fl-${day}`}
                        checked={fullLengthDays[day] || false}
                        onChange={(e) =>
                          setFullLengthDays({
                            ...fullLengthDays,
                            [day]: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-2 border-[--theme-text-color] checked:bg-[--theme-text-color]"
                      />
                      <label 
                        htmlFor={`fl-${day}`}
                        className="ml-4 text-lg text-[--theme-text-color] font-medium cursor-pointer flex-grow"
                      >
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-2xl text-[--theme-text-color]">When is your MCAT?</h3>
            </div>
            <div className="w-full max-w-md">
              <div className="relative">
                <select
                  value={calendarValue instanceof Date ? `${calendarValue.toLocaleString('default', { month: 'long' })} ${calendarValue.getDate()}` : ''}
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const selectedDate = new Date(`${e.target.value}, ${new Date().getFullYear()}`);
                    // If the selected date is in the past, add a year
                    if (selectedDate < new Date()) {
                      selectedDate.setFullYear(selectedDate.getFullYear() + 1);
                    }
                    setCalendarValue(selectedDate);
                  }}
                  className="w-full p-4 rounded-lg bg-[--theme-leaguecard-color] text-[--theme-text-color] focus:outline-none transition-all text-lg appearance-none cursor-pointer mb-6"
                >
                  <option value="">Choose your test date</option>
                  {(() => {
                    // Group dates by month
                    const groupedDates = TEST_DATES.reduce<Record<string, string[]>>((acc, date) => {
                      const [month] = date.split(' ');
                      if (!acc[month]) acc[month] = [];
                      acc[month].push(date);
                      return acc;
                    }, {});

                    return Object.entries(groupedDates).map(([month, dates]) => (
                      <optgroup key={month} label={month} className="text-[--theme-text-color] opacity-50 text-base">
                        {(dates as string[]).map((date) => (
                          <option key={date} value={date} className="py-2 pl-4 text-[--theme-text-color] opacity-100">
                            {date}
                          </option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRecommendTestDate}
                  className="flex-1 bg-[--theme-button-color] hover:bg-[--theme-hover-color] text-[--theme-text-color] py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-[--theme-border-color] hover:text-[--theme-hover-text]"
                >
                  <svg 
                    className="w-4 h-4 opacity-70" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Recommend
                </button>

                <a 
                  href="https://students-residents.aamc.org/register-mcat-exam/register-mcat-exam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[--theme-button-color] hover:bg-[--theme-hover-color] text-[--theme-text-color] py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-[--theme-border-color] hover:text-[--theme-hover-text]"
                >
                  Register
                </a>
              </div>
            </div>
          </div>
        );
    }
  };
 
  return (
    <div 
      className={`
        ${isInitialSetup 
          ? 'w-full bg-[transparent]' 
          : 'bg-[--theme-leaguecard-color] rounded-2xl shadow-xl absolute right-[2rem] w-[40rem] min-h-[40rem]'
        }
      `}
    >
      <div 
        className={`
          ${isInitialSetup 
            ? 'flex flex-col min-h-[48rem]' 
            : 'rounded-2xl overflow-hidden flex flex-col min-h-full'
          }
          ${isInitialSetup ? 'bg-transparent' : 'bg-[--theme-leaguecard-color]'}
        `}
      >
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`flex flex-col items-center cursor-pointer ${
                    index === currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                    ${index === currentStep 
                      ? 'bg-[--theme-hover-color] text-[--theme-hover-text]' 
                      : 'bg-[--theme-leaguecard-color] text-[--theme-text-color]'
                    }
                  `}>
                    {index + 1}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium text-[--theme-text-color]">{step.title}</div>
                    <div className="text-xs text-[--theme-text-color] opacity-70">{step.subtitle}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-16 h-[2px] bg-[--theme-border-color]" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="flex-1 px-6 py-4 flex items-center justify-center">
          {renderStep(currentStep)}
        </div>

        <div className="p-6 mt-auto flex justify-between">
          <Button
            className="px-6 py-3 rounded-xl text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color]/10"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              className="px-8 py-3 rounded-xl text-[--theme-hover-text] bg-[--theme-hover-color] hover:opacity-90"
              onClick={handleGenerateStudyPlan}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Create Study Plan'
              )}
            </Button>
          ) : (
            <Button
              className="px-6 py-3 rounded-xl text-[--theme-hover-text] bg-[--theme-hover-color] hover:opacity-90"
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingContent;
