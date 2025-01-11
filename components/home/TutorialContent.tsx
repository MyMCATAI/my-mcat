import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

type Section = 'mcat' | 'mymcat' | 'taking' | 'reviewing' | 'strategies' | null;

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
        <div className="animate-fadeIn p-6 space-y-6">
          <h2 className="text-xl font-bold">Introduction to the MCAT</h2>
          <p>{"Comprehensive overview of the MCAT exam structure, scoring, and preparation strategies."}</p>
          {/* Add more content here */}
        </div>
      ),
      mymcat: (
        <div className="animate-fadeIn p-6 space-y-6">
          <h2 className="text-xl font-bold">Getting Started with MyMCAT</h2>
          <p>{"Learn how to make the most of MyMCAT&apos;s features and tools for your MCAT preparation."}</p>
          {/* Add more content here */}
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
                    <span className="text-sm font-medium">Intro to the MCAT</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('mymcat')}
                  className="w-full p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Intro to MyMCAT</span>
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
                    <span className="text-sm font-medium">Taking a test</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
                <button
                  onClick={() => setActiveSection('reviewing')}
                  className="w-full p-4 rounded-lg text-left transition-all duration-200 bg-[--theme-doctorsoffice-accent] hover:bg-[--theme-hover-color] shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reviewing a test</span>
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