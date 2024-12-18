import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';

interface Question {
  id: string;
  number: string;
  category: string;
  mistake: string;
  improvement: string;
}

interface SectionReviewProps {
  section: {
    name: string;
    score: number;
  };
  onBack: () => void;
}

const SectionReview: React.FC<SectionReviewProps> = ({ section, onBack }) => {
  const [listOfQuestions, setListOfQuestions] = useState<Question[]>([]);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [newQuestion, setNewQuestion] = useState<Question>({
    id: '',
    number: '',
    category: '',
    mistake: '',
    improvement: ''
  });

  const handleAddQuestion = () => {
    if (editingQuestion) {
      setListOfQuestions(questions => 
        questions.map(q => q.id === editingQuestion.id ? newQuestion : q)
      );
      setEditingQuestion(null);
    } else {
      setListOfQuestions([...listOfQuestions, { ...newQuestion, id: Date.now().toString() }]);
    }
    setNewQuestion({ id: '', number: '', category: '', mistake: '', improvement: '' });
    setIsAddingQuestion(false);
  };

  return (
    <div className="animate-fadeIn h-full">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-[--theme-text-color]" />
          </button>
          <div className="text-sm opacity-60">
            Test Review / {section.name}
          </div>
        </div>
      </div>

      <div className="h-px bg-[--theme-border-color] mb-6" />

      {/* Section Score Display */}
      <div className="w-full bg-[--theme-leaguecard-color] p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-center text-2xl font-medium mb-2">{section.name}</h2>
        <div className="text-4xl text-center font-bold">{section.score}</div>
      </div>

      {/* Questions List and Form */}
      <div className="bg-[--theme-leaguecard-color] p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm uppercase tracking-wide opacity-60">Questions to Review</h3>
          <button
            onClick={() => setIsAddingQuestion(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">Add Question</span>
          </button>
        </div>

        {isAddingQuestion && (
          <div className="mb-6 p-4 bg-[--theme-leaguecard-accent] rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                placeholder="Question Number"
                value={newQuestion.number}
                onChange={e => setNewQuestion({...newQuestion, number: e.target.value})}
                className="p-2 rounded border bg-transparent"
              />
              <input
                placeholder="Content Category"
                value={newQuestion.category}
                onChange={e => setNewQuestion({...newQuestion, category: e.target.value})}
                className="p-2 rounded border bg-transparent"
              />
            </div>
            <textarea
              placeholder="Why I got it wrong"
              value={newQuestion.mistake}
              onChange={e => setNewQuestion({...newQuestion, mistake: e.target.value})}
              className="w-full p-2 rounded border bg-transparent mb-4"
              rows={2}
            />
            <textarea
              placeholder="What I could've done to get it right"
              value={newQuestion.improvement}
              onChange={e => setNewQuestion({...newQuestion, improvement: e.target.value})}
              className="w-full p-2 rounded border bg-transparent mb-4"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddingQuestion(false)}
                className="px-3 py-2 rounded-lg hover:bg-[--theme-hover-color] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-3 py-2 rounded-lg bg-[--theme-hover-color] transition-colors duration-200"
              >
                {editingQuestion ? 'Update' : 'Add'} Question
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {listOfQuestions.map((question) => (
            <div key={question.id} className="p-4 rounded-lg bg-[--theme-leaguecard-accent]">
              <div className="flex justify-between mb-2">
                <div className="flex gap-4">
                  <span className="text-sm font-medium">#{question.number}</span>
                  <span className="text-sm opacity-75">{question.category}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewQuestion(question);
                      setEditingQuestion(question);
                      setIsAddingQuestion(true);
                    }}
                    className="p-1 hover:bg-[--theme-hover-color] rounded transition-colors duration-200"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setListOfQuestions(questions => 
                      questions.filter(q => q.id !== question.id)
                    )}
                    className="p-1 hover:bg-[--theme-hover-color] rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm mb-2">{question.mistake}</p>
              <p className="text-sm opacity-75">{question.improvement}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionReview;