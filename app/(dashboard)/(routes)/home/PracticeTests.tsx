// app/(dashboard)/(routes)/home/PracticeTests.tsx
import React, { useState, useEffect } from "react";
import { ChevronRight, Plus, GripVertical, CalendarIcon, BarChart as AnalyticsIcon, ClipboardList, ChevronLeft } from "lucide-react";
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
import { Calendar, dateFnsLocalizer, ToolbarProps, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/components/styles/CustomCalendar.css";
import TestReview from '@/components/home/TestReview';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import axios from "axios";

const locales = {
  'en-US': require('date-fns/locale/en-US'),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
}

interface UserTest {
  id: string;
  name: string;
  company: string;
  status: string;
  score: number;
  breakdown: string;
  startedAt: string;
  isCompleted?: boolean;
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

interface CustomToolbarProps extends ToolbarProps<CalendarEvent, object> {
  events: CalendarEvent[];
}

// Base toolbar component that accepts only ToolbarProps
const BaseToolbar: React.FC<ToolbarProps<CalendarEvent, object>> = (props) => {
  const { onNavigate, label } = props;

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onNavigate('PREV')}
        className="p-1.5 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-all duration-200"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <span className="text-sm font-medium">{label}</span>
      <button 
        onClick={() => onNavigate('NEXT')}
        className="p-1.5 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] rounded-lg transition-all duration-200"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// Wrapper component that adds the countdown
const CustomToolbarWithEvents: React.FC<{
  calendarEvents: CalendarEvent[];
  toolbarProps: ToolbarProps<CalendarEvent, object>;
}> = ({ calendarEvents, toolbarProps }) => {
  // Get the next test date from calendar events
  const nextTestDate = calendarEvents
    .map(event => event.start)
    .filter(date => date > new Date())
    .sort((a, b) => a.getTime() - b.getTime())[0];

  // Calculate days until next test
  const daysUntilNextTest = nextTestDate
    ? Math.ceil((nextTestDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="rbc-toolbar flex flex-col items-center gap-2 pb-2">
      <BaseToolbar {...toolbarProps} />
      {daysUntilNextTest !== null && (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-medium text-[--theme-emphasis-color]">
            {daysUntilNextTest} days
          </span>
          <span className="text-[--theme-text-color] opacity-70">
            until next FL
          </span>
        </div>
      )}
    </div>
  );
};

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
    averageScore: 85, // Example value - replace with actual data
    testsTaken: 3, // Example value - replace with actual data
    testsRemaining: 8, // Example value - replace with actual data
  });
  const [calendarActivities, setCalendarActivities] = useState<CalendarActivity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch calendar activities
  useEffect(() => {
    const fetchCalendarActivities = async () => {
      try {
        const response = await axios.get('/api/calendar-activity');
        const activities = response.data.filter((activity: CalendarActivity) => 
          activity.activityType === 'Exam'
        );
        setCalendarActivities(activities);
        
        // Convert activities to calendar events
        const events = activities.map((activity: CalendarActivity) => ({
          id: activity.id,
          title: activity.activityTitle,
          start: new Date(activity.scheduledDate),
          end: new Date(activity.scheduledDate),
          allDay: true,
          resource: activity
        }));
        setCalendarEvents(events);
      } catch (error) {
        console.error('Error fetching calendar activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarActivities();
  }, []);

  // Helper function to check if a date has a test
  const isTestDate = (date: Date) => {
    if (!calendarActivities.length) return false;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return calendarActivities.some(activity => {
      const activityDate = new Date(activity.scheduledDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === checkDate.getTime();
    });
  };

  // Get tests for a specific date
  const getTestsForDate = (date: Date): CalendarActivity[] => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    return calendarActivities.filter(activity => {
      const activityDate = new Date(activity.scheduledDate);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === checkDate.getTime();
    });
  };

  // Custom tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    const tests = getTestsForDate(date);
    if (tests.length === 0) return null;

    return (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
    );
  };

  // Custom tile className for calendar
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    const hasTest = isTestDate(date);
    
    return `relative ${hasTest ? 'bg-[--theme-calendar-color] font-semibold hover:bg-[--theme-hover-color]' : ''}`;
  };

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

  const [activeTest, setActiveTest] = useState<UserTest | null>(null);

  const [userTests, setUserTests] = useState<UserTest[]>([
    {
      id: "past1",
      name: "AAMC FL1",
      company: "AAMC",
      status: "Completed",
      score: 527,
      breakdown: "132/132/132/131",
      startedAt: "2023-12-15",
      isCompleted: true
    },
    {
      id: "past2",
      name: "Blueprint FL2",
      company: "Blueprint",
      status: "Completed",
      score: 515,
      breakdown: "129/128/129/129",
      startedAt: "2023-12-10",
      isCompleted: true
    },
    // Add more past tests as needed
  ]);

  const handleAddTest = () => {
    const testId = `${scheduledTests.length + 1}`;
    const newTestEntry: Test = {
      id: testId,
      name: `FL${newTest.testNumber}`,
      company: newTest.company,
      status: "Not Started",
      calendarDate: newTest.date ? newTest.date.getDate() : undefined,
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
    const activity = event.resource as CalendarActivity;
    console.log('Selected activity:', activity);
    // Handle event selection logic here
  };

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: 'var(--theme-emphasis-color)',
        border: 'none',
      }
    };
  };

  // Add onNavigate handler
  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col h-[calc(100vh-8.3rem)]">
          {activeTest ? (
            <div className="h-full px-4">
              <TestReview 
                test={{
                  company: activeTest.company,
                  testNumber: activeTest.name.split(' ').pop() || '',
                  score: activeTest.score,
                  breakdown: activeTest.breakdown,
                  dateTaken: new Date(activeTest.startedAt).toLocaleDateString()
                }}
                onBack={() => setActiveTest(null)} 
              />
            </div>
          ) : (
            <div className="h-full">
              <div
                className="bg-[--theme-leaguecard-color] rounded-xl p-4 sm:p-6 lg:p-8 mx-4 h-full overflow-hidden"
                style={{
                  boxShadow: "var(--theme-adaptive-tutoring-boxShadow)",
                }}
              >
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 h-full">
                  {/* Calendar Side */}
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 flex items-center justify-center">
                      <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        className="custom-calendar w-full max-w-full bg-transparent"
                        views={['month']}
                        defaultView="month"
                        date={date}
                        onNavigate={handleNavigate}
                        toolbar={true}
                        popup
                        selectable
                        onSelectEvent={handleSelectEvent}
                        eventPropGetter={eventStyleGetter}
                        components={{
                          toolbar: (props) => (
                            <CustomToolbarWithEvents
                              calendarEvents={calendarEvents}
                              toolbarProps={props}
                            />
                          ),
                        }}
                      />
                    </div>
                  </div>

                  {/* Tests Side with Tabs */}
                  <div className="flex flex-col h-full overflow-hidden relative">
                    <Tabs defaultValue="upcoming" className="w-full h-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="past">Past Tests</TabsTrigger>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      </TabsList>

                      <TabsContent value="past" className="flex-1 overflow-auto">
                        <div className="space-y-2 pb-2">
                          {userTests.map((test: UserTest, index: number) => (
                            <div
                              key={test.id}
                              className="flex items-center p-3 bg-[--theme-leaguecard-accent] rounded-lg 
                                transition-all duration-200
                                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]
                                cursor-pointer"
                              onClick={() => setActiveTest(test)}
                            >
                              {test.score && (
                                <div className="text-xl font-bold mr-4">
                                  {test.score}
                                </div>
                              )}
                              <div className="flex-grow text-right">
                                <h4 className="text-sm font-medium">
                                  {test.name}
                                </h4>
                                <p className="text-xs opacity-70">
                                  {test.company}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="upcoming" className="flex-1 overflow-auto">
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

                        <button
                          onClick={() => setIsAddDialogOpen(true)}
                          className="mt-4 w-full py-2 px-4 hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                            rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Practice Test
                        </button>
                      </TabsContent>
                    </Tabs>

                    {/* View Toggle Buttons - Made Larger */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-4">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleSetTab && handleSetTab("Schedule?view=calendar")}
                              className="group w-16 h-16 p-3 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                                border-2 border-[--theme-border-color] 
                                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                                shadow-md rounded-full transition flex flex-col items-center justify-center"
                            >
                              <CalendarIcon className="w-8 h-8" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Switch to Calendar View</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleSetTab && handleSetTab("Schedule?view=analytics")}
                              className="group w-16 h-16 p-3 bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                                border-2 border-[--theme-border-color] 
                                hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                                shadow-md rounded-full transition flex flex-col items-center justify-center"
                            >
                              <AnalyticsIcon className="w-8 h-8" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Switch to Analytics View</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
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
    </div>
  );
};

export default PracticeTests;
