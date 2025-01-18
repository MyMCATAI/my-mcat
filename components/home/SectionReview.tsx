import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Flag, XCircle, RefreshCw, Maximize2, Edit2 } from 'lucide-react';
import QuestionAddModal from './QuestionAddModal';
import { ExamQuestion, useExamQuestions } from '@/hooks/useExamQuestions';
import { DISPLAY_TO_FULL_SECTION } from '@/lib/constants';
import { DataPulse } from '@/hooks/useCalendarActivities';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Confetti from 'react-confetti';
import { useDataPulse } from '@/hooks/useDataPulse';
import { toast } from 'react-hot-toast';


export interface Section {
  name: keyof typeof DISPLAY_TO_FULL_SECTION;
  score: number;
}

interface TopicStats {
  total: number;
  wrong: number;
  flagged: number;
}

interface SectionReviewProps {
  section: Section;
  examId: string;
  company: string;
  onBack: () => void;
  isCompleted: boolean;
  onComplete: () => void;
  dataPulse?: DataPulse;
  onScoreUpdate?: (newScore: number) => void;
}

const SectionReview: React.FC<SectionReviewProps> = ({ 
  section, 
  examId,
  company,
  onBack, 
  isCompleted, 
  onComplete,
  dataPulse,
  onScoreUpdate
}) => {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | undefined>(undefined);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalysisMaximized, setIsAnalysisMaximized] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiDimensions, setConfettiDimensions] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [editedScore, setEditedScore] = useState(section.score);
  const { updateDataPulse, markAsReviewed, loading: dataPulseLoading } = useDataPulse();
  
  // Add refs
  const fanfareAudio = React.useRef<HTMLAudioElement | null>(null);
  const statsAreaRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize audio
    fanfareAudio.current = new Audio('/fanfare.mp3');
    fanfareAudio.current.volume = 0.5;
  }, []);

  // Update confetti dimensions when showing
  useEffect(() => {
    if (showConfetti && statsAreaRef.current) {
      const rect = statsAreaRef.current.getBoundingClientRect();
      setConfettiDimensions({
        x: rect.x,
        y: rect.y,
        w: rect.width,
        h: rect.height
      });
    }
  }, [showConfetti]);

  const { 
    questions: listOfQuestions, 
    loading, 
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion
  } = useExamQuestions(examId, section.name);

  // Load existing analysis if available
  useEffect(() => {
    if (dataPulse?.aiResponse) {
      setAnalysis(dataPulse.aiResponse);
    }
  }, [dataPulse]);

  const generateAnalysis = async () => {
    if (!dataPulse?.id) return;
    
    setIsGeneratingAnalysis(true);
    try {
      const response = await fetch('/api/section-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataPulseId: dataPulse.id
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

  // Fetch questions and check if section is already reviewed
  useEffect(() => {
    fetchQuestions()
    const initializeData = async () => {
      if (dataPulse?.reviewed) {
        onComplete();
      }
    };

    initializeData();
  }, []);

  const handleSectionComplete = async () => {
    try {
      if (!dataPulse?.id) {
        console.error('No dataPulse found for section:', section.name);
        return;
      }

      const updatedPulse = await markAsReviewed(dataPulse.id);
      if (!updatedPulse) return;
      
      // Play celebration effects
      setShowConfetti(true);
      if (fanfareAudio.current) {
        fanfareAudio.current.play();
      }

      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      // Increment user score by 1 coin
      const response = await fetch('/api/user-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user score');
      }
      
      // Show toast message
      toast.success("Congratulations! You've earned 1 coin for reviewing the section!");

      // Call the onComplete callback to update frontend state
      onComplete();
    } catch (error) {
      console.error('Error updating section completion:', error);
    }
  };

  const flaggedCount = listOfQuestions.filter(q => q.negative === 0 && q.positive === 0).length;
  const wrongCount = listOfQuestions.filter(q => q.negative === 1).length;

  const topicStats = listOfQuestions.reduce<Record<string, TopicStats>>((acc, question) => {
    if (!question.name) return acc;
    
    if (!acc[question.name]) {
      acc[question.name] = {
        total: 0,
        wrong: 0,
        flagged: 0
      };
    }
    
    acc[question.name].total += 1;
    if (question.negative === 1) acc[question.name].wrong += 1;
    if (question.negative === 0 && question.positive === 0) acc[question.name].flagged += 1;
    
    return acc;
  }, {});

  const sortedTopics = Object.entries(topicStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3);

  const handleScoreUpdate = async () => {
    if (!dataPulse?.id) return;
    
    const updatedPulse = await updateDataPulse({
      id: dataPulse.id,
      positive: editedScore
    });

    if (updatedPulse) {
      // Update the local section score
      section.score = editedScore;
      // Notify parent of score update
      onScoreUpdate?.(editedScore);
      setIsEditingScore(false);
    }
  };

  return (
    <div className="animate-fadeIn h-full p-3 flex flex-col">
      {showConfetti && (
        <Confetti
          width={confettiDimensions.w}
          height={confettiDimensions.h}
          recycle={false}
          numberOfPieces={50}
          gravity={0.3}
          style={{
            position: 'fixed',
            left: confettiDimensions.x,
            top: confettiDimensions.y,
            pointerEvents: 'none'
          }}
        />
      )}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-[12rem] h-[12rem] bg-[--theme-leaguecard-color] rounded-2xl shadow-xl overflow-hidden relative group">
          <button
            onClick={onBack}
            className="absolute top-3 left-3 p-2 hover:bg-[--theme-hover-color] rounded-full transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 text-[--theme-text-color]" />
          </button>

          <button
            onClick={() => setIsEditingScore(true)}
            className="absolute top-3 right-3 p-2 opacity-0 group-hover:opacity-100 hover:bg-[--theme-hover-color] rounded-full transition-all duration-200 hover:scale-105"
          >
            <Edit2 className="h-4 w-4 text-[--theme-text-color]" />
          </button>

          <div className="h-full flex flex-col items-center justify-center space-y-2">
            <span className="text-sm uppercase tracking-wide opacity-60">{section.name}</span>
            {isEditingScore ? (
              <div className="flex flex-col items-center gap-2">
                <input
                  type="number"
                  value={editedScore}
                  onChange={(e) => setEditedScore(Number(e.target.value))}
                  className="w-24 text-4xl font-bold text-center bg-transparent border-b-2 border-[--theme-text-color] focus:outline-none"
                  min="0"
                  max="132"
                  disabled={dataPulseLoading}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleScoreUpdate}
                    disabled={dataPulseLoading}
                    className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded-full hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dataPulseLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingScore(false);
                      setEditedScore(section.score);
                    }}
                    disabled={dataPulseLoading}
                    className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="text-6xl font-bold cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsEditingScore(true)}
              >
                {section.score}
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow bg-[--theme-leaguecard-color] shadow-xl rounded-2xl p-5">
          <div className="flex gap-4 h-full">
            <div className="flex-grow flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wide opacity-60">Kalypso&apos;s Analysis</span>
                {listOfQuestions.length > 0 && (
                  <button
                    onClick={generateAnalysis}
                    disabled={isGeneratingAnalysis}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingAnalysis ? 'animate-spin' : ''}`} />
                    <span>{analysis ? 'Regenerate' : 'Generate'} Analysis</span>
                  </button>
                )}
              </div>
              <div className="flex-grow flex items-center justify-center text-sm relative">
                <div className="max-h-[8rem] overflow-y-auto w-full">
                  {isGeneratingAnalysis ? (
                    <div className="opacity-50">Analyzing your performance...</div>
                  ) : analysis ? (
                    <div className="relative">
                      <div className="text-sm leading-relaxed whitespace-pre-line max-h-[100px] max-w-[660px] overflow-hidden">{analysis}</div>
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[--theme-leaguecard-color] to-transparent" />
                      <button 
                        onClick={() => setIsAnalysisMaximized(true)}
                        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 px-4 py-1 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        Read More
                      </button>
                    </div>
                  ) : listOfQuestions.length === 0 ? (
                    <div className="opacity-50">Add questions to generate an analysis</div>
                  ) : (
                    <div className="opacity-50">Click generate to analyze your performance</div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-48 border-l border-[--theme-border-color] pl-4">
              <span className="text-xs uppercase tracking-wide opacity-60">Key Topics</span>
              <div className="space-y-2 mt-2">
                {sortedTopics.map(([topic, stats]) => (
                  <div key={topic} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span>{topic}</span>
                      <span className="text-red-500">{stats.wrong}/{stats.total}</span>
                    </div>
                    <div className="w-full bg-[--theme-leaguecard-accent] h-1.5 rounded-full mt-1">
                      <div 
                        className="bg-red-500 h-full rounded-full"
                        style={{ width: `${(stats.wrong / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="bg-[--theme-leaguecard-color] p-6 rounded-2xl shadow-xl h-full flex flex-col" ref={statsAreaRef}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-6">              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[--theme-leaguecard-accent]/50">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{wrongCount} Wrong</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[--theme-leaguecard-accent]/50">
                  <Flag className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{flaggedCount} Flagged</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSectionComplete}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color]'
                  }`}
                  disabled={isCompleted}
              >
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </button>

              <button
                onClick={() => setIsAddingQuestion(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Question</span>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-12 gap-2">
              {loading ? (
                <div className="col-span-12 flex items-center justify-center py-8 text-sm opacity-70">
                  Loading questions...
                </div>
              ) : error ? (
                <div className="col-span-12 flex items-center justify-center py-8 text-sm text-red-500">
                  Error loading questions. Please try again.
                </div>
              ) : listOfQuestions.length === 0 ? (
                <div className="col-span-12 flex items-center justify-center py-8 text-sm opacity-70">
                  {`No questions added yet. Click "Add Question" to get started.`}
                </div>
              ) : (
                listOfQuestions.map((question) => (
                  <div
                    key={question.id}
                    onClick={() => {
                      setEditingQuestion(question);
                      setIsAddingQuestion(true);
                    }}
                    className={`aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all duration-200
                      ${question.negative === 1 ? 'bg-red-500/20 text-red-500' : ''}
                      ${question.negative === 0 && question.positive === 0 ? 'bg-yellow-500/20 text-yellow-500' : ''}
                      ${question.negative === 0 && question.positive === 1 ? 'bg-green-500/20 text-green-500' : ''}
                      hover:opacity-75
                    `}
                  >
                    <span className="text-lg font-medium">{question.questionText}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAnalysisMaximized} onOpenChange={setIsAnalysisMaximized}>
        <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] max-h-[90vh] overflow-y-auto bg-[--theme-leaguecard-color] border-[--theme-border-color]">
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm uppercase tracking-wide opacity-60 text-center text-[--theme-text-color]">Kalypso&apos;s Analysis</h3>
            <div className="text-lg leading-relaxed whitespace-pre-line text-[--theme-text-color]">
              {analysis}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuestionAddModal
        isOpen={isAddingQuestion}
        onClose={() => {
          setIsAddingQuestion(false);
          setEditingQuestion(undefined);
        }}
        company={company}
        examId={examId}
        editingQuestion={editingQuestion}
        sectionName={section.name}
        createQuestion={createQuestion}
        updateQuestion={updateQuestion}
        onQuestionSaved={fetchQuestions}
      />
    </div>
  );
};

export default SectionReview;