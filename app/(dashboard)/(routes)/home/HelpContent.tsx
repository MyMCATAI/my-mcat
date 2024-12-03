import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import { useOutsideClick } from '@/hooks/use-outside-click';

interface HelpContentProps {
  onClose: () => void;
}

const HelpContent: React.FC<HelpContentProps> = ({ onClose }) => {
  const helpRef = useRef<HTMLDivElement>(null);
  useOutsideClick(helpRef, onClose);

  return (
    <div ref={helpRef} className="p-6 h-full overflow-y-auto relative">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
      >
        <X className="h-5 w-5 text-[--theme-text-color]" />
      </button>

      {/* Title */}
      <h2 className="text-[--theme-text-color] text-2xl font-semibold mb-6">
        Help & Information
      </h2>

      {/* Content Sections */}
      <div className="space-y-6 text-[--theme-text-color]">
        <section>
          <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
          <p className="text-sm leading-relaxed">
            Welcome to the Adaptive Tutoring System! This platform helps you efficiently prepare for the MCAT by intelligently organizing essential study content and adapting to your learning progress.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Managing Your Study Topics</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li>Access the settings panel to view and manage your current study topics</li>
            <li>Check off topics as you complete them to track your progress</li>
            <li>Use the shuffle feature to randomize your study order</li>
            <li>Filter topics by subject (Biology, Chemistry, Physics, etc.) to focus your studying</li>
            <li>Our algorithm can suggest topics based on your quiz performance and identified knowledge gaps</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Content Types</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li>Switch between video and reading content using the tabs. Both cover the same material, so no need to do both.</li>
            <li>Practice with quizzes generated from the MilesDown question bank</li>
            
            <li>Use Kalypso for explanations of any content or practice questions</li>
            <li>And remember: we have a podcast you can listen to, underneath the thumbnails on the video player!</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Quiz System</h3>
          <ul className="text-sm space-y-2 list-disc pl-4">
            <li>Each quiz costs one coin, but you'll earn it back with a perfect score</li>
            <li>Report unfair questions for review and receive two coins as compensation</li>
            <li>Use the widescreen mode for a better quiz-taking experience</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
          <p className="text-sm leading-relaxed mb-4">
            Contact our support team for additional assistance or specific questions about the platform. Our discord is also a good place to ask questions about the MCAT.
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

export default HelpContent; 