// components/VocabList.tsx

import React from 'react';
import { useVocab } from '@/store/selectors';

const VocabList: React.FC = () => {
  const { vocabList, removeVocabWord } = useVocab();

  return (
    <div className="p-4 bg-gray-100 text-black rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4">Vocabulary List</h3>
      {vocabList.length === 0 ? (
        <p>No vocab words added yet.</p>
      ) : (
        <ul className="space-y-2">
          {vocabList.map((vocab, index) => (
            <li key={index} className="flex justify-between items-center bg-white p-2 rounded shadow">
              <div>
                <strong className="capitalize">{vocab.word}</strong>: {vocab.definitions}
              </div>
              <button
                onClick={() => removeVocabWord(vocab.word)}
                className="text-red-500 hover:text-red-700"
                aria-label={`Remove ${vocab.word}`}
              >
                &#x2715;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VocabList;
