import { Editor } from 'components';
import { convertToRaw } from 'draft-js';
import { EditorProps } from 'models';
import React from 'react';
import { useDrag } from 'react-dnd-cjs';
import { dividingBorder } from 'styles';
import { createDropText } from 'utils';

export interface TextBlockProps extends EditorProps {
  onDragEnd: () => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ onDragEnd, ...editorProps }) => {
  const { editorState } = editorProps;
  const rawEditorState = convertToRaw(editorState.getCurrentContent());
  const [, dragRef] = useDrag({
    item: createDropText({
      editorState: rawEditorState,
    }),
    end: onDragEnd,
  });

  return (
    <div
      ref={dragRef}
      style={{
        border: dividingBorder,
        display: 'inline-block',
        cursor: 'grab',
        padding: 10,
      }}
    >
      <Editor {...editorProps} />
    </div>
  );
};

export default TextBlock;
