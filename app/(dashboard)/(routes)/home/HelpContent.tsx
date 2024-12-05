import React, { useRef, useState } from 'react';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import { useOutsideClick } from '@/hooks/use-outside-click';
import Image from 'next/image';
import Icon from '@/components/ui/icon';

interface HelpContentProps {
  onClose: () => void;
  onResetTutorials: () => void;
}

const HelpContent: React.FC<HelpContentProps> = ({ onClose, onResetTutorials }) => {
  const helpRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<'video' | 'reading' | 'sample' | 'quiz' | 'kalypso' | 'amino' | 'fluids' | 'settings' | null>(null);
  useOutsideClick(helpRef, onClose);

  const handleResetTutorials = () => {
    localStorage.removeItem("initialTutorialPlayed");
    localStorage.removeItem("atsIconTutorialPlayed");
    localStorage.removeItem("atsTutorialPart4Played");
    localStorage.removeItem("catIconInteracted");
    
    onResetTutorials();
  };

  const toggleSection = (section: 'video' | 'reading' | 'sample' | 'quiz' | 'kalypso' | 'amino' | 'fluids' | 'settings') => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div 
      ref={helpRef} 
      className="p-6 h-full overflow-y-auto relative bg-[--theme-mainbox-color] rounded-lg w-[32rem] z-50 border-2 border-[--theme-border-color]" 
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
      >
        <X className="h-5 w-5 text-[--theme-text-color]" />
      </button>

      <h2 className="text-[--theme-text-color] text-2xl font-semibold mb-6">
        ATS Information
      </h2>

      <div className="space-y-6 text-[--theme-text-color]">
        <section>
          <p className="text-sm leading-relaxed mb-4">
            Welcome to the Adaptive Tutoring System! This platform gives you all of the materials to learn MCAT content.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleResetTutorials}
              className="px-4 py-2 text-sm border border-[--theme-border-color] bg-[--theme-bg-transparent] rounded-md hover:bg-[--theme-hover-color] transition-colors duration-200"
            >
              Reset Tutorials
            </button>
          </div>
        </section>

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent]">
          <h3 className="text-lg font-semibold mb-2 text-center">Learning Content</h3>
          <div className="flex items-center justify-center gap-4 bg-transparent p-4 rounded-lg">
            {/* Video Icon */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-[--theme-hover-color] ${activeSection === 'video' ? 'scale-110' : 'hover:scale-105'}`}
              onClick={() => toggleSection('video')}
            >
              <div className="w-6 h-6 relative theme-box">
                <Image
                  src="/camera.svg"
                  layout="fill"
                  objectFit="contain"
                  alt="camera"
                  className="theme-svg"
                />
              </div>
            </div>

            {/* Reading Icon */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-[--theme-hover-color] ${activeSection === 'reading' ? 'scale-110' : 'hover:scale-105'}`}
              onClick={() => toggleSection('reading')}
            >
              <div className="w-6 h-6 relative theme-box">
                <Image
                  src="/bookopened.svg"
                  layout="fill"
                  objectFit="contain"
                  alt="book opened"
                  className="theme-svg"
                />
              </div>
            </div>

            {/* Sample Title */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-200 px-3 py-1 rounded-md bg-[--theme-bg-transparent] border border-[--theme-border-color] hover:bg-[--theme-hover-color] ${activeSection === 'sample' ? 'scale-110' : 'hover:scale-105'}`}
              onClick={() => toggleSection('sample')}
            >
              <span className="text-[--theme-text-color] font-semibold">Topic</span>
            </div>

            {/* Quiz Icon */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-[--theme-hover-color] ${activeSection === 'quiz' ? 'scale-110' : 'hover:scale-105'}`}
              onClick={() => toggleSection('quiz')}
            >
              <div className="w-7 h-7 relative theme-box">
                <Image
                  src="/exam.svg"
                  layout="fill"
                  objectFit="contain"
                  alt="exam"
                  className="theme-svg"
                />
              </div>
            </div>

            {/* Kalypso Icon */}
            <div 
              className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-[--theme-hover-color] ${activeSection === 'kalypso' ? 'scale-110' : 'hover:scale-105'}`}
              onClick={() => toggleSection('kalypso')}
            >
              <div className="w-7 h-7 relative theme-box">
                <Image
                  src="/cat.svg"
                  layout="fill"
                  objectFit="contain"
                  alt="AI Chat"
                  className="theme-svg"
                />
              </div>
            </div>
          </div>

          {/* Explanations */}
          {activeSection ? (
            <div className="p-4 bg-transparent rounded-lg text-sm space-y-2 animate-fadeIn">
              {activeSection === 'video' && (
                <div className="text-sm leading-relaxed">
                  Watch MCAT video lectures curated from YouTube with detailed summaries. Use Kalypso to get instant clarification on any concept while watching. 
                  <strong> You don&apos;t have to do BOTH readings and videos. One will suffice.</strong>
                </div>
              )}
              {activeSection === 'reading' && (
                <div className="text-sm leading-relaxed">
                  Access detailed PDFs from LibreText or OpenStax that cover concepts comprehensively. 
                  You can full screen. Kalypso can clarify anything you don&apos;t understand.
                  <strong> You don&apos;t have to do BOTH readings and videos. One will suffice.</strong>
                </div>
              )}
              {activeSection === 'sample' && (
                <>
                  <div className="">
                    <p className="text-sm mb-4">
                      This is the content category (CC) that you&apos;re currently studying. Hover over it and press a button that looks like the below to complete the category:
                    </p>
                    <div className="flex justify-center flex-col items-center">
                      <button
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm"
                        disabled
                      >
                        <Check className="w-4 h-4 items-center justify-center" />
                        Complete Topic
                      </button>
                      <p className="text-sm mt-2">
                        Pressing complete topic will then result in our system selecting another topic for you to study.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {activeSection === 'quiz' && (
                <div className="text-sm leading-relaxed">
                  You can do practice questions and it&apos;s full screen. You can pay a coin to take a quiz. 
                  If you get a 100, you can get your coin back. Your performance feeds your knowledge profile 
                  and affects the ITS&apos; understanding of your weaknesses. <strong>You can report unfair questions with the downvote and win two coins as compensation.</strong>
                </div>
              )}
              {activeSection === 'kalypso' && (
                <>
                  <div className="text-sm leading-relaxed">
                    Ask Kalypso questions directly or use the button. <strong>Press cmd to toggle voice input (browser support varies).</strong>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mt-2 p-4 bg-transparent rounded-lg text-sm text-center animate-fadeIn">
              Click one of the icons above for an explanation of their purpose.
            </div>
          )}
        </section>

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent]">
          <h3 className="text-lg font-semibold mb-2 text-center">Topic Selection</h3>
          <div className="flex items-center justify-center gap-4">
            {/* Settings Icon */}
            <div 
              className="relative z-10 rounded-lg text-center group min-h-[6.25rem] w-[6.25rem] cursor-pointer transition-all hover:bg-[--theme-hover-color]"
              style={{
                backgroundColor: "var(--theme-adaptive-tutoring-color)",
                boxShadow: "var(--theme-adaptive-tutoring-boxShadow)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--theme-adaptive-tutoring-boxShadow-hover)";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.zIndex = "30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--theme-adaptive-tutoring-boxShadow)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.zIndex = "10";
              }}
              onClick={() => toggleSection('settings')}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="settings-container flex flex-col items-center">
                  <svg
                    className="settings-icon w-8 h-8 text-[--theme-text-color]"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.25,22l-.4-3.2c-.216-.084-.42-.184-.612-.3c-.192-.117-.38-.242-.563-.375L4.7,19.375L1.95,14.625L4.525,12.675c-.016-.117-.024-.23-.024-.338V11.662c0-.108.008-.221.025-.337L1.95,9.375L4.7,4.625L7.675,5.875c.183-.134.375-.259.575-.375c.2-.117.4-.217.6-.3l.4-3.2H14.75l.4,3.2c.216.084.42.184.612.3c.192.117.38.242.563.375l2.975-.75l2.75,4.75l-2.575,1.95c.016.117.024.23.024.338v.675c0,.108-.008.221-.025.337l2.575,1.95l-2.75,4.75l-2.95-.75c-.183.133-.375.258-.575.375c-.2.117-.4.217-.6.3l-.4,3.2H9.25zM12.05,15.5c.966,0,1.791-.342,2.475-1.025c.683-.683,1.025-1.508,1.025-2.475c0-.966-.342-1.791-1.025-2.475c-.683-.683-1.508-1.025-2.475-1.025c-0.984,0-1.813,.342-2.488,1.025c-0.675,.683-1.012,1.508-1.012,2.475c0,.966,.337,1.791,1.012,2.475c.675,.683,1.504,1.025,2.488,1.025z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-[--theme-text-color] mt-2">
                    SETTINGS
                  </span>
                </div>
              </div>
            </div>

            {/* Amino Acids Icon */}
            <div 
              className="relative z-10 rounded-lg text-center group min-h-[6.25rem] w-[6.25rem] cursor-pointer transition-all hover:bg-[--theme-hover-color]"
              style={{
                backgroundColor: "var(--theme-adaptive-tutoring-color)",
                boxShadow: "var(--theme-adaptive-tutoring-boxShadow)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--theme-adaptive-tutoring-boxShadow-hover)";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.zIndex = "30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--theme-adaptive-tutoring-boxShadow)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.zIndex = "10";
              }}
              onClick={() => toggleSection('amino')}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="m-auto transform scale-90">
                  <Icon
                    name="amino"
                    className="w-6 h-6"
                    color="#3B82F6"
                  />
                </div>
              </div>
            </div>

            {/* Fluids Icon */}
            <div 
              className="relative z-10 rounded-lg text-center group min-h-[6.25rem] w-[6.25rem] cursor-pointer transition-all hover:bg-[--theme-hover-color]"
              style={{
                backgroundColor: "var(--theme-adaptive-tutoring-color)",
                boxShadow: "var(--theme-adaptive-tutoring-boxShadow)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--theme-adaptive-tutoring-boxShadow-hover)";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.zIndex = "30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--theme-adaptive-tutoring-boxShadow)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.zIndex = "10";
              }}
              onClick={() => toggleSection('fluids')}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="m-auto transform scale-90">
                  <Icon
                    name="fluids"
                    className="w-6 h-6"
                    color="#800020"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Explanations */}
          {(activeSection === 'amino' || activeSection === 'fluids') ? (
            <div className="p-4 rounded-lg text-sm space-y-2 mt-2 animate-fadeIn">
              <div className="text-sm leading-relaxed">
                At a time, you can have five topics active to choose from when studying. There are around a 100 topics. They are either curated for you using our algorithm or you can choose them. Switch between them by clicking a button.
              </div>
            </div>
          ) : activeSection === 'settings' ? (
            <div className="p-4 rounded-lg text-sm space-y-2 mt-2 animate-fadeIn">
              <div className="text-sm leading-relaxed">
                The settings shows the current categories you have active. You can come here to shuffle them, change them, focus on a category, or have our algorithm find new weaknesses for you. Furthermore, you can check your progress.
              </div>
            </div>
          ) : (
            <div className="mt-2 p-4 rounded-lg text-sm text-center animate-fadeIn">
              Click one of the icons above for an explanation of their purpose.
            </div>
          )}
        </section>

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent]">
          <h3 className="text-lg font-semibold mb-2 text-center">Our Weakness Algorithm</h3>
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
                  <h4 className="text-[--theme-text-color] font-medium">Optimizing Student Scores on the MCAT</h4>
                </div>
                <p className="text-sm text-[--theme-text-color] opacity-80">
                  Learn how our ITS creates a comprehensive, real-time representation of your knowledge profile to personalize your learning experience.
                </p>
              </div>
            </a>
          </div>
        </section>

        <section className="py-2 border-t border-[--theme-doctorsoffice-accent]">
          <h3 className="text-lg font-semibold mb-2 text-center">Need Help?</h3>
          <p className="text-sm leading-relaxed mb-4">
            Contact our support team for additional assistance or specific questions about the platform. Our discord is also a good place to ask questions about the MCAT.
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

export default HelpContent;
