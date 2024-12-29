// app/(dashboard)/(routes)/home/PracticeTests.tsx
import React, { useState } from "react";
import { ChevronRight, Plus, GripVertical } from "lucide-react";
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

interface PracticeTestsProps {
  className?: string;
}

interface Test {
  id: string;
  name: string;
  company: string;
  status: string;
  calendarDate?: number;
  score?: number;
  breakdown?: string;
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
type Value = ValuePiece | [ValuePiece, ValuePiece];

const PracticeTests: React.FC<PracticeTestsProps> = ({ className }) => {
  const [activeSection, setActiveSection] = useState<
    | "aamc"
    | "thirdParty"
    | "myMcat"
    | "custom"
    | "diagnostic"
    | "section"
    | null
  >(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studentStats] = useState<StudentStats>({
    averageScore: 85, // Example value - replace with actual data
    testsTaken: 3, // Example value - replace with actual data
    testsRemaining: 8, // Example value - replace with actual data
  });

  const [scheduledTests, setScheduledTests] = useState<Test[]>([
    {
      id: "1",
      name: "Full Length 1",
      company: "AAMC",
      status: "Not Started",
      calendarDate: 12,
    },
    {
      id: "2",
      name: "Sample Unscored",
      company: "AAMC",
      status: "Not Started",
      calendarDate: 15,
    },
    {
      id: "3",
      name: "Full Length 3",
      company: "Blueprint",
      status: "Not Started",
      calendarDate: 20,
    },
    {
      id: "4",
      name: "Full Length 4",
      company: "AAMC",
      status: "Not Started",
      calendarDate: 25,
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    company: "" as Company,
    testNumber: "",
    date: null as Date | null,
    useRecommendedDate: true
  });

  const [activeTest, setActiveTest] = useState<Test | null>(null);

  const handleAddTest = () => {
    const testId = `${scheduledTests.length + 1}`;
    const newTestEntry: Test = {
      id: testId,
      name: `FL${newTest.testNumber}`,
      company: newTest.company,
      status: "Not Started",
      calendarDate: parseInt(newTest.date),
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
  ];

  const isTestDate = (day: string) => {
    return scheduledTests.some((test) => test.calendarDate === parseInt(day));
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-[calc(100vh-16rem)]">
          {activeTest ? (
            // When a test is active, it takes up the full container
            <div className="h-full px-4">
              <TestReview 
                test={activeTest} 
                onBack={() => setActiveTest(null)} 
              />
            </div>
          ) : (
            // Original layout with calendar and tests
            <>
              {/* Calendar + Scheduled Tests Section */}
              <div className="h-[70%] min-h-0 mb-4 mt-1">
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
                                {week.map((day, dayIndex) => (
                                  <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={`h-full flex items-center justify-center text-[min(0.7rem,1.8vh)] p-0.5
                                      ${parseInt(day) > 0 && parseInt(day) <= 31 ? "hover:bg-[--theme-hover-color] cursor-pointer" : "opacity-30"}
                                      ${date?.getDate() === parseInt(day) ? "bg-[--theme-hover-color] text-[--theme-hover-text]" : ""}
                                      ${isTestDate(day) ? "bg-[--theme-calendar-color] text-[--theme-text-color] font-bold" : ""}
                                    `}
                                  >
                                    {day}
                                  </div>
                                ))}
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
                                          {test.name}
                                        </h4>
                                        <p className="text-xs opacity-70">
                                          {test.company}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <button
                                          className="text-xs px-2 py-1 rounded-md border border-[--theme-border-color] 
                                            hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                                            transition-colors duration-200"
                                        >
                                          Set Date
                                        </button>
                                        <button
                                          className="text-xs px-2 py-1 rounded-md border border-[--theme-border-color] 
                                            hover:bg-green-500 hover:text-white
                                            transition-colors duration-200"
                                        >
                                          Complete
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
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
              <div className="h-[25%] px-4 mt-1">
                <div className="grid grid-cols-5 gap-4 h-full">
                  {[
                    { company: "AAMC", testNumber: "FL1", score: 527, breakdown: "132/132/132/131", dateTaken: "Dec 15" },
                    { company: "Blueprint", testNumber: "FL2", score: 515, breakdown: "129/128/129/129", dateTaken: "Dec 10" },
                    { company: "AAMC", testNumber: "FL3", score: 508, breakdown: "127/127/127/127", dateTaken: "Dec 5" },
                    { company: "Jack Westin", testNumber: "FL1", score: 498, breakdown: "124/124/125/125", dateTaken: "Nov 30" },
                    { company: "Altius", testNumber: "FL4", score: 522, breakdown: "131/130/131/130", dateTaken: "Nov 25" },
                  ].map((test, index) => (
                    <div
                      key={index}
                      className="h-full p-3 rounded-lg bg-opacity-50 bg-[--theme-leaguecard-accent] 
                        transition-all duration-300 cursor-pointer group
                        hover:bg-opacity-100 hover:transform hover:scale-[1.02]"
                      style={{
                        boxShadow: 'var(--theme-button-boxShadow)',
                        height: '15vh',
                      }}
                      onClick={() => setActiveTest(test)}
                    >
                      <div className="h-full flex flex-col">
                        {/* Company and Date - Always visible but muted */}
                        <div className="flex justify-between text-[10px] mb-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] opacity-75">{test.company} {test.testNumber}</span>
                          <span className="text-[10px] opacity-75">{test.dateTaken}</span>
                        </div>

                        {/* Score - Always visible but muted by default */}
                        <div className="flex-grow flex items-center justify-center">
                          <span 
                            className={`text-4xl font-bold leading-none transition-all duration-300
                              opacity-40 group-hover:opacity-100
                              ${test.score < 500 ? 'group-hover:text-red-500' : ''}
                              ${test.score >= 500 && test.score < 510 ? 'group-hover:text-yellow-500' : ''}
                              ${test.score >= 510 && test.score < 515 ? 'group-hover:text-green-500' : ''}
                              ${test.score >= 515 && test.score < 520 ? 'group-hover:text-sky-500' : ''}
                              ${test.score >= 520 && test.score < 525 ? 
                                'group-hover:text-sky-400 group-hover:animate-pulse-subtle' : ''}
                              ${test.score >= 525 ? 
                                'group-hover:bg-gradient-to-r from-violet-500 to-fuchsia-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:animate-pulse-subtle' : ''}
                            `}
                          >
                            {test.score}
                          </span>
                        </div>

                        {/* Breakdown - Hidden until hover */}
                        <div className="flex justify-center text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="opacity-75">
                            {test.breakdown}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
    </div>
  );
};

export default PracticeTests;
