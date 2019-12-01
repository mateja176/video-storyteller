import { DraftBlockType, EditorState } from 'draft-js';
import { find, pipe, prop } from 'ramda';
import React from 'react';
import Select from 'react-select';
import { useTheme } from '@material-ui/core';

interface BlockValue {
  label: string;
  value: DraftBlockType;
}

type BlockValues = BlockValue[];

const headings: BlockValues = [
  { label: 'H1', value: 'header-one' },
  { label: 'H2', value: 'header-two' },
  { label: 'H3', value: 'header-three' },
  { label: 'H4', value: 'header-four' },
  { label: 'H5', value: 'header-five' },
  { label: 'H6', value: 'header-six' },
];

const lists: BlockValues = [
  { label: 'Bulleted', value: 'unordered-list-item' },
  { label: 'Ordered', value: 'ordered-list-item' },
];

const otherBlockTypes: BlockValues = [
  { label: 'Blockquote', value: 'blockquote' },
  { label: 'Code Block', value: 'code-block' },
];

const blockTypes = otherBlockTypes.concat(headings).concat(lists);

const blockValues: Array<
  BlockValue | { label: BlockValue['label']; options: BlockValues }
> = [
  ...otherBlockTypes,
  { label: 'Lists', options: lists },
  { label: 'Headings', options: headings },
];

export interface BlockTypeControlsProps {
  editorState: EditorState;
  onToggle: (style: DraftBlockType) => void;
}

const BlocType: React.FC<BlockTypeControlsProps> = ({
  editorState,
  onToggle,
}) => {
  const selection = editorState.getSelection();

  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  const findActive = find<BlockValue>(({ value }) => blockType === value);

  const activeType = findActive(blockTypes);

  const theme = useTheme();

  return (
    <Select
      placeholder="Block Type..."
      options={blockValues}
      value={activeType || null}
      onChange={pipe(
        prop('value') as any,
        onToggle,
      )}
      menuPortalTarget={document.body}
      styles={{
        container: base => ({
          ...base,
          minWidth: 150,
        }),
        menuPortal: base => ({
          ...base,
          zIndex: theme.zIndex.modal,
        }),
      }}
    />
  );
};

export default BlocType;
