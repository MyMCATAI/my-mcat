import React, { useEffect, useState, useRef } from "react";
import { useStopwatch } from 'react-timer-hook';
import PassageComponent from "@/components/test/Passage";
import QuestionComponent from "@/components/test/Question";
import { Test, TestQuestion, Passage, Question, UserResponse } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Highlighter, Flag } from 'lucide-react';

interface TestComponentProps {
  testId: string;
  onTestComplete?: (score: number) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ testId, onTestComplete }) => {
  const [test, setTest] = useState<Test | null>(null);
  const [userTest, setUserTest] = useState<{ id: string } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [userResponses, setUserResponses] = useState<Record<string, UserResponse>>({});
  const [pendingResponses, setPendingResponses] = useState<Record<string, UserResponse>>({});
  const passageCacheRef = useRef<Record<string, Passage>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCreated, setTestCreated] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [questionIdToResponseId, setQuestionIdToResponseId] = useState<Record<string, string>>({});

  const [showScorePopup, setShowScorePopup] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const [flashHighlight, setFlashHighlight] = useState(false);
  const [flashStrikethrough, setFlashStrikethrough] = useState(false);
  const [flashFlag, setFlashFlag] = useState(false);

  const {
    seconds,
    minutes,
    hours,
    reset,
  } = useStopwatch({ autoStart: true });

  const passageRef = useRef<{ applyStyle: (style: string) => void } | null>(null);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (test && test.questions.length > 0) {
      const firstQuestion = test.questions[0].question;
      if (firstQuestion.passageId) {
        updateCurrentPassage(firstQuestion.passageId);
      }
    }
  }, [test]);

  useEffect(() => {
    if (test) {
      const currentQuestion = getCurrentQuestion();
      if (currentQuestion?.passageId) {
        updateCurrentPassage(currentQuestion.passageId);
      } else {
        setCurrentPassage(null);
      }
    }
    reset();
  }, [currentQuestionIndex, test]);

  const fetchTest = async () => {
    if (!testId) {
      setError("No test ID provided");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/test?id=${testId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test');
      }
      const data: Test = await response.json();
      setTest(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentPassage = async (passageId: string) => {
    if (passageCacheRef.current[passageId]) {
      setCurrentPassage(passageCacheRef.current[passageId]);
    } else {
      try {
        const response = await fetch(`/api/passage?id=${passageId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch passage');
        }
        const passageData: Passage = await response.json();
        passageCacheRef.current[passageId] = passageData;
        setCurrentPassage(passageData);
      } catch (err) {
        console.error('Error fetching passage:', err);
        setCurrentPassage(null);
      }
    }
  };

  const handleUserResponse = async (questionId: string, userAnswer: string, isCorrect: boolean) => {
    let currentUserTest = userTest;

    if (!testCreated) {
      currentUserTest = await createUserTest();
      if (!currentUserTest) {
        console.error('Failed to create user test');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    if (!currentUserTest) {
      console.error('No valid user test available');
      return;
    }

    const timeSpent = hours * 3600 + minutes * 60 + seconds;

    const optimisticResponse: UserResponse = {
      id: `temp-${questionId}`,
      userTestId: currentUserTest.id,
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      answeredAt: new Date(),
    };

    setPendingResponses(prev => ({
      ...prev,
      [questionId]: optimisticResponse
    }));

    setQuestionIdToResponseId(prev => ({
      ...prev,
      [questionId]: optimisticResponse.id
    }));

    try {
      const response = await fetch('/api/user-test/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTestId: currentUserTest.id,
          questionId,
          userAnswer,
          isCorrect,
          timeSpent,
          answeredAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to save user response');
      const savedResponse: UserResponse = await response.json();

      setUserResponses(prev => ({
        ...prev,
        [savedResponse.id]: savedResponse
      }));

      setQuestionIdToResponseId(prev => ({
        ...prev,
        [questionId]: savedResponse.id
      }));

      setPendingResponses(prev => {
        const { [questionId]: _, ...rest } = prev;
        return rest;
      });

    } catch (err) {
      console.error('Error saving user response:', err);
      setPendingResponses(prev => {
        const { [questionId]: _, ...rest } = prev;
        return rest;
      });
      setQuestionIdToResponseId(prev => {
        const { [questionId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const createUserTest = async (): Promise<{ id: string } | null> => {
    if (!testId || testCreated) return null;
    setIsCreatingTest(true);
  
    try {
      const response = await fetch('/api/user-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId }),
      });
  
      if (!response.ok) throw new Error('Failed to create user test');
      const data = await response.json();
      setUserTest(data);
      setTestCreated(true);
      return data;
    } catch (err) {
      console.error('Error creating user test:', err);
      return null;
    } finally {
      setIsCreatingTest(false);
    }
  };

  const calculateScore = () => {
    if (!test) return 0;
    const totalQuestions = test.questions.length;
    const correctAnswers = Object.values(userResponses).filter(r => r.isCorrect).length;
    return (correctAnswers / totalQuestions) * 100;
  };

  const handleFinishTest = async () => {
    setIsSubmitting(true);
    console.log('submit')
    if (!userTest) return;
    
    const score = calculateScore();
    console.log('score',score)
    setFinalScore(score);
    try {
      const response = await fetch(`/api/user-test/${userTest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, finishedAt: new Date().toISOString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update test');
      }

      setShowScorePopup(true);
      onTestComplete && onTestComplete(score);

    } catch (err) {
      console.error('Error finishing test:', err);
      // Optionally, show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentTestQuestion = (): TestQuestion | null => {
    if (!test || !test.questions || test.questions.length === 0) return null;
    return test.questions[currentQuestionIndex];
  };

  const getCurrentQuestion = (): Question | null => {
    const currentTestQuestion = getCurrentTestQuestion();
    return currentTestQuestion?.question || null;
  };

  const handleNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      reset(); // Reset the timer when moving to the next question
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      reset(); // Reset the timer when moving to the previous question
    }
  };

  const getCurrentUserResponse = (questionId: string): UserResponse | undefined => {
    const responseId = questionIdToResponseId[questionId];
    return userResponses[responseId] || pendingResponses[questionId];
  };

  const handleHighlight = () => {
    setFlashHighlight(true);
    passageRef.current?.applyStyle('HIGHLIGHT');
    setTimeout(() => setFlashHighlight(false), 300); 
  };

  const handleStrikethrough = () => {
    setFlashStrikethrough(true);
    passageRef.current?.applyStyle('STRIKETHROUGH');
    setTimeout(() => setFlashStrikethrough(false), 300);
  };

  const handleFlag = () => {
    setFlashFlag(true);
    // Add your flag logic here
    setTimeout(() => setFlashFlag(false), 300);
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;
  if (!test) return <div className="text-white">No test found</div>;

  const currentTestQuestion = getCurrentTestQuestion();
  const currentQuestion = getCurrentQuestion();

  return (
    <div className="bg-white flex flex-col text-white overflow-hidden h-screen">
      <div className="bg-[#006dab] p-2 h-15 flex justify-between items-center border-3 border-sky-500">
        <h1 className="text-lg font-semibold ml-6">
          {test?.title}
          {isCreatingTest && <span className="ml-2 text-sm text-gray-400">Creating test...</span>}
        </h1>
        <div className="timer text-sky-300">
          <span>{hours.toString().padStart(2, '0')}:</span>
          <span>{minutes.toString().padStart(2, '0')}:</span>
          <span>{seconds.toString().padStart(2, '0')}</span>
        </div>
      </div>
      <div className="h-9 border-t-2 border-b-2 border-white bg-[#84aedd] flex items-center justify-between">
        <div className="flex items-center ml-2">
          <button
            className={`mr-2 px-3 py-1 rounded transition-colors duration-200 flex items-center ${
              flashHighlight
                ? 'bg-transparent text-yellow-300'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            onClick={handleHighlight}
          >
            <Highlighter className="w-4 h-4 mr-2 ml-3" />
            Highlight
          </button>
          <button
            className={`mr-2 px-3 py-1 rounded transition-colors duration-200 flex items-center ${
              flashStrikethrough
                ? 'bg-transparent text-yellow-300'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            onClick={handleStrikethrough}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Strikethrough
          </button>
        </div>
        <div className="flex items-center mr-2">
          <button
            className={`mr-2 px-3 py-1 rounded transition-colors duration-200 flex items-center ${
              flashFlag
                ? 'bg-transparent text-yellow-300'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            onClick={handleFlag}
          >
            <Flag className="w-4 h-4 mr-2" />
            Flag for Review
          </button>
        </div>
      </div>
      <div className="h-7 bg-[#a6a6a6]"></div>
      <div className="flex relative flex-grow overflow-hidden">
        {currentPassage ? (
          <>
            <div className="w-1/2 border-r-4 border-[#006dab] overflow-auto">
              <div className="p-4">
                <PassageComponent 
                  ref={passageRef}
                  passageData={currentPassage} 
                  allowHighlight={true}
                  highlightActive={flashHighlight}
                  strikethroughActive={flashStrikethrough}
                  onHighlight={handleHighlight}
                  onStrikethrough={handleStrikethrough}
                />
              </div>
            </div>
            <div className="w-1/2 relative overflow-auto">
              {currentQuestion && currentTestQuestion && (
                <QuestionComponent
                  question={currentQuestion}
                  onNext={handleNextQuestion}
                  onPrevious={handlePreviousQuestion}
                  isFirst={currentQuestionIndex === 0}
                  isLast={currentQuestionIndex === test?.questions.length - 1}
                  onAnswer={handleUserResponse}
                  userAnswer={getCurrentUserResponse(currentQuestion.id)?.userAnswer} 
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={test?.questions.length || 0}
                  onFinish={handleFinishTest}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <div className="max-w-2xl w-full h-full overflow-y-auto relative">
              {currentQuestion && currentTestQuestion && (
                <QuestionComponent
                  question={currentQuestion}
                  onNext={handleNextQuestion}
                  onPrevious={handlePreviousQuestion}
                  isFirst={currentQuestionIndex === 0}
                  isLast={currentQuestionIndex === test?.questions.length - 1}
                  onAnswer={handleUserResponse}
                  userAnswer={getCurrentUserResponse(currentQuestion.id)?.userAnswer} 
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={test?.questions.length || 0}
                  onFinish={handleFinishTest}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        )}
      </div>
      <div className="bg-[#006dab] h-15 border-t-3 border-sky-500"></div>

      <Dialog open={showScorePopup} onOpenChange={setShowScorePopup}>
        <DialogContent className="bg-[#0A2540] text-white border border-sky-500">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-sky-300">Test Completed!</DialogTitle>
            <DialogDescription className="text-gray-300">
              Congratulations on completing the test.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-xl">Your Score: <span className="font-bold text-sky-300">{finalScore.toFixed(2)}%</span></p>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={() => window.location.href = `/user-test/${userTest?.id}`}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded"
            >
              View Details
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestComponent;