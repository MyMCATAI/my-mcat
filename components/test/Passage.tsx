import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Editor, EditorState, ContentState, RichUtils, convertToRaw, convertFromRaw, DraftHandleValue, KeyBindingUtil, getDefaultKeyBinding, ContentBlock, SelectionState, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import styles from './Passage.module.css';
import type { Passage } from '@/types';

interface PassageProps {
  passageData: Passage;
  onNote?: (text: string) => void;
  highlightedStrings?: string[];
}

const Passage = forwardRef<{ applyStyle: (style: string) => void }, PassageProps>(({ 
  passageData, 
  onNote,
  highlightedStrings
}, ref) => {

  const [editorState, setEditorState] = useState(() => 
    EditorState.createWithContent(ContentState.createFromText(passageData?.text || ""))
  );

  useEffect(() => {
    const savedContent = typeof window !== 'undefined' ? localStorage.getItem(`passage-${passageData.id}`) : null;
    let contentState;
    if (savedContent) {
      contentState = convertFromRaw(JSON.parse(savedContent));
    } else {
      contentState = ContentState.createFromText(passageData.text);
    }
    setEditorState(EditorState.createWithContent(contentState));
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

  // Function to remove an inline style from the entire content
  function removeInlineStyleFromContentState(contentState: ContentState, style: string): ContentState {
    const blocks = contentState.getBlocksAsArray();
    blocks.forEach(block => {
      const blockKey = block.getKey();
      const blockLength = block.getLength();
      if (blockLength > 0) {
        const selection = SelectionState.createEmpty(blockKey).merge({
          anchorOffset: 0,
          focusOffset: blockLength,
        });
        contentState = Modifier.removeInlineStyle(contentState, selection, style);
      }
    });
    return contentState;
  }

  // Apply highlights when highlightedStrings change
  useEffect(() => {
    let contentState = editorState.getCurrentContent();

    // Remove existing 'HIGHLIGHT' styles
    contentState = removeInlineStyleFromContentState(contentState, 'HIGHLIGHT');

    if (highlightedStrings && highlightedStrings.length > 0) {
      highlightedStrings.forEach(str => {
        const blocks = contentState.getBlocksAsArray();
        blocks.forEach(block => {
          const blockText = block.getText();
          let start = 0;
          while (true) {
            const index = blockText.indexOf(str, start);
            if (index === -1) break;
            const selection = SelectionState.createEmpty(block.getKey()).merge({
              anchorOffset: index,
              focusOffset: index + str.length,
            });
            contentState = Modifier.applyInlineStyle(contentState, selection, 'HIGHLIGHT');
            start = index + str.length;
          }
        });
      });
    }

    const newEditorState = EditorState.push(editorState, contentState, 'change-inline-style');
    setEditorState(newEditorState);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedStrings]);

  return (
    <div className="bg-[#ffffff] h-[80vh] flex flex-col font-serif">
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
