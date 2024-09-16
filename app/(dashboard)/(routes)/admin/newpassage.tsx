import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import QuestionEditor from './questioneditor';

interface NewPassagePageProps {
  onCancel: () => void;
}

const NewPassagePage: React.FC<NewPassagePageProps> = ({ onCancel }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [citation, setCitation] = useState('');
  const [content, setContent] = useState('');

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    // Implement save functionality here
    console.log({ title, citation, content });
    onCancel(); // Go back to search after saving
  };

  const [showAddQuestions, setShowAddQuestions] = useState(false);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  const handleAddQuestions = () => {
    setShowAddQuestions(true);
    setShowQuestionEditor(true);
  };

  const handleSaveQuestions = (questions: Question[]) => {
    // Handle saving questions here
    console.log('Saved questions:', questions);
    setShowQuestionEditor(false);
  };

  if (showQuestionEditor) {
    return (
      <QuestionEditor
        passageTitle={title}
        passageContent={content}
        passageCitation={citation}
        onSave={handleSaveQuestions}
        onCancel={() => setShowQuestionEditor(false)}
      />
    );
  }

  return (
    <div className="text-black">
      <h2 className="text-xl font-bold mb-6">New Passage</h2>
      
      <div className="mb-6 flex flex-col space-y-4">
        <div className={`${step >= 1 ? 'text-blue-600 font-bold' : ''}`}>1. Title</div>
        <div className={`${step >= 2 ? 'text-blue-600 font-bold' : ''}`}>2. Content</div>
        <div className={`${step >= 3 ? 'text-blue-600 font-bold' : ''}`}>3. Citation</div>
        <div className={`${step >= 4 ? 'text-blue-600 font-bold' : ''}`}>4. Preview</div>
      </div>

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
              toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
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

        <div>
          <h2 className="text-xl font-bold mb-4">Questions</h2>
          <button 
            onClick={handleAddQuestions} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add Questions
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={handlePrevious} className="px-4 py-2 bg-gray-200 rounded" disabled={step === 1}>
          Previous
        </button>
        {step < 4 ? (
          <button onClick={handleNext} className="px-4 py-2 bg-blue-500 text-white rounded">
            Next
          </button>
        ) : (
          <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded">
            Save
          </button>
        )}
      </div>
      
      <button onClick={onCancel} className="mt-4 text-blue-500">
        Cancel and return to search
      </button>
    </div>
  );
};

export default NewPassagePage;
