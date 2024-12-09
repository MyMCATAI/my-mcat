// app/(dashboard)/(routes)/home/PracticeTests.tsx
import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";

interface PracticeTestsProps {
  className?: string;
}

const PracticeTests: React.FC<PracticeTestsProps> = ({ className }) => {
  const [activeSection, setActiveSection] = useState<'aamc' | 'thirdParty' | 'myMcat' | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Sample scheduled tests data
  const scheduledTests = [
    { name: 'AAMC Full Length 1', date: 'Friday October 12', status: 'Scheduled' },
    { name: 'AAMC Full Length 2', date: 'October 15', status: 'Not Started' },
    { name: 'AAMC Full Length 3', date: 'October 20', status: 'Not Started' },
    { name: 'Blueprint 1', date: 'October 25', status: 'Not Started' },
  ];

  const calendarDays = [
    ['26', '27', '28', '29', '30', '1', '2'],
    ['3', '4', '5', '6', '7', '8', '9'],
    ['10', '11', '12', '13', '14', '15', '16'],
    ['17', '18', '19', '20', '21', '22', '23'],
    ['24', '25', '26', '27', '28', '29', '30'],
    ['31', '1', '2', '3', '4', '5', '6']
  ];

  return (
    <div className={`flex flex-col h-full ${className}`}>
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
              {activeSection === 'aamc' ? 'AAMC Full Length Exams' : 
               activeSection === 'thirdParty' ? 'Third Party Exams' : 
               'MyMCAT Exams'}
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

          {(activeSection === 'thirdParty' || activeSection === 'myMcat') && (
            <div className="animate-fadeIn flex flex-col items-center justify-center py-8">
              <p className="text-sm opacity-70 text-center">
                Coming soon! This feature is currently under development.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Top Section - Using flex-grow-0 to prevent expansion */}
          <div className="flex-grow-0" style={{ height: '60%' }}>
            <div className="grid grid-cols-[1fr_1fr] gap-8 h-full">
              {/* Calendar */}
              <div className="bg-[--theme-doctorsoffice-accent] rounded-xl p-6 flex flex-col">
                <div className="text-lg font-medium mb-4 text-center">
                  December 2024
                </div>
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
                      `}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduled Tests */}
              <div className="flex flex-col h-full">
                <h3 className="text-sm font-medium text-[--theme-text-color] opacity-60 uppercase tracking-wide mb-2">
                  Scheduled Tests
                </h3>
                <div className="space-y-2 flex-grow overflow-auto">
                  {scheduledTests.map((test, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-[--theme-doctorsoffice-accent] rounded-lg hover:bg-[--theme-hover-color] transition-colors duration-200"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-medium">{test.name}</h4>
                        <p className="text-xs opacity-70">{test.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          test.status === 'Scheduled' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {test.status}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Using remaining space */}
          <div className="flex-grow flex flex-col justify-end" style={{ height: '40%' }}>
            <h2 className="text-[--theme-text-color] text-xs opacity-60 uppercase tracking-wide mb-4 text-center">
              Available Practice Tests
            </h2>
            <div className="flex justify-center gap-4 max-w-4xl mx-auto">
              {[
                { id: 'aamc', label: 'AAMC Full Length Exams', description: 'Official AAMC practice exams' },
                { id: 'thirdParty', label: 'Third Party Exams', description: 'Blueprint, UWorld, and more' },
                { id: 'myMcat', label: 'MyMCAT Exams', description: 'AI-generated practice tests' },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className="flex-1 p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] 
                    hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg max-w-sm"
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

            {/* Help Text */}
            <div className="mt-4 pt-4 border-t border-[--theme-doctorsoffice-accent]">
              <p className="text-xs leading-relaxed text-center opacity-70">
                Practice tests are crucial for MCAT preparation. They help you build stamina, 
                identify weaknesses, and familiarize yourself with the exam format.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeTests;