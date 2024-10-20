import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';

interface CategoryInputBoxProps {
  onSubmit: (subject: string, category: string, topic: string, randomizeSubject: boolean, randomizeCategory: boolean, prompt: string) => void;
  onClose: () => void;
}

const CategoryInputBox: React.FC<CategoryInputBoxProps> = ({ onSubmit, onClose }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [topic, setTopic] = useState('');
  const [randomizeSubject, setRandomizeSubject] = useState(false);
  const [randomizeCategory, setRandomizeCategory] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const psychSocCategories = useMemo(() => [
    "6A Sensation",
    "6A Perception",
    "6B Cognition",
    "6B Memory & Language",
    "6C Motivation",
    "6C Emotions & Stress",
    "7A Biology and Behavior",
    "7A Personality",
    "7A Motivation & Attitudes",
    "7B Social Processes on Individuals",
    "7B Social Processes on Communities",
    "7C Learning",
    "7C Attitude & Behavior Change",
    "8A Self-Identity",
    "8A Formation of Identity",
    "8B Attribution",
    "8B Stereotypes & Bias",
    "8C Social Interaction",
    "8C Self Presentation",
    "9A Social Institutions",
    "9A Culture",
    "9B Demographic Structure",
    "9B Demographic Shift",
    "10A Social Stratification"
  ], []);

  const generatePrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: "You are a Critical Analysis and Reasoning (CARS) expert for the MCAT. When given a subject, your task is to generate a short writing prompt. The prompt format is: 'Write an AAMC CARS-style passage of between 500-700 words about the author arguing that [fill in with argument].' Use the subject to create a compelling prompt to be fed into an LLM that generates passages."
            },
            {
              role: 'user',
              content: `Subject: ${selectedSubject}, Category: ${customCategory || selectedCategory}, Topic: ${topic}`
            }
          ]
        })
      });
      const data = await response.json();
      setGeneratedPrompt(data.reply);
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = () => {
    const category = customCategory || selectedCategory;
    onSubmit(selectedSubject, category, topic, randomizeSubject, randomizeCategory, generatedPrompt);
    onClose();
  };

  return (
    <div className="bg-white p-4 pt-8 rounded-lg shadow-md z-20 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X size={20} />
      </button>
      
      <select
        className="w-full mb-2 p-2 border rounded"
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
      >
        <option value="">Select Subject</option>
        <option value="biology-biochem">BioBiochem</option>
        <option value="cp">ChemPhys</option>
        <option value="cars">CARs</option>
        <option value="psych-soc">PsychSoc</option>
      </select>
      
      {selectedSubject === 'psych-soc' && (
        <select
          className="w-full mb-2 p-2 border rounded"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {psychSocCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      )}
      
      <input
        type="text"
        className="w-full mb-2 p-2 border rounded"
        placeholder="Custom Category"
        value={customCategory}
        onChange={(e) => setCustomCategory(e.target.value)}
      />
      <input
        type="text"
        className="w-full mb-2 p-2 border rounded"
        placeholder="Topic (optional)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      
      <div className="flex items-center justify-between mb-2">
        <div>
          <label className="flex items-center mr-4">
            <input
              type="checkbox"
              checked={randomizeSubject}
              onChange={(e) => setRandomizeSubject(e.target.checked)}
              className="mr-2"
            />
            Randomize Subject
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={randomizeCategory}
              onChange={(e) => setRandomizeCategory(e.target.checked)}
              className="mr-2"
            />
            Randomize Category
          </label>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded mr-2"
          onClick={generatePrompt}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Prompt'}
        </button>
        <button
          className="bg-black hover:bg-gray-600 text-white p-2 rounded"
          onClick={handleSubmit}
          disabled={!generatedPrompt}
        >
          Submit
        </button>
      </div>

      {generatedPrompt && (
        <div className="mt-4">
          <textarea
            className="w-full p-2 border rounded"
            rows={4}
            value={generatedPrompt}
            onChange={(e) => setGeneratedPrompt(e.target.value)}
            placeholder="Generated prompt will appear here. You can edit it if needed."
          />
        </div>
      )}
    </div>
  );
};

export default CategoryInputBox;