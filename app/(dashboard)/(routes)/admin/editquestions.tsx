"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Question } from "@/types";
import { useRouter } from "next/navigation";

interface Passage {
  id: string;
  text: string;
  citation: string;
  title: string;
  questions: Question[]; 
}
interface EditQuestionsProps {
  passageId: string;
}

const EditQuestions: React.FC<EditQuestionsProps> = ({
  passageId,
}) => {

  const [passage, setPassage] = useState<Passage | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showPassagePreview, setShowPassagePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Questions state updated:", questions);
  }, [questions]);

  useEffect(() => {
    fetchPassageWithQuestions();
  }, [passageId]);

  useEffect(() => {
    if (questions.length === 0) {
      addQuestion();
    }
  }, []);


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
      console.log("Raw passage data:", data); // Log raw data

      setPassage(data);
      const processedQuestions = data.questions.map((q) => {
        console.log("Processing question:", q); // Log each question
        let processedOptions;
        try {
          processedOptions = Array.isArray(q.questionOptions)
            ? q.questionOptions
            : typeof q.questionOptions === "string"
            ? JSON.parse(q.questionOptions)
            : [];
        } catch (error) {
          console.error("Error processing question options:", error);
          processedOptions = [];
        }
        return { 
          ...q, 
          questionOptions: processedOptions,
        };
      });
      console.log("Processed questions:", processedQuestions); // Log processed questions
      setQuestions(processedQuestions);
      
      // New: Log the fetched questions
      console.log("Fetched questions:", processedQuestions);
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
      const currentQuestion = questions[currentQuestionIndex];
      console.log("Attempting to save current question:", currentQuestion);

      const questionToSave = {
        ...currentQuestion,
        questionOptions: Array.isArray(currentQuestion.questionOptions)
          ? currentQuestion.questionOptions
          : typeof currentQuestion.questionOptions === "string"
          ? JSON.parse(currentQuestion.questionOptions)
          : [],
      };

      console.log("Prepared question for saving:", questionToSave);

      const response = await fetch(`/api/question`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(questionToSave),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to save question: ${response.statusText}. ${JSON.stringify(
            errorData
          )}`
        );
      }

      const updatedQuestion = await response.json();
      console.log("Question saved successfully:", updatedQuestion);

      // Update the questions array with the saved question
      setQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions];
        newQuestions[currentQuestionIndex] = updatedQuestion;
        return newQuestions;
      });

      alert("Question saved successfully!");
    } catch (error) {
      console.error("Error saving question:", error);
      setError(`Failed to save question. ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    router.push("/admin"); // Adjust this route as needed
  };

  const addQuestion = () => {
    updateCurrentQuestionContent(currentQuestion);
    const newQuestionId = questions.length + 1;
    const newQuestion: Partial<Question> = {
      id: newQuestionId.toString(),
      questionID: `Q${newQuestionId}`,
      questionContent: "",
      questionOptions: `["", "", "", ""]`, // Initialize with four empty options
      questionAnswerNotes: "",
      contentCategory: "",
      categoryId: "",
      context: "",
      difficulty: 1,
    };
    setQuestions([...questions, newQuestion as Question]);
    setCurrentQuestionIndex(questions.length);
  };


  const deleteQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions((prevQuestions) => {
        const newQuestions = prevQuestions.filter((_, i) => i !== index);
        return newQuestions.map((q, i) => ({ ...q, questionID: `Q${i + 1}` }));
      });
      if (currentQuestionIndex >= index && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      } else if (currentQuestionIndex >= questions.length - 1) {
        setCurrentQuestionIndex(questions.length - 2);
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
        questionOptions: typeof updates.questionOptions === 'string'
          ? updates.questionOptions
          : Array.isArray(updates.questionOptions)
            ? JSON.stringify(updates.questionOptions)
            : newQuestions[currentQuestionIndex].questionOptions,
      };
      console.log("Updated questions:", newQuestions);
      return newQuestions;
    });
  };
  const handleQuestionSwitch = (index: number) => {
    // Save current question changes before switching
    updateCurrentQuestion(currentQuestion);
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
          <Input
            value={currentQuestion.questionContent || ""}
            onChange={(e) => updateCurrentQuestion({ questionContent: e.target.value })}
            className="w-full"
            placeholder="Enter question content"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Options</label>
          {(() => {
            console.log("Current question:", currentQuestion);
            let options: string[] = [];
            
            if (typeof currentQuestion.questionOptions === 'string') {
              try {
                options = JSON.parse(currentQuestion.questionOptions);
              } catch (error) {
                console.error("Error parsing options:", error);
              }
            } else if (Array.isArray(currentQuestion.questionOptions)) {
              options = currentQuestion.questionOptions;
            }
            
            if (!Array.isArray(options)) {
              console.error("Options is not an array:", options);
              options = [];
            }
            
            console.log("Processed options:", options);
            
            return options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  updateCurrentQuestion({ questionOptions: JSON.stringify(newOptions) });
                }}
                className="w-full p-2 border rounded mb-2"
                placeholder={`Option ${index + 1}`}
              />
            ));
          })()}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Answer Notes</label>
          <textarea
            value={currentQuestion.questionAnswerNotes || ""}
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
              updateCurrentQuestion({ difficulty: parseInt(e.target.value, 10) || 1 })
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
            onClick={onSave}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save Question
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

export default EditQuestions;