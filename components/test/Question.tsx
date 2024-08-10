import React, { useEffect, useState } from "react";
import { Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

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
  const [randomNumber, setRandomNumber] = useState(0);
  const [randomizedOptions, setRandomizedOptions] = useState<string[]>([]);
  const options = JSON.parse(question.questionOptions);
  const correctAnswer = options[0];

  useEffect(() => {
    setRandomNumber(Math.floor(Math.random() * 21));
    setRandomizedOptions([...options].sort(() => Math.random() - 0.5));
  }, [question]);

  const handleAnswerChange = (value: string) => {
    onAnswer(question.id, value, value === correctAnswer);
  };

  return (
    <div className="min-h-screen p-6 rounded-t-lg bg-[#001326]">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-xl mb-6 text-gray-800 font-medium">{question.questionContent}</p>
          <RadioGroup
            onValueChange={handleAnswerChange}
            value={userAnswer}
            className="space-y-4"
          >
            {randomizedOptions.map((option: string, idx: number) => (
              <div key={idx} className="relative">
                <RadioGroupItem
                  value={option}
                  id={`option-${idx}`}
                  className="absolute opacity-0 w-full h-full cursor-pointer"
                />
                <Label
                  htmlFor={`option-${idx}`}
                  className={`block p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                    ${userAnswer === option 
                      ? 'bg-blue-100 border-blue-500 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between w-full">
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
          <Progress value={(currentQuestionIndex + 1) / totalQuestions * 100} className="w-full" />
        </CardFooter>
      </Card>

      {/* <Card className="max-w-3xl mx-auto mt-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700 flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            Discussion ({randomNumber})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarImage src="/avatar.jpg" alt="User" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <Textarea 
                placeholder="Add a public comment..."
                className="w-full resize-none"
                rows={3}
              />
              <Button className="mt-2" variant="secondary">Post</Button>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default QuestionComponent;