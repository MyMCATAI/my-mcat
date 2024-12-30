import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { XCircle, Flag, CheckCircle2, HelpCircle } from 'lucide-react';

interface QuestionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: {
    id: string;
    number: string;
    category: string;
    mistake: string;
    improvement: string;
    status: 'wrong' | 'flagged' | 'correct';
  }) => void;
  editingQuestion?: any;
}

const QuestionAddModal: React.FC<QuestionAddModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  editingQuestion 
}) => {
  const [question, setQuestion] = useState({
    id: editingQuestion?.id || '',
    number: editingQuestion?.number || '',
    category: editingQuestion?.category || '',
    mistake: editingQuestion?.mistake || '',
    improvement: editingQuestion?.improvement || '',
    status: editingQuestion?.status || 'wrong' as 'wrong' | 'flagged' | 'correct'
  });

  const handleSubmit = () => {
    onAdd({
      ...question,
      id: question.id || Date.now().toString()
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[45vw] bg-[--theme-leaguecard-color] border-[--theme-border-color]">
        <h3 className="text-sm uppercase tracking-wide opacity-60 mb-6 text-center">
          Add Question Review
        </h3>

        {/* Status Selection - Adjusted to maintain size better */}
        <div className="grid grid-cols-3 gap-4 mb-6 min-h-[4.5rem]">
          <button
            onClick={() => setQuestion({ ...question, status: 'wrong' })}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200
              ${question.status === 'wrong' 
                ? 'bg-red-500/20 text-red-500' 
                : 'hover:bg-[--theme-hover-color] text-[--theme-text-color]'}`}
          >
            <XCircle className="h-6 w-6" />
            <span className="text-xs">Wrong</span>
          </button>
          <button
            onClick={() => setQuestion({ ...question, status: 'flagged' })}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200
              ${question.status === 'flagged' 
                ? 'bg-yellow-500/20 text-yellow-500' 
                : 'hover:bg-[--theme-hover-color] text-[--theme-text-color]'}`}
          >
            <Flag className="h-6 w-6" />
            <span className="text-xs">Flag</span>
          </button>
          <button
            onClick={() => setQuestion({ ...question, status: 'correct' })}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200
              ${question.status === 'correct' 
                ? 'bg-green-500/20 text-green-500' 
                : 'hover:bg-[--theme-hover-color] text-[--theme-text-color]'}`}
          >
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-xs">Correct</span>
          </button>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm uppercase tracking-wide opacity-60 block mb-1.5 text-[--theme-text-color]">
                Question #
              </label>
              <input
                value={question.number}
                onChange={e => setQuestion({ ...question, number: e.target.value })}
                className="w-full p-2 rounded-lg border border-[--theme-border-color] bg-[--theme-mainbox-color] text-[--theme-text-color]"
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <label className="text-sm uppercase tracking-wide opacity-60 block mb-1.5 text-[--theme-text-color]">
                Category
              </label>
              <input
                value={question.category}
                onChange={e => setQuestion({ ...question, category: e.target.value })}
                className="w-full p-2 rounded-lg border border-[--theme-border-color] bg-[--theme-mainbox-color] text-[--theme-text-color]"
                placeholder="e.g., Kinematics"
              />
            </div>
          </div>

          {/* Adjusted textarea heights to use relative units */}
          <div>
            <textarea
              value={question.mistake}
              onChange={e => setQuestion({ ...question, mistake: e.target.value })}
              className="w-full p-2 rounded-lg border border-[--theme-border-color] bg-[--theme-mainbox-color] text-[--theme-text-color] min-h-[8rem]"
              placeholder="Why was I wrong? What was your logical error?"
            />
          </div>

          <div>
            <textarea
              value={question.improvement}
              onChange={e => setQuestion({ ...question, improvement: e.target.value })}
              className="w-full p-2 rounded-lg border border-[--theme-border-color] bg-[--theme-mainbox-color] text-[--theme-text-color] min-h-[8rem]"
              placeholder="How could I be right? What would the correct approach have been?"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          {/* Help Icon */}
          <button
            className="p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
            onClick={() => {/* TODO: Add help functionality */}}
          >
            <HelpCircle className="h-5 w-5 text-[--theme-text-color] opacity-60" />
          </button>

          {/* Existing buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-[--theme-hover-color] transition-all duration-200 text-[--theme-text-color]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] transition-all duration-200 text-[--theme-text-color]"
            >
              {editingQuestion ? 'Update' : 'Add'} Question
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionAddModal; 