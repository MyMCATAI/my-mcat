import React, { useEffect, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Question } from "@prisma/client";
import NewQuestions from "./newquestions";

interface NewPassagePageProps {
  onCancel: () => void;
  // isEditing: boolean;
  // initialData?: {
  //   difficulty: string;
  //   questions: Question[];
  //   title: string;
  //   citation: string;
  //   text: string;
  //   // description: any;
  //   id: string;
  //   // Replace 'any[]' with the correct type for questions
  // };
}

const NewPassagePage: React.FC<NewPassagePageProps> = ({
  onCancel,
  // isEditing,
  // initialData,
}) => {
  const [title, setTitle] = useState("");
  const [citation, setCitation] = useState("");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  // useEffect(() => {
  //   if (isEditing && initialData) {
  //     setTitle(initialData.title || "");
  //     setCitation(initialData.citation || "");
  //     setContent(initialData.text || "");
  //     // setDescription(initialData.description || "");
  //     setDifficulty(
  //       initialData.difficulty ? initialData.difficulty.toString() : ""
  //     );
  //     setQuestions(initialData.questions || []);
  //   }
  // }, [isEditing, initialData]);

  const handleNext = () => {
    if (!title || !content || !citation || !difficulty) {
      alert("Please fill in all passage details before proceeding.");
      return;
    }
    setShowQuestionEditor(true);
  };

  // const updatedQuestions: Question[] = questions.map((item) => ({
  //   id: item.id.toString(),
  //   questionContent: item.questionContent,
  //   questionOptions: Array.isArray(item.questionOptions)
  //     ? item.questionOptions.join(", ")
  //     : item.questionOptions,
  //   questionAnswerNotes: item.questionAnswerNotes || null,
  //   context: item.context || null,
  //   passageId: null, // Add this line with a default value of null
  //   categoryId: item.categoryId,
  //   contentCategory: item.contentCategory,
  //   questionID: item.questionID,
  //   difficulty: parseInt(item.difficulty.toString(), 10) || 0, // Convert to number, default to 0 if parsing fails
  // }));

  // setQuestions(updatedQuestions);

  const handleSaveQuestions = async (savedQuestions: any) => {
    setQuestions(savedQuestions);
    // const convertedQuestions = savedQuestions.map((q: any) => ({
    //   ...q,
    //   questionOptions: Array.isArray(q.questionOptions)
    //     ? q.questionOptions.join(", ")
    //     : q.questionOptions,
    //   difficulty:
    //     typeof q.difficulty === "string"
    //       ? parseInt(q.difficulty, 10)
    //       : q.difficulty,
    // }));

    // setQuestions(convertedQuestions);

    const isValid = savedQuestions.every(
      (q: {
        questionContent: any;
        questionOptions: string | any[];
        questionAnswerNotes: string | any[];
        categoryId: any;
        contentCategory: any;
        questionID: any;
        difficulty: number;
      }) =>
        q.questionContent &&
        q.questionOptions.length > 0 &&
        q.questionAnswerNotes &&
        q.categoryId &&
        q.contentCategory &&
        q.questionID &&
        difficulty
    );

    if (!isValid) {
      alert("Please fill all required fields for each question.");
      return;
    }

    try {
      const payload = {
        title,
        citation,
        text: content,
        difficulty,
        questions: savedQuestions,
      };
      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await fetch("/api/passage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to save passage: ${errorData.error || response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Passage and questions saved:", result);
      onCancel();
    } catch (error) {
      console.error("Error saving passage:", error);
    }
  };

  // const convertToQuestionArray = (questions: any[]): Question[] => {
  //   return questions.map((q) => ({
  //     ...q,
  //     questionOptions:
  //       typeof q.questionOptions === "string"
  //         ? q.questionOptions.split(",").map((opt: string) => opt.trim())
  //         : Array.isArray(q.questionOptions)
  //         ? q.questionOptions
  //         : [q.questionOptions], // Ensure it's always an array
  //     difficulty:
  //       typeof q.difficulty === "number"
  //         ? q.difficulty.toString()
  //         : q.difficulty,
  //   }));
  // };

  if (showQuestionEditor) {
    return (
      <NewQuestions
        passageTitle={title}
        passageContent={content}
        passageCitation={citation}
        onSave={handleSaveQuestions}
        onCancel={onCancel}
        onPrevious={() => setShowQuestionEditor(false)}
        // initialQuestions={questions}
        // isEditing={isEditing}
      />
    );
  }

  // const handleSave = async () => {
  //   try {
  //     const payload = {
  //       title,
  //       citation,
  //       text: content,
  //       difficulty,
  //     };

  //     const url = isEditing
  //       ? `/api/passage/${initialData?.id}`
  //       : "/api/passage";
  //     const method = isEditing ? "PUT" : "POST";

  //     const response = await fetch(url, {
  //       method,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(
  //         `Failed to save passage: ${errorData.error || response.statusText}`
  //       );
  //     }

  //     const result = await response.json();
  //     console.log("Passage saved:", result);
  //     onCancel();
  //   } catch (error) {
  //     console.error("Error saving passage:", error);
  //   }
  // };

  return (
    <div className="text-black">
      <h2 className="text-xl font-bold mb-6">New Passage</h2>

      <div className="space-y-6">
        <div>
          <label className="block mb-2">Passage Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Passage Content</label>
          <CKEditor
            editor={ClassicEditor}
            data={content}
            onChange={(event, editor) => {
              const data = editor.getData();
              setContent(data);
            }}
          />
        </div>

        <div>
          <label className="block mb-2">Citation</label>
          <input
            type="text"
            value={citation}
            onChange={(e) => setCitation(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* <div>
          <label className="block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div> */}

        <div>
          <label className="block mb-2">Difficulty</label>
          <input
            type="number"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2 border rounded"
            min={1}
            step={1}
            max={3}
          />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="border p-4 rounded">
            <h3 className="font-bold">{title}</h3>
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <p className="text-sm text-gray-600 mt-2">{citation}</p>
            {/* <p className="text-sm mt-2">{description}</p> */}
            <p className="text-sm mt-2">Difficulty: {difficulty}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
          Cancel
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next: Add Questions
        </button>
      </div>
    </div>
  );
};

export default NewPassagePage;
