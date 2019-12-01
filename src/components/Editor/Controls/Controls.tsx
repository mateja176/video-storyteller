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
  <div
    style={{
      display: 'grid',
      gridAutoFlow: 'column',
      gridGap: 20,
      alignItems: 'center',
      justifyContent: 'left',
    }}
  >
    <BlockTypeControls editorState={editorState} onToggle={toggleBlockType} />
    <InlineStylesControls
      editorState={editorState}
      onToggle={toggleInlineStyle}
    />
  </div>
);

export default Controls;
