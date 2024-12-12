import React, { useRef, useState } from 'react';
import { X, ArrowLeft, ChevronRight } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

interface HelpContentScheduleProps {
  onClose: () => void;
  onResetTutorials?: () => void;
}

const HelpContentSchedule: React.FC<HelpContentScheduleProps> = ({ onClose, onResetTutorials }) => {
  const [activeMainSection, setActiveMainSection] = useState<'calendar' | 'analytics' | 'articles' | null>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const handleResetTutorials = () => {
    // Remove tutorial-related localStorage items
    localStorage.removeItem("tutorialPart1Played");
    localStorage.removeItem("tutorialPart2Played");
    localStorage.removeItem("tutorialPart3Played");
    localStorage.removeItem("tutorialPart4Played");
    
    // Call the callback to reset tutorial states if provided
    if (onResetTutorials) {
      onResetTutorials();
    }
  };

  return (
    <div 
      ref={helpRef} 
      className="p-6 h-full overflow-y-auto relative bg-[--theme-mainbox-color] rounded-lg w-[32rem] z-50 border-2 border-[--theme-border-color]" 
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
      >
        <X className="h-5 w-5 text-[--theme-text-color]" />
      </button>

      {activeMainSection ? (
        <>
          <button
            onClick={() => setActiveMainSection(null)}
            className="absolute top-4 left-4 p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200 z-50"
          >
            <ArrowLeft className="h-5 w-5 text-[--theme-text-color]" />
          </button>

          <h2 className="text-[--theme-text-color] text-xs mb-6 opacity-60 uppercase tracking-wide text-center">
            {activeMainSection === 'calendar' ? 'Calendar' : 
             activeMainSection === 'analytics' ? 'Analytics' : 
             'Articles'}
          </h2>

          {activeMainSection === 'calendar' && (
            <div className="animate-fadeIn">
              <p className="text-sm text-[--theme-text-color] mb-8 leading-relaxed text-center">
                The calendar allows you to build and modify a study schedule. You can see and complete daily tasks in the sidebar. 
              </p>
              
              <section className="py-2 border-t border-[--theme-doctorsoffice-accent] text-[--theme-text-color] border-opacity-20">
                <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide">
                  Calendar View
                </h3>
                <ul className="text-sm space-y-2 list-disc pl-4">           
                  <li>Add breaks and practice exams on the calendar view.</li>
                  <li>Settings icon above the help button modifies your schedule.</li>
                  <li>Click the calendar icon under analytics to go to your calendar.</li>
                </ul>
                
                <div className="mt-4 flex justify-center">
                  <div className="w-16 h-16 p-4
                    bg-[--theme-leaguecard-color] text-[--theme-text-color] 
                    border-2 border-[--theme-border-color] 
                    hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] 
                    shadow-md rounded-full transition flex items-center justify-center cursor-default"
                  >
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                </div>
              </section>

              <section className="py-2 border-t border-[--theme-doctorsoffice-accent] text-[--theme-text-color] border-opacity-20">
                <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide">
                  Daily To-Do List
                </h3>
                <ul className="text-sm space-y-2 list-disc pl-4">
                  <li>Click titles to jump to linked tasks.</li>
                  <li>Check off tasks to win coins.</li>
                  <li>Gain a streak for logging in to study.</li>
                </ul>
                
                <div className="mt-4 bg-[--theme-leaguecard-color] border border-[--theme-border-color] rounded-lg overflow-hidden">
                  <button className="w-full py-3 px-4 bg-[--theme-mainbox-color] text-[--theme-text-color] border-2 border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] font-semibold shadow-md rounded-lg transition relative flex items-center justify-between text-md">
                    <span>Sample Activity</span>
                    <svg
                      className="min-w-[1.25rem] min-h-[1.25rem] w-[1.25rem] h-[1.25rem]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  <div className="bg-[--theme-leaguecard-color] shadow-md p-4 mt-2 space-y-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sample-task-1"
                        checked={false}
                        onCheckedChange={() => {}}
                      />
                      <label htmlFor="sample-task-1" className="text-sm leading-tight cursor-pointer flex-grow">
                        Complete practice questions
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sample-task-2"
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                      <label htmlFor="sample-task-2" className="text-sm leading-tight cursor-pointer flex-grow">
                        Review flashcards
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeMainSection === 'analytics' && (
            <div className="animate-fadeIn">
              
              <section>
                <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide">
                  Performance Rating
                </h3>
                
                <div className="mt-4 flex justify-center">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full rounded-lg border-2 border-[--theme-border-color]"
                  >
                    <source 
                      src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/analyticswheel.mp4" 
                      type="video/mp4" 
                    />
                  </video>
                </div>
                
                <div className="mt-6 text-sm text-[--theme-text-color]">
                  <p className="mb-2">Three factors determine your grade:</p>
                  <ol className="list-decimal pl-6 space-y-1">
                    <li>Total questions answered (20%)</li>
                    <li>Accuracy (60%)</li>
                    <li>Timing (20%)</li>
                  </ol>
                  <p className="mt-4">To get an S rating, answer a lot of questions accurately and quickly.</p>
                </div>
              </section>
            </div>
          )}

          {activeMainSection === 'articles' && (
            <div className="animate-fadeIn">
              <section className="py-2 border-t border-[--theme-doctorsoffice-accent] border-opacity-20">
                <div className="space-y-4">
                  <a 
                    href="/blog/how-to-study-for-the-mcat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-[--theme-doctorsoffice-accent] rounded-lg shadow hover:shadow-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 mt-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg 
                          className="w-5 h-5 text-[--theme-text-color]" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                        <h4 className="text-[--theme-text-color] font-medium">Optimizing Student MCAT Scores</h4>
                      </div>
                      <p className="text-sm text-[--theme-text-color] opacity-80">
                        Read about our ITS architecture and methology for optimizing student scores.
                      </p>
                    </div>
                  </a>

                  <a 
                    href="/blog/building-a-study-plan-for-the-mcat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-[--theme-doctorsoffice-accent] rounded-lg shadow hover:shadow-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <svg 
                          className="w-5 h-5 text-[--theme-text-color]" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                          />
                        </svg>
                        <h4 className="text-[--theme-text-color] font-medium">Building a Study Plan</h4>
                      </div>
                      <p className="text-sm text-[--theme-text-color] opacity-80">
                        Learn about our algorithm for creating personalized MCAT study schedules.
                      </p>
                    </div>
                  </a>
                </div>
              </section>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="text-[--theme-text-color] text-xs mb-6 opacity-60 uppercase tracking-wide text-center">
            Help & Information
          </h2>

          <div className="space-y-8 text-[--theme-text-color]">
            {/* Main navigation buttons */}
            <div className="flex flex-col gap-2">
              {[
                { id: 'calendar', label: 'Calendar' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'articles', label: 'Articles' },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveMainSection(section.id as any)}
                  className="p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{section.label}</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>

            {/* Reset Tutorials Button */}
            <div className="border-t border-[--theme-doctorsoffice-accent] pt-6">
              <button
                onClick={handleResetTutorials}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Tutorials
              </button>
            </div>

            {/* Email Preferences */}
            <section className="pt-6 border-t border-[--theme-doctorsoffice-accent]">
              <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                Email Preferences
              </h3>
              <p className="text-xs leading-relaxed mb-4 text-center">
                Manage your email notifications and communication preferences
              </p>
              <div className="flex justify-center">
                <Link
                  href="/preferences"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Bell className="w-4 h-4" />
                  <span>Email Settings</span>
                </Link>
              </div>
            </section>

            {/* Need Help section */}
            <section className="pt-6 border-t border-[--theme-doctorsoffice-accent]">
              <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                Need Help?
              </h3>
              <p className="text-xs leading-relaxed mb-4 text-center">
                Contact our support team for additional assistance or specific questions about the platform. Our discord is also a good place to ask questions about the MCAT.
              </p>
              <div className="flex justify-center gap-4">
                <MessageButton iconOnly withShadow />
                <a 
                  href="https://discord.gg/rTxN7wkh6e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-md border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaDiscord className="h-5 w-5" />
                </a>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default HelpContentSchedule; 