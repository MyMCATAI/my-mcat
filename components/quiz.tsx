import { Passage } from "@/types";
import React, { useState, useEffect, useCallback } from "react";
import ContentRenderer from "./ContentRenderer";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export interface QuizQuestion {
  categoryId: string;
  contentCategory: string;
  id: string;
  passage: Passage | null;
  passageId: string | null;
  questionAnswerNotes: string | null;
  questionContent: string;
  questionID: string;
  questionOptions: string[];
}

interface QuizProps {
  category: string;
  shuffle?: boolean;
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

const Quiz: React.FC<QuizProps> = ({ category, shuffle = false }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userResponses, setUserResponses] = useState<Record<string, QuestionResponse>>({});
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({});
  const [currentUserTestId, setCurrentUserTestId] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!category) return;
    
    try {
      setIsLoading(true);
      const types = ["normal", "patient"];
      
      console.log("fetching questions")
      const response = await fetch(
        `/api/question?conceptCategory=${encodeURIComponent(category.replace(
          / /g,
          "_"
        ))}&page=1&pageSize=10&simple=true&types=${types.join("&types=")}`,
      );

      if (!response.ok) throw new Error("Failed to fetch questions");
      
      const data = await response.json();
      console.log(data)
      // console.log("data", data.questions[0])
      if (!data.questions || data.questions.length === 0) {
        toast({
          title: "No Questions Available",
          description: "No quiz questions found for this category.",
          variant: "destructive",
        });
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

      setQuestions(shuffle 
        ? [...formattedQuestions].sort(() => Math.random() - 0.5)
        : formattedQuestions
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
  const handleSaveResponse = async (questionId: string, userAnswer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.questionOptions[0];
    const isCorrect = userAnswer === correctAnswer;
    const timeSpent = 0;

    // Create user test if it doesn't exist
    if (!currentUserTestId) {
      await createUserTest();
      if (!currentUserTestId) return; // Exit if test creation failed
    }
    
    try {
      const result = await fetch('/api/user-test/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          categoryId: currentQuestion.categoryId,
          userAnswer,
          isCorrect,
          timeSpent,
          userNotes: 'From Quiz Component',
          userTestId: currentUserTestId,
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

  // Modify handleAnswerSelect to save response
  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    if (currentQuestion) {
      const isCorrect = answer === currentQuestion.questionOptions[0];
      console.log(`Answer is ${isCorrect ? 'correct! ✅' : 'incorrect ❌'}`);
      handleSaveResponse(currentQuestion.id, answer);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex < questions.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePrevQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  // Render logic for options
  const renderOptions = (question: QuizQuestion) => {
    const options = shuffledOptions[question.id] || [];
    
    return options.map((option, index) => {
      const isSelected = selectedAnswer === option;
      const previousResponse = userResponses[question.id];
      const wasSelectedPreviously = previousResponse?.userAnswer === option;
      const showResult = previousResponse && wasSelectedPreviously;
      const isCorrectAnswer = option === question.questionOptions[0];

      return (
        <button
          key={index}
          onClick={() => handleAnswerSelect(option)}
          className={`w-full text-left p-2 rounded ${
            isSelected || wasSelectedPreviously
              ? showResult
                ? isCorrectAnswer
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-[#0e2247] text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {String.fromCharCode(65 + index)}. {option}
        </button>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="bg-transparent text-black px-6 rounded-lg mx-auto">
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
    <div className="bg-transparent text-black px-6 rounded-lg mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semi-bold text-[--theme-text-color] drop-shadow-lg">
          Question {currentQuestionIndex + 1}
        </h2>
        <span className="text-sm text-[--theme-text-color] drop-shadow-lg">
          {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>
      <div className="mb-2 max-h-[60vh] overflow-y-auto">
        <div className="text-lg mb-4 text-white drop-shadow-lg">
          <ContentRenderer
            content={currentQuestion.questionContent}
            imageWidth="70%"
          />
        </div>
        {/* {currentQuestion.passage && (
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <div className="text-sm text-black">
              <ContentRenderer
                content={currentQuestion.passage.text}
                imageWidth="70%"
              />
            </div>
          </div>
        )} */}
        <div className="space-y-2">
          {currentQuestion && renderOptions(currentQuestion)}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
          className="px-4 py-2 bg-[#0e2247] text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Quiz;