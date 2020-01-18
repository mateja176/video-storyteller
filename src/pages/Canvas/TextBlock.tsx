import { Editor } from 'components';
import { convertToRaw } from 'draft-js';
import { createDropText, EditorProps } from 'models';
import React from 'react';
import { useDrag } from 'react-dnd';
import { Box } from 'rebass';
import { dividingBorder } from 'styles';

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
    <Box
      ref={dragRef}
      p={10}
      style={{
        border: dividingBorder,
        display: 'inline-block',
        cursor: 'grab',
      }}
    >
      <Editor {...editorProps} />
    </Box>
  );
};

export default TextBlock;
