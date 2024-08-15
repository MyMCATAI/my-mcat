import React, { useState, useEffect } from "react";
import { Editor, EditorState, ContentState, RichUtils, convertToRaw, convertFromRaw, DraftHandleValue, KeyBindingUtil, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Button } from "../ui/button";

export interface PassageData {
  id: string;
  text: string;
  citation: string;
}

interface PassageProps {
  passageData: PassageData;
  allowHighlight: boolean;
}

const Passage: React.FC<PassageProps> = ({ passageData, allowHighlight }) => {
  const [highlightActive, setHighlightActive] = useState(false);
  const [strikethroughActive, setStrikethroughActive] = useState(false);

  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem(`passage-${passageData.id}`);
    if (savedContent) {
      const content = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(content);
    }
    return EditorState.createWithContent(ContentState.createFromText(passageData.text));
  });

  useEffect(() => {
    const content = convertToRaw(editorState.getCurrentContent());
    localStorage.setItem(`passage-${passageData.id}`, JSON.stringify(content));
  }, [editorState, passageData.id]);

  useEffect(() => {
    const selection = editorState.getSelection();
    if (!selection.isCollapsed()) {
      if (highlightActive) {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT'));
      } else if (strikethroughActive) {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH'));
      }
    }
  }, [highlightActive, strikethroughActive, editorState]);

  const handleHighlight = () => {
    setHighlightActive(!highlightActive);
    setStrikethroughActive(false);
  };

  const handleStrikethrough = () => {
    setStrikethroughActive(!strikethroughActive);
    setHighlightActive(false);
  };

  const styleMap = {
    'HIGHLIGHT': {
      backgroundColor: 'yellow',
    },
    'STRIKETHROUGH': {
      textDecoration: 'line-through',
    },
  };

  const handleBeforeInput = (chars: string, editorState: EditorState): DraftHandleValue => {
    return 'handled';
  };

  const handlePastedText = (text: string, html: string | undefined, editorState: EditorState): DraftHandleValue => {
    return 'handled';
  };

  const handleKeyCommand = (command: string): DraftHandleValue => {
    if (command === 'delete' || command === 'backspace') {
      return 'handled';
    }
    return 'not-handled';
  };

  const keyBindingFn = (e: React.KeyboardEvent): string | null => {
    if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 88) { // 88 is the keyCode for 'x'
      return 'ignore';
    }
    return getDefaultKeyBinding(e);
  };

  return (
    <div className="bg-[#ffffff] h-[80vh] flex flex-col">
      <div className="sticky top-0 bg-white p-4 z-10">
        <h1 className="text-black font-['Calibri'] text-2xl font-bold">
          Passage {passageData.id}
        </h1>
        {allowHighlight && (
          <div className="mt-4 space-x-2">
            <Button
              className={`text-black ${
                highlightActive ? 'bg-[#80BFFF] hover:bg-[#E6F3FF]/90' : 'hover:text-black'
              }`}
              onClick={handleHighlight}
              variant={highlightActive ? "default" : "outline"}
            >
              Highlight
            </Button>
            <Button
              className={`text-black ${
                strikethroughActive ? 'bg-[#80BFFF] hover:bg-[#E6F3FF]/90' : 'hover:text-black'
              }`}
              onClick={handleStrikethrough}
              variant={strikethroughActive ? "default" : "outline"}
            >
              Strikethrough
            </Button>
          </div>
        )}
      </div>
      <div className="flex-grow overflow-auto p-4">
        <div className="text-black">
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            customStyleMap={styleMap}
            handleBeforeInput={handleBeforeInput}
            handlePastedText={handlePastedText}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
          />
        </div>
        {passageData.citation && (
          <p className="text-black mt-4">Citation: {passageData.citation}</p>
        )}
      </div>
    </div>
  );
};

export default Passage;