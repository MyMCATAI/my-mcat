import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';

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
    <div ref={helpRef} className="p-6 h-full overflow-y-auto relative bg-[--theme-mainbox-color] rounded-lg" onClick={(e) => e.stopPropagation()}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
      >
        <X className="h-5 w-5 text-[--theme-text-color]" />
      </button>

      {/* Title */}
      <h2 className="text-[--theme-text-color] text-2xl font-semibold mb-6">
        Schedule Help & Information
      </h2>

      {/* Content Sections */}
      <div className="space-y-6 text-[--theme-text-color]">
        <section>
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
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

        <section>
          <h3 className="text-lg font-semibold mb-2">Daily To-Do List</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li>View your daily tasks in the left sidebar</li>
            <li>Check off completed tasks to track progress</li>
            <li>Earn coins for completing all tasks in an activity</li>
            <li>Click activity titles to jump directly to that content</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li>Switch between calendar and analytics views</li>
            <li>Drag and drop activities to reschedule</li>
            <li>Click on dates to view or add activities</li>
            <li>Use the settings gear to customize your study plan</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li>Track your performance across all MCAT subjects</li>
            <li>View detailed statistics on questions answered and accuracy</li>
            <li>Monitor your average response time per question</li>
            <li>Identify focus areas that need improvement</li>
            <li>See your progress over time with interactive charts</li>
          </ul>
          <div className="mt-4 p-4 bg-[--theme-leaguecard-color] rounded-lg">
            <p className="text-sm text-[--theme-text-color] opacity-80">
              Pro Tip: Use the analytics insights to adjust your study schedule and focus more time on challenging topics.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Managing Breaks</h3>
          <div className="space-y-4">
            <a 
              href="/blog/mcat-study-schedule"
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
                  <h4 className="text-[--theme-text-color] font-medium">Effective Study Planning</h4>
                </div>
                <p className="text-sm text-[--theme-text-color] opacity-80">
                  Learn how to balance your MCAT prep with other commitments and maintain a sustainable study schedule.
                </p>
              </div>
            </a>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-sm leading-relaxed mb-4">
            Have questions about your schedule or need assistance? Our support team and community are here to help!
          </p>
          <div className="flex ml-2 gap-2">
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