import { Box } from '@material-ui/core';
import { EditorState } from 'draft-js';
import React from 'react';
import { BlockTypeControls, InlineStylesControls } from '.';
import { BlockTypeControlsProps } from './BlockType';
import { InlineStylesControlsProps } from './InlineStyles';

export interface ControlsProps {
  editorState: EditorState;
  toggleBlockType: BlockTypeControlsProps['onToggle'];
  toggleInlineStyle: InlineStylesControlsProps['onToggle'];
}

const Controls: React.FC<ControlsProps> = ({
  editorState,
  toggleBlockType,
  toggleInlineStyle,
}) => (
  <Box display="flex" alignItems="center" height="100%">
    <BlockTypeControls editorState={editorState} onToggle={toggleBlockType} />
    <InlineStylesControls
      editorState={editorState}
      onToggle={toggleInlineStyle}
    />
  </Box>
);

export default Controls;
