import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2, Flag, XCircle, CheckCircle2, BookOpen } from 'lucide-react';
import QuestionAddModal from './QuestionAddModal';

interface Question {
  id: string;
  number: string;
  category: string;
  mistake: string;
  improvement: string;
  status: 'wrong' | 'flagged' | 'correct';
}

interface SectionReviewProps {
  section: {
    name: string;
    score: number;
  };
  onBack: () => void;
  isCompleted: boolean;
  onComplete: () => void;
}

const SectionReview: React.FC<SectionReviewProps> = ({ 
  section, 
  onBack, 
  isCompleted, 
  onComplete 
}) => {
  const [listOfQuestions, setListOfQuestions] = useState<Question[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const flaggedCount = listOfQuestions.filter(q => q.status === 'flagged').length;
  const wrongCount = listOfQuestions.filter(q => q.status === 'wrong').length;

  const topicStats = listOfQuestions.reduce((acc, question) => {
    if (!question.category) return acc;
    
    if (!acc[question.category]) {
      acc[question.category] = {
        total: 0,
        wrong: 0,
        flagged: 0
      };
    }
    
    acc[question.category].total += 1;
    if (question.status === 'wrong') acc[question.category].wrong += 1;
    if (question.status === 'flagged') acc[question.category].flagged += 1;
    
    return acc;
  }, {} as Record<string, { total: number; wrong: number; flagged: number }>);

  const sortedTopics = Object.entries(topicStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3);

  const keyTopics = Array.from(new Set(listOfQuestions.map(q => q.category)))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="animate-fadeIn h-full p-6 flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-[12rem] h-[12rem] bg-[--theme-leaguecard-color] rounded-2xl shadow-xl overflow-hidden relative">
          <button
            onClick={onBack}
            className="absolute top-3 left-3 p-2 hover:bg-[--theme-hover-color] rounded-full transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 text-[--theme-text-color]" />
          </button>

          <div className="h-full flex flex-col items-center justify-center space-y-2">
            <span className="text-sm uppercase tracking-wide opacity-60">{section.name}</span>
            <span className="text-6xl font-bold">{section.score}</span>
          </div>
        </div>

        <div className="flex-grow bg-[--theme-leaguecard-color] shadow-xl rounded-2xl p-5">
          <div className="flex gap-4 h-full">
            <div className="flex-grow flex flex-col">
              <span className="text-xs uppercase tracking-wide opacity-60">Kalypso's Advice</span>
              <div className="flex-grow flex items-center justify-center text-sm opacity-50">
                Coming soon...
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
        <div className="bg-[--theme-leaguecard-color] p-6 rounded-2xl shadow-xl h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
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
                onClick={onComplete}
                className={`px-4 py-2 rounded-full text-sm transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color]'
                  }`}
              >
                {isCompleted ? 'Completed' : 'Mark Complete'}
              </button>

              <button
                onClick={() => setIsAddingQuestion(true)}
                className="flex items-center px-2 py-2 rounded-full bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">Add Question</span>
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-12 gap-2">
              {listOfQuestions.map((question) => (
                <div
                  key={question.id}
                  onClick={() => {
                    setEditingQuestion(question);
                    setIsAddingQuestion(true);
                  }}
                  className={`aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 text-xs
                    ${question.status === 'wrong' ? 'bg-red-500/20 text-red-500' : ''}
                    ${question.status === 'flagged' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                    ${question.status === 'correct' ? 'bg-green-500/20 text-green-500' : ''}
                  `}
                >
                  <span className="text-xs font-medium">{question.number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <QuestionAddModal
        isOpen={isAddingQuestion}
        onClose={() => {
          setIsAddingQuestion(false);
          setEditingQuestion(null);
        }}
        onAdd={(question) => {
          if (editingQuestion) {
            setListOfQuestions(questions => 
              questions.map(q => q.id === editingQuestion.id ? question : q)
            );
          } else {
            setListOfQuestions(prev => [...prev, question]);
          }
          setEditingQuestion(null);
        }}
        editingQuestion={editingQuestion}
      />
    </div>
  );
};

export default SectionReview;