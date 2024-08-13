import React, { useState, useEffect } from "react";
import { Editor, EditorState, ContentState, RichUtils, convertToRaw, convertFromRaw, SelectionState, DraftHandleValue, KeyBindingUtil, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';

export interface PassageData {
  id: string;
  text: string;
  citation: string;
}

interface PassageProps {
  passageData: PassageData;
  highlightActive: boolean;
  strikethroughActive: boolean;
}

const Passage: React.FC<PassageProps> = ({ passageData, highlightActive, strikethroughActive }) => {
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
    <div className="bg-[#ffffff] from-blue-900 h-[80vh] p-4 overflow-auto">
      <div className="px-4">
        <h1 className="text-black font-['Calibri'] text-2xl font-bold mt-5">
          Passage {passageData.id}
        </h1>
      </div>
      <div className="p-4">
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