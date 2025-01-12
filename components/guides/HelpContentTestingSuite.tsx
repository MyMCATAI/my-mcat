import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import clsx from 'clsx';

type Section = 'mcat' | 'mymcat' | 'taking' | 'reviewing' | 'strategies' | 'testing' | 'cars' | 'ats' | 'anki' | null;

const ResourcePack: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(null);

  const renderContent = () => {
    if (!activeSection) return null;

    if (activeSection === 'strategies') {
      return (
        <div className="animate-fadeIn p-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-8 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <Image
                src="/MDPremium.png"
                alt="MD Premium"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src="/MDPremium.png"
                  alt="MD Premium"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <h3 className="text-xl font-bold text-white">MD Premium Exclusive</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Access our premium MCAT strategies and resources, curated by top scorers and medical students.
              </p>
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      );
    }

    const content = {
      mcat: (
        <div className="animate-fadeIn space-y-6 mt-6">
          <h2 className="text-xl font-bold mb-6">What&apos;s on the MCAT?</h2>
          
          <div className="space-y-6">
            <section>
              <p className="text-sm opacity-80 mb-4">
                The MCAT has <strong>four major sections</strong> that test different areas of knowledge: <strong>chemistry/physics</strong>, <strong>biology/biochem</strong>, <strong>reading</strong>, and <strong>psychology/sociology</strong>. Each of these require a mix of a content basis and reading comprehension skills. The test is a &ldquo;mile wide and an inch deep&rdquo; which means that a common mistake is overrelying on content. <strong>Mix content and practice with testing.</strong>
              </p>
              
              <h3 className="text-md mb-4 text-center opacity-60 uppercase tracking-wide font-semibold">
                Test Structure
              </h3>
              <p className="text-sm opacity-80 mb-6">
                Each section has about <strong>59 questions</strong> (except Critical Analysis with 53), and you get a nice mix of standalone questions and passages to analyze. The test is computer-based, and you&apos;ll have access to a periodic table for the chemistry sections. Common philosophy is to study for 3-6 months with a content phase and a practice phase with AAMC materials focused at the end. <strong>We believe in interspersing it</strong>, and this philosophy averaged <strong>15 point increases</strong> in our beta testers.
              </p>

              <h3 className="text-md mb-4 text-center opacity-60 uppercase tracking-wide font-semibold">
                Resources
              </h3>
              <div className="space-y-3">
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
                    <span className="text-xs opacity-70">Join the discussion with fellow test-takers</span>
                  </div>
                </a>

                <a 
                  href={'https://my-mcat.s3.us-east-2.amazonaws.com/pdfs/What\'s+On+The+MCAT.pdf'}
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
                    <span className="text-xs opacity-70">Comprehensive breakdown of test content</span>
                  </div>
                </a>
              </div>
            </section>
          </div>
        </div>
      ),
      mymcat: (
        <div className="animate-fadeIn space-y-6 mt-6">
          <h2 className="text-xl font-bold mb-6">Getting Started with MyMCAT</h2>
          
          <p className="text-sm opacity-80 mb-6">
            MyMCAT is a resource that can either be your <strong>only resource or within your rotation</strong> of resources. The biggest thing about our platform is that <strong>it knows you</strong>. When you enter your tests, it curates videos and readings and flashcards for your weaknesses.
          </p>

          <div className="space-y-8">
            {/* Testing Suite Section */}
            <div className="relative">
              <button 
                className="group relative w-full flex items-center gap-4"
                onClick={() => setActiveSection(activeSection === 'testing' ? null : 'testing')}
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
                onClick={() => setActiveSection(activeSection === 'cars' ? null : 'cars')}
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
                onClick={() => setActiveSection(activeSection === 'ats' ? null : 'ats')}
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
                <div className="animate-fadeIn mt-4 space-y-4">
                  <p className="text-sm opacity-80">
                    The ATS is your content learning hub...
                  </p>
                </div>
              )}
            </div>

            {/* Anki Clinic Section */}
            <div className="relative">
              <button 
                className="group relative w-full flex items-center gap-4"
                onClick={() => setActiveSection(activeSection === 'anki' ? null : 'anki')}
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
                <div className="animate-fadeIn mt-4 space-y-4">
                  <p className="text-sm opacity-80">
                    Review content on either Anki or Anki Clinic...
                  </p>
                  <div className="space-y-3 mt-4">
                    <a 
                      href="https://www.reddit.com/r/Mcat/comments/p1tlkf/milesdown_anki_deck_subdivided_by_kaplan_chapter/"
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
                      href="https://www.reddit.com/r/AnkiMCAT/comments/p7h0g3/aidan_6_million_card_anki_deck/"
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
        <div className="animate-fadeIn p-6 space-y-6">
          <h2 className="text-xl font-bold">Taking a Test</h2>
          <p>{"Best practices and strategies for taking MCAT practice tests and managing your time effectively."}</p>
          {/* Add more content here */}
        </div>
      ),
      reviewing: (
        <div className="animate-fadeIn p-6 space-y-6">
          <h2 className="text-xl font-bold">Reviewing Your Test</h2>
          <p>{"How to effectively review your practice tests and learn from your mistakes."}</p>
          {/* Add more content here */}
        </div>
      ),
      strategies: (
        <div className="animate-fadeIn p-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-8 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <Image
                src="/MDPremium.png"
                alt="MD Premium"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src="/MDPremium.png"
                  alt="MD Premium"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <h3 className="text-xl font-bold text-white">MD Premium Exclusive</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Access our premium MCAT strategies and resources, curated by top scorers and medical students.
              </p>
              <button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      ),
      testing: (
        <div className="animate-fadeIn mt-8 space-y-6">
          <p className="text-sm opacity-80">
            {'Upload practice test results from AAMC or third parties to identify your weak areas. The platform will then generate summaries of your strengths and weaknesses, and then assign content for you on an adaptive schedule.'}
          </p>
        </div>
      ),
      cars: (
        <div className="animate-fadeIn mt-8 space-y-6">
          <p className="text-sm opacity-80">
            {'MyMCAT uses an internal content generator trained on AAMC passages and designed by top CARs scorers. Our passages are generally more difficult than AAMC.'}
          </p>
        </div>
      ),
      ats: (
        <div className="animate-fadeIn mt-8 space-y-6">
          <p className="text-sm opacity-80">
            {'The ATS is your content learning hub. It has 100 topics assigned based on your weaknesses and thousands of practice quiz questions. It has videos and readings in one central hub. You can take quizzes on these again and again, with different questions each time.'}
          </p>
        </div>
      ),
      anki: (
        <div className="animate-fadeIn mt-8 space-y-6">
          <p className="text-sm opacity-80">
            {'Review content on either Anki or Anki Clinic after the ATS. Unlike Anki, we include multiple choice questions and flashcards to help with areas like chemistry and physics. We recommend using ours over Anki, but you can use both. The MCAT requires active learning.'}
          </p>
          <div className="space-y-3 mt-4">
            <a 
              href="https://www.reddit.com/r/Mcat/comments/p1tlkf/milesdown_anki_deck_subdivided_by_kaplan_chapter/"
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
              href="https://www.reddit.com/r/AnkiMCAT/comments/p7h0g3/aidan_6_million_card_anki_deck/"
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
      )
    }[activeSection];

    return content;
  };

  return (
    <ScrollArea className="h-[calc(100vh-12.3rem)]">
      <div className="p-6 relative">
        {activeSection && (
          <button
            onClick={() => setActiveSection(null)}
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
                  onClick={() => setActiveSection('mcat')}
                  className="w-full p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">What&apos;s on the MCAT?</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('mymcat')}
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
                  onClick={() => setActiveSection('taking')}
                  className="w-full p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">How do I take a test?</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('reviewing')}
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
                  onClick={() => setActiveSection('strategies')}
                  className="w-full p-6 rounded-xl text-left transition-all duration-200 bg-[--theme-leaguecard-color] hover:opacity-90 group relative overflow-hidden"
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
      </div>
    </ScrollArea>
  );
};

export default ResourcePack;