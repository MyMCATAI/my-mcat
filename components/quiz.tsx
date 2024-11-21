import { Passage } from "@/types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ContentRenderer from "./ContentRenderer";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import QuizSummary from './QuizSummary';
import Timer, { TimerRef } from './Timer';
import { ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import QuizProgress from './QuizProgress';

export interface QuizQuestion {
  categoryId: string;
  contentCategory: string;
  id: string;
  passage: Passage | null;
  passageId: string | null;
  questionAnswerNotes: string[] | null;
  questionContent: string;
  questionID: string;
  questionOptions: string[];
}

interface QuizProps {
  category: string;
  shuffle?: boolean;
  setChatbotContext?: (context: { contentTitle: string; context: string }) => void;
}

// Add interface for user response
interface QuestionResponse {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  answeredAt: Date;
}

// Add utility function for shuffling
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Update AnswerSummary interface
interface AnswerSummary {
  questionContent: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // Add timeSpent
  questionNumber: number; // Add question number
  explanation: string; // Add explanation field
}

const Quiz: React.FC<QuizProps> = ({ category, shuffle = false, setChatbotContext }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({});
  const [currentUserTestId, setCurrentUserTestId] = useState<string | null>(null);
  const [answerSummaries, setAnswerSummaries] = useState<AnswerSummary[]>([]);
  const [hasAnsweredFirstQuestion, setHasAnsweredFirstQuestion] = useState(false);
  const questionTimerRef = useRef<TimerRef>(null);
  const totalTimerRef = useRef<TimerRef>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchQuestions = useCallback(async (page: number = 1) => {
    if (!category) return;
    
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const types = ["normal"];
      const response = await fetch(
        `/api/question?conceptCategory=${encodeURIComponent(category.replace(
          / /g,
          "_"
        ))}&page=${page}&pageSize=10&simple=true&types=${types.join("&types=")}`,
      );

      if (!response.ok) throw new Error("Failed to fetch questions");
      
      const data = await response.json();
      
      if (!data.questions || data.questions.length === 0) {
        if (page === 1) {
          toast({
            title: "No Questions Available",
            description: "No quiz questions found for this category.",
            variant: "destructive",
          });
        }
        return;
      }

      const formattedQuestions = data.questions.map((question: any) => {
        let options = question.questionOptions;
        
        // If options is a string, try to parse it
        if (typeof options === 'string') {
          try {
            options = JSON.parse(options);
          } catch (e) {
            console.error('Error parsing question options:', e);
            options = [];
          }
        }
        
        // If options is still a string or is an array with a single string (old format)
        if (Array.isArray(options) && options.length === 1 && typeof options[0] === 'string') {
          try {
            options = JSON.parse(options[0]);
          } catch (e) {
            console.error('Error parsing nested question options:', e);
            options = [];
          }
        }
        
        // Ensure options is always an array and clean up any remaining quotes or brackets
        if (!Array.isArray(options)) {
          options = [];
        }
        
        // Clean up each option string
        options = options.map((opt: string) => 
          opt.replace(/[\[\]"]/g, '').trim()
        ).filter(Boolean); // Remove any empty strings

        // Store the original options (first one is correct)
        const questionWithOriginalOptions = {
          id: question.id,
          categoryId: question.category?.id,
          contentCategory: question.category?.contentCategory,
          questionContent: question.questionContent,
          questionID: question.id,
          questionOptions: options,
          questionAnswerNotes: question.questionAnswerNotes,
          passage: question.context,
          passageId: null,
        };

        // Create shuffled options for this question
        setShuffledOptions(prev => ({
          ...prev,
          [question.id]: shuffleArray(options)
        }));

        return questionWithOriginalOptions;
      });

      // Update questions state based on page
      setQuestions(prevQuestions => 
        page === 1 
          ? (shuffle ? shuffleArray(formattedQuestions) : formattedQuestions)
          : [...prevQuestions, ...(shuffle ? shuffleArray(formattedQuestions) : formattedQuestions)]
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching questions:", error);
        toast({
          title: "Error",
          description: "Failed to load quiz questions. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [category, shuffle, toast]);

  useEffect(() => {
    if (!category || isLoading) return;
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, fetchQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  // Simplified create user test function
  const createUserTest = async (): Promise<void> => {
    if (!questions.length) return;

    try {
      const response = await fetch('/api/user-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId: questions[0].categoryId }),
      });

      if (!response.ok) throw new Error('Failed to create user test');
      const data = await response.json();
      setCurrentUserTestId(data.id);
      toast({
        title: "Quiz Started",
        variant: "default",
      });
    } catch (err) {
      console.error('Error creating user test:', err);
      toast({
        title: "Error",
        description: "Failed to create test session. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Simplified handleSaveResponse
  const handleSaveResponse = async (questionId: string, userAnswer: string, timeSpent: number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.questionOptions[0];
    const isCorrect = userAnswer === correctAnswer;

    // Create user test if it doesn't exist
    if (!currentUserTestId) {
      await createUserTest();
      if (!currentUserTestId) return;
    }
    
    try {
      const result = await fetch('/api/user-test/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTestId: currentUserTestId,
          questionId,
          userAnswer,
          isCorrect,
          timeSpent,
          userNotes: 'From Quiz Component',
        }),
      });

      if (!result.ok) {
        throw new Error('Failed to save response');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      toast({
        title: "Error",
        description: "Failed to save your answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update handleAnswerSelect
  const handleAnswerSelect = (answer: string) => {
    if (answeredQuestions.has(currentQuestion.id)) return;
    
    if (!hasAnsweredFirstQuestion) {
      setHasAnsweredFirstQuestion(true);
      questionTimerRef.current?.startTimer();
      totalTimerRef.current?.startTimer();
    }

    const timeSpent = questionTimerRef.current?.getElapsedTime() || 0;
    const isCorrect = answer === currentQuestion.questionOptions[0];
    
    setSelectedAnswer(answer);
    setAnsweredQuestions(prev => new Set([...prev, currentQuestion.id]));
    
    if (currentQuestion) {
      // Get the explanation for the correct answer (first note in the array)
      const explanation = currentQuestion.questionAnswerNotes?.[0] || '';

      setAnswerSummaries(prev => [...prev, {
        questionContent: currentQuestion.questionContent,
        userAnswer: answer,
        correctAnswer: currentQuestion.questionOptions[0],
        isCorrect,
        timeSpent,
        questionNumber: currentQuestionIndex + 1,
        explanation
      }]);

      handleSaveResponse(currentQuestion.id, answer, timeSpent);
    }
  };

  // Update handleNextQuestion to fetch more questions when needed
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    
    // Check if we need to fetch more questions
    if (currentQuestionIndex === questions.length - 3) { // Start fetching when 3 questions remain
      setCurrentPage(prev => prev + 1);
      fetchQuestions(currentPage + 1);
    }
    
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    questionTimerRef.current?.resetTimer();
    if (hasAnsweredFirstQuestion) {
      questionTimerRef.current?.startTimer();
    }
  };
    const handlePrevQuestion = () => {
      if(currentQuestionIndex ===0) return
      setCurrentQuestionIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
    };

  // Update renderOptions
  const renderOptions = (question: QuizQuestion) => {
    console.log("question", question)
    const options = shuffledOptions[question.id] || [];
    const hasAnswered = answeredQuestions.has(question.id);
    const correctAnswer = question.questionOptions[0];
    
    return options.map((option, index) => {
      const isSelected = selectedAnswer === option;
      const isCorrectAnswer = option === correctAnswer;
      
      let buttonClass = 'w-full text-left p-2 rounded ';
      
      if (hasAnswered) {
        if (isSelected) {
          buttonClass += isCorrectAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
        } else if (isCorrectAnswer) {
          buttonClass += 'bg-green-500 text-white';
        } else {
          buttonClass += 'bg-gray-100';
        }
      } else {
        buttonClass += 'bg-gray-100 hover:bg-gray-200';
      }

      return (
        <button
          key={index}
          onClick={() => handleAnswerSelect(option)}
          disabled={hasAnswered}
          className={buttonClass}
        >
          {String.fromCharCode(65 + index)}. {option}
        </button>
      );
    });
  };

  // Add new effect to update chatbot context when question changes
  useEffect(() => {
    if (!currentQuestion || !setChatbotContext) return;

    const correctAnswer = currentQuestion.questionOptions[0];
    const displayedOptions = shuffledOptions[currentQuestion.id] || [];
    
    setChatbotContext({
      contentTitle: "Quiz Question",
      context: `I'm currently taking a quiz on ${category}. Here's the current question I'm looking at:
Question: ${currentQuestion.questionContent}
Available options as shown to me:
${displayedOptions.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}

The correct answer is: "${correctAnswer}" (but this might appear in any position in my shuffled options)

Please act as a tutor - help me understand the concept and provide hints if I ask, but don't directly tell me the answer. If I seem stuck, guide me through the thinking process. Remember not to reference the correct answer's position in the list, as the options are shuffled.`
    });
  }, [currentQuestion, category, shuffledOptions, setChatbotContext]);

  if (isLoading) {
    return (
      <div className="h-full bg-transparent text-black px-6 rounded-lg mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>

        <div className="mb-2 max-h-[60vh]">
          {/* Question content skeleton */}
          <div className="space-y-2 mb-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>

          {/* Multiple choice options skeleton */}
          <div className="space-y-2">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="w-full h-12" />
            ))}
          </div>
        </div>

        {/* Navigation buttons skeleton */}
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        No questions available for this category.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent text-black px-6 rounded-lg mx-auto">
      {/* Timer and Question Header */}
      <div className="flex-none">
        <Timer ref={questionTimerRef} />
        <Timer ref={totalTimerRef} />
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semi-bold text-[--theme-text-color] drop-shadow-lg">
              Question {currentQuestionIndex + 1}
            </h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">View Progress</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto !bg-[--theme-adaptive-tutoring-color] border border-blue-900 text-white">
                <DialogHeader>
                  <DialogTitle className="text-[--theme-text-color]">Quiz Progress</DialogTitle>
                  <DialogClose className="absolute right-4 top-4 text-white opacity-70 hover:opacity-100" />
                </DialogHeader>
                <div className="!bg-[--theme-adaptive-tutoring-color]">
                  <QuizProgress 
                    summaries={answerSummaries}
                    totalQuestions={questions.length}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0"> {/* min-h-0 is crucial for nested flex scrolling */}
        <div className="text-lg mb-4 text-white drop-shadow-lg">
          <ContentRenderer
            content={currentQuestion.questionContent}
            imageWidth="70%"
          />
        </div>
        <div className="space-y-2">
          {currentQuestion && renderOptions(currentQuestion)}
        </div>
        {isLoadingMore && (
          <div className="mt-4 text-center text-white">
            Loading more questions...
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex-none mt-4 flex justify-between"> {/* Prevent shrinking */}
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={isLoadingMore}
          className="px-4 py-2 bg-[#0e2247] text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Quiz;