import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  section: string;
  questionNumber: string;
  troubleReason: string;
  correctThoughtProcess: string;
  difficulty: 1 | 2 | 3;
}

interface Scores {
  overall: string;
  CP: string;
  CARS: string;
  BB: string;
  PS: string;
}

const AAMC_CONTENT_CATEGORIES = [
  "Biochemistry",
  "Biology",
  "General Chemistry",
  "Organic Chemistry",
  "Physics",
  "Psychology",
  "Sociology",
  // Add all other AAMC content categories here
];

const SECTION_OPTIONS = ['CP', 'CARS', 'BB', 'PS'];

const FLSpecific: React.FC = () => {
  const [selectedFL, setSelectedFL] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scores, setScores] = useState<Scores>({
    overall: '',
    CP: '',
    CARS: '',
    BB: '',
    PS: '',
  });
  const [contentCategoryInput, setContentCategoryInput] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');

  useEffect(() => {
    const savedFL = localStorage.getItem('selectedFL');
    if (savedFL) {
      setSelectedFL(savedFL);
      const savedQuestions = JSON.parse(localStorage.getItem(`${savedFL}_questions`) || '[]');
      const savedScores = JSON.parse(localStorage.getItem(`${savedFL}_scores`) || '{}');
      setQuestions(savedQuestions);
      setScores(savedScores);
    }
  }, []);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      section: '',
      questionNumber: '',
      troubleReason: '',
      correctThoughtProcess: '',
      difficulty: 1,
    };
    setQuestions([...questions, newQuestion]);
    saveQuestions([...questions, newQuestion]);
  };

  const openModal = (question: Question) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedQuestion(null);
  };

  const updateQuestion = (updatedQuestion: Question) => {
    const updatedQuestions = questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
    closeModal();
  };

  const saveQuestions = (questionsToSave: Question[]) => {
    localStorage.setItem(`${selectedFL}_questions`, JSON.stringify(questionsToSave));
  };

  const updateScore = (section: keyof Scores, value: string) => {
    const newScores = { ...scores, [section]: value };
    setScores(newScores);
    localStorage.setItem(`${selectedFL}_scores`, JSON.stringify(newScores));
  };

  const handleContentCategoryChange = (value: string) => {
    setContentCategoryInput(value);
    setSelectedQuestion({...selectedQuestion, contentCategory: value});
    if (value) {
      const filtered = AAMC_CONTENT_CATEGORIES.filter(category => 
        category.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories([]);
    }
  };

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    // Implement sorting logic here
  };

  const handleScoreChange = (section: keyof Scores, value: string) => {
    updateScore(section, value);
    // Implement AI summary update logic here
    setAiSummary("This is a placeholder for the AI-generated summary based on your scores and performance.");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 bg-[#FFFDF3] h-full">
      <h2 className="text-2xl font-bold mb-2">{selectedFL || 'Select a FL'}</h2>
      
      {/* AI Summary */}
      <div className="w-full bg-white shadow-lg rounded-lg p-4 mb-4">
        <h2 className="text-xl font-bold mb-2">AI Summary</h2>
        <p className="text-sm">{aiSummary}</p>
      </div>

      <div className="flex w-full gap-8 flex-grow">
        {/* Left side: Questions grid */}
        <div className="w-3/4">
          <div className="border-2 border-gray-300 rounded-lg p-4 h-full overflow-y-auto">
            <div className="grid grid-cols-10 gap-2">
              {questions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => openModal(question)}
                  className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded flex items-center justify-center text-sm"
                >
                  {question.questionNumber || '?'}
                </button>
              ))}
              <button
                onClick={addQuestion}
                className="w-10 h-10 bg-green-100 hover:bg-green-200 rounded flex items-center justify-center text-xl"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Overall Score and Section Scores */}
        <div className="w-1/4 flex flex-col gap-4">
          {/* Overall Score */}
          <div className="bg-white shadow-lg rounded-lg p-4 flex items-center justify-center">
            <div className="text-6xl font-bold">
              517
            </div>
          </div>

          {/* Section Scores */}
          {SECTION_OPTIONS.map((section) => (
            <div key={section} className="flex items-center justify-between bg-white shadow-lg rounded-lg p-4">
              <button
                onClick={() => handleSectionClick(section)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                  activeSection === section ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {section}
              </button>
              <input
                type="text"
                value={scores[section as keyof Scores]}
                onChange={(e) => handleScoreChange(section as keyof Scores, e.target.value)}
                className="w-16 p-2 border rounded text-center"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Question Details</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={selectedQuestion.difficulty}
                onChange={(e) => setSelectedQuestion({...selectedQuestion, difficulty: Number(e.target.value) as 1 | 2 | 3})}
                className="w-full p-2 border rounded"
              >
                <option value={1}>Easy</option>
                <option value={2}>Medium</option>
                <option value={3}>Hard</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={selectedQuestion.section}
                onChange={(e) => setSelectedQuestion({...selectedQuestion, section: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Section</option>
                {SECTION_OPTIONS.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            <div className="flex mb-2 gap-2">
              <input
                type="text"
                value={selectedQuestion.questionNumber}
                onChange={(e) => setSelectedQuestion({...selectedQuestion, questionNumber: e.target.value})}
                placeholder="Question Number"
                className="w-1/2 p-2 border rounded"
              />
              <div className="w-1/2 relative">
                <input
                  type="text"
                  value={contentCategoryInput}
                  onChange={(e) => handleContentCategoryChange(e.target.value)}
                  placeholder="Content Category"
                  className="w-full p-2 border rounded"
                />
                {filteredCategories.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-40 overflow-y-auto">
                    {filteredCategories.map((category, index) => (
                      <li 
                        key={index} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleContentCategoryChange(category)}
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <textarea
              value={selectedQuestion.troubleReason}
              onChange={(e) => setSelectedQuestion({...selectedQuestion, troubleReason: e.target.value})}
              placeholder="Why did this question trouble you?"
              className="w-full p-2 mb-2 border rounded"
              rows={4}
            />
            <textarea
              value={selectedQuestion.correctThoughtProcess}
              onChange={(e) => setSelectedQuestion({...selectedQuestion, correctThoughtProcess: e.target.value})}
              placeholder="What is your corrected thought process?"
              className="w-full p-2 mb-4 border rounded"
              rows={4}
            />
            <div className="flex justify-end">
              <button
                onClick={() => updateQuestion(selectedQuestion)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
              >
                Save
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FLSpecific;
