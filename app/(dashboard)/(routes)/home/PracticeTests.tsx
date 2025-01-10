// app/(dashboard)/(routes)/home/PracticeTests.tsx
import React, { useState, useEffect } from "react";
import { ChevronRight, Plus, GripVertical, CalendarIcon, BarChart as AnalyticsIcon, ClipboardList, ChevronLeft, Trash2, Settings, BarChart } from "lucide-react";
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
import TestReview from '@/components/home/TestReview';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useExamActivities } from '@/hooks/useCalendarActivities';
import DatePickerDialog from '@/components/DatePickerDialog';
import DeleteExamDialog from '@/components/DeleteExamDialog';
import PracticeTestCompleteDialog from '@/components/PracticeTestCompleteDialog';
import { toast } from "@/components/ui/use-toast";
import WeeklyCalendarModal from "@/components/calendar/WeeklyCalendarModal";
import { AnimatePresence, motion } from "framer-motion";
import { useStudyActivities } from '@/hooks/useStudyActivities';
import TestCalendar from '@/components/calendar/TestCalendar';

interface CalendarActivity {
  id: string;
  scheduledDate: Date;
  activityTitle: string;
  activityType: string;
  status: string;
  hours: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

interface PracticeTestsProps {
  className?: string;
  handleSetTab?: (tab: string) => void;
  onActivitiesUpdate?: () => void;
}

interface Test {
  id: string;
  name: string;
  company: string;
  status: string;
  calendarDate?: number;
  score?: number;
  breakdown?: string;
  startedAt?: string;
  formattedDate?: string;
}

interface UserTest {
  id: string;
  examId: string;
  name: string;
  company: string;
  status: string;
  score?: number;
  breakdown?: string;
  startedAt: string;
  isCompleted?: boolean;
}

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

const PracticeTests: React.FC<PracticeTestsProps> = ({ 
  className,
  handleSetTab,
  onActivitiesUpdate
}) => {
  const { activities: examActivities, loading: examLoading, updateExamDate, createExamActivity, fetchExamActivities } = useExamActivities();
  const { activities: studyActivities, loading: studyLoading } = useStudyActivities();
  const [scheduledTests, setScheduledTests] = useState<Test[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedTestToComplete, setSelectedTestToComplete] = useState<{ id: string; name: string } | null>(null);
  const [userTests, setUserTests] = useState<UserTest[]>([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showSettings, setShowSettings] = useState(false);

  // Combine exam and study activities into calendar events
  useEffect(() => {
    if (examActivities && studyActivities) {
      const examEvents = examActivities.map((activity) => ({
        id: activity.id,
        title: "EXAM",
        start: new Date(activity.scheduledDate),
        end: new Date(activity.scheduledDate),
        allDay: true,
        resource: { 
          ...activity, 
          eventType: 'exam',
          fullTitle: activity.activityTitle
        }
      }));

      const studyEvents = studyActivities.map((activity) => ({
        id: activity.id,
        title: activity.activityTitle,
        start: new Date(activity.scheduledDate),
        end: new Date(activity.scheduledDate),
        allDay: true,
        resource: { 
          ...activity, 
          eventType: 'study',
          fullTitle: `${activity.activityTitle} (${activity.hours}h)`
        }
      }));

      setCalendarEvents([...examEvents, ...studyEvents]);
    }
  }, [examActivities, studyActivities]);

  useEffect(() => {
    if (examActivities) {
      const tests = examActivities
        .filter(activity => !activity.fullLengthExam) // Filter out activities that have a fullLengthExam
        .map((activity) => {
          const date = new Date(activity.scheduledDate);
          return {
            id: activity.id,
            name: activity.activityTitle,
            company: activity.activityText,
            status: activity.status,
            calendarDate: date.getUTCDate(),
            formattedDate: new Date(activity.scheduledDate).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC'
            })
          };
        });

      setScheduledTests(tests);
    }
  }, [examActivities]);

  // Convert completed exam activities to user tests
  useEffect(() => {
    if (examActivities) {
      const completedTests = examActivities
        .filter(activity => activity.status === "Completed" && activity.fullLengthExam)
        .map(activity => {
          const exam = activity.fullLengthExam!;
          
          const sectionScores = exam.dataPulses.reduce((acc, pulse) => {
            if (pulse.name.includes("Chemical")) acc.cp = pulse.positive;
            else if (pulse.name.includes("Critical")) acc.cars = pulse.positive;
            else if (pulse.name === "Biological and Biochemical Foundations") acc.bb = pulse.positive;
            else if (pulse.name === "Psychological, Social, and Biological Foundations") acc.ps = pulse.positive;
            return acc;
          }, { cp: 0, cars: 0, bb: 0, ps: 0 });

          const totalScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0)
          const breakdown = `${sectionScores.cp}/${sectionScores.cars}/${sectionScores.bb}/${sectionScores.ps}`;

          return {
            id: activity.id,
            examId: exam.id,
            name: activity.activityTitle,
            company: activity.activityText,
            status: activity.status,
            score: Math.round(totalScore),
            breakdown,
            startedAt: new Date(activity.scheduledDate).toISOString().split('T')[0],
            isCompleted: true
          };
        });

      setUserTests(completedTests);
    }
  }, [examActivities]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    company: "" as Company,
    testNumber: "",
    date: null as Date | null,
    useRecommendedDate: true
  });

  const [activeTest, setActiveTest] = useState<UserTest | null>(null);

  const handleAddTest = async () => {
    try {
      if (!newTest.company || !newTest.testNumber || (!newTest.date && !newTest.useRecommendedDate)) {
        return;
      }

      const testName = `${newTest.company} FL${newTest.testNumber}`;
      
      await createExamActivity({
        activityTitle: testName,
        activityText: newTest.company,
        scheduledDate: newTest.date || new Date(),
        hours: 8, 
      });

      setIsAddDialogOpen(false);
      setNewTest({ company: "" as Company, testNumber: "", date: null, useRecommendedDate: true });
    } catch (error) {
      console.error('Failed to create test:', error);
      // You might want to show an error toast or message here
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(scheduledTests);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScheduledTests(items);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle calendar event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    const activity = event.resource;
    if (activity.eventType === 'exam') {
      // Handle exam selection (existing logic)
    } else {
      // Handle study activity selection
      // You can add a modal or sidebar to show activity details and tasks
    }
  };

  // Add onNavigate handler
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  // Handle opening date picker for a test
  const handleOpenDatePicker = (testId: string) => {
    setSelectedTestId(testId);
    setDatePickerOpen(true);
  };

  // Handle date selection
  const handleDateSelect = async (date: Date) => {
    if (selectedTestId) {
      try {
        await updateExamDate(selectedTestId, date);
        // Close the dialog after successful update
        setDatePickerOpen(false);
        setSelectedTestId(null);
      } catch (error) {
        console.error('Failed to update test date:', error);
      }
    }
  };

  const handleCompleteTest = async (scores: { total: number; cp: number; cars: number; bb: number; ps: number }) => {
    try {
      // After successful completion, refresh the activities to update both lists
      await fetchExamActivities();
      setCompleteDialogOpen(false);
      setSelectedTestToComplete(null);
      // Switch to completed tab
      setActiveTab("completed");
    } catch (error) {
      console.error('Failed to refresh exam activities:', error);
    }
  };

  // Update the DeleteExamDialog handler
  const handleExamDelete = async (testId: string) => {
    try {
      // Optimistically update the UI
      setScheduledTests(prev => prev.filter(test => test.id !== testId));
      
      // Close the dialog
      setDeleteDialogOpen(false);
      setTestToDelete(null);

      // Show success toast
      toast({
        title: "Exam deleted",
        description: "The exam has been successfully removed from your schedule.",
        variant: "default",
      });

      // Refresh the exam activities in the background
      await fetchExamActivities();
    } catch (error) {
      console.error('Failed to delete exam:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete the exam. Please try again.",
        variant: "destructive",
      });
      
      // Refresh to ensure UI is in sync with server
      await fetchExamActivities();
    }
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  const handleStudyPlanSaved = () => {
    setShowSettings(false);
    if (onActivitiesUpdate) {
      onActivitiesUpdate();
    }
  };

  return (
    <div className={`p-2 flex flex-col ${className}`}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-[calc(100vh-7.6rem)]">
          {examLoading || studyLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">Loading activities...</div>
            </div>
          ) : activeTest ? (
            <div className="h-full">
              <TestReview 
                test={{
                  id: activeTest.id,
                  examId: activeTest.examId,
                  name: activeTest.name,
                  company: activeTest.company,
                  status: activeTest.status,
                  score: activeTest.score,
                  breakdown: activeTest.breakdown,
                  dateTaken: new Date(activeTest.startedAt).toLocaleDateString(),
                  aiResponse: examActivities
                    .find(activity => activity.fullLengthExam?.id === activeTest.examId)
                    ?.fullLengthExam?.aiResponse,
                  dataPulses: examActivities
                    .find(activity => activity.fullLengthExam?.id === activeTest.examId)
                    ?.fullLengthExam?.dataPulses
                }}
                onBack={() => setActiveTest(null)} 
              />
            </div>
          ) : (
            <div 
              className="flex-grow h-[calc(100vh-7.6rem)] w-full rounded-[10px] p-2 flex flex-col relative overflow-hidden"
              style={{
                backgroundImage: `linear-gradient(var(--theme-gradient-start), var(--theme-gradient-end)), var(--theme-interface-image)`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundColor: "var(--theme-mainbox-color)",
                color: "var(--theme-text-color)",
                boxShadow: "var(--theme-box-shadow)",
              }}
            >
              <div className="h-full">
                <div className="bg-transparent rounded-xl p-2 sm:p-6 lg:p-8 h-full overflow-visible">
                  <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 h-full">
                    {/* Calendar Side - Now spans 2 columns */}
                    <div className="col-span-2 flex flex-col h-full overflow-visible">
                      <div className="flex-1 flex items-center justify-center">
                        <TestCalendar
                          events={calendarEvents}
                          date={date}
                          onNavigate={handleNavigate}
                          onSelectEvent={handleSelectEvent}
                        />
                      </div>
                    </div>

                    {/* Tests Side - Now takes 1 column */}
                    <div className="flex flex-col h-full overflow-hidden relative">
                      {/* Upcoming Section Header and Add Button */}
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs opacity-60 uppercase tracking-wide">
                          Upcoming Tests
                        </h3>
                        <button
                          onClick={() => setIsAddDialogOpen(true)}
                          className="p-1.5 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                            rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>

                      {/* Upcoming Tests Scrollable Area */}
                      <div className="flex-1 overflow-auto">
                        <Droppable droppableId="droppable-tests">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-1.5 pb-2"
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
                                      className={`flex items-center h-[3.5rem] p-2 bg-[--theme-leaguecard-accent] rounded-lg 
                                        transition-all duration-200 group relative
                                        ${snapshot.isDragging ? "opacity-75" : ""}
                                        opacity-100 hover:opacity-80`}
                                      style={{
                                        ...provided.draggableProps.style,
                                      }}
                                    >
                                      <div
                                        {...provided.dragHandleProps}
                                        className="mr-2 cursor-grab active:cursor-grabbing"
                                      >
                                        <GripVertical className="w-3.5 h-3.5 opacity-50" />
                                      </div>
                                      
                                      {/* Main content that fades more */}
                                      <div className="flex-grow min-w-0 flex items-center justify-between group-hover:opacity-10 transition-opacity duration-200">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <h4 className="text-sm font-medium truncate">
                                            {test.name}
                                          </h4>
                                          {test.formattedDate && (
                                            <span className="text-xs opacity-70 flex-shrink-0">
                                              • {new Date(test.formattedDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric'
                                              })}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Centered overlay buttons with themed text */}
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                                        <div className="flex items-center justify-between w-40">
                                          <div className="flex flex-col items-center w-12">
                                            <button
                                              onClick={() => handleOpenDatePicker(test.id)}
                                              className="text-xs w-8 h-8 flex items-center justify-center rounded-md border border-[--theme-border-color] 
                                                bg-blue-500/10 text-blue-600 opacity-100 hover:opacity-80 
                                                transition-opacity duration-200"
                                            >
                                              <CalendarIcon className="w-3 h-3" />
                                            </button>
                                            <span className="text-[0.6rem] text-[--theme-text-color] mt-0.5">Reschedule</span>
                                          </div>

                                          <div className="flex flex-col items-center w-12">
                                            <button
                                              className="text-xs w-8 h-8 flex items-center justify-center rounded-md border border-[--theme-border-color] 
                                                bg-green-500 text-white opacity-100 hover:opacity-80
                                                transition-opacity duration-200"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedTestToComplete({ id: test.id, name: test.name });
                                                setCompleteDialogOpen(true);
                                              }}
                                            >
                                              <ClipboardList className="w-3 h-3" />
                                            </button>
                                            <span className="text-[0.6rem] text-[--theme-text-color] mt-0.5">Complete</span>
                                          </div>

                                          <div className="flex flex-col items-center w-12">
                                            <button
                                              onClick={() => {
                                                setTestToDelete(test.id);
                                                setDeleteDialogOpen(true);
                                              }}
                                              className="text-xs w-8 h-8 flex items-center justify-center rounded-md border border-[--theme-border-color] 
                                                bg-red-500 text-white opacity-100 hover:opacity-80
                                                transition-opacity duration-200"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                            <span className="text-[0.6rem] text-[--theme-text-color] mt-0.5">Delete</span>
                                          </div>
                                        </div>
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

                      {/* Completed Section Header with Stats Button */}
                      <div className="flex justify-between items-center mt-4 mb-2">
                        <h3 className="text-xs opacity-60 uppercase tracking-wide">
                          Completed Tests
                        </h3>
                        <button
                          onClick={() => handleSetTab?.("Schedule")}
                          className="p-1.5 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                            rounded-lg transition-colors duration-200 text-sm font-medium flex items-center gap-1"
                        >
                          <BarChart className="w-3.5 h-3.5" />
                          Stats
                        </button>
                      </div>

                      {/* Completed Tests Scrollable Area */}
                      <div className="flex-1 overflow-auto">
                        <div className="space-y-1.5 pb-2">
                          {userTests.map((test: UserTest) => (
                            <div
                              key={test.id}
                              className="flex items-center h-[3.5rem] p-2 bg-[--theme-leaguecard-accent] rounded-lg 
                                transition-all duration-200 cursor-pointer
                                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
                              onClick={() => setActiveTest(test)}
                            >
                              {test.score && (
                                <div className="text-xl font-bold mr-3 w-12 text-center flex-shrink-0">
                                  {test.score}
                                </div>
                              )}
                              <div className="flex-grow min-w-0 flex flex-col justify-center">
                                <h4 className="text-sm opacity-70 truncate">
                                  {test.name}
                                </h4>
                                {test.startedAt && (
                                  <span className="text-xs opacity-70">
                                    {new Date(test.startedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    <div className="flex flex-col gap-2">
                      <input
                        type="date"
                        value={newTest.date ? newTest.date.toISOString().split('T')[0] : ''}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : null;
                          setNewTest({ ...newTest, date });
                        }}
                        className="w-full p-2 rounded-lg border border-gray-300 bg-white"
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

      <DeleteExamDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTestToDelete(null);
        }}
        onDelete={handleExamDelete}
        testId={testToDelete || undefined}
        testName={testToDelete ? scheduledTests.find(t => t.id === testToDelete)?.name : undefined}
      />

      <DatePickerDialog
        isOpen={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
          setSelectedTestId(null);
        }}
        onDateSelect={handleDateSelect}
        currentDate={selectedTestId ? new Date(scheduledTests.find(t => t.id === selectedTestId)?.formattedDate || '') : undefined}
        testName={selectedTestId ? scheduledTests.find(t => t.id === selectedTestId)?.name : undefined}
      />

      <PracticeTestCompleteDialog
        isOpen={completeDialogOpen}
        onClose={() => {
          setCompleteDialogOpen(false);
          setSelectedTestToComplete(null);
        }}
        onSubmit={handleCompleteTest}
        testTitle={selectedTestToComplete?.name || ''}
        calendarActivityId={selectedTestToComplete?.id}
      />

      <div className="absolute top-7 right-7 flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={toggleSettings}
                className={`settings-button p-2 rounded-full shadow-md ${
                  showSettings ? "bg-[--theme-hover-color]" : "bg-white"
                }`}
              >
                <Settings 
                  className="w-4 h-4" 
                  fill="none"
                  stroke={showSettings ? "white" : "#333"}
                  strokeWidth={2}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 z-40"
              onClick={toggleSettings}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={toggleSettings}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90vh] overflow-auto"
              >
                <WeeklyCalendarModal
                  onComplete={({ success, action }) => {
                    if (success && action === 'generate') {
                      handleSetTab && handleSetTab('Tests');
                    }
                    if (success) {
                      handleStudyPlanSaved();
                      toggleSettings();
                    }
                  }}
                  isInitialSetup={false}
                  onClose={toggleSettings}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeTests;