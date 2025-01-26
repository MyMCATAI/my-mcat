// app/user-test/[id]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserTest, Passage } from '@/types';
import PassageComponent from "@/components/test/Passage";
import ReviewQuestionComponent from "./ReviewQuestion";
import { useUserActivity } from '@/hooks/useUserActivity';

export default function UserTestReviewPage() {
  const { startActivity, updateActivityEndTime } = useUserActivity();
  const [userTest, setUserTest] = useState<UserTest | null>(null);
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const passageCacheRef = useRef<Record<string, Passage>>({});
  const params = useParams();
  const id = params?.id;

  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: ""
  });

  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);

  useEffect(() => {
    const initializeActivity = async () => {
      const activity = await startActivity({
        type: 'review',
        location: "CARs",
        metadata: {
          initialLoad: true,
          testId: id,
          timestamp: new Date().toISOString()
        }
      });

      if (activity) {
        setCurrentActivityId(activity.id);
      }
    };

    initializeActivity();
  }, []);

  useEffect(() => {
    if (!currentActivityId) return;

    const intervalId = setInterval(() => {
      updateActivityEndTime(currentActivityId);
    }, 300000); // Update every 5 minutes

    return () => clearInterval(intervalId);
  }, [currentActivityId]);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchUserTest(id);
    } else if (Array.isArray(id)) {
      fetchUserTest(id[0]); // Use the first id if it's an array
    }
  }, [id]);

  useEffect(() => {
    if (userTest && userTest.responses.length > 0) {
      const currentResponse = userTest.responses[currentResponseIndex];
      if (currentResponse?.question?.passageId) {
        updateCurrentPassage(currentResponse.question.passageId);
      } else {
        setCurrentPassage(null);
      }

      const correctAnswer = JSON.parse(currentResponse.question?.questionOptions || "[]")[0];
      const answernotes = currentResponse.question?.questionAnswerNotes
      const contextText = 
      (currentPassage?.text ? `Here's a passage that I'm looking at right now, use it as context for your answers: ${currentPassage.text}\n` : '') +
      (currentResponse?.question?.questionContent ? `Here's the question I'm currently looking at: ${currentResponse.question.questionContent}\n` : '') +
      (correctAnswer ? `The correct answer is: ${correctAnswer}\n` : '') +
      (answernotes ? `Here are some notes on why: ${answernotes}` : '');
      // Update chatbot context
      setChatbotContext({
        contentTitle: userTest.test.title,
        context: contextText
      });
    }
  }, [userTest, currentResponseIndex, currentPassage]);

  const fetchUserTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/user-test/${testId}?includeQuestionInfo=true`);
      if (!response.ok) throw new Error('Failed to fetch user test');
      const data = await response.json();
      setUserTest(data);
    } catch (err) {
      setError('Error fetching user test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const updateCurrentPassage = async (passageId: string) => {
    if (passageCacheRef.current[passageId]) {
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

  const handleNextQuestion = () => {
    if (userTest && currentResponseIndex < userTest.responses.length - 1) {
      setCurrentResponseIndex(currentResponseIndex + 1);
      updateActivityEndTime(currentActivityId);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentResponseIndex > 0) {
      setCurrentResponseIndex(currentResponseIndex - 1);
      updateActivityEndTime(currentActivityId);
    }
  };
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
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
  
  if (!userTest) return (
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
  
  if (!userTest.responses || userTest.responses.length === 0) return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Responses Found</h2>
        <p className="text-gray-600">There are no responses available for this test.</p>
      </div>
    </div>
  );

  const currentResponseFromUserTest = userTest.responses[currentResponseIndex];

  return (
    <div className="relative bg-white h-screen flex flex-col text-white">
      <div className="bg-[#002355] p-3 flex justify-between items-center border-b-3 border-sky-500">
        <h1 className="text-lg font-semibold">{userTest.test.title} - Review</h1>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm">Score: {userTest.score !== null ? `${userTest.score?.toFixed(2)}%` : 'Not scored'}</p>
            <p className="text-sm">Completed: {userTest.finishedAt ? new Date(userTest.finishedAt).toLocaleString() : 'Not finished'}</p>
            {userTest.startedAt && userTest.finishedAt && (
              <p className={`text-sm ${
                (() => {
                  const timeTaken = new Date(userTest.finishedAt).getTime() - new Date(userTest.startedAt).getTime();
                  const minutes = Math.floor(timeTaken / 60000);
                  if (minutes > 10) return 'text-red-500';
                  if (minutes > 5) return 'text-orange-500';
                  return 'text-green-500';
                })()
              }`}>
                Time taken: {(() => {
                  const timeTaken = new Date(userTest.finishedAt).getTime() - new Date(userTest.startedAt).getTime();
                  const minutes = Math.floor(timeTaken / 60000);
                  const seconds = Math.floor((timeTaken % 60000) / 1000);
                  return `${minutes}m ${seconds}s`;
                })()}
              </p>
            )}
          </div>
          <Link href={`/home?tab=CARS`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded transition duration-300">
            Return Home
          </Link>
        </div>
      </div>
      <div className="flex flex-grow overflow-hidden">
        {currentResponseFromUserTest ? (
          <>
            {currentPassage ? (
              <>
                <div className="w-1/2 border-r-4 border-[#006dab] overflow-hidden flex flex-col">
                  <div className="flex-grow overflow-auto">
                    <PassageComponent 
                      passageData={currentPassage} 
                      userResponse={currentResponseFromUserTest}
                      onNote={()=>{console.log("note")}}
                    />
                  </div>
                </div>
                <div className="w-1/2 flex flex-col">
                  <div className="flex-grow overflow-auto">
                    <ReviewQuestionComponent
                      question={currentResponseFromUserTest.question}
                      passageData={currentPassage}
                      userResponse={currentResponseFromUserTest}
                      onNext={handleNextQuestion}
                      onPrevious={handlePreviousQuestion}
                      isFirst={currentResponseIndex === 0}
                      isLast={currentResponseIndex === userTest.responses.length - 1}
                      currentQuestionIndex={currentResponseIndex}
                      totalQuestions={userTest.responses.length}
                      testTitle={userTest.test.title}
                      />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full flex flex-col">
                <div className="flex-grow overflow-auto">
                  <ReviewQuestionComponent
                      question={currentResponseFromUserTest.question}
                      userResponse={currentResponseFromUserTest}
                      onNext={handleNextQuestion}
                      onPrevious={handlePreviousQuestion}
                      isFirst={currentResponseIndex === 0}
                      isLast={currentResponseIndex === userTest.responses.length - 1}
                      currentQuestionIndex={currentResponseIndex}
                      totalQuestions={userTest.responses.length}
                      testTitle={userTest.test.title} 
                      />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full flex flex-col justify-center items-center">
            <p className="text-black flex justify-center items-center">No response data available for this question.</p>
          </div>
        )}
      </div>
    </div>
  );
}
