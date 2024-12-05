import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon } from 'lucide-react';

interface HelpContentScheduleProps {
  onClose: () => void;
  onResetTutorials?: () => void;
}

const HelpContentSchedule: React.FC<HelpContentScheduleProps> = ({ onClose, onResetTutorials }) => {
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

      {/* Title */}
      <h2 className="text-[--theme-text-color] text-2xl font-semibold mb-2">
        Schedule Information
      </h2>

      {/* Content Sections */}
      <div className="space-y-6 text-[--theme-text-color]">
        <section className="py-2">
          <p className="text-sm leading-relaxed mb-4">
            Welcome to your MCAT study schedule! This dashboard helps you organize and track your daily study activities.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleResetTutorials}
              className="px-4 py-2 text-sm border border-[--theme-border-color] bg-[--theme-bg-transparent] rounded-md hover:bg-[--theme-hover-color] transition-colors duration-200"
            >
              Reset Tutorial
            </button>
          </div>
        </section>

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent] border-opacity-20">
          <h3 className="text-lg font-semibold mb-2 text-center">Calendar View</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">           
            <li>Click the settings icon above the help button to modify your schedule.</li>
            <li>Read about our <a href="/blog/mcat-study-schedule" target="_blank" rel="noopener" className="text-[--theme-hover-color] hover:opacity-75 underline">algorithm on our blog</a>.</li>
            <li>Click the calendar icon under analytics to go to your calendar.</li>
          </ul>
          
          {/* Add Calendar Button Sample */}
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

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent] border-opacity-20">
          <h3 className="text-lg font-semibold mb-2 text-center">Daily To-Do List</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li>Click titles to jump to linked tasks.</li>
            <li>Check off tasks to win coins.</li>
            <li>Gain a streak for logging in to study.</li>
          </ul>
          
          <div className="mt-4 bg-[--theme-leaguecard-color] border border-[--theme-border-color] rounded-lg overflow-hidden">
            {/* Sample Activity Button */}
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

            {/* Sample Tasks */}
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

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent] border-opacity-20">
          <h3 className="text-lg font-semibold mb-2 text-center">Analytics Dashboard</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li>Coming soon.</li>
          </ul>
        </section>

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent] border-opacity-20">
          <h3 className="text-lg font-semibold mb-2 text-center">Our Methodology</h3>
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
          </div>
        </section>

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent] border-opacity-20">
          <h3 className="text-lg font-semibold mb-2 text-center">Need Help?</h3>
          <p className="text-sm leading-relaxed mb-4">
            Have questions about your schedule or need assistance? Our support team and community are here to help!
          </p>
          <div className="flex justify-center gap-2">
            <MessageButton />
            <a 
              href="https://discord.gg/rTxN7wkh6e"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white text-m rounded-md hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors duration-200"
            >
              <FaDiscord className="h-4 w-4" />
              <span>Join Discord</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpContentSchedule; 