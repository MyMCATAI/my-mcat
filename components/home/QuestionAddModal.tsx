import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { XCircle, Flag, CheckCircle2, HelpCircle, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from '@/hooks/useCategories';
import { DISPLAY_TO_FULL_SECTION, DISPLAY_TO_SHORT_SECTION } from '@/lib/constants';
import { toast } from "react-hot-toast";
import {  ExamQuestion } from '@/hooks/useExamQuestions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface QuestionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  editingQuestion?: ExamQuestion;
  sectionName: keyof typeof DISPLAY_TO_FULL_SECTION;
  createQuestion: (params: any) => Promise<any>;
  updateQuestion: (params: any) => Promise<any>;
  onQuestionSaved: () => Promise<void>;
}

const groupCategories = (categories: any[]) => {
  // Get unique content categories and sort them alphabetically
  const uniqueContentCategories = Array.from(new Set(
    categories.map(cat => cat.contentCategory)
  )).sort((a, b) => a.localeCompare(b));
  
  // Create array of objects with id and contentCategory
  const result = uniqueContentCategories.map(contentCategory => {
    // Find first category with this contentCategory to use its ID
    const category = categories.find(cat => cat.contentCategory === contentCategory);
    return {
      id: category?.id,
      contentCategory,
      section: category?.section
    };
  });

  return result;
};

const FORBIDDEN_WORDS = ['simple mistake', 'dumb', 'mistake', 'accident', 'easy', 'simple'];

const QuestionAddModal: React.FC<QuestionAddModalProps> = ({ 
  isOpen, 
  onClose, 
  examId,
  editingQuestion,
  sectionName,
  createQuestion,
  updateQuestion,
  onQuestionSaved
}) => {
  const name = DISPLAY_TO_FULL_SECTION[sectionName];
  const shortName = DISPLAY_TO_SHORT_SECTION[sectionName];
  const { categories, loading: categoriesLoading } = useCategories(name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [question, setQuestion] = useState({
    id: '',
    number: '',
    categoryId: '',
    mistake: '',
    improvement: '',
    status: 'wrong' as 'wrong' | 'flagged' | 'correct',
    questionText: '',
    answerText: ''
  });

  const [mistakeError, setMistakeError] = useState<string>('');
  const [improvementError, setImprovementError] = useState<string>('');

  // Reset form when opening/closing or switching questions
  useEffect(() => {
    if (isOpen) {
      if (editingQuestion) {
        // Find the category ID from the content category name
        const categoryId = categories.find(cat => cat.contentCategory === editingQuestion.name)?.id || '';
        
        setQuestion({
          id: editingQuestion.id,
          number: editingQuestion.questionText || '',
          categoryId,
          mistake: editingQuestion.originalThoughtProcess || '',
          improvement: editingQuestion.correctedThoughtProcess || '',
          status: editingQuestion.positive === 1 ? 'correct' : 
                 editingQuestion.negative === 1 ? 'wrong' : 'flagged',
          questionText: editingQuestion.questionText || '',
          answerText: editingQuestion.answerText || ''
        });
      } else {
        setQuestion({
          id: '',
          number: '',
          categoryId: '',
          mistake: '',
          improvement: '',
          status: 'wrong',
          questionText: '',
          answerText: ''
        });
      }
    }
  }, [isOpen, editingQuestion, categories]);

  const handleSubmit = async () => {
    // For flagged questions, require 150 characters
    if (question.status === 'flagged') {
      if (question.mistake.length < 150) {
        setMistakeError('Your mistake analysis must be at least 150 characters long for flagged questions.');
        return;
      }
      if (question.improvement.length < 150) {
        setImprovementError('Your improvement plan must be at least 150 characters long for flagged questions.');
        return;
      }
    }
    
    // For wrong questions, require 100 characters
    if (question.status === 'wrong') {
      if (question.mistake.length < 100) {
        setMistakeError('Your mistake analysis must be at least 100 characters long.');
        return;
      }
      if (question.improvement.length < 100) {
        setImprovementError('Your improvement plan must be at least 100 characters long.');
        return;
      }
    }
    // No character validation for correct questions

    const hasForbiddenWord = FORBIDDEN_WORDS.some(word => 
      question.mistake.toLowerCase().includes(word.toLowerCase())
    );

    if (hasForbiddenWord) {
      setMistakeError('This is a cop-out answer to avoid thinking critically. No such thing as a simple mistake.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (!examId) {
        toast.error('Missing exam ID');
        return;
      }

      const params = {
        examId,
        questionNumber: question.number,
        categoryId: question.categoryId,
        mistake: question.mistake,
        improvement: question.improvement,
        status: question.status,
        questionText: question.questionText,
        answerText: question.answerText,
        level: 'contentCategory'
      };


      if (editingQuestion) {
        await updateQuestion({ ...params, id: editingQuestion.id });
        toast.success('Question updated successfully');
      } else {
        const result = await createQuestion(params);
        toast.success('Question added successfully');
      }

      // Wait for questions to be refreshed before closing
      await onQuestionSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save question:', error);
      toast.error(editingQuestion ? 'Failed to update question' : 'Failed to add question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setQuestion(prev => ({
      ...prev,
      categoryId
    }));
  };

  const handleMistakeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setQuestion(prev => ({ ...prev, mistake: newText }));
    
    // Clear error when typing
    setMistakeError('');
    
    // Validate as they type (optional)
    if (FORBIDDEN_WORDS.some(word => newText.toLowerCase().includes(word.toLowerCase()))) {
      setMistakeError('This is a cop-out answer to avoid thinking critically. No such thing as a simple mistake.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[45vw] max-h-[90vh] overflow-y-auto bg-[--theme-leaguecard-color] border-[--theme-border-color]">
        <h3 className="text-sm uppercase tracking-wide opacity-60 mb-6 text-center">
          {editingQuestion ? 'Edit' : 'Add'} Question Review
        </h3>

        {/* Status Selection */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 min-h-[4.5rem]">
          <button
            onClick={() => setQuestion(prev => ({ ...prev, status: 'wrong' }))}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200
              ${question.status === 'wrong' 
                ? 'bg-red-500/20 text-red-500' 
                : 'hover:bg-[--theme-hover-color] text-[--theme-text-color]'}`}
          >
            <XCircle className="h-6 w-6" />
            <span className="text-xs">Wrong</span>
          </button>
          <button
            onClick={() => setQuestion(prev => ({ ...prev, status: 'flagged' }))}
            className={`p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200
              ${question.status === 'flagged' 
                ? 'bg-yellow-500/20 text-yellow-500' 
                : 'hover:bg-[--theme-hover-color] text-[--theme-text-color]'}`}
          >
            <Flag className="h-6 w-6" />
            <span className="text-xs">Flag</span>
          </button>
          <button
            onClick={() => setQuestion(prev => ({ ...prev, status: 'correct' }))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm uppercase tracking-wide opacity-60 block mb-1.5 text-[--theme-text-color]">
                Question #
              </label>
              <input
                value={question.number}
                onChange={e => setQuestion(prev => ({ ...prev, number: e.target.value }))}
                className="w-full p-2 rounded-lg border border-[--theme-border-color] bg-[--theme-mainbox-color] text-[--theme-text-color]"
                placeholder="e.g., 12"
              />
            </div>
            <div>
              <label className="text-sm uppercase tracking-wide opacity-60 block mb-1.5 text-[--theme-text-color]">
                Category
              </label>
              <Select
                value={question.categoryId}
                onValueChange={handleCategorySelect}
              >
                <SelectTrigger className="w-full bg-[--theme-mainbox-color] border-[--theme-border-color]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-[40vh] overflow-y-auto">
                  {categoriesLoading ? (
                    <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                  ) : (
                    groupCategories(categories).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.contentCategory}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Collapsible className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm uppercase tracking-wide opacity-60 text-[--theme-text-color]">
                Question Text (Optional)
              </label>
              <CollapsibleTrigger className="hover:opacity-100 opacity-60 transition-opacity flex items-center [&[data-state=open]>svg]:rotate-90">
                <ChevronRight className="h-4 w-4 ml-2 text-[--theme-text-color] transition-transform" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <textarea
                value={question.questionText}
                onChange={e => setQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                className="w-full p-2 rounded-lg border border-[--theme-border-color] bg-[--theme-mainbox-color] text-[--theme-text-color] min-h-[4rem]"
                placeholder="Enter the actual question text here..."
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm uppercase tracking-wide opacity-60 text-[--theme-text-color]">
                Answer (Optional)
              </label>
              <CollapsibleTrigger className="hover:opacity-100 opacity-60 transition-opacity flex items-center [&[data-state=open]>svg]:rotate-90">
                <ChevronRight className="h-4 w-4 ml-2 text-[--theme-text-color] transition-transform" />
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <textarea
                value={question.answerText}
                onChange={e => setQuestion(prev => ({ ...prev, answerText: e.target.value }))}
                className="w-full p-2 rounded-lg border border-[--theme-border-color] bg-[--theme-mainbox-color] text-[--theme-text-color] min-h-[4rem]"
                placeholder="Enter the correct answer here..."
              />
            </CollapsibleContent>
          </Collapsible>

          <div>
            <label className="text-sm uppercase tracking-wide opacity-60 block mb-1.5 text-[--theme-text-color]">
              Mistake Analysis
            </label>
            <textarea
              value={question.mistake}
              onChange={handleMistakeChange}
              className={`w-full p-2 rounded-lg border ${
                mistakeError ? 'border-red-500' : 'border-[--theme-border-color]'
              } bg-[--theme-mainbox-color] text-[--theme-text-color] min-h-[8rem]`}
              placeholder="'My thought process that resulted in the wrong answer was...'"
            />
            <div className="flex justify-between mt-1">
              {question.status !== 'correct' && (
                <span className={`text-sm ${
                  (question.status === 'flagged' && question.mistake.length < 150) ||
                  (question.status === 'wrong' && question.mistake.length < 100)
                    ? 'text-red-500' 
                    : 'text-green-500'
                }`}>
                  {question.mistake.length}/{question.status === 'flagged' ? '150' : '100'} characters
                </span>
              )}
              {mistakeError && (
                <span className="text-sm text-red-500">{mistakeError}</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm uppercase tracking-wide opacity-60 block mb-1.5 text-[--theme-text-color]">
              Improvement Plan
            </label>
            <textarea
              value={question.improvement}
              onChange={e => {
                setQuestion(prev => ({ ...prev, improvement: e.target.value }));
                setImprovementError('');
              }}
              className={`w-full p-2 rounded-lg border ${
                improvementError ? 'border-red-500' : 'border-[--theme-border-color]'
              } bg-[--theme-mainbox-color] text-[--theme-text-color] min-h-[8rem]`}
              placeholder="If I could do this question again, I would approach it differently by..."
            />
            <div className="flex justify-between mt-1">
              {question.status !== 'correct' && (
                <span className={`text-sm ${
                  (question.status === 'flagged' && question.improvement.length < 150) ||
                  (question.status === 'wrong' && question.improvement.length < 100)
                    ? 'text-red-500' 
                    : 'text-green-500'
                }`}>
                  {question.improvement.length}/{question.status === 'flagged' ? '150' : '100'} characters
                </span>
              )}
              {improvementError && (
                <span className="text-sm text-red-500">{improvementError}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            className="p-2 hover:bg-[--theme-hover-color] rounded-full transition-colors duration-200"
            onClick={() => {/* TODO: Add help functionality */}}
          >
            <HelpCircle className="h-5 w-5 text-[--theme-text-color] opacity-60" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-[--theme-hover-color] transition-all duration-200 text-[--theme-text-color]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!question.categoryId || !question.number || isSubmitting}
              className="px-4 py-2 rounded-lg bg-[--theme-leaguecard-accent] hover:bg-[--theme-hover-color] transition-all duration-200 text-[--theme-text-color] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : editingQuestion ? 'Update' : 'Add'} Question
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionAddModal; 