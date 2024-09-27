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

  // const fetchPassageWithQuestions = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     const response = await fetch(
  //       `/api/passage?id=${encodeURIComponent(passageId)}`
  //     );
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch passage: ${response.statusText}`);
  //     }
  //     const data: Passage = await response.json();
  //     setPassage(data);
  //     // setQuestions(
  //     //   data.questions.map((q) => ({
  //     //     ...q,
  //     //     questionOptions: Array.isArray(q.questionOptions)
  //     //       ? q.questionOptions
  //     //       : JSON.parse(q.questionOptions as string),
  //     //   }))
  //     // );
  //     setQuestions(
  //       data.questions.map((q) => ({
  //         ...q,
  //         questionOptions: Array.isArray(q.questionOptions)
  //           ? q.questionOptions
  //           : typeof q.questionOptions === "string"
  //           ? JSON.parse(q.questionOptions)
  //           : [],
  //       }))
  //     );
  //   } catch (error) {
  //     console.error("Error fetching passage:", error);
  //     setError("Failed to load passage and questions. Please try again.");
  //   } finally {
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
        return { ...q, questionOptions: processedOptions };
      });
      console.log("Processed questions:", processedQuestions); // Log processed questions
      setQuestions(processedQuestions);
    } catch (error) {
      console.error("Error fetching passage:", error);
      setError("Failed to load passage and questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // const onSave = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     updateCurrentQuestion(currentQuestion);

  //     console.log("Saving questions:", questions); // Debug log

  //     // const response = await fetch(`/api/question`, {
  //     //   method: "PUT",
  //     //   headers: {
  //     //     "Content-Type": "application/json",
  //     //   },
  //     //   body: JSON.stringify({
  //     //     passageId,
  //     //     questions: questions.map((q) => ({
  //     //       ...q,
  //     //       questionOptions: Array.isArray(q.questionOptions)
  //     //         ? q.questionOptions
  //     //         : JSON.parse(q.questionOptions),
  //     //     })),
  //     //   }),
  //     // });
  //     const questionsToSave = questions.map((q) => {
  //       let processedOptions;
  //       try {
  //         processedOptions = JSON.stringify(
  //           Array.isArray(q.questionOptions)
  //             ? q.questionOptions
  //             : typeof q.questionOptions === "string"
  //             ? JSON.parse(q.questionOptions)
  //             : []
  //         );
  //       } catch (error) {
  //         console.error("Error processing question options for saving:", error);
  //         processedOptions = "[]";
  //       }
  //       return { ...q, questionOptions: processedOptions };
  //     });

  //     const response = await fetch(`/api/question`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         passageId,
  //         questions: questionsToSave,
  //         // questions.map((q) => ({
  //         //   ...q,
  //         //   questionOptions: JSON.stringify(
  //         //     Array.isArray(q.questionOptions)
  //         //       ? q.questionOptions
  //         //       : typeof q.questionOptions === "string"
  //         //       ? JSON.parse(q.questionOptions)
  //         //       : []
  //         //   ),
  //         // })),
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to save questions: ${response.statusText}`);
  //     }

  //     const updatedQuestions = await response.json();
  //     setQuestions(updatedQuestions);
  //     console.log("Questions saved successfully:", updatedQuestions); // Debug log
  //     alert("Questions saved successfully!");
  //     onCancel();
  //   } catch (error) {
  //     console.error("Error saving questions:", error);
  //     setError("Failed to save questions. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const onSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Attempting to save questions:", questions);

      const questionsToSave = questions.map((q) => ({
        ...q,
        questionOptions: Array.isArray(q.questionOptions)
          ? q.questionOptions
          : typeof q.questionOptions === "string"
          ? JSON.parse(q.questionOptions)
          : [],
      }));

      console.log("Prepared questions for saving:", questionsToSave);

      const response = await fetch(`/api/question`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passageId,
          questions: questionsToSave,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to save questions: ${response.statusText}. ${JSON.stringify(
            errorData
          )}`
        );
      }

      const updatedQuestions = await response.json();
      console.log("Questions saved successfully:", updatedQuestions);
      setQuestions(updatedQuestions);
      alert("Questions saved successfully!");
      router.push("/admin");
    } catch (error) {
      console.error("Error saving questions:", error);
      setError(`Failed to save questions. ${error}`);
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

  const addQuestion = () => {
    updateCurrentQuestionContent(currentQuestion);
    const newQuestionId = questions.length + 1;
    const newQuestion: Partial<Question> = {
      id: newQuestionId.toString(),
      questionID: `Q${newQuestionId}`,
      questionContent: "",
      questionOptions: ["", "", "", ""], // Initialize with four empty options
      questionAnswerNotes: "",
      contentCategory: "",
      categoryId: "",
      context: "",
      difficulty: "1",
    };
    setQuestions([...questions, newQuestion as Question]);
    setCurrentQuestionIndex(questions.length);
  };

  // const deleteQuestion = (index: number) => {
  //   if (questions.length > 1) {
  //     const newQuestions = questions.filter((_, i) => i !== index);

  //     // Reassign IDs and questionIDs to maintain sequential order
  //     const updatedQuestions = questions
  //       .filter((_, i) => i !== index)
  //       .map((q, i) => ({
  //         ...q,
  //         id: q.id.toString(), // Convert id to string
  //         questionID: `Q${i + 1}`,
  //       }));

  //     setQuestions(updatedQuestions);

  //     if (currentQuestionIndex >= index && currentQuestionIndex > 0) {
  //       setCurrentQuestionIndex(currentQuestionIndex - 1);
  //     } else if (currentQuestionIndex >= updatedQuestions.length) {
  //       setCurrentQuestionIndex(updatedQuestions.length - 1);
  //     }
  //   } else {
  //     alert("You cannot delete the last question.");
  //   }
  // };
  // const deleteQuestion = (index: number) => {
  //   if (questions.length > 1) {
  //     setQuestions((prevQuestions) => {
  //       const newQuestions = prevQuestions.filter((_, i) => i !== index);
  //       // Reassign questionIDs
  //       return newQuestions.map((q, i) => ({
  //         ...q,
  //         questionID: `Q${i + 1}`,
  //       }));
  //     });

  //     if (currentQuestionIndex >= index && currentQuestionIndex > 0) {
  //       setCurrentQuestionIndex((prev) => prev - 1);
  //     } else if (currentQuestionIndex >= questions.length - 1) {
  //       setCurrentQuestionIndex(questions.length - 2);
  //     }
  //   } else {
  //     alert("You cannot delete the last question.");
  //   }
  // };

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
  // const updateCurrentQuestion = (updates: Partial<Question>) => {
  //   setQuestions((prevQuestions) => {
  //     const newQuestions = [...prevQuestions];
  //     newQuestions[currentQuestionIndex] = {
  //       ...newQuestions[currentQuestionIndex],
  //       ...updates,
  //     };
  //     console.log("Updated questions:", newQuestions); // Debug log
  //     return newQuestions;
  //   });
  // };
  const updateCurrentQuestion = (updates: Partial<Question>) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      newQuestions[currentQuestionIndex] = {
        ...newQuestions[currentQuestionIndex],
        ...updates,
        questionOptions: updates.questionOptions
          ? Array.isArray(updates.questionOptions)
            ? updates.questionOptions
            : JSON.parse(updates.questionOptions as string)
          : newQuestions[currentQuestionIndex].questionOptions,
      };
      console.log("Updated questions:", newQuestions); // Debug log
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

        {/* <div className="mb-4">
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
        </div> */}

        {/* <div className="mb-4">
          <label className="block mb-2">Options</label>
          {(Array.isArray(currentQuestion.questionOptions)
            ? currentQuestion.questionOptions
            : []
          ).map((option, index) => (
            <input
              key={index}
              type="text"
              value={option || ""}
              onChange={(e) => {
                const newOptions = [...currentQuestion.questionOptions];
                newOptions[index] = e.target.value;
                updateCurrentQuestion({ questionOptions: newOptions });
              }}
              className="w-full p-2 border rounded mb-2"
              placeholder={`Option ${index + 1}`}
            />
          ))}
        </div> */}

        <div className="mb-4">
          <label className="block mb-2">Options</label>
          {(() => {
            console.log("Current question:", currentQuestion); // Log current question
            let options = [];
            try {
              options = Array.isArray(currentQuestion.questionOptions)
                ? currentQuestion.questionOptions
                : typeof currentQuestion.questionOptions === "string"
                ? JSON.parse(currentQuestion.questionOptions)
                : [];
            } catch (error) {
              console.error("Error parsing question options:", error);
            }
            console.log("Parsed options:", options); // Log parsed options
            return options.map(
              (
                option: string | number | readonly string[] | undefined,
                index: React.Key | null | undefined
              ) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...options];
                    newOptions[Number(index)] = e.target.value;
                    updateCurrentQuestion({ questionOptions: newOptions });
                  }}
                  className="w-full p-2 border rounded mb-2"
                  placeholder={`Option ${Number(index) + 1}`}
                />
              )
            );
          })()}
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
            onClick={onSave}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save All Questions
          </button>
        </div>
      </div>
      {/* 
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
       */}
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
