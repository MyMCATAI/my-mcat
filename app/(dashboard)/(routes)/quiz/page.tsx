"use client";


import React from 'react';
import { useUser } from '@clerk/nextjs';
import  Quiz  from "@/components/quiz";
import {mockMcatQuiz} from './quiz'
// TODO, change this to db
interface QuizData {
  questions: {
    question: string;
    options: string[];
    image?: string;
  }[];
  timeLimit: string;
}

const QuizPage = () => {

  const { user } = useUser();

const typedQuiz = mockMcatQuiz as QuizData;

  return (
    <div className="bg-[#001326] min-h-screen p-8 text-white flex justify-center">
      <div className="max-w-screen-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            
          Welcome {user?.firstName ?? ""} to the Diagnostic quiz
          <Quiz quiz={typedQuiz} shuffle={true}/>

            </h1>
        </div>
        
        
      </div>
    </div>
  );
};

export default QuizPage;