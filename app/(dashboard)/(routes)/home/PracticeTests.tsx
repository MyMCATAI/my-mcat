// app/(dashboard)/(routes)/home/PracticeTests.tsx
import React, { useState } from 'react';
import { ChevronRight, Plus, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface PracticeTestsProps {
  className?: string;
}

interface Test {
  id: string;
  name: string;
  company: string;
  status: string;
  calendarDate?: number;
}

interface StudentStats {
  averageScore: number;
  testsTaken: number;
  testsRemaining: number;
}

// Example array for AAMC tests when activeSection === 'aamc'
// (Assuming these are defined somewhere; adjust as needed)
const AAMCTests = [
  { name: 'AAMC FL 1', status: 'Not Started' },
  { name: 'AAMC FL 2', status: 'Not Started' },
  // Add more tests as needed...
];

const PracticeTests: React.FC<PracticeTestsProps> = ({ className }) => {
  const [activeSection, setActiveSection] = useState<
    'aamc' | 'thirdParty' | 'myMcat' | 'custom' | 'diagnostic' | 'section' | null
  >(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [studentStats] = useState<StudentStats>({
    averageScore: 85, // Example value - replace with actual data
    testsTaken: 3,    // Example value - replace with actual data
    testsRemaining: 8 // Example value - replace with actual data
  });

  const [scheduledTests, setScheduledTests] = useState<Test[]>([
    { id: '1', name: 'Full Length 1', company: 'AAMC', status: 'Not Started', calendarDate: 12 },
    { id: '2', name: 'Sample Unscored', company: 'AAMC', status: 'Not Started', calendarDate: 15 },
    { id: '3', name: 'Full Length 3', company: 'Blueprint', status: 'Not Started', calendarDate: 20 },
    { id: '4', name: 'Full Length 4', company: 'AAMC', status: 'Not Started', calendarDate: 25 },
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(scheduledTests);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setScheduledTests(items);
  };

  const calendarDays = [
    ['26', '27', '28', '29', '30', '1', '2'],
    ['3', '4', '5', '6', '7', '8', '9'],
    ['10', '11', '12', '13', '14', '15', '16'],
    ['17', '18', '19', '20', '21', '22', '23'],
    ['24', '25', '26', '27', '28', '29', '30'],
    ['31', '1', '2', '3', '4', '5', '6'],
  ];

  const isTestDate = (day: string) => {
    return scheduledTests.some((test) => test.calendarDate === parseInt(day));
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {activeSection ? (
        // Active Section View
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setActiveSection(null)}
              className="p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
            >
              <ChevronRight className="h-5 w-5 text-[--theme-text-color] rotate-180" />
            </button>

            <h2 className="text-[--theme-text-color] text-sm opacity-60 uppercase tracking-wide">
              {activeSection === 'aamc'
                ? 'AAMC Full Length Exams'
                : activeSection === 'thirdParty'
                ? 'Third Party Exams'
                : activeSection === 'myMcat'
                ? 'MyMCAT Exams'
                : activeSection === 'custom'
                ? 'Custom Exams'
                : activeSection === 'diagnostic'
                ? 'Diagnostic Tests'
                : 'Section Banks'}
            </h2>
          </div>

          {activeSection === 'aamc' && (
            <div className="grid grid-cols-2 gap-4 animate-fadeIn">
              {AAMCTests.map((test, index) => (
                <div
                  key={index}
                  className="bg-[--theme-doctorsoffice-accent] p-4 rounded-lg shadow hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{test.name}</h4>
                      <p className="text-xs opacity-70">{test.status}</p>
                    </div>
                    <button
                      className="px-3 py-1.5 text-xs rounded-md border border-[--theme-border-color] 
                        hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                        transition-colors duration-200"
                    >
                      Schedule Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeSection === 'thirdParty' || activeSection === 'myMcat' || activeSection === 'custom' || activeSection === 'diagnostic' || activeSection === 'section') && (
            <div className="animate-fadeIn flex flex-col items-center justify-center py-8">
              <p className="text-sm opacity-70 text-center">Coming soon! This feature is currently under development.</p>
            </div>
          )}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex flex-col">
            {/* Calendar + Scheduled Tests Section */}
            <div>
              <div
                className="bg-[--theme-leaguecard-color] rounded-xl p-8 mx-4"
                style={{
                  margin: '0.5rem 1rem',
                  boxShadow: 'var(--theme-adaptive-tutoring-boxShadow)'
                }}
              >
                <div className="grid grid-cols-2 h-full gap-8">
                  {/* Calendar Side */}
                  <div className="flex flex-col">
                    <div className="text-lg font-medium mb-4 text-center">December 2024</div>
                    <div className="grid grid-cols-7 gap-1">
                      {/* Day headers */}
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                        <div key={day} className="text-center text-sm font-medium p-2">
                          {day}
                        </div>
                      ))}

                      {/* Calendar days */}
                      {calendarDays.flat().map((day, index) => (
                        <div
                          key={index}
                          className={`aspect-square flex items-center justify-center text-sm p-2 rounded-md
                            ${parseInt(day) > 0 && parseInt(day) <= 31 ? 'hover:bg-[--theme-hover-color] cursor-pointer' : 'opacity-30'}
                            ${date?.getDate() === parseInt(day) ? 'bg-[--theme-hover-color] text-[--theme-hover-text]' : ''}
                            ${isTestDate(day) ? 'bg-[--theme-calendar-color] text-[--theme-text-color] font-bold' : ''}
                          `}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scheduled Tests Side */}
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium text-[--theme-text-color] opacity-60 uppercase tracking-wide mb-4 text-center">
                      Scheduled Tests
                    </h3>
                    <Droppable droppableId="droppable-tests">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="flex-grow overflow-y-auto space-y-2 min-h-[200px]"
                        >
                          {scheduledTests.map((test, index) => (
                            <Draggable key={test.id} draggableId={test.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center p-3 bg-[--theme-leaguecard-accent] rounded-lg 
                                    transition-all duration-200
                                    ${snapshot.isDragging ? 'opacity-75' : ''}
                                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]`}
                                  style={{
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  <div {...provided.dragHandleProps} className="mr-2 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4 opacity-50" />
                                  </div>
                                  <div className="flex-grow">
                                    <h4 className="text-sm font-medium">{test.name}</h4>
                                    <p className="text-xs opacity-70">{test.company}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      className="text-xs px-2 py-1 rounded-md border border-[--theme-border-color] 
                                        hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                                        transition-colors duration-200"
                                    >
                                      Set Date
                                    </button>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
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
                      onClick={() => {
                        /* Add your logic here */
                      }}
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
            <div className="mt-8 px-4">
              <h2 className="text-[--theme-text-color] text-xs opacity-60 uppercase tracking-wide mb-4 text-center">
                Previous Practice Tests
              </h2>
              <div className="grid grid-cols-3 gap-4 max-h-[24rem] overflow-y-auto">
                {[
                  { id: 'aamc', label: 'AAMC Full Length Exams', description: 'Official AAMC practice exams' },
                  { id: 'thirdParty', label: 'Third Party Exams', description: 'Blueprint, UWorld, and more' },
                  { id: 'myMcat', label: 'MyMCAT Exams', description: 'AI-generated practice tests' },
                  { id: 'custom', label: 'Custom Exams', description: 'Create your own practice tests' },
                  { id: 'diagnostic', label: 'Diagnostic Tests', description: 'Assess your starting point' },
                  { id: 'section', label: 'Section Banks', description: 'Practice specific test sections' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className="p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] 
                      hover:bg-[--theme-hover-color]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">{section.label}</span>
                        <p className="text-xs opacity-70">{section.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default PracticeTests;
