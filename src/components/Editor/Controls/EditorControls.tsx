import {
  DraftBlockType,
  DraftInlineStyleType,
  EditorState,
  RichUtils,
} from 'draft-js';
import { EditorProps } from 'models';
import React from 'react';
import Controls from './Controls';

export interface EditorControlsProps
  extends Pick<EditorProps, 'editorState' | 'setEditorState'> {}

const EditorControls: React.FC<EditorControlsProps> = ({
  editorState,
  setEditorState,
}) => {
  const toggleBlockType = (blockType: DraftBlockType) => {
    const newEditorState = RichUtils.toggleBlockType(editorState, blockType);
    setEditorState(
      EditorState.acceptSelection(newEditorState, editorState.getSelection()),
    );
  };

  const toggleInlineStyle = (inlineStyle: DraftInlineStyleType) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  return (
    <Controls
      editorState={editorState}
      toggleBlockType={toggleBlockType}
      toggleInlineStyle={toggleInlineStyle}
    />
  );
};

export default EditorControls;
