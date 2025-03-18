//components/test-component.tsx
"use client";
import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import PassageComponent from "@/components/test/Passage";
import QuestionComponent from "@/components/test/QuestionComponent";
import { Test, TestQuestion, Passage, Question, UserResponse } from "@/types";
import { Cat } from "lucide-react";
import ChatBotInLine from "@/components/chatbot/ChatBotInLine";
import ScoreDialog from "@/components/ScoreDialog";
import TestHeader, { TestHeaderRef } from "@/components/test/TestHeader";
import DictionaryLookup from "./DictionaryLookup";
import VocabList from "@/components/VocabList";
import { fetchDefinitionAndAddToVocab } from "@/lib/utils";
import { TestIntroModal } from "@/components/test/TestIntroModal";
import TestToolbar from "@/components/test/TestToolbar";
import { useUserInfo } from "@/hooks/useUserInfo";
import MessageButton from "@/components/MessageButton";
import { calculateScore, extractQuotedStrings, saveAnnotations } from "@/lib/test-utils";
import { testApi } from "@/services/testApi";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useAudio, useVocab } from "@/store/selectors";
import { calculateCarsReward } from '@/lib/coin/utils';
import { CARS_THRESHOLDS } from '@/lib/coin/constants';
import { toast } from 'react-hot-toast';
import { shouldShowCorrectAnswer } from "@/lib/utils";

interface TestComponentProps {
  testId: string;
  onTestComplete?: (score: number) => void;
  updateActivityEndTime?: () => void;
}

interface DictionaryPosition {
  top: number | null;
  bottom: number | null;
  left: number;
}

// Define a type for active editor identifiers
type ActiveEditor = "passage" | "question" | null;

interface Annotation {
  style: string;
  text: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  testId,
  onTestComplete,
  updateActivityEndTime
}) => {
  const [test, setTest] = useState<Test | null>(null);
  const [userTest, setUserTest] = useState<{ id: string } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [userResponses, setUserResponses] = useState<
    Record<string, UserResponse>
  >({});
  const [pendingResponses, setPendingResponses] = useState<
    Record<string, UserResponse>
  >({});
  const passageCacheRef = useRef<Record<string, Passage>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [questionIdToResponseId, setQuestionIdToResponseId] = useState<
    Record<string, string>
  >({});
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [numberOfPassageHighlights, setNumberOfPassageHighlights] = useState(0);
  const [numberOfPassageStrikethroughs, setNumberOfPassageStrikethroughs] =
    useState(0);
  const [totalOptionsCrossedOut, setTotalOptionsCrossedOut] = useState(0);

  const [flashHighlight, setFlashHighlight] = useState(false);
  const [flashStrikethrough, setFlashStrikethrough] = useState(false);
  const [flashFlag, setFlashFlag] = useState(false);
  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: "",
  });
  const [showChatbot, setShowChatbot] = useState(false);
  const [tempHighlightedStrings, setTempHighlightedStrings] = useState<
    string[]
  >([]); // Temporary highlights
  const passageRef = useRef<{ applyStyle: (style: string) => void, getAnnotations: () => Annotation[], setAnnotations: (annotations: Annotation[]) => void } | null>(
    null
  );
  const questionRef = useRef<{ applyStyle: (style: string) => void} | null>(
    null
  );
  const testHeaderRef = useRef<TestHeaderRef>(null);
  const wasQuestionTimerRunningRef = useRef(false);
  const wasTotalTimerRunningRef = useRef(false);
  const [score, setScore] = useState(0);
  const [timing, setTiming] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [technique, setTechnique] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showDefinition, setShowDefinition] = useState(false);
  const [dictionaryPosition, setDictionaryPosition] =
    useState<DictionaryPosition>({ top: null, bottom: null, left: 0 });

  const {
    isCmdIEnabled,
    addVocabWord, 
    showVocabList,
    toggleVocabList,
  } = useVocab();

  const [shouldShowChatbot, setShouldShowChatbot] = useState(false);
  const [hasAnsweredFirstQuestion, setHasAnsweredFirstQuestion] =useState(false);
  const [showIntroModal, setShowIntroModal] = useState(true);
  const [activeEditor, setActiveEditor] = useState<ActiveEditor>(null);
  const [canApplyStyle, setCanApplyStyle] = useState(true);
  
  const chatbotRef = useRef<{
    sendMessage: (message: string) => void;
  }>({ sendMessage: () => {} });

  const audio = useAudio();

  const showCorrectAnswer = shouldShowCorrectAnswer();

  // Handler to set the active editor
  const handleSetActiveEditor = (editor: ActiveEditor) => {
    setActiveEditor(editor);
  };

  const { userInfo } = useUserInfo();

  useEffect(() => {
    fetchTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (hasAnsweredFirstQuestion) {
      testHeaderRef.current?.resetQuestionTimer();
      testHeaderRef.current?.startQuestionTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, test, hasAnsweredFirstQuestion]);

  useEffect(() => {
    if (testHeaderRef.current) {
      if (showChatbot) {
        wasQuestionTimerRunningRef.current =
          testHeaderRef.current.isQuestionTimerRunning;
        wasTotalTimerRunningRef.current =
          testHeaderRef.current.isTotalTimerRunning;
        testHeaderRef.current.pauseTimers();
      } else {
        testHeaderRef.current.resumeTimers(
          wasQuestionTimerRunningRef.current,
          wasTotalTimerRunningRef.current
        );
      }
    }
  }, [showChatbot]);

  useEffect(() => {
    const checkTimers = () => {
      if (testHeaderRef.current) {
        const questionElapsedTime =
          testHeaderRef.current.getQuestionElapsedTime();
        const totalElapsedTime = testHeaderRef.current.getTotalElapsedTime();
        const isQuestionTimerRunning =
          testHeaderRef.current.isQuestionTimerRunning;

        if (questionElapsedTime >= 120 && !shouldShowChatbot) {
          setShouldShowChatbot(true);
        } else if (
          totalElapsedTime >= 420 &&
          !isQuestionTimerRunning &&
          !shouldShowChatbot
        ) {
          // 420 seconds = 7 minutes
          setShouldShowChatbot(true);
        }
      }
    };

    const intervalId = setInterval(checkTimers, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, [shouldShowChatbot]);

  useEffect(() => {
    if (shouldShowChatbot) {
      setShowChatbot(true);
    }
  }, [shouldShowChatbot]);

  // Reset shouldShowChatbot when moving to a new question
  useEffect(() => {
    setShouldShowChatbot(false);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (showChatbot) {
      audio.playSound('chatbot-open');
      
      // Pause timers when chatbot opens
      if (testHeaderRef.current) {
        wasQuestionTimerRunningRef.current = testHeaderRef.current.isQuestionTimerRunning;
        wasTotalTimerRunningRef.current = testHeaderRef.current.isTotalTimerRunning;
        testHeaderRef.current.pauseTimers();
      }
    } else {
      // Resume timers when chatbot closes
      if (testHeaderRef.current) {
        testHeaderRef.current.resumeTimers(
          wasQuestionTimerRunningRef.current,
          wasTotalTimerRunningRef.current
        );
      }
    }
  }, [showChatbot, audio]);

  useEffect(() => {
    if (currentPassage) {
      const currentQuestion = getCurrentQuestion();
      setChatbotContext((prevContext) => ({
        ...prevContext,
        contentTitle: currentPassage.title || "Untitled Passage",
        context: `I'm currently reading this passage: ${currentPassage.text}\n\nThe question I'm looking at is: ${currentQuestion?.questionContent}\n\n
        The question options, are: ${currentQuestion?.questionOptions}
        
        (secret note to you, the tutor: the first answer is correct, however, don't tell this to the student, we want to help them learn. Also note that they're presented these options in a random order)
        `,
      }));
    }
    testHeaderRef.current?.resetQuestionTimer(); // Reset question timer when question changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPassage, currentQuestionIndex]);

  const fetchTest = async () => {
    if (!testId) {
      setError("No test ID provided");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/test?id=${testId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test");
      }

      const data: Test = await response.json();
      setTest(data);

      // Create user test immediately after fetching the test data
      try {
        const createdUserTest = await testApi.createUserTest(data.id);
        setUserTest(createdUserTest);
        setTestStartTime(new Date());
      } catch (error) {
        console.error("Error creating user test:", error);
      }
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
        const encodedPassageId = encodeURIComponent(passageId);
        const response = await fetch(`/api/passage?id=${encodedPassageId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch passage");
        }
        const passageData: Passage = await response.json();
        passageCacheRef.current[passageId] = passageData;
        setCurrentPassage(passageData);
      } catch (err) {
        console.error("Error fetching passage:", err);
        setCurrentPassage(null);
      }
    }
  };

  const handleUserResponse = async (
    questionId: string,
    userAnswer: string,
    isCorrect: boolean
  ) => {
    updateActivityEndTime ? updateActivityEndTime() : null;
    if (!hasAnsweredFirstQuestion) {
      setHasAnsweredFirstQuestion(true);
      testHeaderRef.current?.startQuestionTimer();
    }
    if (!userTest) {
      console.error("No valid user test available");
      return;
    }

    const timeSpent = testHeaderRef.current?.getElapsedTime() || 0;
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      console.error("No current question found");
      return;
    }

    // Create optimistic response for UI
    const optimisticResponse: UserResponse = {
      id: `temp-${questionId}`,
      userTestId: userTest.id,
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      userNotes: "",
      answeredAt: new Date(),
    };

    // Update UI immediately with optimistic response
    setPendingResponses((prev) => ({
      ...prev,
      [questionId]: optimisticResponse,
    }));

    setQuestionIdToResponseId((prev) => ({
      ...prev,
      [questionId]: optimisticResponse.id,
    }));

    if (!getCurrentUserResponse(questionId)?.userAnswer) {
      setAnsweredQuestions((prev) => prev + 1);
    }

    try {
      // Save the response to the server
      const savedResponse = await testApi.saveUserResponse({
        questionId,
        userTestId: userTest.id,
        userAnswer,
        isCorrect,
        timeSpent,
      });

      // Update state with the saved response
      setUserResponses((prev) => ({
        ...prev,
        [savedResponse.id]: savedResponse,
      }));

      setQuestionIdToResponseId((prev) => ({
        ...prev,
        [questionId]: savedResponse.id,
      }));

      // Remove from pending responses
      setPendingResponses((prev) => {
        const { [questionId]: _, ...rest } = prev;
        return rest;
      });

      // Update chatbot context
      setChatbotContext((prevContext) => ({
        ...prevContext,
        context: `${prevContext.context}\n\nI just answered this question: "${currentQuestion.questionContent}"\nMy answer was: "${userAnswer}" (${isCorrect ? "Correct" : "Incorrect"})`,
      }));

      // Play sound on successful submission
      audio.playSound('correct');
    } catch (error) {
      console.error("Error saving user response:", error);
      audio.playSound('warning');
      // Could add error handling UI here if needed
    }
  };

  const handleFinishTest = async () => {
    if (currentQuestion) {
      await saveAnnotations({
        userTest,
        questionId: currentQuestion.id,
        annotations: passageRef.current?.getAnnotations() || [],
      });
    }
    setIsSubmitting(true);
    if (!userTest || !testStartTime) return;

    const testFinishTime = new Date();
    const totalTimeInSeconds = testHeaderRef.current?.getTotalElapsedTime() || 0;

    const { score, correctAnswers, technique, averageTimePerQuestion } = calculateScore({
      test,
      userResponses: Object.values(userResponses),
      totalTimeInSeconds,
      numberOfPassageHighlights,
      numberOfPassageStrikethroughs,
      totalOptionsCrossedOut,
    });

    setScore(score);
    setCorrectAnswer(correctAnswers);
    setTiming(totalTimeInSeconds);
    setTechnique(technique);

    try {
      // Save all pending responses
      for (const questionId in pendingResponses) {
        await saveUserResponse(questionId);
      }

      // Update the user test record
      const response = await fetch(`/api/user-test/${userTest.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score,
          finishedAt: testFinishTime.toISOString(),
          totalTime: totalTimeInSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update test");
      }

      // Calculate total stars (score stars + timing stars + technique stars)
      const scoreStars = score === 100 ? 3 : score >= 80 ? 2 : 1;
      const totalMinutes = totalTimeInSeconds / 60;
      const timingStars = totalMinutes <= 10 ? 3 : totalMinutes <= 12 ? 2 : 1;
      const techniqueStars = technique;
      
      const totalStars = scoreStars + timingStars + techniqueStars;
      const difficulty = currentPassage?.difficulty || 1;

      // Calculate coins using the CARS-specific function
      const coinsEarned = calculateCarsReward(totalStars, difficulty);

      // Update user's score if coins were earned
      if (coinsEarned > 0) {
        const scoreResponse = await fetch("/api/user-info/", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: coinsEarned }),
        });

        if (!scoreResponse.ok) {
          throw new Error("Failed to update user score");
        }

        if (totalStars === 9) {
          audio.playSound('fanfare');
          const difficultyText = difficulty >= 3 ? 'difficult ' : '';
          toast.success(`Perfect score on ${difficultyText}passage! You earned ${coinsEarned} coins! 🌟`);
        } else if (totalStars >= 6) {
          audio.playSound('levelup');
          toast.success(`Excellent work! You earned ${coinsEarned} coins! 🎉`);
        }
      } else {
        toast.error(`Keep practicing! You'll earn coins when you improve your performance.`);
      }

      setShowScorePopup(true);
      onTestComplete && onTestComplete(score);
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Failed to complete test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveUserResponse = async (questionId: string) => {
    const response = pendingResponses[questionId];
    if (!response) return;

    try {
      const apiResponse = await fetch("/api/user-test/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to save user response: ${apiResponse.status} ${apiResponse.statusText}`
        );
      }

      const savedResponse: UserResponse = await apiResponse.json();

      setUserResponses((prev) => ({
        ...prev,
        [savedResponse.id]: savedResponse,
      }));

      setQuestionIdToResponseId((prev) => ({
        ...prev,
        [questionId]: savedResponse.id,
      }));

      setPendingResponses((prev) => {
        const { [questionId]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      console.error("Error saving user response:", err);
    }
  };

  const getCurrentTestQuestion = (): TestQuestion | null => {
    if (!test || !test.questions || test.questions.length === 0) return null;
    return test.questions[currentQuestionIndex];
  };

  const getCurrentQuestion = (): Question | null => {
    const currentTestQuestion = getCurrentTestQuestion();

    if (currentTestQuestion) {
      const { question } = currentTestQuestion;
      return question;
    }

    return null;
  };

  const currentTestQuestion = getCurrentTestQuestion();
  const currentQuestion = getCurrentQuestion();
  
  const handleNextQuestion = async () => {
    if (currentQuestion) {
      await saveAnnotations({
        userTest,
        questionId: currentQuestion.id,
        annotations: passageRef.current?.getAnnotations() || [],
      });
      await saveUserResponse(currentQuestion.id); // Save user response
    }
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      testHeaderRef.current?.resetQuestionTimer();
    }
  };

  const handlePreviousQuestion = async () => {
    if (currentQuestion) {
      await saveAnnotations({
        userTest,
        questionId: currentQuestion.id,
        annotations: passageRef.current?.getAnnotations() || [],
      });
      await saveUserResponse(currentQuestion.id); // Save user response
    }
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      testHeaderRef.current?.resetQuestionTimer();
    }
  };

  const getCurrentUserResponse = useCallback(
    (questionId: string): UserResponse | undefined => {
      const responseId = questionIdToResponseId[questionId];
      return userResponses[responseId] || pendingResponses[questionId];
    },
    [questionIdToResponseId, userResponses, pendingResponses]
  );

  const handleHighlight = () => {
    if (!activeEditor || !canApplyStyle) {
      console.log("Cannot apply style yet.");
      return;
    }

    setFlashHighlight(true);
    setCanApplyStyle(false);

    if (activeEditor === "passage") {
      passageRef.current?.applyStyle("HIGHLIGHT");
      setNumberOfPassageHighlights((prev) => prev + 1);
    } else if (activeEditor === "question") {
      questionRef.current?.applyStyle("HIGHLIGHT");
    }

    setTimeout(() => setCanApplyStyle(true), 1000);
    setTimeout(() => setFlashHighlight(false), 300);
  };

  const handleStrikethrough = () => {
    if (!activeEditor || !canApplyStyle) {
      console.log("Cannot apply style yet.");
      return;
    }

    setFlashStrikethrough(true);
    setCanApplyStyle(false);

    if (activeEditor === "passage") {
      passageRef.current?.applyStyle("STRIKETHROUGH");
      setNumberOfPassageStrikethroughs((prev) => prev + 1);
    } else if (activeEditor === "question") {
      questionRef.current?.applyStyle("STRIKETHROUGH");
    }

    setTimeout(() => setCanApplyStyle(true), 1000);
    setTimeout(() => setFlashStrikethrough(false), 300);
  };

  const onOptionCrossedOut = () => {
    // TODO: called onece in question.tsx, but twice in test-componet.tsx
    // Save a note in the userResponse
    // saveNote(`crossed out option: ${optionText}`);

    // Increment the total options crossed out counter
    setTotalOptionsCrossedOut((prev) => prev + 1);
  };

  const saveNote = async (text: string) => {
    let currentUserTest = userTest;
    if (!currentUserTest) {
      try {
        currentUserTest = await testApi.createUserTest(test?.id || "");
        setUserTest(currentUserTest);
      } catch (error) {
        console.error("Failed to create user test:", error);
        return;
      }
    }

    if (!currentUserTest) {
      console.error("UserTest is still null after creation attempt");
      return;
    }

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      console.error("No current question found");
      return;
    }

    const timeSpent = testHeaderRef.current?.getElapsedTime() || 0;

    try {
      // First, try to fetch the existing response
      const checkResponse = await fetch(
        `/api/user-test/response?userTestId=${currentUserTest.id}&questionId=${currentQuestion.id}`,
        {
          method: "GET",
        }
      );
      const checkResponseJson = await checkResponse.json();

      let responseData: {
        id?: string;
        userTestId: string;
        questionId: string;
        timeSpent: number;
        userNotes: string;
      } = {
        userTestId: currentUserTest.id,
        questionId: currentQuestion.id,
        timeSpent,
        userNotes: text,
      };

      let method = "PUT";
      if (checkResponse.status === 404) {
        method = "POST";
      } else if (checkResponse.ok) {
        responseData.id = checkResponseJson.id;
      } else if (!checkResponse.ok) {
        throw new Error(
          `Failed to check existing response: ${checkResponse.status} ${checkResponse.statusText}`
        );
      }

      const response = await fetch("/api/user-test/response", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(responseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(
          `Failed to save user response: ${response.status} ${response.statusText}`
        );
      }

      const savedResponse: UserResponse = await response.json();

      setUserResponses((prev) => ({
        ...prev,
        [savedResponse.id]: savedResponse,
      }));

      setQuestionIdToResponseId((prev) => ({
        ...prev,
        [currentQuestion.id]: savedResponse.id,
      }));

      // Update chatbot context
      setChatbotContext((prevContext) => ({
        ...prevContext,
        context: `${prevContext.context}\n\nHere's something I just noted about the passage\n${text}`,
      }));
    } catch (err) {
      console.error("Error saving user response:", err);
    }
  };

  const handleFlag = async () => {
    setFlashFlag(true);

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !userTest) {
      console.error("No current question or user test available");
      setFlashFlag(false);
      return;
    }

    const existingResponse = getCurrentUserResponse(currentQuestion.id);
    const responseId = questionIdToResponseId[currentQuestion.id];

    if (!existingResponse) {
      console.error("No existing response found");
      setFlashFlag(false);
      return;
    }

    try {
      const response = await fetch(`/api/user-test/response`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userTestId: userTest.id,
          questionId: currentQuestion.id,
          flagged: !existingResponse.flagged,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flag status");
      }

      const savedResponse: UserResponse = await response.json();

      setUserResponses((prev) => ({
        ...prev,
        [responseId]: savedResponse,
      }));
    } catch (err) {
      console.error("Error updating question flag status:", err);
    }
  };

  const handleShowHint = (responseText: string) => {
    const quotedStrings = extractQuotedStrings(responseText);
    setTempHighlightedStrings(quotedStrings);

    // Clear the temporary highlights after 5 seconds
    setTimeout(() => {
      setTempHighlightedStrings([]);
    }, 5000);
  };

  const handleWordSelect = useCallback((word: string, rect: DOMRect) => {
    // Pass addVocabWord as a callback
    fetchDefinitionAndAddToVocab(word, addVocabWord);

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const isBottomThird = rect.bottom > (viewportHeight * 2) / 3;

    const leftPosition = Math.min(
      rect.left + rect.width,
      viewportWidth - 300
    );

    setDictionaryPosition({
      top: isBottomThird ? null : rect.bottom + 10,
      bottom: isBottomThird ? viewportHeight - rect.top + 10 : null,
      left: leftPosition,
    });

    setSelectedWord(word);
    setShowDefinition(true);
  }, [addVocabWord]);

  useKeyboardShortcuts({
    onHighlight: handleHighlight,
    onStrikethrough: handleStrikethrough,
    onToggleChatbot: () => setShowChatbot(prev => !prev),
    isCmdIEnabled,
    onWordSelect: handleWordSelect,
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  if (!test)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Test Found
          </h2>
          <p className="text-gray-600">Unable to locate the requested test.</p>
        </div>
      </div>
    );

  const userAnswer = currentQuestion?.id
    ? getCurrentUserResponse(currentQuestion?.id)?.userAnswer
    : undefined;

  return (
    <div className="bg-white flex flex-col text-white overflow-hidden h-screen">
      <TestIntroModal
        isOpen={showIntroModal}
        onClose={() => setShowIntroModal(false)}
        testTitle={test?.title || ""}
        testDescription={test?.description}
        passageTitle={currentPassage?.title}
        userScore={userInfo?.score ?? 0}
      />

      {showDefinition && selectedWord && (
        <div
          style={{
            position: "fixed",
            top:
              dictionaryPosition.top !== null
                ? `${dictionaryPosition.top}px`
                : "auto",
            bottom:
              dictionaryPosition.bottom !== null
                ? `${dictionaryPosition.bottom}px`
                : "auto",
            left: `${dictionaryPosition.left}px`,
            zIndex: 1000,
          }}
        >
          <DictionaryLookup
            word={selectedWord}
            onClose={() => setShowDefinition(false)}
          />
        </div>
      )}

      <TestHeader
        ref={testHeaderRef}
        title={test?.title}
        isCreatingTest={isCreatingTest}
        currentQuestionIndex={currentQuestionIndex}
        hasAnsweredFirstQuestion={hasAnsweredFirstQuestion}
        homeLink="/home?tab=CARS"
      />

      <TestToolbar
        onHighlight={handleHighlight}
        onStrikethrough={handleStrikethrough}
        onFlag={handleFlag}
        onToggleVocabList={toggleVocabList}
        showVocabList={showVocabList}
        flashHighlight={flashHighlight}
        flashStrikethrough={flashStrikethrough}
        flashFlag={flashFlag}
        canFlag={currentQuestion?.id ? !!getCurrentUserResponse(currentQuestion.id)?.userAnswer : false}
      />

      <div className="h-7 bg-[#a6a6a6]"></div>

      {/* Main content area */}
      <div className="flex relative flex-grow overflow-hidden text-base">
        {currentPassage && (
          <div className="w-1/2 border-r-4 border-[#006dab] overflow-auto standard-scrollbar">
            <div className="p-4 h-full">
              <PassageComponent
                ref={passageRef}
                passageData={currentPassage}
                onNote={saveNote}
                tempHighlightedStrings={tempHighlightedStrings}
                onFocus={() => handleSetActiveEditor("passage")}
              />
            </div>
          </div>
        )}

        <div
          className={`${currentPassage ? "w-1/2" : "w-full"} flex flex-col relative`}
        >
          <div className="flex-grow overflow-auto standard-scrollbar">
            {currentQuestion && currentTestQuestion ? (
              <>
                <MessageButton />

                {/* AI Chat toggle button with Cat icon */}
                <button
                  className={`
                    absolute top-4 right-4 p-2 rounded-full shadow-lg
                    transition-colors duration-200
                    ${
                      showChatbot
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 text-gray-600 hover:bg-blue-500 hover:text-white"
                    }
                  `}
                  onClick={() => setShowChatbot(!showChatbot)}
                  aria-label="Toggle Chatbot"
                >
                  <Cat className="w-6 h-6" />
                  <span className="sr-only">Toggle Chatbot (Cmd+A)</span>
                </button>

                <QuestionComponent
                  ref={questionRef}
                  question={currentQuestion}
                  onNext={handleNextQuestion}
                  onPrevious={handlePreviousQuestion}
                  isFirst={currentQuestionIndex === 0}
                  isLast={currentQuestionIndex === test?.questions?.length - 1}
                  onAnswer={handleUserResponse}
                  userAnswer={userAnswer}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={test?.questions?.length ?? 0}
                  onFinish={handleFinishTest}
                  isSubmitting={isSubmitting}
                  answeredQuestions={answeredQuestions}
                  onOptionCrossedOut={onOptionCrossedOut}
                  onStartQuestionTimer={() =>
                    testHeaderRef.current?.startQuestionTimer()
                  }
                  onFocus={() => handleSetActiveEditor("question")}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No question available</p>
              </div>
            )}
          </div>

          {/* ChatBotInLine component */}
          {showChatbot && (
            <div className="rounded-lg mx-4 flex-shrink-0 relative">
                <button
                    onClick={() => setShowChatbot(false)}
                    className="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label="Close chatbot"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <ChatBotInLine
                    chatbotContext={chatbotContext}
                    chatbotRef={chatbotRef}
                    question={currentQuestion}
                    handleShowHint={handleShowHint}
                />
            </div>
          )}
        </div>

        {/* Conditionally render the VocabList Sidebar */}
        {showVocabList && (
          <div className="fixed top-0 right-0 p-4 bg-white shadow-lg z-50 w-80 h-full overflow-auto transition-transform transform">
            <VocabList />
            <button
              onClick={toggleVocabList}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              aria-label="Close Vocabulary List"
            >
              Close
            </button>
          </div>
        )}
      </div>

      <div className="bg-[#006dab] h-15 border-t-3 border-sky-500"></div>
      <ScoreDialog
        open={showScorePopup}
        onOpenChange={setShowScorePopup}
        score={score}
        timing={timing}
        correctAnswer={correctAnswer}
        technique={technique}
        totalQuestions={test?.questions?.length ?? 0}
        userTestId={userTest?.id}
        totalTimeTaken={
          testStartTime
            ? Math.round(
                (new Date().getTime() - testStartTime.getTime()) / 1000
              )
            : 0
        }
        difficulty={currentPassage?.difficulty}
      />
    </div>
  );
};

export default TestComponent;
