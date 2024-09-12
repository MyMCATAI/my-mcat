import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DictionaryLookupProps {
  word: string;
  onClose: () => void;
}

interface Definition {
  definition: string;
  example?: string;
}

const DictionaryLookup: React.FC<DictionaryLookupProps> = ({ word, onClose }) => {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefinition = async () => {
      try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = response.data[0];
        const meanings = data.meanings.flatMap((meaning: any) =>
          meaning.definitions.map((def: any) => ({
            definition: def.definition,
            example: def.example,
          }))
        );
        setDefinitions(meanings);
        setLoading(false);
      } catch (err) {
        setError('Unable to fetch definition');
        setLoading(false);
      }
    };

    fetchDefinition();
  }, [word]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded shadow-lg max-w-md w-full">
      <h2 className="text-xl font-bold mb-2">{word}</h2>
      {definitions.map((def, index) => (
        <div key={index} className="mb-2">
          <p>{def.definition}</p>
          {def.example && <p className="text-gray-600 italic">Example: {def.example}</p>}
        </div>
      ))}
      <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Close</button>
    </div>
  );
};

export default DictionaryLookup;