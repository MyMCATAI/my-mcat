import React, { useState, useEffect } from 'react';
import { Question, UserResponse } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PassageData } from '@/components/test/Passage';

interface ReviewQuestionComponentProps {
  question?: Question;
  passageData?: PassageData;
  userResponse: UserResponse;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ReviewQuestionComponent: React.FC<ReviewQuestionComponentProps> = ({
  question,
  userResponse,
  passageData,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  currentQuestionIndex,
  totalQuestions
}) => {
  const [explanations, setExplanations] = useState<string[]>([]);
  const [selectedExplanationIndex, setSelectedExplanationIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExplanationsOpen, setIsExplanationsOpen] = useState(false);
  const [defense, setDefense] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showExplanations, setShowExplanations] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setDefense('');
    setAiResponse('');
    setShowExplanations(false);
  }, [question]);

  useEffect(() => {
    if (question) {
      const options = JSON.parse(question.questionOptions);
      const answerNotes = JSON.parse(question.questionAnswerNotes || '[]');
      setExplanations(answerNotes);
      const userAnswerIndex = options.indexOf(userResponse.userAnswer);
      setSelectedExplanationIndex(userAnswerIndex);

      const correctAnswer = options[0];
      const userAnswer = options[userAnswerIndex];

      const context = `
      I'm reviewing a test question I've answered, here's some context

      ${passageData ? "Questions Passage: " + passageData.text : ""} \n
      Question: ${question.questionContent} \n
      Options: ${question.questionOptions} \n
      Correct Answer: ${correctAnswer} \n
      My Answer: ${userAnswer} \n
      Result: ${userResponse.isCorrect ? 'Correct' : 'Incorrect'} \n
      Time Spent: ${userResponse.timeSpent || "0"} seconds \n
      ${userResponse.isCorrect? "": `Explanation for my answer: ${answerNotes[userAnswerIndex] || 'No explanation available.'} \n`}
      
      Explanation for correct answer: ${answerNotes[0] || 'No explanation available.'} \n
            
      I'm going to explain my line of thinking and defend my answer, help me use this context to learn.
      `.trim();

      setChatMessages([{ role: 'user', content: context }, { role: 'assistant', content: "Ok, thank you for the context, now send me your defense for why you chose that answer." }]);
    }
  }, [question, userResponse, passageData]);
  const handleSubmitDefense = async () => {
    if (!defense.trim()) return;
    setIsLoading(true);

    try {
      setHasSubmitted(true);

      const context = `
        Here's my answer: ${userResponse.userAnswer}
        \n
        and here's my reasoning for it: ${defense}
        
        Please provide feedback on my answer. Be encouraging but also point out any misunderstandings.
      `;

      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: defense,
          context,
          assistantId: "asst_61EMvczy4MpaJqUObrWceV9V", // todo, put this in env
          generateAudio: false,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      setAiResponse(data.message);
      setShowExplanations(true);
    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Sorry, there was an error processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!question) return null;
  const options = JSON.parse(question.questionOptions);
  const correctAnswerIndex = 0; // Assuming the correct answer is always the first option

  const getOptionClass = (index: number) => {
    if (index === correctAnswerIndex && showExplanations) {
      return 'bg-green-500 text-white';
    }
    if (index === options.indexOf(userResponse.userAnswer) && !userResponse.isCorrect && showExplanations) {
      return 'bg-red-500 text-white';
    }
    if (index === selectedExplanationIndex) {
      return 'bg-blue-500 text-white';
    }
    return 'bg-gray-200 text-black hover:bg-gray-300 cursor-pointer';
  };

  const handleOptionClick = (index: number) => {
    setSelectedExplanationIndex(index);
  };

  return (
    <div className="p-6 bg-white text-black h-full flex flex-col text-sm">
      <h2 className="text-lg font-semibold mb-4">Question {currentQuestionIndex + 1} of {totalQuestions}</h2>
      <div className="mb-4 flex-grow overflow-auto">
        <h3 className="font-medium mb-2">{question.questionContent}</h3>
        <div className="mt-4">
          {options.map((option: string, index: number) => (
            <div 
              key={index} 
              className={`p-3 mb-2 rounded ${getOptionClass(index)}`}
              onClick={() => handleOptionClick(index)}
            >
              {option}
            </div>
          ))}
        </div>
        
        <h4 className="font-semibold mb-2">Defend your answer:</h4>
        {!hasSubmitted ?
        <div className="mt-4">
        <div className="flex items-center justify-center m-2">
          <Textarea
            value={defense}
            onChange={(e) => setDefense(e.target.value)}
            placeholder="Explain your reasoning..."
            className="flex-grow mr-2"
            disabled={hasSubmitted}
          />
          <div className="flex items-center justify-center ">
          <Button 
            onClick={handleSubmitDefense} 
            disabled={isLoading || hasSubmitted || !defense}
            className="self-start"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
          </div>

        </div>
      </div>
        : (
          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <div className="mb-2 flex justify-end">
              <p className="inline-block p-2 rounded-lg bg-white max-w-[80%]">{defense}</p>
            </div>
            <div className="mb-1 flex justify-start">
              <span className="text-sm text-gray-600 ml-2">Kalypso 🐱</span>
            </div>
            <div className="flex justify-start">
              <p className="inline-block p-2 rounded-lg bg-blue-100 text-blue-800 max-w-[80%]">{aiResponse}</p>
            </div>
          </div>
        )}
            <div className="max-h-[400px] overflow-y-auto">
            {showExplanations && (
        <Collapsible
          open={isExplanationsOpen}
          onOpenChange={setIsExplanationsOpen}
          className="mt-4 border border-gray-200 rounded-lg"
        >
          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 font-semibold">
            Explanations and Details
            {isExplanationsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            <p><strong>Your answer:</strong> {userResponse.userAnswer}</p>
            <p><strong>Time spent:</strong> {userResponse.timeSpent || "0"} seconds</p>
            <p><strong>Correct answer:</strong> {options[correctAnswerIndex]}</p>
            <p className={userResponse.isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {userResponse.isCorrect ? "Correct" : "Incorrect"}
            </p>

            {selectedExplanationIndex !== null && (
              <div className="mt-4">
                <h4 className="font-semibold">Explanation for selected answer:</h4>
                <p className={`p-3 rounded ${selectedExplanationIndex === correctAnswerIndex ? 'bg-green-100' : 'bg-red-100'}`}>
                  {explanations[selectedExplanationIndex]}
                </p>
              </div>
            )}

            {selectedExplanationIndex !== correctAnswerIndex && (
              <div className="mt-4">
                <h4 className="font-semibold">Explanation for correct answer:</h4>
                <p className="bg-green-100 p-3 rounded">{explanations[correctAnswerIndex]}</p>
              </div>
            )}

            {userResponse.userNotes && (
              <div className="mt-4">
                <h4 className="font-semibold">Your notes:</h4>
                <p className="bg-blue-100 p-3 rounded">{userResponse.userNotes}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

            </div>
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={onPrevious}
          disabled={isFirst}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ReviewQuestionComponent;