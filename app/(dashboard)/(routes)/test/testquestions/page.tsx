"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import PassageComponent from "@/components/test/Passage";
import QuestionComponent from "@/components/test/Question";
import { Test, TestQuestion, Passage, Question } from "@/types";

const TestQuestions = () => {
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const passageCacheRef = useRef<Record<string, Passage>>({});
  const searchParams = useSearchParams();
  const testId = searchParams.get('id');

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
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;
  if (!test) return <div className="text-white">No test found</div>;

  const currentTestQuestion = getCurrentTestQuestion();
  const currentQuestion = getCurrentQuestion();

  return (
    <div className="bg-[#001326] min-h-[80vh] text-black flex justify-center flex-col">
      <div className="max-w-full w-full flex-grow">
        <div className="bg-gray-800 text-white p-4 flex justify-between border-b-2 border-sky-500">
          <h1 className="text-white text-lg font-semi-bold mb-0 mt-2">
            {test.title}
          </h1>
          <p className="">Timer</p>
        </div>
        <div className="flex flex-row h-screen">
          <div className="w-1/2 border-r border-sky-500">
            {currentPassage && <PassageComponent passageData={currentPassage} />}
          </div>
          <div className="w-1/2">
            {currentQuestion && (
              <QuestionComponent
                question={currentQuestion} 
                onNext={handleNextQuestion}
                onPrevious={handlePreviousQuestion}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === test.questions.length - 1}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuestions;