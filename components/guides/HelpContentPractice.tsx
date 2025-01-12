import React, { useRef, useState } from 'react';
import { X, ChevronDown, ChevronUp, Check, Podcast, ArrowLeft, ChevronRight, Bell, Phone } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import { useOutsideClick } from '@/hooks/use-outside-click';
import Image from 'next/image';
import Icon from '@/components/ui/icon';
import Link from 'next/link';

interface HelpContentProps {
  onClose: () => void;
  onResetTutorials: () => void;
}

const HelpContent: React.FC<HelpContentProps> = ({ onClose, onResetTutorials }) => {
  const helpRef = useRef<HTMLDivElement>(null);
  const [activeMainSection, setActiveMainSection] = useState<'ats' | 'podcast' | 'system' | null>(null);
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
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      if (!activeMainSection) {
        setActiveMainSection('ats');
      }
    }
  };

  return (
    <div 
      ref={helpRef} 
      className="p-6 h-full overflow-y-auto relative bg-[--theme-mainbox-color] rounded-lg w-full z-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="max-w-[calc(100vw-20rem)] w-full mx-auto">
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
              className="flex items-center gap-2 text-[--theme-text-color] mb-4 opacity-60 hover:opacity-100 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">Back</span>
            </button>
            
            <h2 className="text-[--theme-text-color] text-xs mb-6 opacity-60 uppercase tracking-wide text-center">
              {activeMainSection === 'ats' && 'Adaptive Tutoring Suite'}
              {activeMainSection === 'podcast' && 'MyMCAT Podcast'}
              {activeMainSection === 'system' && 'System Design'}
            </h2>

            {activeMainSection === 'ats' && (
              <p className="text-sm text-[--theme-text-color] mb-8 leading-relaxed text-center">
                The ATS is designed so you can learn content in one place. Please click the buttons below for more information.
              </p>
            )}

            <div className="space-y-4 text-[--theme-text-color]">
              {activeMainSection === 'ats' && (
                <div className="animate-fadeIn">
                  <section className="space-y-8">
                    <section className="py-4 border-t border-[--theme-doctorsoffice-accent]">
                      <h3 className="text-sm mb-2 text-center opacity-60 uppercase tracking-wide">
                        Learning Content
                      </h3>
                      <div className="flex items-center justify-center gap-4 bg-[--theme-leaguecard-color] p-4 rounded-lg shadow-md">
                        {/* Video Icon */}
                        <div 
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeSection === 'video' ? 'scale-110' : 'hover:scale-105'}`}
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
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeSection === 'reading' ? 'scale-110' : 'hover:scale-105'}`}
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
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 px-3 py-1 rounded-md bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl border border-[--theme-border-color] hover:bg-[--theme-hover-color] ${activeSection === 'sample' ? 'scale-110' : 'hover:scale-105'}`}
                          onClick={() => toggleSection('sample')}
                        >
                          <span className="text-[--theme-text-color] font-semibold">Topic</span>
                        </div>

                        {/* Quiz Icon */}
                        <div 
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeSection === 'quiz' ? 'scale-110' : 'hover:scale-105'}`}
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
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeSection === 'kalypso' ? 'scale-110' : 'hover:scale-105'}`}
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
                            <div className="text-sm leading-relaxed">
                              Ask Kalypso questions directly or use the button. <strong>Press cmd to toggle voice input (browser support varies).</strong>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </section>

                    <section className="py-2 border-t border-[--theme-doctorsoffice-accent] mb-8">
                      <h3 className="text-sm mb-2 text-center opacity-60 uppercase tracking-wide">
                        Topic Selection
                      </h3>
                      <div className="flex items-center justify-center gap-4">
                        {/* Settings Icon */}
                        <div 
                          className="relative z-10 rounded-lg text-center group min-h-[6.25rem] w-[6.25rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                              <span className="text-sm font-semibold text-[--theme-text-color] mt-2">
                                SETTINGS
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amino Acids Icon */}
                        <div 
                          className="relative z-10 rounded-lg text-center group min-h-[6.25rem] w-[6.25rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                          className="relative z-10 rounded-lg text-center group min-h-[6.25rem] w-[6.25rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                      ) : null}
                    </section>
                  </section>
                </div>
              )}

              {activeMainSection === 'podcast' && (
                <div className="animate-fadeIn">
                  <section>
                    <div className="w-full">
                      <iframe 
                        style={{ borderRadius: "0.75rem" }}
                        src="https://open.spotify.com/embed/artist/39hEmhoBLVCLVbKNgcCQpw?utm_source=generator" 
                        width="100%" 
                        height="152"
                        frameBorder="0" 
                        allowFullScreen 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                      />
                    </div>
                    <p className="text-sm leading-relaxed mt-4 text-center">
                      Under the thumbnails besides a category, you can access a podcast for a category by clicking this icon:
                    </p>
                    <div className="flex justify-center mt-2">
                      <button
                        className="w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-300 bg-[--theme-leaguecard-color] hover:bg-[--theme-hover-color] border border-[--theme-border-color]"
                      >
                        <Podcast className="w-8 h-8 transition-colors duration-300 text-[--theme-text-color] hover:text-[--theme-hover-text]" />
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {activeMainSection === 'system' && (
                <div className="animate-fadeIn">
                  <section>
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
                            <h4 className="text-[--theme-text-color] text-sm opacity-70">
                              Optimizing Student Scores on the MCAT
                            </h4>
                          </div>
                          <p className="text-sm text-[--theme-text-color] opacity-80">
                            Learn how our ITS creates a comprehensive, real-time representation of your knowledge profile to personalize your learning experience.
                          </p>
                        </div>
                      </a>

                      <a 
                        href="/blog/weakness-finding-algorithm"
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
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                              />
                            </svg>
                            <h4 className="text-[--theme-text-color] text-sm opacity-70">
                              The Weakness Finding Algorithm
                            </h4>
                          </div>
                          <p className="text-sm text-[--theme-text-color] opacity-80">
                            Discover how we use Thompson sampling and multi-armed bandits to identify and target your weak areas.
                          </p>
                        </div>
                      </a>
                    </div>
                  </section>
                </div>
              )}
            </div>
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
                  { id: 'ats', label: 'ATS Layout' },
                  { id: 'podcast', label: 'MyMCAT Podcast' },
                  { id: 'system', label: 'Articles' },
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

              {/* Settings Section */}
              <section className="pt-6 border-t border-[--theme-doctorsoffice-accent]">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleResetTutorials}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Reset Tutorials</span>
                  </button>
                  <Link
                    href="/preferences"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Email Settings</span>
                  </Link>
                </div>
              </section>

              {/* Need Help section */}
              <section className="pt-6 border-t border-[--theme-doctorsoffice-accent]">
                <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide">
                  Need Help?
                </h3>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://discord.gg/DcHWnEu8Xb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors"
                  >
                    <FaDiscord className="w-5 h-5" />
                    <span>Join Discord Community</span>
                  </a>
                  <a
                    href="sms:832-646-2445"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Text Prynce (832) 646-2445</span>
                  </a>
                  <a
                    href="tel:832-646-2445"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Prynce (832) 646-2445</span>
                  </a>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HelpContent;