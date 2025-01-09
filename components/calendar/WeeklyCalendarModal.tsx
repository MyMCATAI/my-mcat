import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, startOfWeek } from "date-fns";
import { X, Check, Loader2, ArrowRight, ArrowLeft, Calendar as CalendarIcon, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import Calendar from "@/components/ui/calendar";
import "react-day-picker/dist/style.css";

interface WeeklyCalendarModalProps {
  onComplete?: (result: { success: boolean; action?: 'generate' | 'save' }) => void;
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

interface Subject {
  id: string;
  name: string;
  selected: boolean;
}

const examDescriptions = {
  "AAMC Unscored Sample": "The Unscored Sample is your first step into AAMC-style questions. While unscored, it's crucial for understanding the test format and identifying initial content gaps. Take this early in your prep to establish a baseline.",
  "AAMC Full Length Exam 1": "FL1 is typically easier than later exams but provides accurate CARS difficulty. Use this to gauge your progress and identify areas needing focus. Many find the Chemical/Physical foundations section particularly representative.",
  "AAMC Full Length Exam 2": "FL2 is known for its challenging Biology/Biochemistry section. The CARS section tends to be slightly more difficult than FL1. This exam helps assess your content mastery mid-preparation.",
  "AAMC Full Length Exam 3": "FL3 is considered most representative of recent MCAT exams. The Psychology/Sociology section is particularly challenging. Use this exam to get the most accurate prediction of your performance.",
  "AAMC Full Length Exam 4": "FL4 features more research-heavy passages and data interpretation. The Chemical/Physical section is notably challenging. This exam is crucial for identifying last-minute weak areas.",
  "AAMC Sample Scored (FL5)": "The final practice exam before your test day. Known for having the most up-to-date question style and difficulty level. Focus on timing and stamina, treating it exactly like the real exam."
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

interface Subject {
  id: string;
  name: string;
  selected: boolean;
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
  },
  {
    title: "Subject Focus",
    subtitle: "Select your focus areas"
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
  const [resources, setResources] = useState<Resource[]>([
    { id: 'uworld', name: 'UWorld', selected: false },
    { id: 'aamc', name: 'AAMC', selected: false },
    { id: 'adaptive', name: 'MyMCAT Adaptive Tutoring', selected: false },
    { id: 'ankigame', name: 'MyMCAT Anki Game', selected: false },
  ]);

  const balanceOptions: StudyBalance[] = [
    { id: '25-75', ratio: '25/75', description: 'Focus on Practice (25% Content, 75% Practice)' },
    { id: '50-50', ratio: '50/50', description: 'Balanced (50% Content, 50% Practice)' },
    { id: '75-25', ratio: '75/25', description: 'Focus on Content (75% Content, 25% Practice)' },
  ];

  const [selectedBalance, setSelectedBalance] = useState<string>('50-50');
  
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'cp', name: 'Chemical and Physical Foundations of Biological Systems', selected: true },
    { id: 'cars', name: 'Critical Analysis and Reasoning Skills', selected: true },
    { id: 'bb', name: 'Biological and Biochemical Foundations of Living Systems', selected: true },
    { id: 'ps', name: 'Psychological, Social, and Biological Foundations of Behavior', selected: true },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState<string[]>([]);
  const [examSchedule, setExamSchedule] = useState<ExamSchedule[]>([]);

  const messages = [
    "Analyzing your study patterns...",
    "Balancing content and practice...",
    "Optimizing your schedule...",
    "Creating personalized tasks...",
    "Almost there...",
  ];

  const simulateScheduleGeneration = async () => {
    setIsGenerating(true);
    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingMessages(prev => [...prev, message]);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (onComplete) {
      onComplete({ success: true });
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

  // Generate the week days
  const weekDays = [...Array(7)].map((_, i) => {
    const date = addDays(currentWeekStart, i);
    return {
      date,
      dayName: format(date, 'EEEE'),
      dayDate: format(date, 'MMM d')
    };
  });

  const getTestDateDescription = () => {
    // Find the next scheduled exam
    const nextExam = examSchedule.find(exam => {
      const examDate = new Date(exam.date);
      return examDate >= new Date();
    });

    if (!nextExam) {
      // Default to AAMC Unscored Sample description if no exam is scheduled
      return `${examDescriptions["AAMC Unscored Sample"]}\n\nYour test is scheduled for ${testDate ? format(testDate, 'MMMM do, yyyy') : 'January 24th'}.`;
    }

    return `${examDescriptions[nextExam.examName]}\n\nYour next exam (${nextExam.examName}) is scheduled for ${format(nextExam.date, 'MMMM do, yyyy')}.`;
  };

  const handleHoursChange = (day: string, hours: string) => {
    setWeeklyHours(prev => ({
      ...prev,
      [day]: hours
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="text-center">
              <p className="text-lg text-[--theme-text-color] mb-6 whitespace-pre-line max-w-2xl mx-auto">
                {getTestDateDescription()}
              </p>
              
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-[--theme-text-color] opacity-70 text-sm">
                  Click to change your test date:
                </div>
                <div className="relative w-fit">
                  <Calendar
                    mode="single"
                    selected={testDate}
                    onSelect={(date) => setTestDate(date)}
                    className="rounded-md border-2 border-[--theme-border-color]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-xl text-[--theme-text-color] mb-2">Your Study Week</h3>
              <p className="text-[--theme-text-color] opacity-70">
                Enter your available study hours for each day. Click the coffee icon for that day off.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-7 gap-4"
            >
              {weekDays.map(({ dayName, dayDate }) => (
                <motion.div
                  key={dayName}
                  variants={itemVariants}
                  className="flex flex-col items-center"
                >
                  <div className="w-full bg-[--theme-leaguecard-color] rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center relative">
                      <div className="text-[--theme-text-color] font-medium">{dayName}</div>
                      <div className="flex items-center">
                        <AnimatePresence>
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            whileHover={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="overflow-hidden flex items-center"
                          >
                            <motion.span className="text-sm text-[--theme-text-color] opacity-70 mr-2 whitespace-nowrap">
                              break?
                            </motion.span>
                          </motion.div>
                        </AnimatePresence>
                        <button
                          onClick={() => handleHoursChange(dayName, '0')}
                          className="text-[--theme-text-color] opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <Coffee className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[--theme-text-color] opacity-70 text-sm">{dayDate}</div>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={weeklyHours[dayName] || ''}
                      onChange={(e) => handleHoursChange(dayName, e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent border-2 border-[--theme-border-color] rounded-lg px-3 py-2 text-center text-[--theme-text-color] placeholder-[--theme-text-color]/50 focus:outline-none focus:border-[--theme-hover-color]"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                className="text-[--theme-text-color] border-[--theme-border-color]"
                onClick={() => {/* handle keep consistent */}}
              >
                Set for All Weeks
              </Button>
              <Button 
                variant="outline"
                className="text-[--theme-text-color] border-[--theme-border-color]"
                onClick={() => {/* handle next week */}}
              >
                Go to Next Week
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-xl text-[--theme-text-color] mb-2">Study Resources</h3>
              <p className="text-[--theme-text-color] opacity-70">
                Select the resources you plan to use in your study schedule
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {resources.map((resource) => (
                <motion.button
                  key={resource.id}
                  onClick={() => {
                    setResources(resources.map(r => 
                      r.id === resource.id ? { ...r, selected: !r.selected } : r
                    ));
                  }}
                  className={`
                    p-4 rounded-xl border-2 flex items-center justify-between
                    ${resource.selected 
                      ? 'border-[--theme-hover-color] bg-[--theme-hover-color] bg-opacity-10' 
                      : 'border-[--theme-border-color]'
                    }
                  `}
                >
                  <span className="text-[--theme-text-color]">{resource.name}</span>
                  {resource.selected && <Check className="w-5 h-5 text-[--theme-hover-color]" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-xl text-[--theme-text-color] mb-2">Content vs Practice Balance</h3>
              <p className="text-[--theme-text-color] opacity-70">
                Choose your preferred balance between content review and practice questions
              </p>
            </div>

            <div className="space-y-4">
              {balanceOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setSelectedBalance(option.id)}
                  className={`
                    w-full p-6 rounded-xl border-2 flex items-center justify-between
                    ${selectedBalance === option.id 
                      ? 'border-[--theme-hover-color] bg-[--theme-hover-color] bg-opacity-10' 
                      : 'border-[--theme-border-color]'
                    }
                  `}
                >
                  <div className="text-left">
                    <div className="text-lg font-medium text-[--theme-text-color]">{option.ratio}</div>
                    <div className="text-sm text-[--theme-text-color] opacity-70">{option.description}</div>
                  </div>
                  {selectedBalance === option.id && <Check className="w-5 h-5 text-[--theme-hover-color]" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-xl text-[--theme-text-color] mb-2">Subject Focus</h3>
              <p className="text-[--theme-text-color] opacity-70">
                Check the subjects you want in your weekly schedule.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {subjects.map((subject) => (
                <motion.button
                  key={subject.id}
                  onClick={() => {
                    setSubjects(subjects.map(s => 
                      s.id === subject.id ? { ...s, selected: !s.selected } : s
                    ));
                  }}
                  className={`
                    p-6 rounded-xl border-2 flex items-center justify-between
                    ${subject.selected 
                      ? 'border-[--theme-hover-color] bg-[--theme-hover-color] bg-opacity-10 text-[--theme-hover-text]' 
                      : 'border-[--theme-border-color] text-[--theme-text-color] hover:text-[--theme-hover-text]'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-5 h-5 rounded border flex items-center justify-center
                      ${subject.selected 
                        ? 'border-[--theme-hover-color] bg-[--theme-hover-color]' 
                        : 'border-[--theme-text-color]'
                      }
                    `}>
                      {subject.selected && <Check className="w-4 h-4 text-[--theme-hover-text]" />}
                    </div>
                    <span>{subject.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center space-y-8"
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
              {isGenerating && loadingMessages.length < messages.length && (
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

  return (
    <div className="bg-[--theme-mainbox-color] w-full h-[50rem] flex flex-col rounded-lg">
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
      {currentStep < 5 && (
        <div className="border-t border-[--theme-border-color] p-6 flex justify-between items-center">
          <Button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            variant="outline"
            className="text-[--theme-text-color]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentStep === 4) {
                setCurrentStep(5);
                simulateScheduleGeneration();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            className="bg-[--theme-hover-color] text-[--theme-hover-text] hover:bg-[--theme-hover-color] hover:opacity-80 transition-opacity"
          >
            {currentStep === 4 ? 'Create Schedule' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[--theme-text-color] hover:opacity-70 transition-opacity"
        >
          <X className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default WeeklyCalendarModal;
