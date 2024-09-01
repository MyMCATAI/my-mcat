import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { Pencil, Highlighter, Flag } from 'lucide-react';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import Link from 'next/link';

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
  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: ""
  });
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
    if (test && test.questions?.length > 0) {
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
    if (passageCacheRef?.current[passageId]) {
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

      // Log the answer
      await saveAnswerLog(currentUserTest.id, questionId, userAnswer, isCorrect);

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

  // Note to future Josh: this is super messy and spaghetti, you need to organize this all at some point. get rekt idiot 
  // - past Josh

  const saveAnswerLog = async (userTestId: string, questionId: string, userAnswer: string, isCorrect: boolean) => {
    console.log("Starting saveAnswerLog function");
  
    const currentQuestion = getCurrentQuestion();
    console.log("Current question:", currentQuestion);
    if (!currentQuestion) {
      console.error("No current question found");
      return;
    }
  
    const existingResponse = getCurrentUserResponse(questionId);
    console.log("Existing response:", existingResponse);
    const timeSpent = hours * 3600 + minutes * 60 + seconds;
  
    const timestamp = new Date().toISOString();
    const formattedAction = `[${timestamp}] - Answered: "${userAnswer}" (${isCorrect ? 'Correct' : 'Incorrect'})`;
  
    let updatedUserNotes = formattedAction;
    if (existingResponse?.userNotes) {
      updatedUserNotes = `${existingResponse.userNotes}\n${formattedAction}`;
    }
  
    const responseData = {
      userTestId,
      questionId,
      userAnswer: existingResponse?.userAnswer || userAnswer,
      isCorrect: existingResponse?.isCorrect || isCorrect,
      timeSpent,
      userNotes: updatedUserNotes,
      answeredAt: new Date().toISOString(),
    };
  
    console.log("Response data to be sent:", responseData);
  
    try {
      const response = await fetch('/api/user-test/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to save user response: ${response.status} ${response.statusText}`);
      }
  
      const savedResponse: UserResponse = await response.json();
      console.log("Saved response:", savedResponse);
  
      setUserResponses(prev => ({
        ...prev,
        [savedResponse.id]: savedResponse
      }));
  
      setQuestionIdToResponseId(prev => ({
        ...prev,
        [questionId]: savedResponse.id
      }));
  
      // Update chatbot context
      setChatbotContext(prevContext => ({
        ...prevContext,
        context: `${prevContext.context}\n\nI just answered this question: "${currentQuestion.questionContent}"\nMy answer was: "${userAnswer}" (${isCorrect ? 'Correct' : 'Incorrect'})`
      }));
  
      console.log('Answer log appended and context updated successfully');
    } catch (err) {
      console.error('Error saving user response:', err);
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
    if (!userTest) return;
    
    const score = calculateScore();
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
    console.log("get current question")
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

  const getCurrentUserResponse = useCallback((questionId: string): UserResponse | undefined => {
    console.log("getCurrentUserResponse")
    const responseId = questionIdToResponseId[questionId];
    return userResponses[responseId] || pendingResponses[questionId];
  }, [questionIdToResponseId, userResponses, pendingResponses]);

  useEffect(() => {
    if (currentPassage) {
      const currentQuestion = getCurrentQuestion();
      setChatbotContext({
        contentTitle: "writing a practice test on" + currentPassage.id,
        context: `I'm currently reading this passage: ${currentPassage.text}\n\nThe question I'm considering is: ${currentQuestion?.questionContent}\n\nOnly refer to this if I ask about what I'm currently studying.`
      });
    }
  }, [currentPassage, currentQuestionIndex]);

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
 
  const saveNote = async (text: string) => {
    console.log("Starting saveNote function");
    let currentUserTest = userTest
    if (!currentUserTest) {
      console.log("No userTest, creating new one");
      currentUserTest = await createUserTest();
      if (!currentUserTest) {
        console.error('Failed to create user test');
        return;
      }
      setUserTest(currentUserTest);
      setTestCreated(true);
    }

    console.log("UserTest state:", currentUserTest);
    if (!currentUserTest) {
      console.error("UserTest is still null after creation attempt");
      return;
    }

    const currentQuestion = getCurrentQuestion();
    console.log("Current question:", currentQuestion);
    if (!currentQuestion) {
      console.error("No current question found");
      return;
    }

    const existingResponse = getCurrentUserResponse(currentQuestion.id);
    console.log("Existing response:", existingResponse);
    const timeSpent = hours * 3600 + minutes * 60 + seconds;

    const timestamp = new Date().toISOString();
    const formattedAction = `[${timestamp}] - ${text}`;

    let updatedUserNotes = formattedAction;
    if (existingResponse?.userNotes) {
      updatedUserNotes = `${existingResponse.userNotes}\n${formattedAction}`;
    }

    const responseData = {
      userTestId: currentUserTest.id,
      questionId: currentQuestion.id,
      userAnswer: existingResponse?.userAnswer || '',
      isCorrect: existingResponse?.isCorrect || false,
      timeSpent,
      userNotes: updatedUserNotes,
      answeredAt: new Date().toISOString(),
    };

    console.log("Response data to be sent:", responseData);

    try {
      const response = await fetch('/api/user-test/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to save user response: ${response.status} ${response.statusText}`);
      }

      const savedResponse: UserResponse = await response.json();
      console.log("Saved response:", savedResponse);

      setUserResponses(prev => ({
        ...prev,
        [savedResponse.id]: savedResponse
      }));

      setQuestionIdToResponseId(prev => ({
        ...prev,
        [currentQuestion.id]: savedResponse.id
      }));

      // Update chatbot context
      setChatbotContext(prevContext => ({
        ...prevContext,
        context: `${prevContext.context}\n\n
        
        Here's something I just noted about the passage
        ${text}`
      }));

    } catch (err) {
      console.error('Error saving user response:', err);
    }
  };

  const onNote = (text: string) => {
    console.log('Noted:', text);
    saveNote(text);
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

  const userAnswer = currentQuestion?.id ? getCurrentUserResponse(currentQuestion?.id)?.userAnswer : undefined

  return (
    <div className="bg-white flex flex-col text-white overflow-hidden h-screen">
      <div className="bg-[#006dab] p-2 h-15 flex justify-between items-center border-3 border-sky-500">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold ml-6">
            {test?.title}
            {isCreatingTest && <span className="ml-2 text-sm text-gray-400">Creating test...</span>}
          </h1>
        </div>
        <div className="timer text-sky-300">
          <span>{hours.toString().padStart(2, '0')}:</span>
          <span>{minutes.toString().padStart(2, '0')}:</span>
          <span>{seconds.toString().padStart(2, '0')}</span>
        </div>
        <Link href="/home" className="ml-4 px-3 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded transition duration-300">
            Return Home
          </Link>
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
     
      {/* Main content area */}
      <div className="flex relative flex-grow overflow-hidden">
        {currentPassage && (
          <div className="w-1/2 border-r-4 border-[#006dab] overflow-auto">
            <div className="p-4 h-full">
              <PassageComponent 
                ref={passageRef}
                passageData={currentPassage} 
                onNote={onNote}
              />
            </div>
          </div>
        )}

        <div className={`overflow-auto ${currentPassage ? 'w-1/2' : 'w-full'}`}>
          <div className="p-4 h-full">
            {currentQuestion && currentTestQuestion ? (
              <QuestionComponent
                question={currentQuestion}
                onNext={handleNextQuestion}
                onPrevious={handlePreviousQuestion}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === test?.questions.length - 1}
                onAnswer={handleUserResponse}
                userAnswer={userAnswer} 
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={test?.questions.length || 0}
                onFinish={handleFinishTest}
                isSubmitting={isSubmitting}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No question available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="bg-[#006dab] h-15 border-t-3 border-sky-500"></div>
     {/* Chatbot */}
     <ChatbotWidget chatbotContext={chatbotContext} />

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