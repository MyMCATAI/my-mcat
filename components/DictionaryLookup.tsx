import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { VocabContext } from "@/contexts/VocabContext"; // Update import path

interface DictionaryLookupProps {
  word: string;
  onClose: () => void;
}

interface Definition {
  partOfSpeech: string;
  definition: string;
  example?: string;
}

const DictionaryLookup: React.FC<DictionaryLookupProps> = ({
  word,
  onClose,
}) => {
  const { addVocabWord } = useContext(VocabContext);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    const fetchDefinitions = async () => {
      try {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch definitions");
        }

        const responseData = await response.json();
        const data = responseData[0];
        const uniqueDefinitions = data.meanings.reduce(
          (acc: Definition[], meaning: any) => {
            if (!acc.some((def) => def.partOfSpeech === meaning.partOfSpeech)) {
              acc.push({
                partOfSpeech: meaning.partOfSpeech,
                definition: meaning.definitions[0].definition,
                example: meaning.definitions[0].example,
              });
            }
            return acc;
          },
          []
        );
        setDefinitions(uniqueDefinitions);

        // Automatically add all definitions to the vocab list
        if (uniqueDefinitions.length > 0) {
          const allDefinitions = uniqueDefinitions
            .map((def: Definition) => `(${def.partOfSpeech}) ${def.definition}`)
            .join("; ");
          addVocabWord(word, allDefinitions);
        }
      } catch (err) {
        console.error("Error fetching definitions:", err);
        setError("Failed to fetch definitions.");
        setDefinitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDefinitions();
  }, [word, addVocabWord]);

  if (loading)
    return (
      <div className="bg-black p-4 rounded shadow-lg text-white">
        Loading...
      </div>
    );

  return (
    <div
      ref={boxRef}
      className="bg-blue-100 text-black p-4 rounded shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto relative"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        aria-label="Close"
      >
        &#x2715;
      </button>
      <h2 className="text-sm font-bold mb-2">{word}</h2>
      {error && <p className="text-red-500">{error}</p>}
      {definitions.length > 0
        ? definitions.map((def, index) => (
            <div key={index} className="mb-4">
              <p className="font-semibold capitalize">{def.partOfSpeech}</p>
              <p>{def.definition}</p>
              {def.example && (
                <p className="text-gray-600 italic">Example: {def.example}</p>
              )}
            </div>
          ))
        : !error && <p>No definitions found.</p>}
    </div>
  );
};

export default DictionaryLookup;
