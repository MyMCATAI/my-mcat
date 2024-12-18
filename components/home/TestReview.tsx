import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import SectionReview from './SectionReview';

interface TestReviewProps {
  test: {
    company: string;
    testNumber: string;
    score: number;
    breakdown: string;
    dateTaken: string;
  };
  onBack: () => void;
}

const TestReview: React.FC<TestReviewProps> = ({ test, onBack }) => {
  const [chem, cars, bio, psych] = test.breakdown.split('/').map(Number);
  const [activeSection, setActiveSection] = useState<{name: string, score: number} | null>(null);

  if (activeSection) {
    return <SectionReview section={activeSection} onBack={() => setActiveSection(null)} />;
  }

  return (
    <div className="animate-fadeIn h-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-[--theme-text-color]" />
        </button>
        <h2 className="text-[--theme-text-color] text-base">
          {test.company} {test.testNumber}
        </h2>
        <div className="w-[2.5rem]" /> {/* Spacer to center the title */}
      </div>

      <div className="h-px bg-[--theme-border-color] mb-6" />

      <div className="flex mb-6">
        <div className="w-[8rem] h-[10rem] bg-[--theme-leaguecard-color] rounded-lg mr-4 flex-shrink-0 shadow-lg overflow-hidden relative">
          <div className="h-full flex items-center justify-center">
            <span className={`text-4xl font-bold
              ${test.score < 500 ? 'text-red-500' : ''}
              ${test.score >= 500 && test.score < 510 ? 'text-yellow-500' : ''}
              ${test.score >= 510 && test.score < 515 ? 'text-green-500' : ''}
              ${test.score >= 515 && test.score < 520 ? 'text-sky-500' : ''}
              ${test.score >= 520 && test.score < 525 ? 'text-sky-400 animate-pulse-subtle' : ''}
              ${test.score >= 525 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text animate-pulse-subtle' : ''}
            `}>
              {test.score}
            </span>
          </div>
        </div>

        <div className="flex-grow p-2 bg-[--theme-leaguecard-color] shadow-lg rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full p-2 sm:p-4">
            {[
              { value: chem, label: "Chem + Phys" },
              { value: cars, label: "CARS" },
              { value: bio, label: "Bio + Biochem" },
              { value: psych, label: "Psych/Soc" }
            ].map((section, index) => (
              <div key={index} className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-black/5 transition-all duration-200">
                <span className="text-xl md:text-2xl font-medium mb-1">{section.value}</span>
                <span className="text-xs opacity-75 mb-2">{section.label}</span>
                <button 
                  onClick={() => setActiveSection({ name: section.label, score: section.value })}
                  className="px-3 py-1.5 text-xs rounded-full bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] hover:text-white transition-colors duration-200"
                >
                  REVIEW SECTION
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        <div className="lg:col-span-3 bg-[--theme-leaguecard-color] p-4 md:p-6 rounded-lg shadow-lg min-h-[24rem]">
          <h3 className="text-sm uppercase tracking-wide opacity-60 mb-4">AI Analysis</h3>
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">
              Your performance shows strong understanding in CARS and Bio/Biochem sections. 
              However, there's room for improvement in the Chemistry/Physics section, 
              particularly in thermodynamics and electrochemistry concepts.
            </p>
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wide opacity-60">Key Areas for Improvement</h4>
              <ul className="text-sm list-disc list-inside space-y-1 opacity-80">
                <li>Review thermodynamics fundamentals</li>
                <li>Practice electrochemistry problems</li>
                <li>Focus on data interpretation in Physics</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[--theme-leaguecard-color] p-4 md:p-6 rounded-lg shadow-lg min-h-[24rem]">
          <h3 className="text-sm uppercase tracking-wide opacity-60 mb-4">Recommended Review</h3>
          <div className="space-y-3">
            {[
              { topic: "Thermodynamics", urgency: "high" },
              { topic: "Electrochemistry", urgency: "high" },
              { topic: "Kinematics", urgency: "medium" }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 rounded bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] hover:bg-opacity-20 transition-colors duration-200"
              >
                <span className="text-sm">{item.topic}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.urgency === 'high' ? 'bg-red-500/20 text-red-400' : 
                  item.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-green-500/20 text-green-400'
                }`}>
                  {item.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-[--theme-leaguecard-color] p-4 md:p-6 rounded-lg shadow-lg">
          <h3 className="text-sm uppercase tracking-wide opacity-60 mb-4">Calendar Updates</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1 p-3 rounded bg-[--theme-leaguecard-accent]">
              <p className="text-sm">
                Based on your performance, we've adjusted your study schedule. 
                Added 2 additional practice sessions for thermodynamics this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestReview;