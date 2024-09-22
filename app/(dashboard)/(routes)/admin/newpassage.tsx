import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import QuestionEditor from "./questioneditor";

interface NewPassagePageProps {
  onCancel: () => void;
}

const NewPassagePage: React.FC<NewPassagePageProps> = ({ onCancel }) => {
  const [title, setTitle] = useState("");
  const [citation, setCitation] = useState("");
  const [content, setContent] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  const handleNext = () => {
    setShowQuestionEditor(true);
  };

  const handleSaveQuestions = async (savedQuestions: any) => {
    setQuestions(savedQuestions);
    try {
      const response = await fetch("/api/passage/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          citation,
          content,
          questions: savedQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save passage");
      }

      const result = await response.json();
      console.log("Passage and questions saved:", result);
      onCancel(); // Go back to search after saving
    } catch (error) {
      console.error("Error saving passage:", error);
    }
  };

  if (showQuestionEditor) {
    return (
      <QuestionEditor
        passageTitle={title}
        passageContent={content}
        passageCitation={citation}
        onSave={handleSaveQuestions}
        onCancel={onCancel}
        onPrevious={() => setShowQuestionEditor(false)}
      />
    );
  }

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
            config={{
              toolbar: [
                "heading",
                "|",
                "bold",
                "italic",
                "link",
                "bulletedList",
                "numberedList",
                "blockQuote",
              ],
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

        <div>
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="border p-4 rounded">
            <h3 className="font-bold">{title}</h3>
            <div dangerouslySetInnerHTML={{ __html: content }} />
            <p className="text-sm text-gray-600 mt-2">{citation}</p>
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
