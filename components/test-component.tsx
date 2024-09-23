'use client'

import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import axios from 'axios';
import { useStopwatch } from 'react-timer-hook';
import PassageComponent from "@/components/test/Passage";
import QuestionComponent from "@/components/test/Question";
import { Test, TestQuestion, Passage, Question, UserResponse } from "@/types";
import { Pencil, Highlighter, Flag, Cat } from 'lucide-react';
import ChatBotInLine from '@/components/chatbot/ChatBotInLine';
import Link from 'next/link';
import ScoreDialog from '@/components/ScoreDialog';
import TestHeader, { TestHeaderRef } from '@/components/test/TestHeader';
import DictionaryLookup from './DictionaryLookup';
import { VocabContext } from '@/contexts/VocabContext';
import VocabList from '@/components/VocabList';

interface TestComponentProps {
  testId: string;
  onTestComplete?: (score: number) => void;
}

interface DictionaryPosition {
  top: number | null;
  bottom: number | null;
  left: number;
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

  const [testStartTime, setTestStartTime] = useState<Date | null>(null);

  const [finalScore, setFinalScore] = useState(0);

  const [numberOfPassageHighlights, setNumberOfPassageHighlights] = useState(0);
  const [numberOfPassageStrikethroughs, setNumberOfPassageStrikethroughs] = useState(0);
  const [totalOptionsCrossedOut, setTotalOptionsCrossedOut] = useState(0);


  const [flashHighlight, setFlashHighlight] = useState(false);
  const [flashStrikethrough, setFlashStrikethrough] = useState(false);
  const [flashFlag, setFlashFlag] = useState(false);
  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: ""
  });
  const [showChatbot, setShowChatbot] = useState(false);
  const [highlightedStrings, setHighlightedStrings] = useState<string[]>([]);
  const [tempHighlightedStrings, setTempHighlightedStrings] = useState<string[]>([]); // Temporary highlights
  const passageRef = useRef<{ applyStyle: (style: string) => void } | null>(null);
  const questionRef = useRef<{ applyStyle: (style: string) => void } | null>(null);
  const testHeaderRef = useRef<TestHeaderRef>(null);

  const [score, setScore] = useState(0);
  const [timing, setTiming] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [technique, setTechnique] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showDefinition, setShowDefinition] = useState(false);
  const [dictionaryPosition, setDictionaryPosition] = useState<DictionaryPosition>({ top: null, bottom: null, left: 0 });

  const { isCmdIEnabled, toggleCmdI, addVocabWord, removeVocabWord, showVocabList, toggleVocabList, vocabList } = useContext(VocabContext);

  
  const passageStorageKey = test?.id && currentPassage?.id ? `passage-${test.id}-${currentPassage.id}` : undefined;


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
    testHeaderRef.current?.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const encodedPassageId = encodeURIComponent(passageId);
        const response = await fetch(`/api/passage?id=${encodedPassageId}`);
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

    const timeSpent = testHeaderRef.current?.getElapsedTime() || 0;
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      console.error("No current question found");
      return;
    }

    const timestamp = new Date().toISOString();
    const formattedAction = `[${timestamp}] - Answered: "${userAnswer}" (${isCorrect ? 'Correct' : 'Incorrect'})`;

    const existingResponse = getCurrentUserResponse(questionId);
    let updatedUserNotes = formattedAction;
    if (existingResponse?.userNotes) {
      updatedUserNotes = `${existingResponse.userNotes}\n${formattedAction}`;
    }

    const optimisticResponse: UserResponse = {
      id: `temp-${questionId}`,
      userTestId: currentUserTest.id,
      questionId,
      userAnswer,
      isCorrect,
      timeSpent,
      userNotes: updatedUserNotes,
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

    if (!getCurrentUserResponse(questionId)?.userAnswer) {
      setAnsweredQuestions(prev => prev + 1);
    }

    console.log("User Response:", userAnswer);
    console.log("Is Correct:", isCorrect);
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
          userNotes: updatedUserNotes,
          answeredAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(`Failed to save user response: ${response.status} ${response.statusText}`);
      }

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

      // Update chatbot context
      setChatbotContext(prevContext => ({
        ...prevContext,
        context: `${prevContext.context}\n\nI just answered this question: "${currentQuestion.questionContent}"\nMy answer was: "${userAnswer}" (${isCorrect ? 'Correct' : 'Incorrect'})`
      }));

      console.log('Answer log appended and context updated successfully');
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
      setTestStartTime(new Date()); 
      return data;
    } catch (err) {
      console.error('Error creating user test:', err);
      return null;
    } finally {
      setIsCreatingTest(false);
    }
  };

  const calculateScore = (totalTimeInSeconds: number) => {
    if (!test) return { score: 0, correctAnswers: 0, technique: 0 };
  
    const totalQuestions = test.questions.length;
    const responses = Object.values(userResponses);
  
    // Calculate correct answers
    const correctAnswers = responses.filter(r => r.isCorrect).length;
    const score = (correctAnswers / totalQuestions) * 100;
  
    let technique = 0;
  
    // Calculate total passage marks
    const totalPassageMarks = numberOfPassageHighlights + numberOfPassageStrikethroughs;
  
    // Points from passage marks
    if (totalPassageMarks >= 2) {
      technique += 2;
    } else if (totalPassageMarks >= 1) {
      technique += 1;
    }
  
    // Points from options crossed out
    if (totalOptionsCrossedOut >= totalQuestions) {
      technique += 2;
    } else if (totalOptionsCrossedOut >= totalQuestions / 2) {
      technique += 1;
    }
  
    return { score, correctAnswers, technique };
  };


  const handleFinishTest = async () => {
    setIsSubmitting(true);
    if (!userTest || !testStartTime) return;
  
    const testFinishTime = new Date();
    const totalTimeInSeconds = Math.round((testFinishTime.getTime() - testStartTime.getTime()) / 1000);
  
    const { score, correctAnswers, technique } = calculateScore(totalTimeInSeconds);
  
    setScore(score);
    setCorrectAnswer(correctAnswers);
    setTiming(totalTimeInSeconds);
    setTechnique(technique);
  
    try {
      // Update the user test record
      const response = await fetch(`/api/user-test/${userTest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, finishedAt: testFinishTime.toISOString(), totalTime: totalTimeInSeconds }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update test');
      }
  
      // Determine the number of cupcakes (points) earned
      let cupcakesEarned = 0;
      if (score === 100) {
        cupcakesEarned = 3;
      } else if (score >= 60) {
        cupcakesEarned = 2;
      } else {
        cupcakesEarned = 1;
      }
  
      // Update the user's score
      const scoreResponse = await fetch('/api/user-info/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cupcakesEarned }),
      });
  
      if (!scoreResponse.ok) {
        throw new Error('Failed to update user score');
      }
  
      const updatedUserInfo = await scoreResponse.json();
      console.log('User score updated:', updatedUserInfo.score);
  
      setShowScorePopup(true);
      onTestComplete && onTestComplete(score);
  
    } catch (err) {
      console.error('Error finishing test:', err);
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
    
    if (currentTestQuestion) {
      const { question } = currentTestQuestion;      
      return question;
    }
  
    return null;
  };

  const handleNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      testHeaderRef.current?.reset();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      testHeaderRef.current?.reset();
    }
  };

  const getCurrentUserResponse = useCallback((questionId: string): UserResponse | undefined => {
    const responseId = questionIdToResponseId[questionId];
    return userResponses[responseId] || pendingResponses[questionId];
  }, [questionIdToResponseId, userResponses, pendingResponses]);

  useEffect(() => {
    if (currentPassage) {
      const currentQuestion = getCurrentQuestion();
      setChatbotContext({
        contentTitle: "writing a practice test on " + currentPassage.id,
        context: `I'm currently reading this passage: ${currentPassage.text}\n\nThe question I'm considering is: ${currentQuestion?.questionContent}\n\nOnly refer to this if I ask about what I'm currently studying.`
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPassage, currentQuestionIndex]);

  const handleHighlight = () => {
    setFlashHighlight(true);
    passageRef.current?.applyStyle('HIGHLIGHT');
    questionRef.current?.applyStyle('HIGHLIGHT');
    setNumberOfPassageHighlights(prev => prev + 1);
    setTimeout(() => setFlashHighlight(false), 300);
  };

  const handleStrikethrough = () => {
    setFlashStrikethrough(true);
    passageRef.current?.applyStyle('STRIKETHROUGH');
    questionRef.current?.applyStyle('STRIKETHROUGH');
    setNumberOfPassageStrikethroughs(prev => prev + 1);
    setTimeout(() => setFlashStrikethrough(false), 300);
  };

  const onOptionCrossedOut = (optionText: string) => {
    // Save a note in the userResponse
    saveNote(`crossed out option: ${optionText}`);
  
    // Increment the total options crossed out counter
    setTotalOptionsCrossedOut(prev => prev + 1);
  };
  
  
 
  const saveNote = async (text: string) => {
    console.log("Starting saveNote function",text);
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

    if (!currentUserTest) {
      console.error("UserTest is still null after creation attempt");
      return;
    }

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      console.error("No current question found");
      return;
    }

    const existingResponse = getCurrentUserResponse(currentQuestion.id);
    const timeSpent = testHeaderRef.current?.getElapsedTime() || 0;

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
        context: `${prevContext.context}\n\nHere's something I just noted about the passage\n${text}`
      }));

    } catch (err) {
      console.error('Error saving user response:', err);
    }
  };

  const handleFlag = async () => {
    setFlashFlag(true);
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !userTest) {
      console.error('No current question or user test available');
      setFlashFlag(false);
      return;
    }

    const existingResponse = getCurrentUserResponse(currentQuestion.id);
    const responseId = questionIdToResponseId[currentQuestion.id];

    if (!existingResponse) {
      console.error('No existing response found');
      setFlashFlag(false);
      return;
    }

    try {
      const response = await fetch(`/api/user-test/response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTestId: userTest.id,
          questionId: currentQuestion.id,
          flagged: !existingResponse.flagged
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update flag status');
      }

      const savedResponse: UserResponse = await response.json();

      setUserResponses(prev => ({
        ...prev,
        [responseId]: savedResponse
      }));

      console.log('Question flag status updated successfully');
    } catch (err) {
      console.error('Error updating question flag status:', err);
    } 
  };

  // Function to extract quoted strings from context text
  function extractQuotedStrings(inputText: string): string[] {
    const regex = /"([^"]+)"/g;
    const matches = [];
    let match;
    while ((match = regex.exec(inputText)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  const handleShowHint = (responseText: string) => {
    const quotedStrings = extractQuotedStrings(responseText);
    setTempHighlightedStrings(quotedStrings);

    // Clear the temporary highlights after 5 seconds
    setTimeout(() => {
      setTempHighlightedStrings([]);
    }, 5000);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.metaKey && event.key === 'i') {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        const word = selection.toString().trim();

        // Always fetch the definition and add to vocabList
        fetchDefinitionAndAddToVocab(word);

        // If Command-I is enabled, perform dictionary lookup
        if (isCmdIEnabled) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;

          const isBottomThird = rect.bottom > (viewportHeight * 2 / 3);

          const leftPosition = Math.min(rect.left + rect.width, viewportWidth - 300);

          setDictionaryPosition({
            top: isBottomThird ? null : rect.bottom + 10,
            bottom: isBottomThird ? viewportHeight - rect.top + 10 : null,
            left: leftPosition
          });

          setSelectedWord(word);
          setShowDefinition(true);
        }
      }
    }
  }, [isCmdIEnabled]);

  // New function to fetch definition and add to vocab list
  const fetchDefinitionAndAddToVocab = async (word: string) => {
    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      const data = response.data[0];
      const uniqueDefinitions = data.meanings.reduce((acc: any[], meaning: any) => {
        if (!acc.some((def: any) => def.partOfSpeech === meaning.partOfSpeech)) {
          acc.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: meaning.definitions[0].definition,
          });
        }
        return acc;
      }, []);

      const allDefinitions = uniqueDefinitions.map((def: any) => 
        `(${def.partOfSpeech}) ${def.definition}`
      ).join('; ');

      addVocabWord(word, allDefinitions);
      console.log(`Added "${word}" to vocabList with definition`);
    } catch (err) {
      console.error('Error fetching definition:', err);
      addVocabWord(word, ''); // Add word with empty definition if fetch fails
      console.log(`Added "${word}" to vocabList without definition`);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (!test) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Test Found</h2>
        <p className="text-gray-600">Unable to locate the requested test.</p>
      </div>
    </div>
  );

  const currentTestQuestion = getCurrentTestQuestion();
  const currentQuestion = getCurrentQuestion();
 
  const userAnswer = currentQuestion?.id ? getCurrentUserResponse(currentQuestion?.id)?.userAnswer : undefined

  return (
    <div className="bg-white flex flex-col text-white overflow-hidden h-screen">
      {showDefinition && selectedWord && (
        <div 
          style={{
            position: 'fixed',
            top: dictionaryPosition.top !== null ? `${dictionaryPosition.top}px` : 'auto',
            bottom: dictionaryPosition.bottom !== null ? `${dictionaryPosition.bottom}px` : 'auto',
            left: `${dictionaryPosition.left}px`,
            zIndex: 1000
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
      />

      {/* Toolbar with highlight, strikethrough, flag, and vocab list toggle */}
      <div className="h-9 border-t-2 border-b-2 border-white bg-[#84aedd] flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <button
            className={`px-3 py-1 rounded transition-colors duration-200 flex items-center ${
              flashHighlight
                ? 'bg-transparent text-yellow-300'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            onClick={handleHighlight}
            aria-label="Highlight"
          >
            <Highlighter className="w-4 h-4 mr-2" />
            Highlight
          </button>
          <button
            className={`px-3 py-1 rounded transition-colors duration-200 flex items-center ${
              flashStrikethrough
                ? 'bg-transparent text-yellow-300'
                : 'bg-transparent text-white hover:bg-white/10'
            }`}
            onClick={handleStrikethrough}
            aria-label="Strikethrough"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Strikethrough
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVocabList}
            className={`rounded px-2 transition-colors duration-200 flex items-center ${
              showVocabList ? 'bg-blue-500' : 'bg-transparent'
            } text-white hover:bg-blue-600`}
            aria-label={showVocabList ? "Hide Vocabulary List" : "Show Vocabulary List"}
          >
            📚
          </button>
          <button
            className={`px-3 py-1 rounded transition-colors duration-200 flex items-center ${
              flashFlag
                ? 'bg-transparent text-yellow-300'
                : currentQuestion && getCurrentUserResponse(currentQuestion.id)
                ? 'bg-transparent text-white hover:bg-white/10'
                : 'bg-transparent text-gray-400 cursor-not-allowed'
            }`}
            onClick={handleFlag}
            aria-label="Flag for Review"
            disabled={currentQuestion?.id ? !getCurrentUserResponse(currentQuestion?.id)?.userAnswer : true}
          >
            <Flag className="w-4 h-4 mr-2" />
            Flag for Review
          </button>
        </div>
      </div>

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
            />
            </div>
          </div>
        )}

        <div className={`${currentPassage ? 'w-1/2' : 'w-full'} flex flex-col relative`}>
          <div className="flex-grow overflow-auto standard-scrollbar">
            {currentQuestion && currentTestQuestion ? (
              <>
                {/* AI Chat toggle button with Cat icon */}
                <button
                  className={`
                    absolute top-4 right-4 p-2 rounded-full shadow-lg
                    transition-colors duration-200
                    ${showChatbot 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-300 text-gray-600 hover:bg-blue-500 hover:text-white'}
                  `}
                  onClick={() => setShowChatbot(!showChatbot)}
                  aria-label="Toggle Chatbot"
                >
                  <Cat className="w-6 h-6" />
                </button>

                <QuestionComponent
                  ref={questionRef}
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
                  answeredQuestions={answeredQuestions}
                  onOptionCrossedOut={onOptionCrossedOut}
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
            <div className="rounded-lg mx-4 flex-shrink-0">
              <ChatBotInLine
                chatbotContext={chatbotContext}
                isVoiceEnabled={false}
                width="100%"
                backgroundColor="white"
                handleShowHint={handleShowHint}
                question={currentQuestion}
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
        totalQuestions={test.questions.length}
        userTestId={userTest?.id}
        totalTimeTaken={testStartTime ? Math.round((new Date().getTime() - testStartTime.getTime()) / 1000) : 0}
      />
    </div>
  );
};

export default TestComponent;