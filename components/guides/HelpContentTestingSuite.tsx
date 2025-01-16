import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ArrowLeft, Check, X, Podcast, Bell } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import clsx from 'clsx';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FaDiscord } from 'react-icons/fa';
import MessageButton from '@/components/MessageButton';
import Link from 'next/link';
import { SubscriptionButton } from '@/components/subscription-button';

type Section = 'mcat' | 'mymcat' | 'taking' | 'reviewing' | 'strategies' | 'testing' | 'cars' | 'ats' | 'anki' | null;

interface ResourcePackProps {
  onResetTutorials: () => void;
}

const ResourcePack: React.FC<ResourcePackProps> = ({ onResetTutorials }) => {
  const [activeSection, setActiveSection] = useState<Section>(null);
  const [activeATSSubsection, setActiveATSSubsection] = useState<string | null>(null);
  const [previousSection, setPreviousSection] = useState<Section>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [testingSuiteExpanded, setTestingSuiteExpanded] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);

  const handleSectionChange = (newSection: Section) => {
    setPreviousSection(activeSection);
    setActiveSection(newSection);
  };

  const handleBack = () => {
    setActiveSection(previousSection);
    setPreviousSection(null);
  };

  const VideoCard = ({ src, title, description }: { src: string; title: string; description: string }) => (
    <div className="rounded-xl overflow-hidden bg-[--theme-doctorsoffice-accent] cursor-pointer hover:opacity-90 transition-all duration-200"
         onClick={() => setActiveVideo(src)}>
      <video 
        className="w-full"
        preload="metadata"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="p-4">
        <h4 className="text-sm font-medium mb-1">{title}</h4>
        <p className="text-xs opacity-70">{description}</p>
      </div>
    </div>
  );

  const toggleSection = (section: Section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const toggleATSSubsection = (section: string) => {
    setActiveATSSubsection(activeATSSubsection === section ? null : section);
  };

  const renderContent = () => {
    if (!activeSection) return null;

    const content = {
      mcat: (
        <div className="animate-fadeIn space-y-6 mt-6">
          <h3 className="text-xs text-center opacity-60 uppercase tracking-wide">
            {'What\'s on the MCAT?'}
          </h3>          
          <div className="space-y-6">
            <section>
              <p className="text-sm opacity-80 mb-4">
                The MCAT is a test of content and critical thinking. It consists of <strong>four sections</strong> spanning seven undergraduate topics. The test is a mile wide and an inch deep so <strong>don&apos;t overrely on content such as Anki or even UWorld.</strong> We have tagged every topic on the MCAT. For every question you answer, our model updates your knowledge profile which affects your flashcards, UWorld, ATS, and Anki Clinic.
              </p>

              <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide font-semibold">
                Resources
              </h3>
              <div className="space-y-3">
                <a 
                  href={'https://my-mcat.s3.us-east-2.amazonaws.com/pdfs/What%27s+On+The+MCAT.pdf'}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-[--theme-doctorsoffice-accent] rounded-lg hover:opacity-80 transition-opacity w-full"
                >
                  <svg 
                    className="w-5 h-5 flex-shrink-0" 
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
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">MCAT PDF Guide</span>
                    <span className="text-xs opacity-70">Comprehensive breakdown of test content.</span>
                  </div>
                </a>
                <a 
                  href="https://reddit.com/r/mcat" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-[--theme-doctorsoffice-accent] rounded-lg hover:opacity-80 transition-opacity w-full"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                  >
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">r/MCAT Community</span>
                    <span className="text-xs opacity-70">Join the discussion with fellow test-taker.</span>
                  </div>
                </a>

              </div>
            </section>
          </div>
        </div>
      ),
      mymcat: (
        <div className="animate-fadeIn space-y-6">
          <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
            Starting with MyMCAT
          </h3>
          
          <p className="text-sm opacity-80 mb-6">
            MyMCAT is a resource that can either be your <strong>only resource or within your rotation</strong> of resources. The biggest thing about our platform is that <strong>it knows you</strong>. When you enter your tests, it curates videos and readings and flashcards for your weaknesses.
          </p>

          <div className="space-y-8">
            {/* Testing Suite Section */}
            <div className="relative">
              <button 
                className="group relative w-full flex items-center gap-4"
                onClick={() => handleSectionChange('testing')}
              >
                <div className={clsx(
                  "w-12 h-12 bg-[var(--theme-navbutton-color)] rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all",
                  {
                    "scale-110": activeSection === 'testing',
                    "hover:scale-110": activeSection !== 'testing'
                  }
                )}>
                  <Image 
                    src="/icons/exam.svg" 
                    alt="Testing Suite" 
                    width={24} 
                    height={24}
                  />
                </div>
                <span className="text-md font-semibold">Testing Suite</span>
              </button>
              {activeSection === 'testing' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 space-y-4"
                >
                  <p className="text-sm opacity-80">
                    Upload practice test results from AAMC or third parties...
                  </p>
                </motion.div>
              )}
            </div>

            {/* CARs Suite Section */}
            <div className="relative">
              <button 
                className="group relative w-full flex items-center gap-4"
                onClick={() => handleSectionChange('cars')}
              >
                <div className="w-12 h-12 bg-[var(--theme-navbutton-color)] rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-transform">
                  <Image 
                    src="/icons/book.svg" 
                    alt="CARS Suite" 
                    width={24} 
                    height={24}
                  />
                </div>
                <span className="text-md font-semibold">CARS Suite</span>
              </button>
              {activeSection === 'cars' && (
                <div className="animate-fadeIn mt-4 space-y-4">
                  <p className="text-sm opacity-80">
                    MyMCAT uses an internal content generator <strong>trained on AAMC passages</strong> as well as <strong>top CARs scorers</strong> designing our passages. They&apos;re harder than AAMC and designed that way, with only a quarter of the passages on AAMC matching us in terms of difficulty.
                  </p>
                </div>
              )}
            </div>

            {/* Adaptive Tutoring Suite Section */}
            <div className="relative">
              <button 
                className="group relative w-full flex items-center gap-4"
                onClick={() => handleSectionChange('ats')}
              >
                <div className="w-12 h-12 bg-[var(--theme-navbutton-color)] rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-transform">
                  <Image 
                    src="/graduationcap.svg" 
                    alt="Tutoring Suite" 
                    width={24} 
                    height={24}
                  />
                </div>
                <span className="text-md font-semibold">ATS</span>
              </button>
              {activeSection === 'ats' && (
                <div className="animate-fadeIn">
                  <h3 className="text-xs text-center opacity-60 uppercase tracking-wide">
                    Adaptive Learning
                  </h3>
                  <p className="text-sm text-[--theme-text-color] leading-relaxed">
                    The ATS is designed so you can learn content in one place. Everytime you refresh, it pulls your weakest subjects from your knowledge profile. Please click the buttons below for more information.
                  </p>

                  <section className="space-y-8">
                    <section className="py-6 border-t border-[--theme-doctorsoffice-accent]">
                      <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                        Learning Content
                      </h3>
                      <div className="flex items-center justify-center gap-2 bg-[--theme-leaguecard-color] p-3 rounded-lg shadow-md">
                        {/* Video Icon */}
                        <div 
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeATSSubsection === 'video' ? 'scale-110' : 'hover:scale-105'}`}
                          onClick={() => toggleATSSubsection('video')}
                        >
                          <div className="w-4 h-4 relative theme-box">
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
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeATSSubsection === 'reading' ? 'scale-110' : 'hover:scale-105'}`}
                          onClick={() => toggleATSSubsection('reading')}
                        >
                          <div className="w-4 h-4 relative theme-box">
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
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 px-3 py-1 rounded-md bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl border border-[--theme-border-color] hover:bg-[--theme-hover-color] ${activeATSSubsection === 'sample' ? 'scale-110' : 'hover:scale-105'}`}
                          onClick={() => toggleATSSubsection('sample')}
                        >
                          <span className="text-[--theme-text-color] font-semibold">Topic</span>
                        </div>

                        {/* Quiz Icon */}
                        <div 
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeATSSubsection === 'quiz' ? 'scale-110' : 'hover:scale-105'}`}
                          onClick={() => toggleATSSubsection('quiz')}
                        >
                          <div className="w-4 h-4 relative theme-box">
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
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeATSSubsection === 'kalypso' ? 'scale-110' : 'hover:scale-105'}`}
                          onClick={() => toggleATSSubsection('kalypso')}
                        >
                          <div className="w-4 h-4 relative theme-box">
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
                      {activeATSSubsection ? (
                        <div className="p-4 bg-transparent rounded-lg text-sm space-y-2 animate-fadeIn">
                          {activeATSSubsection === 'video' && (
                            <div className="text-sm leading-relaxed">
                              Watch MCAT video lectures curated from YouTube with detailed summaries. Use Kalypso to get instant clarification on any concept while watching. 
                              <strong> You don&apos;t have to do BOTH readings and videos. One will suffice.</strong>
                            </div>
                          )}
                          {activeATSSubsection === 'reading' && (
                            <div className="text-sm leading-relaxed">
                              Access detailed PDFs from LibreText or OpenStax that cover concepts comprehensively. 
                              You can full screen. Kalypso can clarify anything you don&apos;t understand.
                              <strong> You don&apos;t have to do BOTH readings and videos. One will suffice.</strong>
                            </div>
                          )}
                          {activeATSSubsection === 'sample' && (
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
                          {activeATSSubsection === 'quiz' && (
                            <div className="text-sm leading-relaxed">
                              You can do practice questions and it&apos;s full screen. You can pay a coin to take a quiz. 
                              If you get a 100, you can get your coin back. Your performance feeds your knowledge profile 
                              and affects the ITS&apos; understanding of your weaknesses. <strong>You can report unfair questions with the downvote and win two coins as compensation.</strong>
                            </div>
                          )}
                          {activeATSSubsection === 'kalypso' && (
                            <div className="text-sm leading-relaxed">
                              Ask Kalypso questions directly or use the button. <strong>Press cmd to toggle voice input (browser support varies).</strong>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </section>

                    <section className="py-6 border-t border-[--theme-doctorsoffice-accent] mb-6">
                      <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                        Topic Selection
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        {/* Settings Card */}
                        <div 
                          className="relative z-10 rounded-lg text-center group min-h-[4rem] w-[4rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                          onClick={() => toggleATSSubsection('settings')}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="settings-container flex flex-col items-center">
                              <svg
                                className="settings-icon w-6 h-6 text-[--theme-text-color]"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9.25,22l-.4-3.2c-.216-.084-.42-.184-.612-.3c-.192-.117-.38-.242-.563-.375L4.7,19.375L1.95,14.625L4.525,12.675c-.016-.117-.024-.23-.024-.338V11.662c0-.108.008-.221.025-.337L1.95,9.375L4.7,4.625L7.675,5.875c.183-.134.375-.259.575-.375c.2-.117.4-.217.6-.3l.4-3.2H14.75l.4,3.2c.216.084.42.184.612.3c.192.117.38.242.563.375l2.975-.75l2.75,4.75l-2.575,1.95c.016.117.024.23.024.338v.675c0,.108-.008.221-.025.337l2.575,1.95l-2.75,4.75l-2.95-.75c-.183.133-.375.258-.575.375c-.2.117-.4.217-.6.3l-.4,3.2H9.25zM12.05,15.5c.966,0,1.791-.342,2.475-1.025c.683-.683,1.025-1.508,1.025-2.475c0-.966-.342-1.791-1.025-2.475c-.683-.683-1.508-1.025-2.475-1.025c-0.984,0-1.813,.342-2.488,1.025c-0.675,.683-1.012,1.508-1.012,2.475c0,.966,.337,1.791,1.012,2.475c.675,.683,1.504,1.025,2.488,1.025z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Amino Acids Icon */}
                        <div 
                          className="relative z-10 rounded-lg text-center group min-h-[4rem] w-[4rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                          onClick={() => toggleATSSubsection('amino')}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="m-auto transform scale-90">
                              <svg
                                className="w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="#3B82F6"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                                <path d="M2 17L12 22L22 17" />
                                <path d="M2 12L12 17L22 12" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Fluids Icon */}
                        <div 
                          className="relative z-10 rounded-lg text-center group min-h-[4rem] w-[4rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                          onClick={() => toggleATSSubsection('fluids')}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="m-auto transform scale-90">
                              <svg
                                className="w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="#800020"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 2L5 12L12 22L19 12L12 2Z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explanations */}
                      {(activeATSSubsection === 'amino' || activeATSSubsection === 'fluids') ? (
                        <div className="p-4 rounded-lg text-sm space-y-2 mt-2 animate-fadeIn">
                          <div className="text-sm leading-relaxed">
                            At a time, you can have five topics active to choose from when studying. There are around a 100 topics. They are either curated for you using our algorithm or you can choose them. Switch between them by clicking a button.
                          </div>
                        </div>
                      ) : activeATSSubsection === 'settings' ? (
                        <div className="p-4 rounded-lg text-sm space-y-2 mt-2 animate-fadeIn">
                          <div className="text-sm leading-relaxed">
                            The settings shows the current categories you have active. You can come here to shuffle them, change them, focus on a category, or have our algorithm find new weaknesses for you.
                          </div>
                        </div>
                      ) : null}
                    </section>

                    {/* Add new Podcast Section */}
                    <section className="py-6 border-t border-[--theme-doctorsoffice-accent] mb-8">
                      <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                        MyMCAT Podcast
                      </h3>
                      <div className="w-full flex items-center justify-center">
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
                      <div className="flex items-center justify-center mt-2">
                        <button
                          className="w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-300 bg-[--theme-leaguecard-color] hover:bg-[--theme-hover-color] border border-[--theme-border-color]"
                        >
                          <Podcast className="w-8 h-8 transition-colors duration-300 text-[--theme-text-color] hover:text-[--theme-hover-text]" />
                        </button>
                      </div>
                    </section>
                  </section>
                </div>
              )}
            </div>

            {/* Anki Clinic Section */}
            <div className="relative">
              <button 
                className="group relative w-full flex items-center gap-4"
                onClick={() => handleSectionChange('anki')}
              >
                <div className="w-12 h-12 bg-[var(--theme-navbutton-color)] rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-transform">
                  <Image 
                    src="/icons/gamecontroller.svg" 
                    alt="Anki Clinic" 
                    width={24} 
                    height={24}
                  />
                </div>
                <span className="text-md font-semibold">Anki Clinic</span>
              </button>
              {activeSection === 'anki' && (
                <div className="animate-fadeIn space-y-6">
                  <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                    Flashcards
                  </h3>

                  {/* Anki Clinic Video */}
                  <div 
                    className="rounded-xl overflow-hidden bg-[--theme-doctorsoffice-accent] cursor-pointer hover:opacity-90 transition-all duration-200"
                    onClick={() => setActiveVideo("https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/AnkiClinicAdvertisement.mp4")}
                  >
                    <video 
                      className="w-full"
                      preload="metadata"
                    >
                      <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/AnkiClinicAdvertisement.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="p-4">
                      <h4 className="text-lg font-medium mb-1">Anki Clinic</h4>
                      <div className="relative">
                        <p className={clsx(
                          "text-sm opacity-70 transition-all duration-300",
                          !testingSuiteExpanded && "line-clamp-2"
                        )}>
                          The Anki Clinic is an adaptive question bank in the form of a flashcard game that allows you to treat patients to solve cards. Every question you see is picked for you based upon your results in AAMC, UWorld, and the ATS.
                        </p>
                        <button 
                          className="text-xs mt-2 text-blue-500 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTestingSuiteExpanded(!testingSuiteExpanded);
                          }}
                        >
                          {!testingSuiteExpanded ? 'Read more' : 'Show less'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Filtering MilesDown Video */}
                  <div 
                    className="rounded-xl overflow-hidden bg-[--theme-doctorsoffice-accent] cursor-pointer hover:opacity-90 transition-all duration-200"
                    onClick={() => setActiveVideo("https://my-mcat.s3.us-east-2.amazonaws.com/Anki.mp4")}
                  >
                    <video 
                      className="w-full"
                      preload="metadata"
                    >
                      <source src="https://my-mcat.s3.us-east-2.amazonaws.com/Anki.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <div className="p-4">
                      <h4 className="text-lg font-medium mb-1">Filtering MilesDown By Concepts</h4>
                      <div className="relative">
                        <p className={clsx(
                          "text-sm opacity-70 transition-all duration-300",
                          !statsExpanded && "line-clamp-2"
                        )}>
                          For those of you using Anki, we recommend filtering it by the subject you studied that day using this method. Simply, create a custom study, sort by tags, as many new cards as you can, and then study.
                        </p>
                        <button 
                          className="text-xs mt-2 text-blue-500 hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStatsExpanded(!statsExpanded);
                          }}
                        >
                          {!statsExpanded ? 'Read more' : 'Show less'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs text-center opacity-60 uppercase tracking-wide">
                      Anki Decks
                    </h3>
                    <a 
                      href="https://drive.google.com/file/d/1v4gIfTwr9xCyjqVxj7xmYquDpmsY3y8t/view?usp=drive_link"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 bg-[--theme-doctorsoffice-accent] rounded-lg hover:opacity-80 transition-opacity w-full"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">MilesDown Anki Deck</span>
                        <span className="text-xs opacity-70">Popular comprehensive Anki deck</span>
                      </div>
                    </a>

                    <a 
                      href="https://drive.google.com/file/d/1lYHJG0t8NZqvaQQk8s1l5rold-0h6amR/view?usp=drive_link"
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-3 bg-[--theme-doctorsoffice-accent] rounded-lg hover:opacity-80 transition-opacity w-full"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Aiden Anki Deck</span>
                        <span className="text-xs opacity-70">Extensive 6M card collection</span>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      taking: (
        <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[50vh]">
          <h3 className="text-xs mb-6 text-center opacity-60 uppercase tracking-wide">
            Test Taking
          </h3>
          <div className="flex flex-col items-center justify-center p-8 bg-[--theme-doctorsoffice-accent] rounded-lg w-full max-w-md">
            <svg
              className="w-16 h-16 text-yellow-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-lg font-semibold mb-2">Under Construction</h2>
            <p className="text-sm opacity-70 text-center">
              This section is currently being built. Check back soon!
            </p>
          </div>
        </div>
      ),
      reviewing: (
        <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[50vh]">
          <h3 className="text-xs mb-6 text-center opacity-60 uppercase tracking-wide">
            Test Review
          </h3>
          <div className="flex flex-col items-center justify-center p-8 bg-[--theme-doctorsoffice-accent] rounded-lg w-full max-w-md">
            <svg
              className="w-16 h-16 text-yellow-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-lg font-semibold mb-2">Under Construction</h2>
            <p className="text-sm opacity-70 text-center">
              This section is currently being built. Check back soon!
            </p>
          </div>
        </div>
      ),
      strategies: (
        <div className="animate-fadeIn space-y-6">
          <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
            Strategies
          </h3>

          {/* Premium Content Section */}
          <div className="relative overflow-hidden rounded-xl bg-[--theme-leaguecard-color] p-4 shadow-lg mt-2 w-[14rem] mx-auto min-h-[24rem]">
            <div className="absolute top-0 right-0 w-28 h-28 opacity-10">
              <Image
                src="/MDPremium.png"
                alt="MD Premium"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <Image
                    src="/MDPremium.png"
                    alt="MD Premium"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                  <h3 className="text-lg font-bold text-[--theme-text-color]">MD Premium Exclusive</h3>
                </div>
                <p className="text-[--theme-text-color] opacity-80 mb-6">
                  Get your target score. Once-a-week masterclasses on MCAT strategies. Access to a private discord community. Now, you can apply content rather than just learn it.
                </p>
              </div>
              <SubscriptionButton variant="traditional" />
            </div>
          </div>
        </div>
      ),
      testing: (
        <div className="animate-fadeIn space-y-6">
          <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
            Testing Suite
          </h3>

          <div className="space-y-6">
            <div 
              className="rounded-xl overflow-hidden bg-[--theme-doctorsoffice-accent] cursor-pointer hover:opacity-90 transition-all duration-200"
              onClick={() => setActiveVideo("https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/testingsuite.mp4")}
            >
              <video 
                className="w-full"
                preload="metadata"
              >
                <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/testingsuite.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h4 className="text-lg font-medium mb-1">How To Use The Testing Suite</h4>
                <div className="relative">
                  <p className={clsx(
                    "text-sm opacity-70 transition-all duration-300",
                    !testingSuiteExpanded && "line-clamp-2"
                  )}>
                    {'MyMCAT.ai allows you to intelligently review your exams and find where you can improve. Simply add your exam, whether it&apos;s AAMC or third party, and then it&apos;s scheduled. Then, you can complete exam and then add questions you got wrong for each section. When you&apos;re done with that, your weaknesses are automatically considered in the ATS, and you can generate a new day-by-day schedule until your next exam.'}
                  </p>
                  <button 
                    className="text-xs mt-2 text-blue-500 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTestingSuiteExpanded(!testingSuiteExpanded);
                    }}
                  >
                    {!testingSuiteExpanded ? 'Read more' : 'Show less'}
                  </button>
                </div>
              </div>
            </div>

            <div 
              className="rounded-xl overflow-hidden bg-[--theme-doctorsoffice-accent] cursor-pointer hover:opacity-90 transition-all duration-200"
              onClick={() => setActiveVideo("https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/Finding+Stats.mp4")}
            >
              <video 
                className="w-full"
                preload="metadata"
              >
                <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/Finding+Stats.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-4">
                <h4 className="text-lg font-medium mb-1">Finding Your Stats</h4>
                <div className="relative">
                  <p className={clsx(
                    "text-sm opacity-70 transition-all duration-300",
                    !statsExpanded && "line-clamp-2"
                  )}>
                    {'We calculate the average of all of your FLs, let you know if youre within range of a target score, and also predict your FL score in stats. Here&apos;s how to navigate to it.'}
                  </p>
                  <button 
                    className="text-xs mt-2 text-blue-500 hover:text-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatsExpanded(!statsExpanded);
                    }}
                  >
                    {!statsExpanded ? 'Read more' : 'Show less'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Dialog */}
          <Dialog open={!!activeVideo} onOpenChange={() => setActiveVideo(null)}>
            <DialogContent className="sm:max-w-[80vw] max-h-[90vh] p-0 bg-black overflow-hidden">
              {activeVideo && (
                <video 
                  controls
                  autoPlay
                  className="w-full h-full"
                  src={activeVideo}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </DialogContent>
          </Dialog>
        </div>
      ),
      cars: (
        <div className="animate-fadeIn space-y-6">

          {/* Key Metrics Section */}
          <section className="">
            <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide">
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
                <span className="text-xs mt-1">time</span>
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
            <div className="mt-4 space-y-2.5 text-sm">
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
            <ul className="text-sm space-y-2 list-disc pl-4">
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
            <ul className="text-sm space-y-2 list-disc pl-4">
              <li>Videos are collected from YouTube to help with CARs.</li>
              <li>Insights from r/MCAT sends a feed of Reddit content to you for you to search and review.</li>
            </ul>
          </section>
        </div>
      ),
      ats: (
        <div className="animate-fadeIn space-y-6">
          <h3 className="text-xs text-center opacity-60 uppercase tracking-wide">
            Adaptive Learning
          </h3>
          <p className="text-sm text-[--theme-text-color] leading-relaxed">
            The ATS is designed so you can learn content in one place. Everytime you refresh, it pulls your weakest subjects from your knowledge profile. Please click the buttons below for more information.
          </p>

          <section className="space-y-4">
            <section className="py-4 border-t border-[--theme-doctorsoffice-accent]">
              <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                Learning Content
              </h3>
              <div className="flex items-center justify-center gap-2 bg-[--theme-leaguecard-color] p-3 rounded-lg shadow-md">
                {/* Video Icon */}
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeATSSubsection === 'video' ? 'scale-110' : 'hover:scale-105'}`}
                  onClick={() => toggleATSSubsection('video')}
                >
                  <div className="w-4 h-4 relative theme-box">
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
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeATSSubsection === 'reading' ? 'scale-110' : 'hover:scale-105'}`}
                  onClick={() => toggleATSSubsection('reading')}
                >
                  <div className="w-4 h-4 relative theme-box">
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
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 px-3 py-1 rounded-md bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl border border-[--theme-border-color] hover:bg-[--theme-hover-color] ${activeATSSubsection === 'sample' ? 'scale-110' : 'hover:scale-105'}`}
                  onClick={() => toggleATSSubsection('sample')}
                >
                  <span className="text-[--theme-text-color] font-semibold">Topic</span>
                </div>

                {/* Quiz Icon */}
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeATSSubsection === 'quiz' ? 'scale-110' : 'hover:scale-105'}`}
                  onClick={() => toggleATSSubsection('quiz')}
                >
                  <div className="w-4 h-4 relative theme-box">
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
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1.5 rounded-md hover:bg-[--theme-hover-color] bg-[--theme-leaguecard-color] shadow-lg hover:shadow-xl ${activeATSSubsection === 'kalypso' ? 'scale-110' : 'hover:scale-105'}`}
                  onClick={() => toggleATSSubsection('kalypso')}
                >
                  <div className="w-4 h-4 relative theme-box">
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
              {activeATSSubsection ? (
                <div className="p-4 bg-transparent rounded-lg text-sm space-y-2 animate-fadeIn">
                  {activeATSSubsection === 'video' && (
                    <div className="text-sm leading-relaxed">
                      Watch MCAT video lectures curated from YouTube with detailed summaries. Use Kalypso to get instant clarification on any concept while watching. 
                      <strong> You don&apos;t have to do BOTH readings and videos. One will suffice.</strong>
                    </div>
                  )}
                  {activeATSSubsection === 'reading' && (
                    <div className="text-sm leading-relaxed">
                      Access detailed PDFs from LibreText or OpenStax that cover concepts comprehensively. 
                      You can full screen. Kalypso can clarify anything you don&apos;t understand.
                      <strong> You don&apos;t have to do BOTH readings and videos. One will suffice.</strong>
                    </div>
                  )}
                  {activeATSSubsection === 'sample' && (
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
                  {activeATSSubsection === 'quiz' && (
                    <div className="text-sm leading-relaxed">
                      You can do practice questions and it&apos;s full screen. You can pay a coin to take a quiz. 
                      If you get a 100, you can get your coin back. Your performance feeds your knowledge profile 
                      and affects the ITS&apos; understanding of your weaknesses. <strong>You can report unfair questions with the downvote and win two coins as compensation.</strong>
                    </div>
                  )}
                  {activeATSSubsection === 'kalypso' && (
                    <div className="text-sm leading-relaxed">
                      Ask Kalypso questions directly or use the button. <strong>Press cmd to toggle voice input (browser support varies).</strong>
                    </div>
                  )}
                </div>
              ) : null}
            </section>

            <section className="py-6 border-t border-[--theme-doctorsoffice-accent] mb-6">
              <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                Topic Selection
              </h3>
              <div className="flex items-center justify-center gap-2">
                {/* Settings Card */}
                <div 
                  className="relative z-10 rounded-lg text-center group min-h-[4rem] w-[4rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                  onClick={() => toggleATSSubsection('settings')}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="settings-container flex flex-col items-center">
                      <svg
                        className="settings-icon w-6 h-6 text-[--theme-text-color]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.25,22l-.4-3.2c-.216-.084-.42-.184-.612-.3c-.192-.117-.38-.242-.563-.375L4.7,19.375L1.95,14.625L4.525,12.675c-.016-.117-.024-.23-.024-.338V11.662c0-.108.008-.221.025-.337L1.95,9.375L4.7,4.625L7.675,5.875c.183-.134.375-.259.575-.375c.2-.117.4-.217.6-.3l.4-3.2H14.75l.4,3.2c.216.084.42.184.612.3c.192.117.38.242.563.375l2.975-.75l2.75,4.75l-2.575,1.95c.016.117.024.23.024.338v.675c0,.108-.008.221-.025.337l2.575,1.95l-2.75,4.75l-2.95-.75c-.183.133-.375.258-.575.375c-.2.117-.4.217-.6.3l-.4,3.2H9.25zM12.05,15.5c.966,0,1.791-.342,2.475-1.025c.683-.683,1.025-1.508,1.025-2.475c0-.966-.342-1.791-1.025-2.475c-.683-.683-1.508-1.025-2.475-1.025c-0.984,0-1.813,.342-2.488,1.025c-0.675,.683-1.012,1.508-1.012,2.475c0,.966,.337,1.791,1.012,2.475c.675,.683,1.504,1.025,2.488,1.025z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Amino Acids Icon */}
                <div 
                  className="relative z-10 rounded-lg text-center group min-h-[4rem] w-[4rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                  onClick={() => toggleATSSubsection('amino')}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="m-auto transform scale-90">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="#3B82F6"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                        <path d="M2 17L12 22L22 17" />
                        <path d="M2 12L12 17L22 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Fluids Icon */}
                <div 
                  className="relative z-10 rounded-lg text-center group min-h-[4rem] w-[4rem] cursor-pointer transition-all hover:bg-[--theme-hover-color] shadow-md hover:shadow-lg"
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
                  onClick={() => toggleATSSubsection('fluids')}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="m-auto transform scale-90">
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="#800020"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2L5 12L12 22L19 12L12 2Z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanations */}
              {(activeATSSubsection === 'amino' || activeATSSubsection === 'fluids') ? (
                <div className="p-4 rounded-lg text-sm space-y-2 mt-2 animate-fadeIn">
                  <div className="text-sm leading-relaxed">
                    At a time, you can have five topics active to choose from when studying. There are around a 100 topics. They are either curated for you using our algorithm or you can choose them. Switch between them by clicking a button.
                  </div>
                </div>
              ) : activeATSSubsection === 'settings' ? (
                <div className="p-4 rounded-lg text-sm space-y-2 mt-2 animate-fadeIn">
                  <div className="text-sm leading-relaxed">
                    The settings shows the current categories you have active. You can come here to shuffle them, change them, focus on a category, or have our algorithm find new weaknesses for you.
                  </div>
                </div>
              ) : null}
            </section>

            {/* Add new Podcast Section */}
            <section className="py-4 border-t border-[--theme-doctorsoffice-accent]">
              <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                MyMCAT Podcast
              </h3>
              <div className="w-full flex items-center justify-center">
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
              <p className="text-sm mb-8 leading-relaxed mt-4 text-center">
                Under the thumbnails besides a category, you can access a podcast for a category by clicking this icon:
              </p>
              <div className="flex items-center justify-center mt-2">
                <button
                  className="w-14 h-14 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-300 bg-[--theme-leaguecard-color] hover:bg-[--theme-hover-color] border border-[--theme-border-color]"
                >
                  <Podcast className="w-8 h-8 transition-colors duration-300 text-[--theme-text-color] hover:text-[--theme-hover-text]" />
                </button>
              </div>
            </section>
          </section>
        </div>
      ),
      anki: (
        <div className="animate-fadeIn space-y-6">
          <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
            Flashcards
          </h3>

          {/* Anki Clinic Video */}
          <div 
            className="rounded-xl overflow-hidden bg-[--theme-doctorsoffice-accent] cursor-pointer hover:opacity-90 transition-all duration-200"
            onClick={() => setActiveVideo("https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/AnkiClinicAdvertisement.mp4")}
          >
            <video 
              className="w-full"
              preload="metadata"
            >
              <source src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/AnkiClinicAdvertisement.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="p-4">
              <h4 className="text-lg font-medium mb-1">Anki Clinic</h4>
              <div className="relative">
                <p className={clsx(
                  "text-sm opacity-70 transition-all duration-300",
                  !testingSuiteExpanded && "line-clamp-2"
                )}>
                  The Anki Clinic is an adaptive question bank in the form of a flashcard game that allows you to treat patients to solve cards. Every question you see is picked for you based upon your results in AAMC, UWorld, and the ATS.
                </p>
                <button 
                  className="text-xs mt-2 text-blue-500 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTestingSuiteExpanded(!testingSuiteExpanded);
                  }}
                >
                  {!testingSuiteExpanded ? 'Read more' : 'Show less'}
                </button>
              </div>
            </div>
          </div>

          {/* Filtering MilesDown Video */}
          <div 
            className="rounded-xl overflow-hidden bg-[--theme-doctorsoffice-accent] cursor-pointer hover:opacity-90 transition-all duration-200"
            onClick={() => setActiveVideo("https://my-mcat.s3.us-east-2.amazonaws.com/Anki.mp4")}
          >
            <video 
              className="w-full"
              preload="metadata"
            >
              <source src="https://my-mcat.s3.us-east-2.amazonaws.com/Anki.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="p-4">
              <h4 className="text-lg font-medium mb-1">Filtering MilesDown By Concepts</h4>
              <div className="relative">
                <p className={clsx(
                  "text-sm opacity-70 transition-all duration-300",
                  !statsExpanded && "line-clamp-2"
                )}>
                  For those of you using Anki, we recommend filtering it by the subject you studied that day using this method. Simply, create a custom study, sort by tags, as many new cards as you can, and then study.
                </p>
                <button 
                  className="text-xs mt-2 text-blue-500 hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatsExpanded(!statsExpanded);
                  }}
                >
                  {!statsExpanded ? 'Read more' : 'Show less'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs text-center opacity-60 uppercase tracking-wide">
              Anki Decks
            </h3>
            <a 
              href="https://drive.google.com/file/d/1v4gIfTwr9xCyjqVxj7xmYquDpmsY3y8t/view?usp=drive_link"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-[--theme-doctorsoffice-accent] rounded-lg hover:opacity-80 transition-opacity w-full"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">MilesDown Anki Deck</span>
                <span className="text-xs opacity-70">Popular concise Anki deck</span>
              </div>
            </a>

            <a 
              href="https://drive.google.com/file/d/1lYHJG0t8NZqvaQQk8s1l5rold-0h6amR/view?usp=drive_link"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-[--theme-doctorsoffice-accent] rounded-lg hover:opacity-80 transition-opacity w-full"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium">Aiden Anki Deck</span>
                <span className="text-xs opacity-70">Extensive card collection</span>
              </div>
            </a>
          </div>
        </div>
      )
    }[activeSection];

    return content;
  };

  return (
    <ScrollArea className="h-[calc(100vh-12.3rem)]">
      <div className="p-6 relative">
        {activeSection && (
          <button
            onClick={() => handleBack()}
            className="absolute top-4 left-4 p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200 z-50"
          >
            <ArrowLeft className="h-5 w-5 text-[--theme-text-color]" />
          </button>
        )}

        {!activeSection ? (
          <div className="space-y-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                  Introduction
                </h3>
                <button
                  onClick={() => handleSectionChange('mcat')}
                  className="w-full p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">What&apos;s on the MCAT?</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
                <button
                  onClick={() => handleSectionChange('mymcat')}
                  className="w-full p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">How do I use MyMCAT?</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                  Test Information
                </h3>
                <button
                  onClick={() => handleSectionChange('taking')}
                  className="w-full p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">How do I take a test?</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
                <button
                  onClick={() => handleSectionChange('reviewing')}
                  className="w-full p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">How do I review a test?</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs mb-2 text-center opacity-60 uppercase tracking-wide">
                  Strategies
                </h3>
                <button
                  onClick={() => handleSectionChange('strategies')}
                  className="w-full max-w-xl mx-auto p-6 rounded-xl text-left transition-all duration-200 bg-[--theme-leaguecard-color] hover:opacity-90 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                    <Image
                      src="/MDPremium.png"
                      alt="MD Premium"
                      width={128}
                      height={128}
                      className="object-contain"
                    />
                  </div>
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src="/MDPremium.png"
                        alt="MD Premium"
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                      <span className="text-sm font-medium text-[--theme-text-color]">MD Premium Only</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[--theme-text-color] transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          renderContent()
        )}

        {/* Need Help section - Only show in initial view */}
        {!activeSection && (
          <div className="mt-8 text-center">
            <h3 className="text-xs mb-4 text-center opacity-60 uppercase tracking-wide">
              Need help?
            </h3>
            <div className="flex flex-col gap-4">  {/* Changed gap-2 to gap-4 */}
              {/* Reset Tutorials and Email Settings */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={onResetTutorials}
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

              {/* Discord Link */}
              <a
                href="https://discord.gg/DcHWnEu8Xb"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors"
              >
                <FaDiscord className="w-5 h-5" />
                <span>Join Discord</span>
              </a>
              
              <MessageButton 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[--theme-leaguecard-color] text-[--theme-text-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text] transition-colors"
              />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ResourcePack;