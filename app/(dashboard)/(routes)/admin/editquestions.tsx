"use client";

import React, { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Editor } from "@ckeditor/ckeditor5-core";
import { Question } from "@/types";
import { useRouter } from "next/navigation";

interface Passage {
  id: string;
  text: string;
  citation: string;
  title: string;
  questions: Question[]; // Add this line
}
interface EditQuestionsProps {
  // passageId: string;
  // passageTitle: string;
  // passageContent: string;
  // passageCitation: string;
  // // initialQuestions: Question[];
  // onSave: (questions: Question[]) => void;
  // onCancel: () => void;
  passageId: string;
  // onSave: (questions: Question[]) => void;
  // onCancel: () => void;
}

const EditQuestions: React.FC<EditQuestionsProps> = ({
  passageId,
  // onSave,
  // onCancel,
}) => {
  // const router = useRouter();
  // const [passageData, setPassageData] = useState<EditQuestionsProps | null>(
  //   null
  // );
  // const [id, setId] = useState<string | null>(null);

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const passageId = params.get("id");
  //   if (passageId) {
  //     setId(passageId);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (id) {
  //     fetch(`/api/passage?id=${id}`)
  //       .then((response) => response.json())
  //       .then((data: EditQuestionsProps) => setPassageData(data))
  //       .catch((error) => console.error("Error fetching passage:", error));
  //   }
  // }, [id]);

  // if (!passageData) {
  //   return <div>Loading...</div>;
  // }

  // const [questions, setQuestions] = useState<Question[]>([]);
  // const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // const [showPassagePreview, setShowPassagePreview] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const editorRef = useRef<Editor | null>(null);

  const [passage, setPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPassagePreview, setShowPassagePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPassageWithQuestions();
  }, [passageId]);

  // const fetchQuestions = async () => {
  //   try {
  //     setIsLoading(true);
  //     const response = await fetch(`/api/passage/${passageId}/questions`);
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch questions");
  //     }
  //     const data = await response.json();
  //     setQuestions(data);
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Error fetching questions:", error);
  //     setError("Failed to load questions. Please try again.");
  //     setIsLoading(false);
  //   }
  // };

  const fetchPassageWithQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/passage?id=${encodeURIComponent(passageId)}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch passage: ${response.statusText}`);
      }
      const data: Passage = await response.json();
      setPassage(data);
      setQuestions(data.questions);
    } catch (error) {
      console.error("Error fetching passage:", error);
      setError("Failed to load passage and questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/question`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passageId,
          questions: questions.map((q) => ({
            ...q,
            questionOptions: Array.isArray(q.questionOptions)
              ? q.questionOptions
              : JSON.parse(q.questionOptions),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save questions: ${response.statusText}`);
      }

      const updatedQuestions = await response.json();
      setQuestions(updatedQuestions);
      alert("Questions saved successfully!");
    } catch (error) {
      console.error("Error saving questions:", error);
      setError("Failed to save questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    router.push("/admin"); // Adjust this route as needed
  };

  // const fetchQuestions = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     const response = await fetch(`/api/passage/${passageId}/questions`);
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch questions: ${response.statusText}`);
  //     }
  //     const data = await response.json();
  //     setQuestions(data);
  //   } catch (error) {
  //     console.error("Error fetching questions:", error);
  //     setError("Failed to load questions. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
    setCurrentQuestionIndex(index);
  };

  const currentQuestion = questions[currentQuestionIndex] || {
    id: "",
    questionID: "",
    questionContent: "",
    questionOptions: ["", "", "", ""],
    questionAnswerNotes: "",
    contentCategory: "",
    categoryId: "",
    context: "",
    difficulty: "1",
  };

  if (isLoading) {
    return <div>Loading passage and questions...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button
          onClick={fetchPassageWithQuestions}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!passage) {
    return <div>No passage found.</div>;
  }
  return (
    <div className="flex text-black bg-white">
      <div className="w-3/4 pr-4">
        <h2 className="text-xl font-bold mb-6">Edit Questions</h2>

        <div className="mb-4">
          <label className="block mb-2">Question Content</label>
          <CKEditor
            editor={ClassicEditor}
            data={currentQuestion.questionContent}
            onReady={(editor: Editor) => {
              editorRef.current = editor;
            }}
            onChange={(event, editor: Editor) => {
              const data = editor.getData();
              updateCurrentQuestion({ questionContent: data });
            }}
          />
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
                updateCurrentQuestion({ questionOptions: newOptions });
              }}
              className="w-full p-2 border rounded mb-2"
              placeholder={`Option ${index + 1}`}
            />
          ))}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Answer Notes</label>
          <textarea
            value={currentQuestion.questionAnswerNotes}
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
              <h3 className="font-bold">{passage.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: passage.text }} />
              <p className="text-sm text-gray-600 mt-2">{passage.citation}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
          <button
            onClick={() => onSave}
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
            key={question.id}
            className={`cursor-pointer p-2 mb-2 rounded ${
              index === currentQuestionIndex
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
            onClick={() => handleQuestionSwitch(index)}
          >
            Question {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditQuestions;
