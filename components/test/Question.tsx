import React, { useMemo, useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Question } from "@/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Editor, EditorState, ContentState, RichUtils, convertToRaw, convertFromRaw, DraftHandleValue } from 'draft-js';
import 'draft-js/dist/Draft.css';

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
  onFinish: () => void;
  isSubmitting: boolean;
  answeredQuestions: number;
  onOptionCrossedOut: (optionText: string) => void;
}

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const preprocessContent = (content: string): string => {
  const specialChars = ['I.', 'II.', 'III.'];
  let lines = content.split('\n');

  lines = lines.map(line => {
    specialChars.forEach((char, index) => {
      const regex = new RegExp(`^\\s*([IVX]+\\.)`);
      const match = line.match(regex);
      if (match) {
        line = line.replace(regex, specialChars[index]);
      }
    });
    return line;
  });

  // Combine lines that were incorrectly split
  lines = lines.reduce((acc, line, index) => {
    if (index === 0 || line.match(/^[I.]+\./)) {
      acc.push(line);
    } else {
      acc[acc.length - 1] += ' ' + line;
    }
    return acc;
  }, [] as string[]);

  // Add newlines before Roman numerals if they're not at the start of a line
  lines = lines.flatMap(line => {
    const parts = line.split(/(\s+[I.]+\.)/);
    return parts.map(part => part.trim()).filter(Boolean);
  });

  // Join Roman numerals with their content, add indentation, and extra newline before first Roman numeral
  let firstRomanNumeralFound = false;
  lines = lines.reduce((acc, line, index) => {
    if (specialChars.includes(line) && index < lines.length - 1) {
      if (!firstRomanNumeralFound) {
        acc.push(''); // Add an extra empty line before the first Roman numeral
        firstRomanNumeralFound = true;
      }
      acc.push('     ' + line + ' ' + lines[index + 1]); // Add 5 spaces for indentation
      return acc;
    } else if (!specialChars.includes(lines[index - 1])) {
      acc.push(line);
    }
    return acc;
  }, [] as string[]);

  return lines.join('\n').trim();
};

const QuestionComponent = forwardRef<{ applyStyle: (style: string) => void }, QuestionsProps>(({
  question,
  onNext,
  onPrevious,
  isFirst,
  isLast,
  onAnswer,
  userAnswer,
  currentQuestionIndex,
  totalQuestions,
  onFinish,
  isSubmitting,
  answeredQuestions,
  onOptionCrossedOut
}, ref) => {
  const options = JSON.parse(question.questionOptions);
  const correctAnswer = options[0];

  const [strikedOptions, setStrikedOptions] = useState<Set<number>>(new Set());
  const [editorState, setEditorState] = useState(() => {
    const processedContent = preprocessContent(question.questionContent);
    return EditorState.createWithContent(ContentState.createFromText(processedContent));
  });

  const testHeaderRef = useRef(null);
  
  useEffect(() => {
    setStrikedOptions(new Set());
    const savedContent = typeof window !== 'undefined' ? localStorage.getItem(`question-${question.id}`) : null;
    if (savedContent) {
      const content = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(content));
    } else {
      const processedContent = preprocessContent(question.questionContent);
      setEditorState(EditorState.createWithContent(ContentState.createFromText(processedContent)));
    }
  }, [question]);

  useEffect(() => {
    const content = convertToRaw(editorState.getCurrentContent());
    localStorage.setItem(`question-${question.id}`, JSON.stringify(content));
  }, [editorState, question.id]);

  const randomizedOptions = useMemo(() => {
    const seed = question.id.charCodeAt(question.id.length - 1);
    return [...options].map((option, index) => ({ option, index }))
      .sort((a, b) => seededRandom(seed + a.index) - seededRandom(seed + b.index))
      .map(({ option }) => option);
  }, [question.id, options]);

  const handleAnswerChange = (value: string) => {
    onAnswer(question.id, value, value === correctAnswer);
  };

  const toggleStrikeout = (index: number) => {
    setStrikedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        onOptionCrossedOut(randomizedOptions[index]);
      }
      return newSet;
    });
  };

  useImperativeHandle(ref, () => ({
    applyStyle: (style: string) => {
      const newState = RichUtils.toggleInlineStyle(editorState, style);
      setEditorState(newState);
    }
  }));

  const handleBeforeInput = (chars: string, editorState: EditorState): DraftHandleValue => {
    return 'handled';
  };

  const handlePastedText = (text: string, html: string | undefined, editorState: EditorState): DraftHandleValue => {
    return 'handled';
  };

  const handleDrop = (): DraftHandleValue => {
    return 'handled';
  };

  return (
    <div className="flex flex-col items-center px-6 font-serif text-black text-sm">
      <div className="w-full max-w-3xl flex flex-col">
        <div className="flex justify-between items-center mt-2 mb-4 pt-6 mx-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-base font-bold font-override font-['Times_New_Roman',_Times,_serif]">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h2>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-base mb-6">
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              customStyleMap={{
                'HIGHLIGHT': {
                  background: 'yellow',
                },
                'STRIKETHROUGH': {
                  textDecoration: 'line-through',
                },
              }}
              handleBeforeInput={handleBeforeInput}
              handlePastedText={handlePastedText}
              handleDrop={handleDrop}
            />
          </div>
          <RadioGroup
            onValueChange={handleAnswerChange}
            value={userAnswer}
            className="space-y-4"
          >
            {randomizedOptions.map((option: string, idx: number) => (
              <div key={idx} className="flex items-start group relative">
                <RadioGroupItem
                  value={option}
                  id={`option-${idx}`}
                  className="mr-3 mt-1"
                />
                <Label
                  htmlFor={`option-${idx}`}
                  className={`text-base cursor-pointer flex-grow ${strikedOptions.has(idx) ? 'line-through' : ''}`}
                >
                  <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
                </Label>
                <Button
                  onClick={() => toggleStrikeout(idx)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex justify-between items-center w-full mt-4">
          <Button
            onClick={onPrevious}
            disabled={isFirst}
            variant="outline"
            className="bg-white hover:bg-blue-50 text-blue-600"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm font-semibold text-gray-600">
            {answeredQuestions}/{totalQuestions} Answered
          </span>
          {isLast ? (
            <Button
              onClick={onFinish}
              disabled={isSubmitting || answeredQuestions < totalQuestions}
              variant="default"
              className={`${
                answeredQuestions < totalQuestions
                  ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              {isSubmitting ? 'Finishing...' : "Finish Test"}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              variant="outline"
              className="bg-white hover:bg-blue-50 text-blue-600"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

QuestionComponent.displayName = 'QuestionComponent';

export default QuestionComponent;