import React, { useEffect, useState } from "react";
import { Question } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

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
  userAnswer,
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
    console.log("handleAnswerChange", value);

    const isCorrect = value === correctAnswer;
    console.log("isCorrect", isCorrect);
    onAnswer(question.id, value, isCorrect);
  };

  return (
    <div className="bg-[#ffffff] from-blue-900  h-[80vh] p-4 overflow-auto ">
      <Card className="max-w-3xl border-0 shadow-none">
        <CardHeader className=" ">
          <CardTitle className="text-2xl font-bold text-black">
            Question {question.questionID}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-xl mb-6 text-black">{question.questionContent}</p>
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
                  className="border-black text-black"
                />
                <Label
                  htmlFor={`option-${idx}`}
                  className="text-black hover:text-blue-200 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
      <div className="text-[#555555] mt-2 flex justify-start gap-1 items-center">
        <div>
          <p>Discuss </p>
        </div>
        <div className="h-[6px] w-[6px] rounded-[60px] bg-[#555555]"></div>
        <div>
          <p>35</p>
        </div>
      </div>
      <div>
        <div className="flex gap-2">
          <div>
          <Image src="/avatar.jpg" width={50} height={50} alt="exam" />
          </div>
          <div className="w-full">
            <textarea className="border w-full p-2" placeholder="Add a public comment..." rows={3} id=""></textarea>
          </div>
        </div>
      </div>
      <div className="border-b"> </div>

      {/* <div className="flex justify-between mt-6 max-w-3xl mx-auto">
        <Button
          onClick={onPrevious}
          disabled={isFirst}
          variant="outline"
          className="bg-black/10 hover:bg-black/20 text-black"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={isLast}
          variant="outline"
          className="bg-black/10 hover:bg-black/20 text-black"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div> */}
    </div>
  );
};

export default QuestionComponent;
