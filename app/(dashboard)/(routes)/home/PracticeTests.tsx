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

  const AAMCTests = [
    { name: 'Unscored Sample', status: 'Not Started' },
    { name: 'Full Length 1', status: 'Not Started' },
    { name: 'Full Length 2', status: 'Not Started' },
    { name: 'Full Length 3', status: 'Not Started' },
    { name: 'Full Length 4', status: 'Not Started' },
    { name: 'Sample Scored (FL5)', status: 'Not Started' },
  ];

  return (
    <div className={`grid grid-cols-[20rem_1fr] gap-8 h-[65vh] ${className}`}>
      {/* Calendar Section */}
      <div className="border-r border-[--theme-border-color] pr-8">
        <div className="sticky top-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border border-[--theme-border-color]"
          />
          
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-[--theme-doctorsoffice-accent] rounded-lg">
              <h3 className="text-sm font-medium text-[--theme-text-color] mb-2">Next Test</h3>
              <p className="text-xs text-[--theme-text-color] opacity-70">
                No test scheduled
              </p>
            </div>
            
            <div className="p-4 bg-[--theme-doctorsoffice-accent] rounded-lg">
              <h3 className="text-sm font-medium text-[--theme-text-color] mb-2">Test History</h3>
              <p className="text-xs text-[--theme-text-color] opacity-70">
                No tests taken yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Added max-height and overflow-y-auto */}
      <div className="overflow-y-auto pr-4 max-h-[65vh]">
        {activeSection ? (
          <>
            <button
              onClick={() => setActiveSection(null)}
              className="mb-6 p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
            >
              <ChevronRight className="h-5 w-5 text-[--theme-text-color] rotate-180" />
            </button>
            
            <h2 className="text-[--theme-text-color] text-sm mb-6 opacity-60 uppercase tracking-wide">
              {activeSection === 'aamc' ? 'AAMC Full Length Exams' : 
               activeSection === 'thirdParty' ? 'Third Party Exams' : 
               'MyMCAT Exams'}
            </h2>

            <div className="space-y-4 text-[--theme-text-color]">
              {activeSection === 'aamc' && (
                <div className="animate-fadeIn">
                  <section>
                    <div className="space-y-2">
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

                    <div className="mt-6 pt-6 border-t border-[--theme-doctorsoffice-accent]">
                      <p className="text-xs leading-relaxed text-center opacity-70">
                        AAMC practice tests are the most representative of the actual MCAT. 
                        We recommend taking these under timed conditions.
                      </p>
                    </div>
                  </section>
                </div>
              )}

              {(activeSection === 'thirdParty' || activeSection === 'myMcat') && (
                <div className="animate-fadeIn flex flex-col items-center justify-center py-12">
                  <p className="text-sm opacity-70 text-center">
                    Coming soon! This feature is currently under development.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[--theme-text-color] text-xs mb-6 opacity-60 uppercase tracking-wide">
              Practice Tests
            </h2>

            <div className="space-y-8 text-[--theme-text-color]">
              <div className="flex flex-col gap-2">
                {[
                  { id: 'aamc', label: 'AAMC Full Length Exams', description: 'Official AAMC practice exams' },
                  { id: 'thirdParty', label: 'Third Party Exams', description: 'Blueprint, UWorld, and more' },
                  { id: 'myMcat', label: 'MyMCAT Exams', description: 'AI-generated practice tests' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className="p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-sm font-medium">{section.label}</span>
                        <p className="text-xs opacity-70">{section.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-[--theme-doctorsoffice-accent]">
                <p className="text-xs leading-relaxed text-center opacity-70">
                  Practice tests are crucial for MCAT preparation. They help you build stamina, 
                  identify weaknesses, and familiarize yourself with the exam format.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeTests;