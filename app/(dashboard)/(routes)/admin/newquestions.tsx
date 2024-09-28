import React, { useState, useEffect } from "react";
import { Editor, EditorState, ContentState, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';

interface Question {
  id: string;
  questionContent: string;
  editorState: EditorState;
  questionOptions: string[];
  questionAnswerNotes: string;
  context: string;
  categoryId: string;
  contentCategory: string;
  questionID: string;
  difficulty: string;
}

interface NewQuestionsProps {
  passageTitle: string;
  passageContent: string;
  passageCitation: string;
  onSave: (questions: Question[]) => void;
  onCancel: () => void;
  onPrevious: () => void;
}

const NewQuestions: React.FC<NewQuestionsProps> = ({
  passageTitle,
  passageContent,
  passageCitation,
  onSave,
  onCancel,
  onPrevious,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPassagePreview, setShowPassagePreview] = useState(false);

  useEffect(() => {
    if (questions.length === 0) {
      addQuestion();
    }
  }, []);

  const addQuestion = () => {
    updateCurrentQuestionContent(currentQuestion);
    const newQuestionId = questions.length + 1;
    const newQuestion: Partial<Question> = {
      id: newQuestionId.toString(),
      questionID: `Q${newQuestionId}`,
      questionContent: "",
      editorState: EditorState.createEmpty(),
      questionOptions: ["", "", "", ""],
      questionAnswerNotes: "",
      contentCategory: "",
      categoryId: "",
      context: "",
      difficulty: "1",
    };
    setQuestions([...questions, newQuestion as Question]);
    setCurrentQuestionIndex(questions.length);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);

      const updatedQuestions = questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({
          ...q,
          id: q.id.toString(),
          questionID: `Q${i + 1}`,
        }));

      setQuestions(updatedQuestions);

      if (currentQuestionIndex >= index && currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else if (currentQuestionIndex >= updatedQuestions.length) {
        setCurrentQuestionIndex(updatedQuestions.length - 1);
      }
    } else {
      alert("You cannot delete the last question.");
    }
  };

  const updateCurrentQuestionContent = (updates: Partial<Question>) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[currentQuestionIndex] = {
        ...newQuestions[currentQuestionIndex],
        ...updates,
        questionContent: updates.editorState 
          ? JSON.stringify(convertToRaw(updates.editorState.getCurrentContent()))
          : newQuestions[currentQuestionIndex].questionContent,
      };
      return newQuestions;
    });
  };

  const updateCurrentQuestion = (updates: Partial<Question>) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[currentQuestionIndex] = {
        ...newQuestions[currentQuestionIndex],
        ...updates,
      };
      return newQuestions;
    });
  };

  const handleQuestionSwitch = (index: number) => {
    updateCurrentQuestionContent(currentQuestion);
    setCurrentQuestionIndex(index);
  };

  const currentQuestion = questions[currentQuestionIndex] || {
    id: "",
    questionID: "",
    questionContent: "",
    editorState: EditorState.createEmpty(),
    questionOptions: [],
    questionAnswerNotes: "",
    contentCategory: "",
    passageId: null,
    categoryId: "",
    context: null,
    difficulty: "1",
  };

  return (
    <div className="flex text-black">
      <div className="w-3/4 pr-4">
        <h2 className="text-xl font-bold mb-6">Question Editor</h2>

        <div className="mb-4">
          <label className="block mb-2">Question Content</label>
          <div className="border rounded p-2">
            <Editor
              editorState={currentQuestion.editorState}
              onChange={(newState) => updateCurrentQuestionContent({ editorState: newState })}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Options</label>
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              type="text"
              value={currentQuestion.questionOptions[index] || ""}
              onChange={(e) => {
                const newOptions = [...currentQuestion.questionOptions];
                newOptions[index] = e.target.value;
                updateCurrentQuestion({
                  questionOptions: newOptions,
                });
              }}
              className="w-full p-2 border rounded mb-2"
              placeholder={`Option ${index + 1}`}
            />
          ))}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Answer Notes</label>
          <textarea
            value={currentQuestion.questionAnswerNotes ?? ""}
            onChange={(e) =>
              updateCurrentQuestion({ questionAnswerNotes: e.target.value })
            }
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Context</label>
          <textarea
            value={currentQuestion.context ?? ""}
            onChange={(e) => updateCurrentQuestion({ context: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Category ID</label>
          <input
            type="text"
            value={currentQuestion.categoryId}
            onChange={(e) =>
              updateCurrentQuestion({ categoryId: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Content Category</label>
          <input
            type="text"
            value={currentQuestion.contentCategory}
            onChange={(e) =>
              updateCurrentQuestion({ contentCategory: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Question ID</label>
          <input
            type="text"
            value={currentQuestion.questionID}
            onChange={(e) =>
              updateCurrentQuestion({ questionID: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Difficulty</label>
          <input
            type="number"
            value={currentQuestion.difficulty}
            onChange={(e) =>
              updateCurrentQuestion({ difficulty: e.target.value })
            }
            className="w-full p-2 border rounded"
            min={1}
            step={1}
            max={3}
          />
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowPassagePreview(!showPassagePreview)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            {showPassagePreview
              ? "Hide Passage Preview"
              : "Show Passage Preview"}
          </button>
          {showPassagePreview && (
            <div className="mt-2 border p-4 rounded">
              <h3 className="font-bold">{passageTitle}</h3>
              <div dangerouslySetInnerHTML={{ __html: passageContent }} />
              <p className="text-sm text-gray-600 mt-2">{passageCitation}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => {
              updateCurrentQuestionContent(currentQuestion);
              onPrevious();
            }}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Previous: Edit Passage
          </button>
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={() => {
              updateCurrentQuestionContent(currentQuestion);
              const questionsToSave = questions.map(q => ({
                ...q,
                questionContent: JSON.stringify(convertToRaw(q.editorState.getCurrentContent())),
              }));
              onSave(questionsToSave);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save All Questions
          </button>
        </div>
      </div>

      <div className="w-1/4 pl-4 border-l">
        <h3 className="text-lg font-bold mb-4">Questions</h3>
        {questions.map((question, index) => (
          <div
            key={question.id.toString()}
            className={`cursor-pointer p-2 mb-2 rounded ${
              index === currentQuestionIndex
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleQuestionSwitch(index)}
          >
            Question {index + 1}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteQuestion(index);
              }}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
            >
              Delete
            </button>
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

export default NewQuestions;