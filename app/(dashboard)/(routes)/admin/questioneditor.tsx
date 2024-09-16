import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface Question {
  id: number;
  content: string;
  options: string[];
  relevantContext: string;
  correctOption: number | null;
  explanations: string[];
}

interface QuestionEditorProps {
  passageTitle: string;
  passageContent: string;
  passageCitation: string;
  onSave: (questions: Question[]) => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  passageTitle,
  passageContent,
  passageCitation,
  onSave,
  onCancel
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPassagePreview, setShowPassagePreview] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      content: '',
      options: ['', '', '', ''],
      relevantContext: '',
      correctOption: null,
      explanations: ['', '', '', '']
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const updateQuestion = (updatedQuestion: Partial<Question>) => {
    const updatedQuestions = questions.map((q, index) =>
      index === currentQuestionIndex ? { ...q, ...updatedQuestion } : q
    );
    setQuestions(updatedQuestions);
  };

  const currentQuestion = questions[currentQuestionIndex] || {
    content: '',
    options: ['', '', '', ''],
    relevantContext: '',
    correctOption: null,
    explanations: ['', '', '', '']
  };

  return (
    <div className="flex text-black">
      <div className="w-3/4 pr-4">
        <h2 className="text-xl font-bold mb-6">Question Editor</h2>
        
        <div className="mb-4">
          <label className="block mb-2">Question Content</label>
          <CKEditor
            editor={ClassicEditor}
            data={currentQuestion.content}
            onChange={(event, editor) => {
              updateQuestion({ content: editor.getData() });
            }}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Options</label>
          {currentQuestion.options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...currentQuestion.options];
                newOptions[index] = e.target.value;
                updateQuestion({ options: newOptions });
              }}
              className="w-full p-2 border rounded mb-2"
              placeholder={`Option ${index + 1}`}
            />
          ))}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Relevant Context</label>
          <textarea
            value={currentQuestion.relevantContext}
            onChange={(e) => updateQuestion({ relevantContext: e.target.value })}
            className="w-full p-2 border rounded"
            rows={4}
          />
          <button
            onClick={() => setShowPassagePreview(!showPassagePreview)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            {showPassagePreview ? 'Hide Passage Preview' : 'Show Passage Preview'}
          </button>
          {showPassagePreview && (
            <div className="mt-2 border p-4 rounded">
              <h3 className="font-bold">{passageTitle}</h3>
              <div dangerouslySetInnerHTML={{ __html: passageContent }} />
              <p className="text-sm text-gray-600 mt-2">{passageCitation}</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Select Correct Option</label>
          <select
            value={currentQuestion.correctOption || ''}
            onChange={(e) => updateQuestion({ correctOption: Number(e.target.value) })}
            className="w-full p-2 border rounded"
          >
            <option value="">Select correct option</option>
            {currentQuestion.options.map((_, index) => (
              <option key={index} value={index}>
                Option {index + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Explanations per Option</label>
          {currentQuestion.explanations.map((explanation, index) => (
            <textarea
              key={index}
              value={explanation}
              onChange={(e) => {
                const newExplanations = [...currentQuestion.explanations];
                newExplanations[index] = e.target.value;
                updateQuestion({ explanations: newExplanations });
              }}
              className="w-full p-2 border rounded mb-2"
              rows={2}
              placeholder={`Explanation for Option ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button onClick={() => onSave(questions)} className="px-4 py-2 bg-green-500 text-white rounded">
            Save Questions
          </button>
        </div>
      </div>

      <div className="w-1/4 pl-4 border-l">
        <h3 className="text-lg font-bold mb-4">Questions</h3>
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`cursor-pointer p-2 mb-2 rounded ${
              index === currentQuestionIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            Question {question.id}
          </div>
        ))}
        <button
          onClick={addQuestion}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded w-full"
        >
          Add Question
        </button>
      </div>
    </div>
  );
};

export default QuestionEditor;
