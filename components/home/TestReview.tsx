import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle, GraduationCap, RefreshCw, HelpCircle } from 'lucide-react';
import SectionReview, { Section } from './SectionReview';
import { Button } from "@/components/ui/button";
import { DataPulse } from '@/hooks/useCalendarActivities';
import { FULL_TO_DISPLAY_SECTION, SECTION_MAPPINGS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface TestReviewProps {
  test: {
    id: string;
    examId: string;
    name: string;
    company: string;
    status: string;
    calendarDate?: Date;
    score?: number;
    breakdown?: string;
    dateTaken?: string;
    dataPulses?: Array<DataPulse>;
    aiResponse?: string;
  };
  onBack: () => void;
}

const TestReview: React.FC<TestReviewProps> = ({ test, onBack }) => {
  const router = useRouter();
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(test.aiResponse || null);
  const [retakeCompleted, setRetakeCompleted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`retake-${test.id}`) === 'true';
    }
    return false;
  });

  // Initialize completedSections and analysis from dataPulses
  useEffect(() => {
    if (test.dataPulses) {
      const reviewedSections = test.dataPulses
        .filter(pulse => pulse.reviewed && pulse.level === "section")
        .map(pulse => FULL_TO_DISPLAY_SECTION[pulse.name as keyof typeof FULL_TO_DISPLAY_SECTION] || pulse.name)
        .filter(name => name);
      setCompletedSections(reviewedSections);
    }
    if (test.aiResponse) {
      setAnalysis(test.aiResponse);
    }
  }, [test.dataPulses, test.aiResponse]);

  const generateAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    try {
      const response = await fetch('/api/test-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: test.examId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Safely handle potentially undefined breakdown
  const [chem, cars, bio, psych] = (test.breakdown?.split('/').map(Number) || [0, 0, 0, 0]);

  const handleSectionComplete = (sectionName: string) => {
    setCompletedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  // Process dataPulses to find weaknesses
  const getWeaknesses = (dataPulses: DataPulse[] | undefined) => {
    console.log('Getting weaknesses from dataPulses:', dataPulses);
    if (!dataPulses || dataPulses.length === 0) {
      console.log('No data pulses found');
      return [];
    }

    // Filter out section-level pulses and group by section and name
    const groupedPulses = dataPulses
      .filter(pulse => {
        console.log('Processing pulse:', pulse);
        return pulse.level !== "section";
      })
      .reduce((acc, pulse) => {
        // Get the standardized section name (C/P, CARS, etc.)
        const sectionKey = pulse.section || 
          (SECTION_MAPPINGS[pulse.name as keyof typeof SECTION_MAPPINGS] || 'Unknown');
        
        console.log('Section key:', sectionKey, 'for pulse:', pulse.name);

        if (!acc[sectionKey]) {
          acc[sectionKey] = {};
        }

        if (!acc[sectionKey][pulse.name]) {
          acc[sectionKey][pulse.name] = {
            total: 0,
            negative: 0,
            positive: 0,
            flagged: 0
          };
        }

        acc[sectionKey][pulse.name].total++;
        if (pulse.negative === 1) acc[sectionKey][pulse.name].negative++;
        if (pulse.positive === 1) acc[sectionKey][pulse.name].positive++;
        if (pulse.negative === 0 && pulse.positive === 0) acc[sectionKey][pulse.name].flagged++;

        return acc;
      }, {} as Record<string, Record<string, { total: number; negative: number; positive: number; flagged: number }>>);

    console.log('Grouped pulses:', groupedPulses);

    // Convert to array and calculate weakness scores
    const weaknesses = Object.entries(groupedPulses).flatMap(([section, topics]) =>
      Object.entries(topics).map(([topic, stats]) => ({
        section,
        topic,
        total: stats.total,
        negative: stats.negative,
        flagged: stats.flagged,
        weaknessScore: (stats.negative + stats.flagged * 0.5) / stats.total,
      }))
    );

    console.log('Calculated weaknesses:', weaknesses);

    // Sort by weakness score and take top 3
    const result = weaknesses
      .sort((a, b) => b.weaknessScore - a.weaknessScore)
      .slice(0, 5)
      .map(weakness => ({
        topic: weakness.topic,
        section: weakness.section,
        urgency: weakness.weaknessScore > 0.7 ? "high" : 
                weakness.weaknessScore > 0.4 ? "medium" : "low",
        icon: weakness.section === "C/P" ? "⚡" :
              weakness.section === "CARS" ? "📚" :
              weakness.section === "B/B" ? "🧬" : "🧠"
      }));

    console.log('Final result:', result);
    return result;
  };

  const formatAnalysis = (text: string) => {
    return text
      // Convert ** bold ** to HTML
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      // Convert bullet points
      .replace(/^- /gm, '• ')
      // Convert newlines to proper spacing
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  const handleNavigateToTutoring = async (specificContentCategory?: string) => {
    // If specific content category provided, only use that one
    const weakContentCategories = specificContentCategory 
      ? [specificContentCategory]
      : getWeaknesses(test.dataPulses).map(item => item.topic);
    
    if (weakContentCategories.length > 0) {
        try {
            // Query prisma to get all concept categories for these content categories
            const conceptCategories = await fetch('/api/categories/concepts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentCategories: weakContentCategories })
            }).then(res => res.json());

            if (!conceptCategories || !Array.isArray(conceptCategories)) {
                throw new Error('Invalid response from server');
            }

            // If specific content category, use all concepts, otherwise take 6 weakest
            const selectedConcepts = specificContentCategory
                ? conceptCategories.map(concept => encodeURIComponent(concept))
                : conceptCategories
                    .slice(0, 6)
                    .map(concept => encodeURIComponent(concept));

            if (selectedConcepts.length > 0) {
                const url = `/home?tab=AdaptiveTutoringSuite&conceptCategories=${selectedConcepts.join(',')}`;
                window.location.href = url;
            } else {
                toast.error('No concept categories found to review');
            }
        } catch (error) {
            console.error('Error fetching concept categories:', error);
            toast.error('Failed to load review content');
        }
    } else {
        toast.error('No weak categories found to review');
    }
  };

  const handleRetakeComplete = () => {
    setRetakeCompleted(true);
    localStorage.setItem(`retake-${test.id}`, 'true');
  };

  if (activeSection) {
    // Find the specific dataPulse for this section
    const sectionDataPulse = test.dataPulses?.find(pulse => 
      pulse.level === "section" && 
      FULL_TO_DISPLAY_SECTION[pulse.name as keyof typeof FULL_TO_DISPLAY_SECTION] === activeSection.name
    );

    return (
      <SectionReview 
        examId={test.examId}
        section={activeSection} 
        onBack={() => setActiveSection(null)}
        isCompleted={completedSections.includes(activeSection.name)}
        onComplete={() => handleSectionComplete(activeSection.name)}
        dataPulse={sectionDataPulse}
      />
    );
  }

  // Early return if score is not available
  if (!test.score) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg opacity-60">No score available for this test</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn h-full p-3 flex flex-col min-h-0">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-[12rem] h-[13rem] bg-[--theme-leaguecard-color] rounded-2xl shadow-xl overflow-hidden relative">
          <button
            onClick={onBack}
            className="absolute top-3 left-3 p-2 hover:bg-[--theme-hover-color] rounded-full transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 text-[--theme-text-color]" />
          </button>
          <div className="h-full flex flex-col items-center justify-center space-y-2">
            <span className="text-sm uppercase tracking-wide opacity-60 truncate max-w-[80%]">{test.name}</span>
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
            <span className="text-xs opacity-50 truncate max-w-[80%]">{test.dateTaken || formatDate(test.calendarDate)}</span>
          </div>
        </div>

        <div className="flex-grow bg-[--theme-leaguecard-color] shadow-xl rounded-2xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
            {[
              { name: "Chem Phys" as const, score: chem },
              { name: "CARS" as const, score: cars },
              { name: "Bio Biochem" as const, score: bio },
              { name: "Psych Soc" as const, score: psych }
            ].map((section: Section, index) => (
              <div 
                key={index} 
                className="min-h-[6.25rem] flex flex-col items-center justify-center p-4 rounded-xl hover:bg-[--theme-leaguecard-accent] transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => setActiveSection(section)}
              >
                {completedSections.includes(section.name) ? (
                  <CheckCircle2 className="h-6 w-6 mb-2 text-green-500" />
                ) : (
                  <Circle className="h-6 w-6 mb-2 text-gray-400" />
                )}
                <span className="text-2xl md:text-3xl font-medium mb-1">{section.score}</span>
                <span className="text-xs opacity-75 mb-3 text-center">{section.name}</span>
                <span className="px-4 py-1.5 text-xs rounded-full bg-black/10 group-hover:bg-black/20 transition-colors duration-200">
                  Review
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0 flex-grow">
        <div className="lg:col-span-3 bg-[--theme-leaguecard-color] p-4 rounded-2xl shadow-xl flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-wide opacity-60">Kalypso&apos;s Analysis</h3>
            {completedSections.length > 0 && (
              <button
                onClick={generateAnalysis}
                disabled={isGeneratingAnalysis}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-3 w-3 ${isGeneratingAnalysis ? 'animate-spin' : ''}`} />
                <span>{analysis ? 'Regenerate' : 'Generate'} Analysis</span>
              </button>
            )}
          </div>
          <div className="space-y-4 flex-grow overflow-y-auto">
            {isGeneratingAnalysis ? (
              <div className="flex items-center justify-center h-full opacity-50">
                Analyzing your test performance...
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                <p 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: `<p class="mb-4">${formatAnalysis(analysis)}</p>` 
                  }} 
                />
                {analysis && (
                  <div className="mt-8">
                    <h3 className="text-xs uppercase tracking-wide opacity-60 mb-3 flex items-center gap-2">
                      Retake A Section
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="hover:opacity-100 transition-opacity">
                            <HelpCircle className="h-3.5 w-3.5 opacity-60 hover:opacity-100" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <div className="p-4 sm:p-6">
                            <h4 className="text-[--theme-hover-color] font-medium text-lg mb-3">
                              Retaking AAMC
                            </h4>
                            <p className="text-sm leading-relaxed text-black">
                              Before you mark it as complete, spend an hour-thirty minutes retaking a section. We ran a statistical analysis and found students who retook sections, even if you did it recently, performed better. However, don&apos;t rely on memory. Rely on actually verbally walking yourself through the logic of why an answer is correct or wrong.
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </h3>
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 bg-[--theme-doctorsoffice-accent] rounded-lg">
                      <span className="text-sm whitespace-nowrap">
                        {(() => {
                          const lowestIdx = [chem, cars, bio, psych]
                            .reduce((acc, curr, idx) => curr < acc.score ? { score: curr, idx } : acc, { score: Infinity, idx: 0 })
                            .idx;
                          
                          return lowestIdx === 0 ? "Chemistry and Physics" 
                               : lowestIdx === 1 ? "Critical Analysis and Reading Skills"
                               : lowestIdx === 2 ? "Biology and Biochemistry"
                               : "Psychology/Sociology";
                        })()}
                      </span>
                      {retakeCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <button
                          onClick={handleRetakeComplete}
                          className="px-3 py-1 text-xs rounded-full bg-black/10 hover:bg-black/20 transition-colors duration-200"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : completedSections.length === 0 ? (
              <div className="flex items-center justify-center h-full opacity-50">
                Complete section reviews to generate an analysis
              </div>
            ) : (
              <div className="flex items-center justify-center h-full opacity-50">
                Click generate to analyze your test performance
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[--theme-leaguecard-color] p-4 rounded-2xl shadow-xl flex flex-col min-h-0 overflow-visible">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wide opacity-60">Weaknesses</h3>
            <div className="relative group">
              <Button 
                variant="secondary"
                size="icon"
                className="opacity-80 hover:opacity-100 transition-all duration-200 h-8 w-8"
                onClick={() => handleNavigateToTutoring()}
              >
                <GraduationCap className="h-4 w-4 text-[--theme-text-color] hover:text-[--theme-hover-color]" />
              </Button>
              <span className="absolute -bottom-8 right-0 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Review weaknesses
              </span>
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto overflow-x-visible flex-1 min-h-0 pr-2">
            {getWeaknesses(test.dataPulses).map((item, index) => (
              <div 
                key={index}
                className="flex items-center p-3 rounded-xl bg-[--theme-leaguecard-accent] hover:translate-x-2 transition-all duration-200 cursor-pointer relative"
                onClick={() => handleNavigateToTutoring(item.topic)}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <div className="flex-grow">
                  <span className="text-sm">{item.topic}</span>
                  <span className="text-xs opacity-60 ml-2">({item.section})</span>
                </div>
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
      </div>
    </div>
  );
};

// Helper function to format dates consistently
const formatDate = (date: Date | undefined): string => {
  if (!date) return "";
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default TestReview;