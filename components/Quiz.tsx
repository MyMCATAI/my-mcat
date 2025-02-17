//components/Quiz.tsx
"use client";
import { Passage } from "@/types";
import React, { useState, useEffect, useCallback, useRef } from "react";
import ContentRenderer from "./ContentRenderer";
import { Skeleton } from "@/components/ui/skeleton";
import Timer, { TimerRef } from "./Timer";
import { ThumbsDown, BarChart2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import QuizProgress from "./QuizProgress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Latex from "react-latex-next";
import toast from "react-hot-toast";
import { ExplanationImages } from "./ExplanationImages";
import { QuizIntroDialog } from "./ATS/QuizIntroDialogue";
import { useUserInfo } from "@/hooks/useUserInfo";
import DownvoteFeedback from './DownvoteFeedback';
import { useAudio } from "@/contexts/AudioContext";

/* ---------------------------------------- Types ------------------------------------------ */
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
  setChatbotContext?: (context: {
    contentTitle: string;
    context: string;
  }) => void;
}

interface AnswerSummary {
  questionContent: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  questionNumber: number;
  explanation: string;
}

/* ---------------------------------------- Utilities ---------------------------------------- */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculateScore = (summaries: AnswerSummary[]): number => {
  const correctAnswers = summaries.filter((summary) => summary.isCorrect).length;
  return (correctAnswers / summaries.length) * 100;
};

/* ---------------------------------------- Component ---------------------------------------- */
const Quiz: React.FC<QuizProps> = ({ category, shuffle = false, setChatbotContext }) => {
  /* ---------------------------------------- Hooks ------------------------------------------ */
  const { userInfo, isLoading: isLoadingUserInfo, updateScore } = useUserInfo();
  const audio = useAudio();

  /* ---------------------------------------- Refs ------------------------------------------ */
  const questionTimerRef = useRef<TimerRef>(null);
  const totalTimerRef = useRef<TimerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------- State ------------------------------------------ */
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [answerSummaries, setAnswerSummaries] = useState<AnswerSummary[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<
    Record<string, string[]>
  >({});
  const [currentUserTestId, setCurrentUserTestId] = useState<string | null>(
    null
  );
  const [hasAnsweredFirstQuestion, setHasAnsweredFirstQuestion] =
    useState(false);
  const [showIntroDialog, setShowIntroDialog] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [hasAwardedCoins, setHasAwardedCoins] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);


  const handleStartQuiz = async () => {
    try {
      setIsStarting(true);
      await updateScore(-1); // Spend 1 coin to start
      setShowIntroDialog(false);
      setHasStarted(true);
      await fetchQuestions();
      toast.success("Quiz started! Good luck!");
    } catch (error) {
      console.error("Error starting quiz:", error);
      toast.error("Failed to start quiz. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const fetchQuestions = useCallback(
    async (page: number = 1) => {
      if (!category) return;

      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const types = ["normal"];
        const response = await fetch(
          `/api/question?conceptCategory=${encodeURIComponent(
            category.replace(/ /g, "_")
          )}&page=${page}&pageSize=10&simple=true&types=${types.join("&types=")}`
        );

        if (!response.ok) throw new Error("Failed to fetch questions");

        const data = await response.json();

        if (!data.questions || data.questions.length === 0) {
          if (page === 1) {
            toast.error("No quiz questions found for this category.");
          }
          return;
        }

        const formattedQuestions = data.questions.map((question: any) => {
          let options = question.questionOptions;

          // If options is a string, try to parse it
          if (typeof options === "string") {
            try {
              options = JSON.parse(options);
            } catch (e) {
              console.error("Error parsing question options:", e);
              options = [];
            }
          }

          // If options is still a string or is an array with a single string (old format)
          if (
            Array.isArray(options) &&
            options.length === 1 &&
            typeof options[0] === "string"
          ) {
            try {
              options = JSON.parse(options[0]);
            } catch (e) {
              console.error("Error parsing nested question options:", e);
              options = [];
            }
          }

          // Ensure options is always an array and clean up any remaining quotes or brackets
          if (!Array.isArray(options)) {
            options = [];
          }

          // Clean up each option string
          options = options
            .map((opt: string) => opt.replace(/[\[\]"]/g, "").trim())
            .filter(Boolean); // Remove any empty strings

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
          setShuffledOptions((prev) => ({
            ...prev,
            [question.id]: shuffleArray(options),
          }));

          return questionWithOriginalOptions;
        });

        // Update questions state based on page
        setQuestions((prevQuestions) =>
          page === 1
            ? shuffle
              ? shuffleArray(formattedQuestions)
              : formattedQuestions
            : [
                ...prevQuestions,
                ...(shuffle
                  ? shuffleArray(formattedQuestions)
                  : formattedQuestions),
              ]
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching questions:", error);
          toast.error("Failed to load quiz questions. Please try again.");
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [category, shuffle]
  );

  useEffect(() => {
    if (!category || isLoading) return;
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, fetchQuestions, hasStarted]);


  const currentQuestion = questions[currentQuestionIndex];

  // Simplified create user test function
  const createUserTest = async (): Promise<void> => {
    if (!questions.length) return;

    try {
      const response = await fetch("/api/user-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: questions[0].categoryId }),
      });

      if (!response.ok) throw new Error("Failed to create user test");
      const data = await response.json();
      setCurrentUserTestId(data.id);
      toast.success("Quiz Started");
    } catch (err) {
      console.error("Error creating user test:", err);
      toast.error("Failed to create test session. Please try again.");
    }
  };

  // Simplified handleSaveResponse
  const handleSaveResponse = async (
    questionId: string,
    userAnswer: string,
    timeSpent: number
  ) => {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.questionOptions[0];
    const isCorrect = userAnswer === correctAnswer;

    // Create user test if it doesn't exist
    if (!currentUserTestId) {
      await createUserTest();
      if (!currentUserTestId) return;
    }

    try {
      const result = await fetch("/api/user-test/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTestId: currentUserTestId,
          questionId,
          userAnswer,
          isCorrect,
          timeSpent,
          userNotes: "From Quiz Component",
        }),
      });

      if (!result.ok) {
        throw new Error("Failed to save response");
      }
    } catch (error) {
      console.error("Error saving response:", error);
      toast.error("Failed to save your answer. Please try again.");
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (answeredQuestions.has(currentQuestion.id)) return;

    if (!hasAnsweredFirstQuestion) {
      setHasAnsweredFirstQuestion(true);
      questionTimerRef.current?.startTimer();
      totalTimerRef.current?.startTimer();
    }

    const timeSpent = questionTimerRef.current?.getElapsedTime() || 0;
    const isCorrect = answer === currentQuestion.questionOptions[0];

    setAnsweredQuestions((prev) => new Set([...prev, currentQuestion.id]));
    setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));

    if (currentQuestion) {
      // Get the explanation for the correct answer (first note in the array)
      const explanation = currentQuestion?.questionAnswerNotes && JSON.parse(currentQuestion.questionAnswerNotes)[0] || ""

      setAnswerSummaries((prev) => [
        ...prev,
        {
          questionContent: currentQuestion.questionContent,
          userAnswer: answer,
          correctAnswer: currentQuestion.questionOptions[0],
          isCorrect,
          timeSpent,
          questionNumber: currentQuestionIndex + 1,
          explanation,
        },
      ]);

      handleSaveResponse(currentQuestion.id, answer, timeSpent);
    }
  };

  const handleReset = useCallback(() => {
    // Reset all quiz states
    setCurrentQuestionIndex(0);
    setAnswerSummaries([]);
    setAnsweredQuestions(new Set());
    setHasAnsweredFirstQuestion(false);
    setShowSummary(false);
    setIsQuizComplete(false);
    setHasAwardedCoins(false);
    questionTimerRef.current?.resetTimer();
    totalTimerRef.current?.resetTimer();
    
    // Reset to initial quiz state
    setHasStarted(false);
    setShowIntroDialog(true);
    
    // Clear current questions to force a fresh fetch
    setQuestions([]);
  }, []);

  const handleNextQuestion = async () => {
    if (isQuizComplete) return;

    if (currentQuestionIndex === 14 || currentQuestionIndex === questions.length - 1) {
      setIsQuizComplete(true);
      
      const score = calculateScore(answerSummaries);
      
      if (!hasAwardedCoins) {
        try {
          if (score >= 100) {
            await updateScore(2);
            audio.playSound('fanfare');
            toast.success("Congratulations! You earned 2 coins for a perfect score! 🎉");
          } else if (score >= 70) {
            await updateScore(1);
            audio.playSound('levelup');
            toast.success("Congratulations! You earned 1 coin for scoring above 70%! 🎉");
          }
          setHasAwardedCoins(true);
        } catch (error) {
          console.error("Error incrementing score:", error);
          toast.error("Failed to award coin");
        }
      }

      setShowSummary(true);
      return;
    }

    if (currentQuestionIndex === questions.length - 3) {
      setCurrentPage((prev) => prev + 1);
      fetchQuestions(currentPage + 1);
    }

    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    questionTimerRef.current?.resetTimer();
    if (hasAnsweredFirstQuestion) {
      questionTimerRef.current?.startTimer();
    }
  };
  const handlePrevQuestion = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  const renderOptions = (question: QuizQuestion) => {
    const options = shuffledOptions[question.id] || [];
    const hasAnswered = answeredQuestions.has(question.id);
    const correctAnswer = question.questionOptions[0];
    const userAnswer = userAnswers[question.id];

    let explanations = question.questionAnswerNotes;
    if (typeof explanations === "string") {
      try {
        explanations = JSON.parse(explanations);
      } catch (e) {
        console.error("Error parsing questionAnswerNotes:", e);
        explanations = null;
      }
    }

    return (
      <div>
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = hasAnswered && userAnswer === option;
            const isCorrectAnswer = option === correctAnswer;

            let buttonClass =
              "w-full text-left p-2 rounded text-[--theme-text-color] ";

            if (hasAnswered) {
              if (isSelected) {
                buttonClass += isCorrectAnswer ? "bg-green-500" : "bg-red-500";
              } else if (isCorrectAnswer) {
                buttonClass += "bg-green-500";
              } else {
                buttonClass += "bg-[--theme-leaguecard-color]";
              }
            } else {
              buttonClass +=
                "bg-[--theme-leaguecard-color] hover:bg-[--theme-hover-color]";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={hasAnswered}
                className={buttonClass}
              >
                <Latex>
                  {String.fromCharCode(65 + index)}. {option}
                </Latex>
              </button>
            );
          })}
        </div>

        {/* Explanation Section */}
        {hasAnswered && explanations && (
          <div className="mt-6 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[--theme-hover-color] mb-2">
              Explanation
            </h3>
            <div className="text-[--theme-text-color]">
              <ContentRenderer
                content={explanations[0] || ""}
                imageWidth="70%"
              />
            </div>

            <ExplanationImages
              questionContent={question.questionContent}
              isFullScreen={isFullScreen}
            />
          </div>
        )}
      </div>
    );
  };

  // Update the useEffect for chatbot context
  useEffect(() => {
    if (!currentQuestion || !setChatbotContext) return;

    const correctAnswer = currentQuestion.questionOptions[0];
    const displayedOptions = shuffledOptions[currentQuestion.id] || [];
    const explanation = currentQuestion.questionAnswerNotes?.[0] || "";

    setChatbotContext({
      contentTitle: "Quiz Question",
      context: `I'm currently taking a quiz on ${category}. Here's the current question I'm looking at:
Question: ${currentQuestion.questionContent}
Available options as shown to me:
${displayedOptions.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join("\n")}

The correct answer is: "${correctAnswer}" (but this might appear in any position in my shuffled options)

Explanation for the correct answer:
${explanation}

Please act as a tutor and explain concepts in a straight-forward and beginner-friendly manner. Remember not to reference the correct answer's position in the list, as the options are shuffled.`,
    });
  }, [currentQuestion, category, shuffledOptions, setChatbotContext]);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleDownvote = () => {
    setIsFeedbackOpen(true);
  };

  /* ---------------------------------------- Render ----------------------------------------- */
  if (isLoading || isLoadingUserInfo) {
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

  if (!isLoading && (!questions.length || !currentQuestion)) {
    return (
      <div className="flex items-center justify-center h-full text-[--theme-text-color]">
        No questions available for this category.
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <QuizIntroDialog
        category={category}
        userScore={userInfo?.score ?? 0}
        isStarting={isStarting}
        onStart={handleStartQuiz}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      data-quiz-container="true"
      className="h-full flex flex-col px-6 rounded-lg mx-auto bg-[--theme-adaptive-tutoring-color]"
    >
      {/* Timer and Question Header */}
      <div className="flex-none">
        <Timer ref={questionTimerRef} />
        <Timer ref={totalTimerRef} />

        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semi-bold text-[--theme-hover-color] drop-shadow-lg">
              Question {currentQuestionIndex + 1}
            </h2>

            {!isFullScreen && (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-transparent text-[--theme-text-color] hover:text-[--theme-hover-color] transition-colors"
                    >
                      <BarChart2 className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto !bg-[--theme-adaptive-tutoring-color] border-transparent text-[--theme-text-color]">
                    <DialogHeader>
                      <DialogTitle className="text-[--theme-text-color]">
                        Quiz Progress
                      </DialogTitle>
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

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownvote}
                        className="hover:bg-transparent text-[--theme-text-color] hover:text-[--theme-hover-color] transition-colors"
                      >
                        <ThumbsDown className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Report this question</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-transparent text-[--theme-text-color] hover:text-[--theme-hover-color] transition-colors mt-2"
            onClick={() => handleFullScreen()}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content - adjust max-height */}
      <div className="flex-1 overflow-y-auto min-h-0 mb-4">
        <div className="mb-4 text-[--theme-text-color] drop-shadow-lg">
          {currentQuestion && (
            <ContentRenderer
              content={currentQuestion.questionContent}
              imageWidth={isFullScreen ? "50%" : "70%"}
              isFullScreen={isFullScreen}
            />
          )}
        </div>
        <div className="space-y-2">
          {currentQuestion && renderOptions(currentQuestion)}
        </div>
        {isLoadingMore && (
          <div className="mt-4 text-center text-[--theme-text-color]">
            Loading more questions...
          </div>
        )}
      </div>

      {/* Navigation Buttons - ensure they stay at bottom */}
      <div
        className={`flex-none mt-auto flex justify-between items-center ${
          isFullScreen ? "mb-11" : ""
        }`}
      >
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-300 text-black rounded disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={isQuizComplete ? handleReset : handleNextQuestion}
          disabled={isLoadingMore}
          className="px-4 py-2 bg-[--theme-button-color] text-[--theme-text-color] rounded-md border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
        >
          {isQuizComplete ? "Try Again" : "Next"}
        </button>
      </div>

      {/* Move Dialog outside the main container */}
      <Dialog 
        open={showSummary && isQuizComplete} 
        onOpenChange={(open) => {
          setShowSummary(open);
          // Exit fullscreen when showing summary
          if (open && document.fullscreenElement) {
            document.exitFullscreen();
            setIsFullScreen(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto !bg-[--theme-adaptive-tutoring-color] border border-transparent">
          <DialogHeader>
            <DialogTitle className="text-[--theme-text-color]">
              Quiz Complete!
            </DialogTitle>
            <DialogClose className="absolute right-4 top-4 text-white opacity-70 hover:opacity-100" />
          </DialogHeader>
          <div className="!bg-[--theme-adaptive-tutoring-color]">
            <QuizProgress summaries={answerSummaries} totalQuestions={15} />
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-[--theme-button-color] text-[--theme-text-color] rounded-md border border-[--theme-border-color] hover:bg-[--theme-hover-color] hover:text-[--theme-hover-text]"
              >
                Try Again
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <DownvoteFeedback
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentUserTestId={currentUserTestId}
        currentQuestionId={currentQuestion?.id || null}
        currentQuestionContent={currentQuestion?.questionContent || null}
      />
    </div>
  );
};

export default Quiz;
