// app/(dashboard)/(routes)/home/PracticeTests.tsx
import React, { useState, useEffect } from "react";
import { ChevronRight, Plus, GripVertical, CalendarIcon, BarChart as AnalyticsIcon, ClipboardList } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import TestReview from '@/components/home/TestReview';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import PracticeTestCompleteDialog from '@/components/PracticeTestCompleteDialog';
import { toast } from "react-hot-toast";

interface PracticeTestsProps {
  className?: string;
  handleSetTab?: (tab: string) => void;
}

interface Test {
  id: string;
  activityTitle: string;
  activityText: string;
  status: string;
  scheduledDate: Date;
  fullLengthExam?: {
    dataPulses: Array<{
      positive: number;
      name: string;
    }>;
  };
}

interface StudentStats {
  averageScore: number;
  testsTaken: number;
  testsRemaining: number;
}

// Example array for AAMC tests when activeSection === 'aamc'
// (Assuming these are defined somewhere; adjust as needed)
const AAMCTests = [
  { name: "AAMC FL 1", status: "Not Started" },
  { name: "AAMC FL 2", status: "Not Started" },
  // Add more tests as needed...
];

const COMPANIES = ["AAMC", "Blueprint", "Jack Westin", "Altius"] as const;
type Company = typeof COMPANIES[number];

const COMPANY_INFO = {
  "Jack Westin": {
    url: "https://jackwestin.com/mcat-cars-practice-exams",
    note: "(6 Free FLs)"
  },
  "Blueprint": {
    url: "https://blueprintprep.com/mcat/free-resources/free-mcat-practice-bundle",
    note: "(One Free HL)"
  },
  "AAMC": {
    url: "https://students-residents.aamc.org/prepare-mcat-exam/practice-mcat-exam-official-low-cost-products",
    note: "(Two Free Samples)"
  },
  "Altius": {
    url: "https://altiustestprep.com/practice-exam/free-exam/",
    note: "(One Free FL)"
  }
} as const;

type ValuePiece = Date | null;

interface NewTest {
  company: Company;
  testNumber: string;
  date: Date | null;
  useRecommendedDate: boolean;
}

const PracticeTests: React.FC<PracticeTestsProps> = ({ 
  className,
  handleSetTab 
}) => {
  const [activeSection, setActiveSection] = useState<
    | "aamc"
    | "thirdParty"
    | "myMcat"
    | "custom"
    | "diagnostic"
    | "section"
    | null
  >(null);
  const [date, setDate] = useState<Date>(new Date());
  const [studentStats] = useState<StudentStats>({
    averageScore: 85,
    testsTaken: 3,
    testsRemaining: 8,
  });
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [scheduledTests, setScheduledTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch exam activities on component mount
  useEffect(() => {
    const fetchExamActivities = async () => {
      try {
        const response = await fetch('/api/calendar/exam-activities');
        if (!response.ok) {
          throw new Error('Failed to fetch exam activities');
        }
        const activities = await response.json();
        
        // Transform calendar activities into the Test format
        const transformedTests = activities.map((activity: any) => ({
          id: activity.id,
          activityTitle: activity.activityTitle,
          activityText: activity.activityText,
          status: activity.status,
          scheduledDate: new Date(activity.scheduledDate),
          fullLengthExam: activity.fullLengthExam,
        }));

        setScheduledTests(transformedTests);
      } catch (error) {
        console.error('Error fetching exam activities:', error);
        toast.error('Failed to load scheduled exams');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamActivities();
  }, []);

  // Helper function to get score breakdown from data pulses
  const getScoreBreakdown = (dataPulses: Array<{ positive: number; name: string }> | undefined) => {
    if (!dataPulses) return '';
    
    const scores = {
      cp: 0,
      cars: 0,
      bb: 0,
      ps: 0
    };

    dataPulses.forEach(pulse => {
      if (pulse.name.includes('Chemical')) scores.cp = pulse.positive;
      else if (pulse.name.includes('Critical')) scores.cars = pulse.positive;
      else if (pulse.name.includes('Biological')) scores.bb = pulse.positive;
      else if (pulse.name.includes('Psychological')) scores.ps = pulse.positive;
    });

    return `${scores.cp}/${scores.cars}/${scores.bb}/${scores.ps}`;
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState<NewTest>({
    company: "" as Company,
    testNumber: "",
    date: null,
    useRecommendedDate: true
  });

  const [activeTest, setActiveTest] = useState<Test | null>(null);

  // Helper function to format dates consistently
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get recommended test date
  const getRecommendedTestDate = (): Date => {
    const recommendedDate = new Date();
    recommendedDate.setDate(recommendedDate.getDate() + 7); // Set to 1 week from now
    return recommendedDate;
  };

  const handleAddTest = () => {
    const testId = `${scheduledTests.length + 1}`;
    const testDate = newTest.useRecommendedDate ? getRecommendedTestDate() : newTest.date;
    
    const newTestEntry: Test = {
      id: testId,
      name: `FL${newTest.testNumber}`,
      company: newTest.company,
      status: "Not Started",
      calendarDate: testDate || new Date(), // Fallback to current date if no date is selected
    };

    setScheduledTests([...scheduledTests, newTestEntry]);
    setIsAddDialogOpen(false);
    setNewTest({ company: "" as Company, testNumber: "", date: null, useRecommendedDate: true });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(scheduledTests);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScheduledTests(items);
  };

  const calendarDays = [
    ["26", "27", "28", "29", "30", "1", "2"],
    ["3", "4", "5", "6", "7", "8", "9"],
    ["10", "11", "12", "13", "14", "15", "16"],
    ["17", "18", "19", "20", "21", "22", "23"],
    ["24", "25", "26", "27", "28", "29", "30"],
    ["31", "1", "2", "3", "4", "5", "6"],
  ] as const;

  const isTestDate = (day: string) => {
    // Only process days that are valid numbers
    if (!/^\d+$/.test(day)) return false;
    
    const dayNum = parseInt(day);
    return scheduledTests.some((test) => {
      if (!test.calendarDate) return false;
      return test.calendarDate.getDate() === dayNum;
    });
  };

  const handleCompleteTest = (test: Test) => {
    setSelectedTest(test);
    setIsCompleteDialogOpen(true);
  };

  const handleSubmitScores = (scores: { total: number; cp: number; cars: number; bb: number; ps: number; }) => {
    if (!selectedTest) return;

    const updatedTest = {
      ...selectedTest,
      status: "Completed",
      score: scores.total,
      breakdown: `${scores.cp}/${scores.cars}/${scores.bb}/${scores.ps}`,
      dateTaken: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };

    setScheduledTests(prev => prev.map(t => 
      t.id === selectedTest.id ? updatedTest : t
    ));

    setSelectedTest(null);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-[calc(100vh-8.3rem)]">
          {activeTest ? (
            // When a test is active, it takes up the full container
            <div className="h-full px-4 ">
              <TestReview 
                test={activeTest} 
                onBack={() => setActiveTest(null)} 
              />
            </div>
          ) : (
            // Original layout with calendar and tests
            <>
              {/* Calendar + Scheduled Tests Section */}
              <div className="h-[70%] min-h-0 mb-4">
                <div
                  className="bg-[--theme-leaguecard-color] rounded-xl p-4 sm:p-6 lg:p-8 mx-4 h-full overflow-hidden"
                  style={{
                    boxShadow: "var(--theme-adaptive-tutoring-boxShadow)",
                  }}
                >
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 h-full">
                    {/* Calendar Side - Add overflow handling */}
                    <div className="flex flex-col h-full overflow-hidden">
                      <div className="text-lg font-medium mb-1 text-center">
                        December 2024
                      </div>
                      <div className="flex-1 overflow-auto px-2">
                        {/* Calendar Grid Container */}
                        <div className="h-full flex flex-col">
                          {/* Header Row - Updated with more responsive text sizes */}
                          <div className="grid grid-cols-7 mb-0.5">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                              <div
                                key={day}
                                className="text-center text-[min(0.6rem,1.5vh)] font-medium truncate"
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Grid - Updated cell styling with responsive text */}
                          <div className="flex-1 grid grid-rows-6 min-h-0">
                            {calendarDays.map((week, weekIndex) => (
                              <div key={weekIndex} className="grid grid-cols-7">
                                {week.map((day, dayIndex) => {
                                  const dayNum = parseInt(day);
                                  const isValidDay = !isNaN(dayNum) && dayNum > 0 && dayNum <= 31;
                                  const isCurrentDay = date.getDate() === dayNum;
                                  const hasTest = isTestDate(day);

                                  return (
                                    <div
                                      key={`${weekIndex}-${dayIndex}`}
                                      className={`h-full flex items-center justify-center text-[min(0.7rem,1.8vh)] p-0.5
                                        ${isValidDay ? "hover:bg-[--theme-hover-color] cursor-pointer" : "opacity-30"}
                                        ${isCurrentDay ? "bg-[--theme-hover-color] text-[--theme-hover-text]" : ""}
                                        ${hasTest ? "bg-[--theme-calendar-color] text-[--theme-text-color] font-bold" : ""}
                                      `}
                                      onClick={() => {
                                        if (isValidDay) {
                                          const newDate = new Date(date);
                                          newDate.setDate(dayNum);
                                          setDate(newDate);
                                        }
                                      }}
                                    >
                                      {day}
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Tests Side - Add overflow handling */}
                    <div className="flex flex-col h-full overflow-hidden">
                      <h3 className="text-sm font-medium text-[--theme-text-color] opacity-60 uppercase tracking-wide mb-4 text-center">
                        Scheduled Tests
                      </h3>
                      <div className="flex-1 overflow-auto px-2">
                        {isLoading ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-sm text-gray-500">Loading scheduled exams...</div>
                          </div>
                        ) : (
                          <Droppable droppableId="droppable-tests">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2 pb-2"
                              >
                                {scheduledTests.map((test, index) => (
                                  <Draggable
                                    key={test.id}
                                    draggableId={test.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`flex items-center p-3 bg-[--theme-leaguecard-accent] rounded-lg 
                                          transition-all duration-200
                                          ${snapshot.isDragging ? "opacity-75" : ""}
                                          hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]`}
                                        style={{
                                          ...provided.draggableProps.style,
                                        }}
                                      >
                                        <div
                                          {...provided.dragHandleProps}
                                          className="mr-2 cursor-grab active:cursor-grabbing"
                                        >
                                          <GripVertical className="w-4 h-4 opacity-50" />
                                        </div>
                                        <div className="flex-grow">
                                          <h4 className="text-sm font-medium">
                                            {test.activityTitle}
                                          </h4>
                                          <p className="text-xs opacity-70">
                                            {test.activityText}
                                          </p>
                                          {test.fullLengthExam && (
                                            <p className="text-xs mt-1">
                                              Score: {getScoreBreakdown(test.fullLengthExam.dataPulses)}
                                            </p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            className="text-xs px-2 py-1 rounded-md border border-[--theme-border-color] 
                                              hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                                              transition-colors duration-200"
                                          >
                                            Set Date
                                          </button>
                                          {test.status !== "Completed" && (
                                            <button
                                              onClick={() => handleCompleteTest(test)}
                                              className="text-xs px-2 py-1 rounded-md border border-[--theme-border-color] 
                                                hover:bg-green-500 hover:text-white
                                                transition-colors duration-200"
                                            >
                                              Complete
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>

                      <button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="mt-4 w-full py-2 px-4 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                          rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Practice Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Practice Tests Section */}
              <div className="flex-grow px-4">
                <div className="grid grid-cols-5 gap-4 h-full">
                  {[
                    { 
                      id: "past-1",
                      name: "FL1",
                      company: "AAMC",
                      status: "Completed",
                      score: 527,
                      breakdown: "132/132/132/131",
                      dateTaken: "Dec 15"
                    },
                    { 
                      id: "past-2",
                      name: "FL2",
                      company: "Blueprint",
                      status: "Completed",
                      score: 515,
                      breakdown: "129/128/129/129",
                      dateTaken: "Dec 10"
                    },
                    { 
                      id: "past-3",
                      name: "FL3",
                      company: "AAMC",
                      status: "Completed",
                      score: 508,
                      breakdown: "127/127/127/127",
                      dateTaken: "Dec 5"
                    },
                    { 
                      id: "past-4",
                      name: "FL1",
                      company: "Jack Westin",
                      status: "Completed",
                      score: 498,
                      breakdown: "124/124/125/125",
                      dateTaken: "Nov 30"
                    },
                    { 
                      id: "past-5",
                      name: "FL4",
                      company: "Altius",
                      status: "Completed",
                      score: 522,
                      breakdown: "131/130/131/130",
                      dateTaken: "Nov 25"
                    }
                  ].map((test) => (
                    <div
                      key={test.id}
                      className="h-full p-3 rounded-lg bg-opacity-50 bg-[--theme-leaguecard-accent] 
                        transition-all duration-300 cursor-pointer group
                        hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] hover:transform hover:scale-[1.02]"
                      style={{
                        boxShadow: 'var(--theme-button-boxShadow)',
                        height: '15vh',
                      }}
                      onClick={() => setActiveTest(test)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--theme-button-boxShadow-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--theme-button-boxShadow)';
                      }}
                    >
                      <div className="h-full flex flex-col">
                        <div className="flex justify-between text-[10px] mb-1 opacity-40 group-hover:opacity-100 group-hover:text-[--theme-hover-text] transition-opacity">
                          <span className="text-[10px] opacity-75">{test.company} {test.name}</span>
                          <span className="text-[10px] opacity-75">{test.dateTaken}</span>
                        </div>

                        <div className="flex-grow flex items-center justify-center">
                          <span 
                            className={`text-4xl font-bold leading-none transition-all duration-300
                              opacity-40 group-hover:opacity-100 group-hover:text-[--theme-hover-text]`}
                          >
                            {test.score}
                          </span>
                        </div>

                        <div className="flex justify-center text-[10px] mt-1 opacity-0 group-hover:opacity-100 group-hover:text-[--theme-hover-text] transition-opacity">
                          <span className="opacity-75">
                            {test.breakdown}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* View Toggle Buttons - Positioned like in Schedule.tsx */}
              <div className="flex justify-end px-4 mr-2.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleSetTab?.("Schedule")}
                        className="group w-20 h-20 p-4 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                          border-2 border-[--theme-border-color] 
                          hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                          shadow-md rounded-full transition flex flex-col items-center justify-center gap-1"
                      >
                        <AnalyticsIcon className="w-8 h-8" />
                        <span className="text-xs font-medium">Stats</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Switch to Stats View</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </>
          )}
        </div>
      </DragDropContext>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[40rem] bg-[#f8fafc] text-black">
          <DialogHeader>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <DialogTitle className="text-2xl font-bold text-black">
                    Add Practice Test
                  </DialogTitle>
                  <div className="text-[0.7rem] text-gray-400 italic">
                    Our study tool is unaffiliated. Click visit to access their websites.
                  </div>
                </div>
                {newTest.company && (
                  <a 
                    href={COMPANY_INFO[newTest.company].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-all shadow-sm hover:shadow-md"
                  >
                    <span>Visit</span>
                    <span className="text-[0.625rem] text-gray-500">*</span>
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col space-y-8 py-6">
            <div className="bg-[#8e9aab] bg-opacity-10 p-6 rounded-lg border border-[#e5e7eb] shadow-sm">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">Company</label>
                  <Select
                    value={newTest.company}
                    onValueChange={(value) => setNewTest({ ...newTest, company: value as Company })}
                  >
                    <SelectTrigger className="bg-white border-gray-300 h-10">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map((company) => (
                        <SelectItem key={company} value={company}>
                          <span className="flex items-center justify-between w-full">
                            <span>{company}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {COMPANY_INFO[company].note}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">Full Length Number</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newTest.testNumber}
                    onChange={(e) => setNewTest({ ...newTest, testNumber: e.target.value })}
                    placeholder="Enter test number"
                    className="bg-white border-gray-300 h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Test Date</label>
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="checkbox"
                        checked={newTest.useRecommendedDate}
                        onChange={(e) => setNewTest({ 
                          ...newTest, 
                          useRecommendedDate: e.target.checked,
                          date: null
                        })}
                        className="rounded border-gray-300"
                        id="pickForMe"
                      />
                      <label htmlFor="pickForMe" className="text-sm text-gray-600">
                        Pick for me
                      </label>
                    </div>
                  </div>
                  
                  {newTest.useRecommendedDate ? (
                    <div className="text-sm text-gray-600 italic p-2 bg-gray-50 rounded text-center">
                      We&apos;ll recommend the next available test date based on your study schedule
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Calendar
                        onChange={(value) => setNewTest({ ...newTest, date: value as Date })}
                        value={newTest.date}
                        className="w-fit bg-white rounded-lg shadow-sm"
                        tileClassName="text-gray-700"
                        minDate={new Date()}
                        formatMonthYear={(locale, date) => {
                          return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                        }}
                      />
                    </div>
                  )}
                  
                  {newTest.date && (
                    <div className="text-sm text-gray-600 mt-1 text-center">
                      Selected date: {formatDate(newTest.date)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="px-4 py-1.5 text-gray-600 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTest}
                disabled={!newTest.company || !newTest.testNumber || (!newTest.date && !newTest.useRecommendedDate)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Test
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PracticeTestCompleteDialog
        isOpen={isCompleteDialogOpen}
        onClose={() => setIsCompleteDialogOpen(false)}
        onSubmit={handleSubmitScores}
        testTitle={selectedTest?.name || "Practice Test"}
      />
    </div>
  );
};

export default PracticeTests;
