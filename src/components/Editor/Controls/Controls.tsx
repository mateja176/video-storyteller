import { EditorState } from 'draft-js';
import React from 'react';
import { Flex } from 'rebass';
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
  <Flex alignItems="center" height="100%">
    <BlockTypeControls editorState={editorState} onToggle={toggleBlockType} />
    <InlineStylesControls
      editorState={editorState}
      onToggle={toggleInlineStyle}
    />
  </Flex>
);

export default Controls;
