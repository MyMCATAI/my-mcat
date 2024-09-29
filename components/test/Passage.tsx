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
}

interface Annotation {
  style: string;
  text: string;
}

function applyAnnotations(editorState: EditorState, annotations: Annotation[]): EditorState {
  let contentState: ContentState = editorState.getCurrentContent();

  // Sort annotations by start index to ensure consistent application
  annotations.sort((a, b) => contentState.getPlainText().indexOf(a.text) - contentState.getPlainText().indexOf(b.text));

  annotations.forEach(({ style, text }) => {
    const blocks: ContentBlock[] = contentState.getBlocksAsArray();
    blocks.forEach((block) => {
      const blockText: string = block.getText();
      let start: number = 0;
      while (true) {
        const index: number = blockText.indexOf(text, start);
        if (index === -1) break;
        const selection: SelectionState = SelectionState.createEmpty(block.getKey()).merge({
          anchorOffset: index,
          focusOffset: index + text.length,
        });
        contentState = Modifier.applyInlineStyle(contentState, selection, style);
        start = index + 1; // Move only one character to catch overlapping annotations
      }
    });
  });

  return EditorState.push(editorState, contentState, 'change-inline-style');
}

const Passage = forwardRef<{ applyStyle: (style: string) => void }, PassageProps>(
  ({ passageData, onNote, tempHighlightedStrings, userResponse }, ref) => {
    const [editorState, setEditorState] = useState(() => {
      const initialState = EditorState.createWithContent(ContentState.createFromText(passageData?.text || ""));
      console.log("Initial editor state created");
      return initialState;
    });
    const notesAppliedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      applyStyle,
    }));
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
      const newState = RichUtils.toggleInlineStyle(editorState, style);
      const selectionInfo = getSelectedText(newState);

      console.log("selectionInfo")
      console.log(selectionInfo)
      onNote(style + " : " + selectionInfo);

      setEditorState(newState);
      console.log(`Style ${style} applied to editor state`);
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
      if (!userResponse?.userNotes || notesAppliedRef.current) return;
    
      const contentState = editorState.getCurrentContent();
      if (contentState.getPlainText().trim() === '') return; // Ensure content is loaded
    
      const timer = setTimeout(() => {
        let newContentState = contentState;
    
        // Remove existing 'HIGHLIGHT' and 'STRIKETHROUGH' styles
        newContentState = removeInlineStyleFromContentState(newContentState, "HIGHLIGHT");
        newContentState = removeInlineStyleFromContentState(newContentState, "STRIKETHROUGH");
        console.log("Applying userNotes", userResponse?.userNotes);

        const annotations = parseUserNotes(userResponse.userNotes!);
        console.log("Applying annotations", annotations);

        if (annotations.length > 0) {
          const newEditorState = applyAnnotations(EditorState.createWithContent(newContentState), annotations);
          setEditorState(newEditorState);
          console.log("Applied annotations to editor state after 3-second delay");
          notesAppliedRef.current = true;
        }
      }, 3000); 
    
      return () => clearTimeout(timer);
      
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userResponse?.userNotes]);

    // Reset the ref when userResponse?.userNotes changes
    useEffect(() => {
      notesAppliedRef.current = false;
    }, [userResponse?.userNotes]);

    // Function to parse userNotes and extract annotations
    function parseUserNotes(userNotes: string): Annotation[] {
      const annotations: Annotation[] = [];
      const lines = userNotes.split("\n");
      for (let line of lines) {
        line = line.trim();
        if (line === "") continue;
        // New regex pattern to match the actual format
        const regex = /^\[([^\]]+)\]\s*-\s*(HIGHLIGHT|STRIKETHROUGH)\s*:\s*"(.*)"$/;
        const match = line.match(regex);
        if (match) {
          const style = match[2];
          const text = match[3];
          annotations.push({ style, text });
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
      console.log("Applied temporary highlights to editor state");

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
          console.log("Removed temporary highlights from editor state");
        }, 5000); // 5000 milliseconds = 5 seconds

        // Cleanup function to clear the timeout if the component unmounts
        return () => {
          clearTimeout(timeoutId);
        };
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tempHighlightedStrings, userResponse?.userNotes]);

    return (
      <div className="bg-[#ffffff] h-[80vh] flex flex-col font-serif">
        <div className="sticky top-0 bg-white p-4 z-10">
          <h1 className="text-black font-serif text-1xl font-bold">{passageData.title}</h1>
        </div>
        <div className="bg-[#ffffff] flex-grow overflow-auto p-4 standard-scrollbar">
          <div className="text-black" style={editorStyle}>
            <Editor
              editorState={editorState}
              onChange={(newState) => {
                setEditorState(newState);
                console.log("Editor state changed");
              }}
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
  }
);

Passage.displayName = "Passage";

export default Passage;
