// app/user-test/[id]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { UserTest, UserResponse, Passage, Question } from '@/types';
import PassageComponent from "@/components/test/Passage";
import ReviewQuestionComponent from "./ReviewQuestion";
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function UserTestReviewPage() {
  const [userTest, setUserTest] = useState<UserTest | null>(null);
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const passageCacheRef = useRef<Record<string, Passage>>({});
  const params = useParams();
  const { id } = params;

  const [chatbotContext, setChatbotContext] = useState({
    contentTitle: "",
    context: ""
  });

  useEffect(() => {
    if (id) fetchUserTest(id as string);
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
      const response = await fetch(`/api/user-test/${testId}`);
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

  const handleNextQuestion = () => {
    if (userTest && currentResponseIndex < userTest.responses.length - 1) {
      setCurrentResponseIndex(currentResponseIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentResponseIndex > 0) {
      setCurrentResponseIndex(currentResponseIndex - 1);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;
  if (!userTest) return <div className="text-white">No test found</div>;
  if (!userTest.responses || userTest.responses.length === 0) return <div className="text-white">No responses found for this test</div>;

  const currentResponse = userTest.responses[currentResponseIndex];

  return (
    <div className="relative bg-white h-screen flex flex-col text-white">
      <div className="bg-[#006dab] p-3 flex justify-between items-center border-b-3 border-sky-500">
        <h1 className="text-lg font-semibold">{userTest.test.title} - Review</h1>
        <Link href="/review" className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded transition duration-300">
          Back to Review
        </Link>
      </div>
      <div className="bg-[#a1a1aa] p-4">
        <p>Score: {userTest.score !== null ? `${userTest.score?.toFixed(2)}%` : 'Not scored'}</p>
        <p>Completed: {userTest.finishedAt ? new Date(userTest.finishedAt).toLocaleString() : 'Not finished'}</p>
      </div>
      <div className="flex flex-grow overflow-hidden">
        {currentResponse ? (
          <>
            {currentPassage ? (
              <>
                <div className="w-1/2 border-r-4 border-[#006dab] overflow-auto">
                  <div className="p-4">
                    <PassageComponent 
                      passageData={currentPassage} 
                      allowHighlight={true}
                      highlightActive={false}
                      strikethroughActive={false}
                      onHighlight={() => {}}
                      onStrikethrough={() => {}}
                    />
                  </div>
                </div>
                <div className="w-1/2 flex flex-col">
                  <div className="flex-grow overflow-auto">
                    <ReviewQuestionComponent
                      question={currentResponse.question}
                      userResponse={currentResponse}
                      onNext={handleNextQuestion}
                      onPrevious={handlePreviousQuestion}
                      isFirst={currentResponseIndex === 0}
                      isLast={currentResponseIndex === userTest.responses.length - 1}
                      currentQuestionIndex={currentResponseIndex}
                      totalQuestions={userTest.responses.length}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full flex flex-col">
                <div className="flex-grow overflow-auto">
                  <ReviewQuestionComponent
                    question={currentResponse.question}
                    userResponse={currentResponse}
                    onNext={handleNextQuestion}
                    onPrevious={handlePreviousQuestion}
                    isFirst={currentResponseIndex === 0}
                    isLast={currentResponseIndex === userTest.responses.length - 1}
                    currentQuestionIndex={currentResponseIndex}
                    totalQuestions={userTest.responses.length}
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
      
      {/* Chatbot */}
      <ChatbotWidget chatbotContext={chatbotContext} />
    </div>
  );
}