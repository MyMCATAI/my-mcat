import React, { useEffect, useState } from "react";
import { Question } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionsProps {
  question: Question;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  onAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;
  userAnswer?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

const QuestionComponent: React.FC<QuestionsProps> = ({
  question,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  onAnswer,
  userAnswer,
  currentQuestionIndex,
  totalQuestions,
}) => {
  const [randomizedOptions, setRandomizedOptions] = useState<string[]>([]);
  const options = JSON.parse(question.questionOptions);
  const correctAnswer = options[0];

  useEffect(() => {
    setRandomizedOptions([...options].sort(() => Math.random() - 0.5));
  }, [question]);

  const handleAnswerChange = (value: string) => {
    onAnswer(question.id, value, value === correctAnswer);
  };

  return (
    <div className="flex flex-col items-center px-6 font-serif text-black">
      <div className="w-full max-w-3xl flex flex-col">
        <h2 className="text-lg mt-2 font-bold mb-4 pt-6">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </h2>
        <div className="max-h-[70vh] overflow-y-auto mb-4">
          <p className="text-lg mb-6">{question.questionContent}</p>
          <RadioGroup
            onValueChange={handleAnswerChange}
            value={userAnswer}
            className="space-y-4"
          >
            {randomizedOptions.map((option: string, idx: number) => (
              <div key={idx} className="flex items-center">
                <RadioGroupItem
                  value={option}
                  id={`option-${idx}`}
                  className="mr-3"
                />
                <Label
                  htmlFor={`option-${idx}`}
                  className="text-lg cursor-pointer flex-grow"
                >
                  <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex justify-between w-full mt-4">
          <Button
            onClick={onPrevious}
            disabled={isFirst}
            variant="outline"
            className="bg-white hover:bg-blue-50 text-blue-600"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button
            onClick={onNext}
            disabled={isLast}
            variant="outline"
            className="bg-white hover:bg-blue-50 text-blue-600"
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionComponent;