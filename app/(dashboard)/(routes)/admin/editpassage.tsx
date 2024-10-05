"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Question } from "@prisma/client";

interface EditPassagePageProps {
  id: string;
}

const EditPassage: React.FC<EditPassagePageProps> = ({ id }) => {
  const [title, setTitle] = useState("");
  const [citation, setCitation] = useState("");
  const [content, setContent] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchPassage();
    }
  }, [id]);

  function onCancel() {
    router.push("/admin");
  }

  const fetchPassage = async () => {
    try {
      const response = await fetch(`/api/passage?id=${encodeURIComponent(id)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch passage");
      }
      const data = await response.json();
      setTitle(data.title);
      setCitation(data.citation);
      setContent(data.text);
      setDifficulty(data.difficulty.toString());
      setQuestions(data.questions || []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching passage:", error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !content || !citation || !difficulty) {
      alert("Please fill in all passage details before proceeding.");
      return;
    }

    try {
      const payload = {
        id,
        title,
        citation,
        text: content,
        difficulty,
      };
      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`/api/passage`, {
        method: "PUT",
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
      console.log("Passage updated:", result);
      alert("Passage updated successfully!");
      onCancel();
    } catch (error) {
      console.error("Error saving passage:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="text-black bg-white">
      <h2 className="text-xl font-bold mb-6">Edit Passage</h2>

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
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded"
            rows={10}
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
            <textarea
              value={content}
              readOnly
              className="w-full p-2 border rounded mt-2"
              rows={5}
            />
            <p className="text-sm text-gray-600 mt-2">{citation}</p>
            <p className="text-sm mt-2">Difficulty: {difficulty}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save Passage
        </button>
      </div>
    </div>
  );
};

export default EditPassage;
