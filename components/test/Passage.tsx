import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import {
  Editor,
  EditorState,
  ContentState,
  RichUtils,
  DraftHandleValue,
  KeyBindingUtil,
  getDefaultKeyBinding,
  ContentBlock,
  SelectionState,
  Modifier,
} from "draft-js";
import "draft-js/dist/Draft.css";
import styles from "./Passage.module.css";
import type { Passage, UserResponse } from "@/types";

interface PassageProps {
  passageData: Passage;
  onNote: (text: string) => void;
  tempHighlightedStrings?: string[];
  userResponse?: UserResponse;
  onFocus?: () => void;
}

interface Annotation {
  style: string;
  text: string;
}

interface PassageRef {
  applyStyle: (style: string) => void;
  getAnnotations: () => Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
}

function applyAnnotations(editorState: EditorState, annotations: Annotation[]): EditorState {
  let contentState: ContentState = editorState.getCurrentContent();

  // Sort annotations by start index to ensure consistent application
  annotations.sort((a, b) => contentState.getPlainText().indexOf(a.text) - contentState.getPlainText().indexOf(b.text));

  annotations.forEach(({ style, text }) => {
    // UserNotes might contain newlines symbol
    const textArray = text.split("\n");
    const blocks: ContentBlock[] = contentState.getBlocksAsArray();
    blocks.forEach((block) => {
      const blockText: string = block.getText();
      let start: number = 0;
      for (const txt of textArray) {
        const index: number = blockText.indexOf(txt, start);
        if (index === -1) continue;

        const selection: SelectionState = SelectionState.createEmpty(block.getKey()).merge({
          anchorOffset: index,
          focusOffset: index + txt.length,
        });

        const currentStyle = editorState.getCurrentInlineStyle();
        if (currentStyle.has(style)) {
          // If the current style is the same, toggle (remove) it
          contentState = Modifier.removeInlineStyle(contentState, selection, style);
        } else {
          // If the current style is different, apply the new style
          contentState = Modifier.applyInlineStyle(contentState, selection, style);
        }

        start = index + 1; // Move only one character to catch overlapping annotations
      }
    });
  });

  return EditorState.push(editorState, contentState, 'change-inline-style');
}

const Passage = forwardRef<PassageRef, PassageProps>(
  (
    { passageData, onNote, tempHighlightedStrings, userResponse, onFocus },
    ref
  ) => {
    const [editorState, setEditorState] = useState(() => {
      const initialState = EditorState.createWithContent(
        ContentState.createFromText(passageData?.text || "")
      );
      return initialState;
    });

    const [annotations, setAnnotations] = useState<Annotation[]>([]);

    useImperativeHandle(ref, () => ({
      applyStyle,
      getAnnotations: () => annotations,
      setAnnotations: (loadedAnnotations: Annotation[]) => {
        setAnnotations(loadedAnnotations);
      },
    }));

    const handleEditorFocus = () => {
      if (onFocus) onFocus();
    };

    const getSelectedText = (editorState: EditorState): string => {
      const selectionState = editorState.getSelection();
      const startKey = selectionState.getStartKey();
      const endKey = selectionState.getEndKey();
      const startOffset = selectionState.getStartOffset();
      const endOffset = selectionState.getEndOffset();
    
      const contentState = editorState.getCurrentContent();
      const blockMap = contentState.getBlockMap();
      const blocks = blockMap.toArray();
    
      const startIndex = blocks.findIndex((block) => block.getKey() === startKey);
      const endIndex = blocks.findIndex((block) => block.getKey() === endKey);
    
      const selectedBlocks = blocks.slice(startIndex, endIndex + 1);
    
      const selectedTextArray = selectedBlocks.map((block) => {
        const key = block.getKey();
        const text = block.getText();
        let blockStart = 0;
        let blockEnd = text.length;
    
        if (key === startKey) {
          blockStart = startOffset;
        }
        if (key === endKey) {
          blockEnd = endOffset;
        }
    
        return text.slice(blockStart, blockEnd);
      });
    
      const selectedText = selectedTextArray.join('\n');
      return `"${selectedText}"`;
    };
    
    const styleMap = {
      HIGHLIGHT: {
        backgroundColor: "yellow",
      },
      TEMP_HIGHLIGHT: {
        backgroundColor: "lightblue",
      },
      STRIKETHROUGH: {
        textDecoration: "line-through",
      },
    };

    const editorStyle = {
      fontFamily: "inherit",
    };

    const blockStyleFn = (contentBlock: ContentBlock) => {
      const type = contentBlock.getType();
      if (type === "unstyled") {
        return styles.paragraph;
      }
      return ""; // Return an empty string for non-matching cases
    };

    const handleBeforeInput = (chars: string, editorState: EditorState): DraftHandleValue => {
      return "handled";
    };

    const handlePastedText = (
      text: string,
      html: string | undefined,
      editorState: EditorState
    ): DraftHandleValue => {
      return "handled";
    };

    const handleDrop = (): DraftHandleValue => {
      return "handled";
    };

    const applyStyle = (style: string) => {
      const selectionState = editorState.getSelection();
      if (!selectionState.isCollapsed()) { // Check if there is a valid selection
        const currentStyle = editorState.getCurrentInlineStyle();
        const newState = RichUtils.toggleInlineStyle(editorState, style);

        if (!currentStyle.has(style)) { // Check if the style was not already applied
          const selectionInfo = getSelectedText(newState);
          const newAnnotation: Annotation = { style, text: selectionInfo };
          setAnnotations((prev) => [...prev, newAnnotation]);
          // onNote(`${style} : ${selectionInfo}`);
        }

        setEditorState(newState);
      }
    };

    const handleKeyCommand = (command: string): DraftHandleValue => {
      if (command === "delete" || command === "backspace" || command === "split-block") {
        return "handled";
      }
      if (command === "toggle-highlight") {
        applyStyle("HIGHLIGHT");
        return "handled";
      }
      if (command === "toggle-strikethrough") {
        applyStyle("STRIKETHROUGH");
        return "handled";
      }
      return "not-handled";
    };

    const keyBindingFn = (e: React.KeyboardEvent): string | null => {
      if (KeyBindingUtil.hasCommandModifier(e) && e.shiftKey) {
        if (e.key === "H" || e.key === "h") {
          return "toggle-highlight";
        }
        if (e.key === "X" || e.key === "x") {
          return "toggle-strikethrough";
        }
      }
      if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 88) {
        // 88 is the keyCode for 'x'
        return "ignore";
      }
      return getDefaultKeyBinding(e);
    };

    // Function to remove an inline style from the entire content
    function removeInlineStyleFromContentState(contentState: ContentState, style: string): ContentState {
      const blocks = contentState.getBlocksAsArray();
      blocks.forEach((block) => {
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
          
    useEffect(() => {
      const contentState = editorState.getCurrentContent();
      if (contentState.getPlainText().trim() === '') return; // Ensure content is loaded
    
      const timer = setTimeout(() => {
        let newContentState = contentState;
    
        // Remove existing 'HIGHLIGHT' and 'STRIKETHROUGH' styles
        newContentState = removeInlineStyleFromContentState(newContentState, "HIGHLIGHT");
        newContentState = removeInlineStyleFromContentState(newContentState, "STRIKETHROUGH");

        // Update the editor state with the new content state
        let newEditorState = EditorState.push(editorState, newContentState, 'change-inline-style');
        setEditorState(newEditorState);

        if (!userResponse?.userNotes) return;

        const annotations = parseUserNotes(userResponse.userNotes!);

        if (annotations.length > 0) {
          newEditorState = applyAnnotations(EditorState.createWithContent(newContentState), annotations);
          setEditorState(newEditorState);
        }
      }, 3000); 
    
      return () => clearTimeout(timer);
      
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userResponse?.questionId]);

    // Function to parse userNotes and extract annotations
    function parseUserNotes(userNotes: string): Annotation[] {
      const annotations: Annotation[] = [];
      const delimiter = "|||";
      const lines = userNotes.split(delimiter);
      for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        // New regex pattern to match the actual format
        const regex = /^\[([^\]]+)\]\s*-\s*(HIGHLIGHT|STRIKETHROUGH)\s*:\s*"([\s\S]*)"$/;
        const match = line.match(regex);
        if (match) {
          const style = match[2];
          const text = match[3];
          annotations.push({ style, text });
          console.log(`Style: ${style}, Text: ${text}`);
        }
      }
      return annotations;
    }

    useEffect(() => {
      let contentState = editorState.getCurrentContent();

      // Remove existing 'TEMP_HIGHLIGHT' styles
      contentState = removeInlineStyleFromContentState(contentState, "TEMP_HIGHLIGHT");

      if (tempHighlightedStrings && tempHighlightedStrings.length > 0) {
        tempHighlightedStrings.forEach((str) => {
          const blocks = contentState.getBlocksAsArray();
          blocks.forEach((block) => {
            const blockText = block.getText();
            let start = 0;
            while (true) {
              const index = blockText.indexOf(str, start);
              if (index === -1) break;
              const selection = SelectionState.createEmpty(block.getKey()).merge({
                anchorOffset: index,
                focusOffset: index + str.length,
              });
              contentState = Modifier.applyInlineStyle(contentState, selection, "TEMP_HIGHLIGHT");
              start = index + str.length;
            }
          });
        });
      }

      const newEditorState = EditorState.push(editorState, contentState, "change-inline-style");
      setEditorState(newEditorState);

      // Only set up the timeout to remove 'TEMP_HIGHLIGHT' if there are no userNotes
      if (!userResponse?.userNotes) {
        const timeoutId = setTimeout(() => {
          let updatedContentState = editorState.getCurrentContent();
          updatedContentState = removeInlineStyleFromContentState(updatedContentState, "TEMP_HIGHLIGHT");
          const clearedEditorState = EditorState.push(
            editorState,
            updatedContentState,
            "change-inline-style"
          );
          setEditorState(clearedEditorState);
        }, 5000); // 5000 milliseconds = 5 seconds

        // Cleanup function to clear the timeout if the component unmounts
        return () => {
          clearTimeout(timeoutId);
        };
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tempHighlightedStrings, userResponse?.userNotes]);

    // Reset annotations when question changes
    useEffect(() => {
      setAnnotations([]);
    }, [passageData]);

    return (
      <div className="bg-[#ffffff] h-[80vh] flex flex-col font-serif">
        <div className="sticky top-0 bg-white p-4 z-10">
          <h1 className="text-black font-serif text-1xl font-bold">{passageData.title}</h1>
        </div>
        <div className="bg-[#ffffff] flex-grow overflow-auto p-4 standard-scrollbar">
          <div className="text-black" style={editorStyle}>
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              onFocus={handleEditorFocus}
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
            <p className="text-black mt-4 text-xs">{passageData.citation}</p>
          )}
        </div>
      </div>
    );
  }
);

Passage.displayName = "Passage";

export default Passage;
