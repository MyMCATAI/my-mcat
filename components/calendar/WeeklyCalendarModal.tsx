import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, startOfWeek } from "date-fns";
import { X, Check, Loader2, ArrowRight, ArrowLeft, Calendar as CalendarIcon, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import "react-day-picker/dist/style.css";
import { useExamActivities, CalendarActivity } from "@/hooks/useCalendarActivities";
import DatePickerDialog from "@/components/DatePickerDialog";
import { useStudyPlan } from '@/hooks/useStudyPlan';
import { toast } from "react-hot-toast";
import ResetConfirmDialog from "@/components/calendar/ResetConfirmDialog";

interface WeeklyCalendarModalProps {
  onComplete?: (result: { success: boolean; action?: 'generate' | 'save' | 'reset' }) => Promise<boolean>;
  isInitialSetup?: boolean;
  onClose?: () => void;
}

interface Resource {
  id: string;
  name: string;
  selected: boolean;
}

interface StudyBalance {
  id: string;
  ratio: string;
  description: string;
}

const examDescriptions = {
  "Unscored Sample": "The Unscored Sample is your first step into AAMC-style questions. While unscored, it's crucial for understanding the test format and identifying initial content gaps. It's not representative. Take this first and focus on content.",
  "Full Length Exam 1": "FL1 is typically easier than later exams but provides accurate CARS difficulty. Generally, we recommend more content-heavy resources for this exam interspersed with practice questions. It's semi-representative.",
  "Full Length Exam 2": "FL2 is known for its challenging Biology/Biochemistry section. The CARS section tends to be slightly more difficult than FL1. This exam helps assess your content mastery mid-way through your studies.",
  "Full Length Exam 3": "FL3 is considered slightly inflated. The Psychology/Sociology section is particularly considered easy. However, it is a good exam for diagnosing certain weaknesses in the sciences. After this point, your schedule will focus on AAMC.",
  "Full Length Exam 4": "FL4 features more research-heavy passages and data interpretation. The Chemical/Physical section is notably challenging. This exam is crucial for identifying last-minute weaknesses. If you score poorly, reschedule.",
  "Sample Scored (FL5)": "The final practice exam before your test day. Known for having the most up-to-date question style and difficulty level. Focus on timing and stamina, treating it exactly like the MCAT. If you score poorly, reschedule."
} as const;

type ExamName = keyof typeof examDescriptions;

interface ExamSchedule {
  date: Date;
  examName: ExamName;
}

interface Resource {
  id: string;
  name: string;
  selected: boolean;
}

interface StudyBalance {
  id: string;
  ratio: string;
  description: string;
}

const steps = [
  {
    title: "Next Steps",
    subtitle: "Review your progress"
  },
  {
    title: "Weekly Schedule",
    subtitle: "Plan your study time"
  },
  {
    title: "Resources",
    subtitle: "Choose your materials"
  },
  {
    title: "Study Balance",
    subtitle: "Content vs Practice"
  }
];

const WeeklyCalendarModal: React.FC<WeeklyCalendarModalProps> = ({
  onComplete,
  isInitialSetup = false,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [testDate, setTestDate] = useState<Date | null>(new Date('2024-01-24'));
  const [weeklyHours, setWeeklyHours] = useState<Record<string, string>>({});
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [allWeeksHours, setAllWeeksHours] = useState<Record<string, Record<string, string>>>({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const { activities: examActivities, loading: examLoading, error: examError, updateExamDate, deleteExamActivity } = useExamActivities();
  const [resources, setResources] = useState<Resource[]>([
    { id: 'adaptive', name: 'MyMCAT Adaptive Tutoring', selected: true },
    { id: 'ankigame', name: 'MyMCAT Anki Clinic', selected: false },
    { id: 'uworld', name: 'UWorld', selected: false },
    { id: 'aamc', name: 'AAMC Materials', selected: false },
    { id: 'anki', name: 'Anki', selected: false },
  ]);

  const balanceOptions: StudyBalance[] = [
    { id: '75-25', ratio: 'More Content', description: '75% Content, 25% Practice' },
    { id: '50-50', ratio: 'Balanced', description: '50% Content, 50% Practice' },
    { id: '25-75', ratio: 'More Practice', description: '25% Content, 75% Practice' }
  ];

  const [selectedBalance, setSelectedBalance] = useState<string>('50-50');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState<string[]>([]);
  const [examSchedule, setExamSchedule] = useState<ExamSchedule[]>([]);

  const messages = [
    "Purr-using your past exams...",
    "Clawing at your vulnerabilities...",
    "Picking out subjects...",
    "Nibbling on some catnip...",
    "Your study plan is now ready!"
  ];

  const { generateTasks, loading: studyPlanLoading } = useStudyPlan();

  // Function to get week identifier
  const getWeekIdentifier = (date: Date) => {
    return format(startOfWeek(date), 'yyyy-MM-dd');
  };

  // Add state synchronization
  useEffect(() => {
    const weekId = getWeekIdentifier(currentWeekStart);
    if (allWeeksHours[weekId]) {
      setWeeklyHours(allWeeksHours[weekId]);
    } else {
      setWeeklyHours({}); // Reset when switching to a new week
    }
  }, [currentWeekStart, allWeeksHours]);

  // Load hours for current week
  useEffect(() => {
    const weekId = getWeekIdentifier(currentWeekStart);
    if (allWeeksHours[weekId]) {
      setWeeklyHours(allWeeksHours[weekId]);
    } else {
      setWeeklyHours({});
    }
  }, [currentWeekStart, allWeeksHours]);

  const getNextExam = () => {
    if (!examActivities) return null;
    
    const now = new Date();
    return examActivities
      .filter((activity: CalendarActivity) => new Date(activity.scheduledDate) > now)
      .sort((a: CalendarActivity, b: CalendarActivity) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      )[0];
  };

  // Generate all days until next exam
  const getAllDaysUntilExam = () => {
    const nextExam = getNextExam();
    if (!nextExam) return [];
    
    const days = [];
    let currentDate = new Date();
    const examDate = new Date(nextExam.scheduledDate);
    
    while (currentDate <= examDate) {
      days.push({
        date: new Date(currentDate),
        dayName: format(currentDate, 'EEEE'),
        dayDate: format(currentDate, 'MMM d'),
        isValid: true
      });
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  };

  // Handle setting hours for all specific weekdays
  const handleSetForWeekday = (targetDayName: string, hours: string) => {
    const newHours = { ...weeklyHours };
    getAllDaysUntilExam().forEach(({ dayName, date }) => {
      if (dayName === targetDayName) {
        newHours[format(date, 'yyyy-MM-dd')] = hours;
      }
    });
    setWeeklyHours(newHours);
  };

  // Handle setting hours for all days
  const handleSetForAllDays = (hours: string) => {
    const newHours = { ...weeklyHours };
    getAllDaysUntilExam().forEach(({ date }) => {
      newHours[format(date, 'yyyy-MM-dd')] = hours;
    });
    setWeeklyHours(newHours);
  };

  const handleHoursChange = (date: Date, hours: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const newHours = {
      ...weeklyHours,
      [dateKey]: hours
    };
    setWeeklyHours(newHours);
  };

  // Generate tasks when completing the schedule
  const handleScheduleComplete = async () => {
    if (!testDate) return;
    
    const nextExam = getNextExam();
    if (!nextExam) {
      toast.error('Please schedule an exam first');
      return;
    }

    try {
      setIsGenerating(true);
      setCurrentStep(4);  // Move to generation step

      // Show first message immediately
      setLoadingMessages([messages[0]]);

      // Get current date with time set to start of day in UTC
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(today.toISOString());

      // Set end date to end of the exam day in UTC
      const endDate = new Date(nextExam.scheduledDate);
      endDate.setHours(23, 59, 59, 999);

      const response = await generateTasks({
        resources: {
          uworld: resources.find(r => r.id === 'uworld')?.selected || false,
          aamc: resources.find(r => r.id === 'aamc')?.selected || false,
          adaptive: resources.find(r => r.id === 'adaptive')?.selected || false,
          ankigame: resources.find(r => r.id === 'ankigame')?.selected || false,
          anki: resources.find(r => r.id === 'anki')?.selected || false,
        },
        hoursPerDay: weeklyHours,
        selectedBalance,
        startDate,
        endDate,
        examDate: new Date(nextExam.scheduledDate)
      });

      // After getting response, show remaining messages with delay
      for (let i = 1; i < messages.length - 1; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoadingMessages(prev => [...prev, messages[i]]);
      }

      // Add a new loading message for refreshing activities
      setLoadingMessages(prev => [...prev, "Refreshing your calendar..."]);

      // Wait for activities to refresh
      if (onComplete) {
        const refreshSuccess = await onComplete({ success: true, action: 'generate' });
        if (!refreshSuccess) {
          throw new Error('Failed to refresh activities');
        }
      }

      // Show final success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingMessages(prev => [...prev, messages[messages.length - 1]]);

      // Wait a final second before closing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Close the modal
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
      toast.error('Failed to create schedule. Please try again.');
      setCurrentStep(3); // Return to previous step on failure
    } finally {
      setIsGenerating(false);
    }
  };

  // Animation variants for the day boxes
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  const handleDateSelect = async (date: Date) => {
    if (selectedExamId) {
      if (date < new Date()) {
        toast.error("Cannot schedule exams in the past");
        return;
      }
      
      try {
        await updateExamDate(selectedExamId, date);
        setDatePickerOpen(false);
        setSelectedExamId(null);
      } catch (error) {
        toast.error('Failed to update exam date');
      }
    }
  };

  const handleOpenDatePicker = (examId: string) => {
    setSelectedExamId(examId);
    setDatePickerOpen(true);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        const nextExam = getNextExam();
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="bg-[--theme-leaguecard-color] rounded-xl p-6 mb-6 max-w-3xl mx-auto">
                {nextExam ? (
                  <>
                    <p className="text-lg text-[--theme-text-color] mb-6 whitespace-pre-line">
                      {examDescriptions[nextExam.activityTitle as ExamName] || ""}
                    </p>
                    <div className="flex flex-col items-center gap-4 mt-6 pt-6 border-t border-[--theme-border-color]">
                      <div className="text-[--theme-text-color] text-lg">
                        Your next exam ({nextExam.activityTitle}) is scheduled for {format(new Date(nextExam.scheduledDate), 'MMMM do, yyyy')}
                      </div>
                      <Button
                        onClick={() => handleOpenDatePicker(nextExam.id)}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        Change Exam Date
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-6">
                    <p className="text-lg text-[--theme-text-color]">
                      No upcoming exams scheduled.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/examcalendar'}
                      variant="default"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      Regenerate Your Exam Schedule
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 1:
        const availableDays = getAllDaysUntilExam();
        const uniqueWeekdays = Array.from(new Set(availableDays.map(day => day.dayName)));
        
        return (
          <div className="space-y-4 p-4">
            <div className="text-center">
              {getNextExam() ? (
                <p className="text-[--theme-emphasis-color] text-sm">
                  {format(new Date(), 'MMMM do')} → {format(new Date(getNextExam()!.scheduledDate), 'MMMM do')} ({getNextExam()!.activityTitle})
                </p>
              ) : (
                <p className="text-[--theme-emphasis-color] text-sm">
                  Please add a future test before scheduling your weel;y schedule.
                </p>
              )}
            </div>

            {getNextExam() ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-2xl mx-auto"
              >
                <div className="bg-[--theme-leaguecard-color] rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[--theme-border-color] flex items-center justify-between">
                    <span className="text-[--theme-text-color] text-sm">Quick Actions</span>
                    <div className="flex gap-2 items-center">
                      <div className="flex items-center gap-2">
                      <span className="text-[--theme-text-color] opacity-70 text-sm">Set all days </span>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          placeholder="0"
                          className="w-16 bg-transparent border border-[--theme-border-color] rounded-md px-2 py-1 text-center text-[--theme-text-color] placeholder-[--theme-text-color]/50 focus:outline-none focus:border-[--theme-hover-color]"
                          onChange={(e) => {
                            if (e.target.value && Number(e.target.value) >= 0) {
                              handleSetForAllDays(e.target.value);
                            }
                          }}
                        />
                      </div>
                      <select
                        onChange={(e) => {
                          const [day, hours] = e.target.value.split('|');
                          if (hours) handleSetForWeekday(day, hours);
                          e.target.value = '';
                        }}
                        className="bg-[--theme-button-color] text-[--theme-text-color] border border-[--theme-border-color] rounded-md px-3 py-1 text-sm hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] cursor-pointer"
                      >
                        <option value="">Set by weekday...</option>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <optgroup key={day} label={`Set all ${day}s`}>
                            {[0, 2, 4, 6].map(hours => (
                              <option key={`${day}-${hours}`} value={`${day}|${hours}`}>
                                {hours === 0 ? 'Break day' : `${hours} hours`}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="divide-y divide-[--theme-border-color]">
                    {availableDays.map(({ date, dayName, dayDate }) => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      const hours = weeklyHours[dateKey] || '';
                      const isBreak = hours === '0';

                      return (
                        <motion.div
                          key={dateKey}
                          variants={itemVariants}
                          className={`flex items-center justify-between p-4 ${
                            isBreak ? 'bg-[--theme-border-color] bg-opacity-10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-6">
                            <div>
                              <div className="text-[--theme-text-color] font-medium">{dayName}</div>
                              <div className="text-[--theme-text-color] opacity-70 text-sm">{dayDate}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="24"
                                value={hours}
                                onChange={(e) => handleHoursChange(date, e.target.value)}
                                placeholder="0"
                                className={`w-16 bg-transparent border border-[--theme-border-color] rounded-md px-2 py-1 text-center text-[--theme-text-color] placeholder-[--theme-text-color]/50 focus:outline-none focus:border-[--theme-hover-color] ${
                                  isBreak ? 'opacity-50' : ''
                                }`}
                              />
                              <span className="text-[--theme-text-color] opacity-70 text-sm">hours</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleHoursChange(date, isBreak ? '' : '0')}
                            className={`min-w-[4.5rem] px-3 py-1.5 rounded-md text-sm border transition-all duration-200 ${
                              isBreak 
                                ? 'bg-[--theme-hover-color] text-[--theme-hover-text] border-[--theme-hover-color] opacity-90'
                                : 'border-[--theme-border-color] text-[--theme-text-color] opacity-30 hover:opacity-100 hover:text-[--theme-hover-text] hover:bg-[--theme-hover-color] hover:border-[--theme-hover-color]'
                            }`}
                          >
                            Break
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 p-6">
            <div className="text-center">
              <p className="text-[--theme-emphasis-color] text-base">
                Select the resources you&apos;ll use to prepare for your {getNextExam()?.activityTitle}
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-2xl mx-auto"
            >
              <div className="bg-[--theme-leaguecard-color] rounded-xl overflow-hidden">
                <div className="divide-y divide-[--theme-border-color]">
                  {resources.map((resource) => (
                    <motion.button
                      key={resource.id}
                      onClick={() => {
                        if (resource.id === 'adaptive') return;
                        setResources(resources.map(r => {
                          // If clicking on anki or ankigame, deselect the other one
                          if (resource.id === 'anki' && r.id === 'ankigame') {
                            return { ...r, selected: false };
                          }
                          if (resource.id === 'ankigame' && r.id === 'anki') {
                            return { ...r, selected: false };
                          }
                          // Toggle the clicked resource
                          if (r.id === resource.id) {
                            return { ...r, selected: !r.selected };
                          }
                          return r;
                        }));
                      }}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        resource.selected ? 'bg-[--theme-border-color] bg-opacity-10' : ''
                      } ${resource.id === 'adaptive' ? 'cursor-default' : ''}`}
                    >
                      <span className="text-[--theme-text-color]">{resource.name}</span>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        resource.selected 
                          ? 'border-[--theme-hover-color] bg-[--theme-hover-color]' 
                          : 'border-[--theme-text-color]'
                      }`}>
                        {resource.selected && <Check className="w-4 h-4 text-[--theme-hover-text]" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 p-6">
            <div className="text-center">
              <p className="text-[--theme-emphasis-color] text-base">
                Choose how to balance content review and practice
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="max-w-2xl mx-auto"
            >
              <div className="bg-[--theme-leaguecard-color] rounded-xl overflow-hidden">
                <div className="divide-y divide-[--theme-border-color]">
                  {balanceOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setSelectedBalance(option.id)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        selectedBalance === option.id ? 'bg-[--theme-border-color] bg-opacity-10' : ''
                      }`}
                    >
                      <div className="text-left">
                        <div className="text-[--theme-text-color] font-medium">{option.ratio}</div>
                        <div className="text-[--theme-text-color] opacity-70 text-sm">{option.description}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        selectedBalance === option.id
                          ? 'border-[--theme-hover-color] bg-[--theme-hover-color]' 
                          : 'border-[--theme-text-color]'
                      }`}>
                        {selectedBalance === option.id && <Check className="w-4 h-4 text-[--theme-hover-text]" />}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center p-6"
          >
            <div className="space-y-4 w-full max-w-md">
              {loadingMessages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[--theme-leaguecard-color] p-4 rounded-lg shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[--theme-hover-color]" />
                    </div>
                    <p className="text-[--theme-text-color] font-medium">{message}</p>
                  </div>
                </motion.div>
              ))}
              {isGenerating && loadingMessages.length < messages.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center space-x-3 text-[--theme-text-color] p-4"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Generating your schedule...</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Add persistence for weekly hours
  useEffect(() => {
    // Save to localStorage or backend whenever allWeeksHours changes
    if (Object.keys(allWeeksHours).length > 0) {
      localStorage.setItem('studySchedule', JSON.stringify(allWeeksHours));
      // Or save to backend
      // await saveStudySchedule(allWeeksHours);
    }
  }, [allWeeksHours]);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <>
      <div className="bg-[--theme-mainbox-color] w-full h-[90vh] flex flex-col rounded-lg">
        {/* Progress Steps */}
        <div className="flex items-center justify-center px-8 py-6 border-b border-[--theme-border-color]">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div 
                  className={`flex flex-col items-center ${
                    index === currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                    transition-all duration-200
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

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep < 4 && (
          <div className="border-t border-[--theme-border-color] p-6 flex justify-between items-center">
            <Button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              variant="secondary"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={() => setIsResetConfirmOpen(true)}
              variant="secondary"
              size="sm"
              className="opacity-70 hover:opacity-100 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
            >
              Reset Schedule
            </Button>

            <Button
              onClick={() => {
                if (currentStep === 3) {
                  // Validate before proceeding
                  const hasNoHours = Object.values(weeklyHours).every(hours => !hours || hours === '0');
                  if (hasNoHours) {
                    toast.error('Please set study hours for at least one day before generating the schedule.');
                    return;
                  }
                  
                  const hasNoResources = resources.every(r => !r.selected || r.id === 'adaptive');
                  if (hasNoResources) {
                    toast.error('Please select at least one additional resource besides Adaptive Tutoring.');
                    return;
                  }

                  setCurrentStep(4);
                  handleScheduleComplete();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              variant="default"
              size="sm"
            >
              {currentStep === 3 ? 'Create Schedule' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
      <DatePickerDialog
        isOpen={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
          setSelectedExamId(null);
        }}
        onDateSelect={handleDateSelect}
        currentDate={selectedExamId && examActivities ? new Date(examActivities.find(a => a.id === selectedExamId)?.scheduledDate || '') : undefined}
        testName={selectedExamId && examActivities ? examActivities.find(a => a.id === selectedExamId)?.activityTitle : undefined}
      />
      <ResetConfirmDialog 
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onComplete={async (result) => {
          if (result.success) {
            // Reset local state after successful reset
            setWeeklyHours({});
            setResources(resources.map(r => ({
              ...r,
              selected: r.id === 'adaptive'
            })));
            setSelectedBalance('50-50');
            setCurrentStep(0);
            setLoadingMessages([]);
            setIsGenerating(false);
            
            // Show success toast
            toast.success('Schedule reset successfully');
            
            // Notify parent
            if (onComplete) {
              return await onComplete(result);
            }
          }
          return true;
        }}
      />
    </>
  );
};

export default WeeklyCalendarModal;