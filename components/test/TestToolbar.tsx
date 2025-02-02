import React, { useState, useEffect } from 'react';
import { Pencil, Highlighter, Flag, HelpCircle } from 'lucide-react';

interface TestToolbarProps {
  onHighlight: () => void;
  onStrikethrough: () => void;
  onFlag: () => void;
  onToggleVocabList: () => void;
  showVocabList: boolean;
  flashHighlight: boolean;
  flashStrikethrough: boolean;
  flashFlag: boolean;
  canFlag: boolean;
}

const TestToolbar: React.FC<TestToolbarProps> = ({
  onHighlight,
  onStrikethrough,
  onFlag,
  onToggleVocabList,
  showVocabList,
  flashHighlight,
  flashStrikethrough,
  flashFlag,
  canFlag,
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const modifierKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="h-9 border-t-2 border-b-2 border-white bg-[#84aedd] flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <button
          className={`px-3 py-1 rounded transition-colors duration-200 flex items-center ${
            flashHighlight
              ? "bg-transparent text-yellow-300"
              : "bg-transparent text-white hover:bg-white/10"
          }`}
          onClick={onHighlight}
          aria-label={`Highlight (${modifierKey}+H)`}
          title={`Highlight (${modifierKey}+H)`}
        >
          <Highlighter className="w-4 h-4 mr-2" />
          Highlight <span className="ml-1 text-lg">({modifierKey}+H)</span>
        </button>
        <button
          className={`px-3 py-1 rounded transition-colors duration-200 flex items-center ${
            flashStrikethrough
              ? "bg-transparent text-yellow-300"
              : "bg-transparent text-white hover:bg-white/10"
          }`}
          onClick={onStrikethrough}
          aria-label={`Strikethrough (${modifierKey}+S)`}
          title={`Strikethrough (${modifierKey}+S)`}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Strikethrough <span className="ml-1 text-lg">({modifierKey}+S)</span>
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onMouseEnter={() => setShowShortcuts(true)}
            onMouseLeave={() => setShowShortcuts(false)}
            className="rounded px-2 transition-colors duration-200 flex items-center text-white hover:bg-white/10"
            aria-label="Keyboard Shortcuts"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {showShortcuts && (
            <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg text-sm text-gray-700 z-50">
              <h4 className="font-semibold mb-2 text-gray-900">Keyboard Shortcuts:</h4>
              <ul className="space-y-1">
                <li className="flex items-center">
                  <span className="font-mono bg-gray-100 px-1 rounded">{modifierKey}+H</span>
                  <span className="ml-2">- Highlight text</span>
                </li>
                <li className="flex items-center">
                  <span className="font-mono bg-gray-100 px-1 rounded">{modifierKey}+S</span>
                  <span className="ml-2">- Strikethrough text</span>
                </li>
                <li className="flex items-center">
                  <span className="font-mono bg-gray-100 px-1 rounded">{modifierKey}+A</span>
                  <span className="ml-2">- Toggle AI Assistant</span>
                </li>
                <li className="flex items-center">
                  <span className="font-mono bg-gray-100 px-1 rounded">{modifierKey}+I</span>
                  <span className="ml-2">- Look up selected word</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={onToggleVocabList}
          className={`rounded px-2 transition-colors duration-200 flex items-center ${
            showVocabList ? "bg-blue-500" : "bg-transparent"
          } text-white hover:bg-blue-600`}
          aria-label={showVocabList ? "Hide Vocabulary List" : "Show Vocabulary List"}
          title="View Vocabulary List"
        >
          📚
        </button>

        <button
          className={`px-3 py-1 rounded transition-colors duration-200 flex items-center ${
            flashFlag
              ? "bg-transparent text-yellow-300"
              : canFlag
              ? "bg-transparent text-white hover:bg-white/10"
              : "bg-transparent text-gray-400 cursor-not-allowed"
          }`}
          onClick={onFlag}
          aria-label="Flag for Review"
          title={canFlag ? "Flag for Review" : "Select an answer before flagging"}
          disabled={!canFlag}
        >
          <Flag className="w-4 h-4 mr-2" />
          Flag for Review
        </button>
      </div>
    </div>
  );
};

export default TestToolbar;
