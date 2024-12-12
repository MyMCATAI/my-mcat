import React, { useRef, useState } from 'react';
import { X, ArrowLeft, ChevronRight } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import { useOutsideClick } from '@/hooks/use-outside-click';
import Image from 'next/image';
import Link from 'next/link';
import { Bell } from 'lucide-react';

interface HelpContentCARsProps {
  onClose: () => void;
  onResetTutorials?: () => void;
}

const HelpContentCARs: React.FC<HelpContentCARsProps> = ({ onClose, onResetTutorials }) => {
  const [activeMainSection, setActiveMainSection] = useState<'suite' | 'strategies' | null>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const handleResetTutorials = () => {
    localStorage.setItem("carsTutorialPlayed", "false");
    if (onResetTutorials) {
      onResetTutorials();
    }
  };

  return (
    <div ref={helpRef} className="p-6 h-full overflow-y-auto relative bg-[--theme-mainbox-color] rounded-lg w-[32rem] z-50 border-2 border-[--theme-border-color]">
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
            {activeMainSection === 'suite' ? 'Daily CARS Suite' : 'CARS Strategies'}
          </h2>

          {activeMainSection === 'suite' && (
            <div className="animate-fadeIn space-y-8 text-[--theme-text-color]">
              <p className="text-center">You can practice and learn CARS here.</p>

              {/* Key Metrics Section */}
              <section className="py-4 border-t border-[--theme-doctorsoffice-accent]">
                <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                  Key Metrics
                </h3>
                <div className="flex justify-between items-center p-2 bg-transparent border-2 rounded-lg mb-6"
                     style={{ borderColor: "var(--theme-border-color)" }}>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-10 h-10 relative">
                      <Image src="/game-components/PixelHeart.png" alt="Heart" layout="fill" objectFit="contain" />
                    </div>
                    <span className="text-xs mt-1">score</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-10 h-10 relative">
                      <Image src="/game-components/PixelWatch.png" alt="Watch" layout="fill" objectFit="contain" />
                    </div>
                    <span className="text-xs mt-1">per passage</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-10 h-10 relative">
                      <Image src="/game-components/PixelCupcake.png" alt="Diamond" layout="fill" objectFit="contain" />
                    </div>
                    <span className="text-xs mt-1">coins</span>
                  </div>
                  <div className="flex flex-col items-center w-1/4">
                    <div className="w-10 h-10 relative">
                      <Image src="/game-components/PixelBook.png" alt="Flex" layout="fill" objectFit="contain" />
                    </div>
                    <span className="text-xs mt-1">tests</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5 text-sm text-[--theme-text-color]">
                  <p><span className="font-medium">Score:</span> Averaged from last 10 passages</p>
                  <p><span className="font-medium">Time:</span> Target under 10 mins/passage</p>
                  <p><span className="font-medium">Coins:</span> Pay a coin a passage, earn back at 80%+ score</p>
                  <p><span className="font-medium">Tests:</span> Review for bonus coins</p>
                </div>
              </section>

              {/* System Design Section */}
              <section className="py-4 border-t border-[--theme-doctorsoffice-accent]">
                <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                  System Design
                </h3>
                <ul className="text-sm space-y-2 list-disc pl-4 text-[--theme-text-color]">
                  <li><span className="font-medium">Cost:</span> 1 coin per passage</li>
                  <li><span className="font-medium">Difficulty:</span> Levels 1-3, based on recent scores</li>
                  <li><span className="font-medium">Part 2:</span> Most passages have bonus questions</li>
                  <li><span className="font-medium">Bugs:</span> Report for 2 coins if validated</li>
                </ul>
              </section>

              {/* Sidebar Section */}
              <section className="py-4 border-t border-[--theme-doctorsoffice-accent]">
                <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                  Sidebar
                </h3>
                <ul className="text-sm space-y-2 list-disc pl-4 text-[--theme-text-color]">
                  <li>Videos are collected from YouTube to help with CARs.</li>
                  <li>Insights from r/MCAT sends a feed of Reddit content to you for you to search and review.</li>
                </ul>
              </section>
            </div>
          )}

          {activeMainSection === 'strategies' && (
            <div className="animate-fadeIn text-[--theme-text-color]">
              <div className="grid grid-cols-1 gap-4">
                <a 
                  href="/blog/best-cars-strategy"
                  className="block p-4 bg-[--theme-doctorsoffice-accent] rounded-lg shadow hover:shadow-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200"
                >
                  <div className="space-y-2">
                    <h4 className="text-[--theme-text-color] font-medium">How To Read A CARs Passage</h4>
                    <p className="text-sm text-[--theme-text-color] opacity-80">
                      Master the scaffolding technique for better passage comprehension
                    </p>
                  </div>
                </a>
                <a 
                  href="/blog/how-to-answer-cars-questions"
                  className="block p-4 bg-[--theme-doctorsoffice-accent] rounded-lg shadow hover:shadow-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200"
                >
                  <div className="space-y-2">
                    <h4 className="text-[--theme-text-color] font-medium">How To Answer CARs Questions</h4>
                    <p className="text-sm text-[--theme-text-color] opacity-80">
                      Learn strategies for tackling different types of CARs questions effectively
                    </p>
                  </div>
                </a>
                <a 
                  href="/blog/cars-ai-help"
                  className="block p-4 bg-[--theme-doctorsoffice-accent] rounded-lg shadow hover:shadow-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200"
                >
                  <div className="space-y-2">
                    <h4 className="text-[--theme-text-color] font-medium">How To Use AI to Help with CARs</h4>
                    <p className="text-sm text-[--theme-text-color] opacity-80">
                      Discover how to leverage AI tools to improve your CARS practice
                    </p>
                  </div>
                </a>
              </div>
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
                { id: 'suite', label: 'Daily CARS Suite' },
                { id: 'strategies', label: 'CARS Strategies' },
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
                Have questions about CARS or need assistance? Our support team and community are here to help!
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

export default HelpContentCARs; 