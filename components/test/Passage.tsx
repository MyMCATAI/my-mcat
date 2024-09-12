import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Editor, EditorState, ContentState, RichUtils, convertToRaw, convertFromRaw, DraftHandleValue, KeyBindingUtil, getDefaultKeyBinding, ContentBlock } from 'draft-js';
import 'draft-js/dist/Draft.css';
import styles from './Passage.module.css';
import type { Passage } from '@/types';

interface PassageProps {
  passageData: Passage;
  onNote?: (text: string) => void;
}

const Passage = forwardRef<{ applyStyle: (style: string) => void }, PassageProps>(({ 
  passageData, 
  onNote, 
}, ref) => {

  const [editorState, setEditorState] = useState(() => 
    EditorState.createWithContent(ContentState.createFromText(passageData?.text || ""))
  );

  useEffect(() => {
    const savedContent = typeof window !== 'undefined' ? localStorage.getItem(`passage-${passageData.id}`) : null;
    if (savedContent) {
      const content = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(content));
    } else {
      setEditorState(EditorState.createWithContent(ContentState.createFromText(passageData.text)));
    }
  }, [passageData.id, passageData.text]);

  useEffect(() => {
    const content = convertToRaw(editorState.getCurrentContent());
    localStorage.setItem(`passage-${passageData.id}`, JSON.stringify(content));
  }, [editorState, passageData.id]);

  
  useImperativeHandle(ref, () => ({
    applyStyle
  }));

  const getSelectedText = (editorState: EditorState): string => {
    const selectionState = editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(anchorKey);
    const start = selectionState.getStartOffset();
    const end = selectionState.getEndOffset();
    const selectedText = currentContentBlock.getText().slice(start, end);
    return `[${start},${end}], "${selectedText}"`;
  };

  const styleMap = {
    'HIGHLIGHT': {
      backgroundColor: 'yellow',
    },
    'STRIKETHROUGH': {
      textDecoration: 'line-through',
    },
  };

  const editorStyle = {
    fontFamily: 'inherit',
  };

  const blockStyleFn = (contentBlock: ContentBlock) => {
    const type = contentBlock.getType();
    if (type === 'unstyled') {
      return styles.paragraph;
    }
    return ''; // Return an empty string for non-matching cases
  };

  const handleBeforeInput = (chars: string, editorState: EditorState): DraftHandleValue => {
    return 'handled';
  };

  const handlePastedText = (text: string, html: string | undefined, editorState: EditorState): DraftHandleValue => {
    return 'handled';
  };

  const handleDrop = (): DraftHandleValue => {
    return 'handled';
  };

  const applyStyle = (style: string) => {
    const newState = RichUtils.toggleInlineStyle(editorState, style);
    const selectionInfo = getSelectedText(newState);

    onNote && onNote(style + " : " +selectionInfo);

    setEditorState(newState);
  };

  const handleKeyCommand = (command: string): DraftHandleValue => {
    if (command === 'delete' || command === 'backspace') {
      return 'handled';
    }
    if (command === 'toggle-highlight') {
      applyStyle('HIGHLIGHT');
      return 'handled';
    }
    if (command === 'toggle-strikethrough') {
      applyStyle('STRIKETHROUGH');
      return 'handled';
    }
    return 'not-handled';
  };

  const keyBindingFn = (e: React.KeyboardEvent): string | null => {
    if (KeyBindingUtil.hasCommandModifier(e) && e.shiftKey) {
      if (e.key === 'H' || e.key === 'h') {
        return 'toggle-highlight';
      }
      if (e.key === 'X' || e.key === 'x') {
        return 'toggle-strikethrough';
      }
    }
    if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 88) { // 88 is the keyCode for 'x'
      return 'ignore';
    }
    return getDefaultKeyBinding(e);
  };

  return (
    <div className="bg-[#ffffff] h-[80vh] flex flex-col font-serif text-lg">
      <div className="sticky top-0 bg-white p-4 z-10">
        <h1 className="text-black font-serif text-1xl font-bold">
          {passageData.title}
        </h1>
      </div>
      <div className="bg-[#ffffff] flex-grow overflow-auto p-4">
        <div className="text-black" style={editorStyle}>
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            customStyleMap={styleMap}
            handleBeforeInput={handleBeforeInput}
            handlePastedText={handlePastedText}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
            blockStyleFn={blockStyleFn}
            handleDrop={handleDrop}
          />
        </div>
        {passageData.citation && (
          <p className="text-black mt-4">Citation: {passageData.citation}</p>
        )}
      </div>
    </div>
  );
});

Passage.displayName = 'Passage';

export default Passage;