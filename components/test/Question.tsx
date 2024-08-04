import React, { useEffect, useState } from "react";
import { Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

const QuestionComponent: React.FC<QuestionsProps> = ({
  question,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  onAnswer,
  userAnswer
}) => {
  const [randomizedOptions, setRandomizedOptions] = useState<string[]>([]);
  const options = JSON.parse(question.questionOptions);
  const correctAnswer = options[0];

  useEffect(() => {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setRandomizedOptions(shuffled);
  }, [question]);

  const handleAnswerChange = (value: string) => {
    console.log("handleAnswerChange",value)
    
    const isCorrect = value === correctAnswer;
    console.log("isCorrect",isCorrect)
    onAnswer(question.id, value, isCorrect);
  };

  return (
    <div className="bg-gradient-to-b from-blue-900 to-blue-950 min-h-screen p-4 md:p-8 mt-2">
      <Card className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md shadow-xl">
        <CardHeader className="border-b border-white/20">
          <CardTitle className="text-2xl font-bold text-white">
            Question {question.questionID}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-xl mb-6 text-white">{question.questionContent}</p>
          <RadioGroup
            onValueChange={handleAnswerChange}
            value={userAnswer}
            className="space-y-4"
          >
            {randomizedOptions.map((option: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`option-${idx}`}
                  className="border-white text-white"
                />
                <Label
                  htmlFor={`option-${idx}`}
                  className="text-white hover:text-blue-200 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6 max-w-3xl mx-auto">
        <Button
          onClick={onPrevious}
          disabled={isFirst}
          variant="outline"
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={isLast}
          variant="outline"
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionComponent;