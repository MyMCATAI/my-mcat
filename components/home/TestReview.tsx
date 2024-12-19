import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, GraduationCap } from 'lucide-react';
import SectionReview from './SectionReview';
import { Button } from "@/components/ui/button";

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
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<{name: string, score: number} | null>(null);

  const handleSectionComplete = (sectionName: string) => {
    setCompletedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  if (activeSection) {
    return (
      <SectionReview 
        section={activeSection} 
        onBack={() => setActiveSection(null)}
        isCompleted={completedSections.includes(activeSection.name)}
        onComplete={() => handleSectionComplete(activeSection.name)}
      />
    );
  }

  return (
    <div className="animate-fadeIn h-full p-6">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-[12rem] h-[12rem] bg-[--theme-leaguecard-color] rounded-2xl shadow-xl overflow-hidden relative">
          <button
            onClick={onBack}
            className="absolute top-3 left-3 p-2 hover:bg-[--theme-hover-color] rounded-full transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 text-[--theme-text-color]" />
          </button>
          <div className="h-full flex flex-col items-center justify-center space-y-2">
            <span className="text-sm uppercase tracking-wide opacity-60">{test.company} {test.testNumber}</span>
            <span className={`text-6xl font-bold transition-all duration-300 hover:scale-110
              ${test.score < 500 ? 'text-red-500' : ''}
              ${test.score >= 500 && test.score < 510 ? 'text-yellow-500' : ''}
              ${test.score >= 510 && test.score < 515 ? 'text-green-500' : ''}
              ${test.score >= 515 && test.score < 520 ? 'text-sky-500' : ''}
              ${test.score >= 520 && test.score < 525 ? 'text-sky-400 animate-pulse-subtle' : ''}
              ${test.score >= 525 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text animate-pulse-subtle' : ''}
            `}>
              {test.score}
            </span>
            <span className="text-xs opacity-50">{test.dateTaken}</span>
          </div>
        </div>

        <div className="flex-grow bg-[--theme-leaguecard-color] shadow-xl rounded-2xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
            {[
              { value: chem, label: "Chem Phys" },
              { value: cars, label: "CARS" },
              { value: bio, label: "Bio Biochem" },
              { value: psych, label: "Psych Soc" }
            ].map((section, index) => (
              <div 
                key={index} 
                className="min-h-[6.25rem] flex flex-col items-center justify-center p-4 rounded-xl hover:bg-[--theme-leaguecard-accent] transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => setActiveSection({ name: section.label, score: section.value })}
              >
                {completedSections.includes(section.label) ? (
                  <CheckCircle2 className="h-6 w-6 mb-2 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 mb-2 text-gray-400" />
                )}
                <span className="text-2xl md:text-3xl font-medium mb-1">{section.value}</span>
                <span className="text-xs opacity-75 mb-3 text-center">{section.label}</span>
                <span className="px-4 py-1.5 text-xs rounded-full bg-black/10 group-hover:bg-black/20 transition-colors duration-200">
                  Review
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-[--theme-leaguecard-color] p-4 rounded-2xl shadow-xl min-h-[10rem]">
          <h3 className="text-xs uppercase tracking-wide opacity-60 mb-3">Kalypso's Analysis</h3>
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

        <div className="lg:col-span-2 bg-[--theme-leaguecard-color] p-4 rounded-2xl shadow-xl min-h-[10rem]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wide opacity-60">Weaknesses</h3>
            <div className="relative group">
              <Button 
                variant="secondary"
                size="icon"
                className="opacity-80 hover:opacity-100 transition-all duration-200 h-8 w-8"
              >
                <GraduationCap className="h-4 w-4 text-[--theme-text-color] hover:text-[--theme-hover-color]" />
              </Button>
              <span className="absolute -bottom-8 right-0 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Review weaknesses
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { topic: "Thermodynamics", urgency: "high", icon: "🔥" },
              { topic: "Electrochemistry", urgency: "high", icon: "⚡" },
              { topic: "Kinematics", urgency: "medium", icon: "🎯" }
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center p-3 rounded-xl bg-[--theme-leaguecard-accent] hover:translate-x-2 transition-all duration-200 cursor-pointer"
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="text-sm flex-grow">{item.topic}</span>
                <span className={`text-xs px-3 py-1.5 rounded-full ${
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

        <div className="lg:col-span-5 bg-[--theme-leaguecard-color] p-4 rounded-2xl shadow-xl min-h-[5rem]">
          <h3 className="text-sm uppercase tracking-wide opacity-60 mb-4">Updates</h3>
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