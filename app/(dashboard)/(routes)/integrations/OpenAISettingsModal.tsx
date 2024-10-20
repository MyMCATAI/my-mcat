import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';

interface OpenAISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialPrompts = {
  passagePrompt: 'You are an expert writer for the AAMC CARS section, specializing in creating passages that closely mimic the style and complexity of official AAMC materials. Your task is to generate passages of between 500-700 words on a topic, where the author is making a complex argument.',
  questionPrompt: `You are an expert in generating MCAT CARS questions modeled after AAMC\'s format. 
  Your task is to create a well-structured, thought-provoking multiple-choice question based on a given passage. 
  This question should test critical reasoning, comprehension, and application of complex arguments, reflecting the style and complexity of AAMC\'s CARS section. 

  Your question will have a content component and 4 options. where the first option will be the correct answer.

  Return your response in JSON format, following this format:
  
  {"questionContent": "question text", "questionOptions": ["option A (correct)", "option B", "option C", "option D"]}.
  `,
  explanationPrompt: `You are a Critical Analysis and Reasoning (CARS) expert for the MCAT. Your task is to provide clear, concise explanations for each answer choice based on a given passage and question. The first answer choice will be the right one. These explanations should help students understand the rationale behind both correct and incorrect answers. Focus on reasoning similar to what is found in official AAMC materials, using specific evidence and DIRECT QUOTES from the passage to justify why an answer is correct or incorrect. Use SIMPLE 8TH GRADE LANGUAGE. For incorrect answers, explain why they are wrong and why a student might be tempted to choose them.

  Return your response in JSON format, following this structure:
  
  {"explanations": ["explanation for option A (correct)", "explanation for option B", "explanation for option C", "explanation for option D"]}
  
  Ensure that each explanation is a concise paragraph, and the order of explanations matches the order of the question options. Don't specifically mention the letter of the answer in your explanations.`,
};

const OpenAISettingsModal: React.FC<OpenAISettingsModalProps> = ({ isOpen, onClose }) => {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [selectedModel, setSelectedModel] = useState('Master Saraswati');

  useEffect(() => {
    const savedModelPrompts = localStorage.getItem('modelPrompts');
    const savedCurrentModel = localStorage.getItem('currentModel');
    
    if (savedModelPrompts) {
      const parsedPrompts = JSON.parse(savedModelPrompts);
      if (savedCurrentModel && parsedPrompts[savedCurrentModel]) {
        setPrompts(parsedPrompts[savedCurrentModel]);
        setSelectedModel(savedCurrentModel);
      }
    }
  }, []);

  const handlePromptChange = (promptType: keyof typeof initialPrompts, value: string) => {
    setPrompts(prev => ({
      ...prev,
      [promptType]: value,
    }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
    const savedModelPrompts = localStorage.getItem('modelPrompts');
    if (savedModelPrompts) {
      const parsedPrompts = JSON.parse(savedModelPrompts);
      if (parsedPrompts[e.target.value]) {
        setPrompts(parsedPrompts[e.target.value]);
      } else {
        setPrompts(initialPrompts);
      }
    }
  };

  const handleSave = () => {
    const savedModelPrompts = localStorage.getItem('modelPrompts');
    const updatedModelPrompts = savedModelPrompts ? JSON.parse(savedModelPrompts) : {};
    updatedModelPrompts[selectedModel] = prompts;
    
    localStorage.setItem('modelPrompts', JSON.stringify(updatedModelPrompts));
    localStorage.setItem('currentModel', selectedModel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div className="relative p-8 bg-[#353740] border-2 border-[#15a37c] w-full max-w-2xl m-auto flex-col flex rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">OpenAI Settings</h2>
                {/* Select Model dropdown */}
                <label className="block mb-4">
          <span className="text-white">Select Model</span>
          <select
            className="form-select mt-1 block w-full bg-[#8c8c8c] text-black px-3 py-2 border border-[#15a37c] rounded"
            value={selectedModel}
            onChange={handleModelChange}
          >
            <option value="PS Saraswati">Saraswati — PS</option>
            <option value="CP Saraswati">Saraswati - CP</option>
            <option value="BB Saraswati">Saraswati - BB</option>
            <option value="CARs Saraswati">Saraswati - CARs</option>
            <option value="Master Saraswati">Master Saraswati</option>
          </select>
        </label>

        <button
          className="absolute top-0 right-0 mt-4 mr-4 text-white hover:text-[#15a37c]"
          onClick={onClose}
        >
          <IoMdClose size={24} />
        </button>
        
        {Object.entries(prompts).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label className="block">
              <span className="text-white">
                {key === 'passagePrompt' ? 'Passage Prompt' :
                 key === 'questionPrompt' ? 'Question Prompt' :
                 'Explanation Prompt'}
              </span>
              <textarea
                className="form-textarea mt-1 block w-full bg-[#353740] text-white border border-[#15a37c] rounded px-3 py-2"
                rows={4}
                value={value}
                onChange={(e) => handlePromptChange(key as keyof typeof initialPrompts, e.target.value)}
              />
            </label>
          </div>
        ))}

        <button
          className="mt-4 bg-[#15a37c] text-white rounded-md px-4 py-2 hover:bg-[#0f7a5c] transition-colors duration-200"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default OpenAISettingsModal;