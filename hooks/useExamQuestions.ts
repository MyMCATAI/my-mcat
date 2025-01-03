import { useState, useCallback } from 'react';
import axios from 'axios';
import { DISPLAY_TO_SHORT_SECTION, SECTION_MAPPINGS } from '@/lib/constants';

export interface ExamQuestion {
  id: string;
  questionText: string;
  answerText?: string | null;
  name: string;
  originalThoughtProcess: string | null;
  correctedThoughtProcess: string | null;
  positive: number;
  negative: number;
  level: string;
  section: string;
  fullLengthExamId: string;
}

interface CreateQuestionParams {
  examId: string;
  questionNumber: string;
  categoryId: string;
  mistake: string;
  improvement: string;
  status: 'wrong' | 'flagged' | 'correct';
  level?: string;
  questionText?: string;
  answerText?: string;
}

interface UpdateQuestionParams extends CreateQuestionParams {
  id: string;
}

export function useExamQuestions(examId: string, section?: string) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const sectionShortName = section ? DISPLAY_TO_SHORT_SECTION[section as keyof typeof DISPLAY_TO_SHORT_SECTION] : null;

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('examId', examId);
      if (sectionShortName) {
        params.append('section', sectionShortName);
      }
      params.append('level', 'contentCategory');

      const response = await axios.get(`/api/exam-questions?${params}`);
      setQuestions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch questions'));
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [examId, section]);

  const createQuestion = useCallback(async (params: CreateQuestionParams) => {
    try {
      if (!params.examId) {
        throw new Error('examId is required');
      }

      const response = await axios.post('/api/exam-questions', {
        examId: params.examId,
        questionNumber: params.questionNumber,
        categoryId: params.categoryId,
        mistake: params.mistake,
        improvement: params.improvement,
        status: params.status,
        questionText: params.questionText,
        answerText: params.answerText,
        level: params.level || 'contentCategory'
      });

      return response.data;
    } catch (err) {
      console.error('Error in createQuestion:', err);
      throw err instanceof Error ? err : new Error('Failed to create question');
    }
  }, []);

  const updateQuestion = useCallback(async (params: UpdateQuestionParams) => {
    try {
      const response = await axios.put('/api/exam-questions', params);
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update question');
    }
  }, []);

  const deleteQuestion = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/exam-questions?id=${id}`);
      await fetchQuestions();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete question');
    }
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
  };
} 