import {
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  ClickAwayListener,
} from '@material-ui/core';
import { TextFormat } from '@material-ui/icons';
import { DraftBlockType, EditorState } from 'draft-js';
import { find } from 'ramda';
import React from 'react';
import { Box } from 'rebass';

interface BlockTypeOption {
  label: string;
  value: DraftBlockType;
}

type BlockTypeOptions = BlockTypeOption[];

const headings: BlockTypeOptions = [
  { label: 'H1', value: 'header-one' },
  { label: 'H2', value: 'header-two' },
  { label: 'H3', value: 'header-three' },
  { label: 'H4', value: 'header-four' },
  { label: 'H5', value: 'header-five' },
  { label: 'H6', value: 'header-six' },
];

const lists: BlockTypeOptions = [
  { label: 'Bulleted', value: 'unordered-list-item' },
  { label: 'Ordered', value: 'ordered-list-item' },
];

const other: BlockTypeOptions = [
  { label: 'Blockquote', value: 'blockquote' },
  { label: 'Code Block', value: 'code-block' },
];

const blockTypeCategories: Array<{
  category: string;
  options: BlockTypeOptions;
}> = [
  { category: 'Lists', options: lists },
  { category: 'Headings', options: headings },
  { category: 'Other', options: other },
];

const allOptions = blockTypeCategories.flatMap(({ options }) => options);

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

  const findActive = find<BlockTypeOption>(({ value }) => blockType === value);

  const activeType = findActive(allOptions);

  const [open, setOpen] = React.useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const anchorRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <>
      <ClickAwayListener
        onClickAway={() => {
          setOpen(false);
        }}
      >
        <ListItem
          ref={anchorRef}
          button
          style={{ height: '100%' }}
          onClick={() => {
            toggleOpen();
          }}
        >
          <ListItemIcon style={{ minWidth: 'auto', marginRight: 10 }}>
            <TextFormat />
          </ListItemIcon>
          <ListItemText style={{ whiteSpace: 'nowrap' }}>
            {(activeType && activeType.label) || 'Block type'}
          </ListItemText>
        </ListItem>
      </ClickAwayListener>
      <Menu
        anchorEl={anchorRef.current}
        open={open}
        autoFocus={false}
        disableAutoFocus
        disableEnforceFocus
        disableAutoFocusItem
      >
        {blockTypeCategories.map(({ category, options }) => (
          <Box key={category}>
            <ListSubheader>{category}</ListSubheader>
            {options.map(({ label, value }) => (
              <MenuItem
                key={value}
                value={value}
                onMouseDown={e => {
                  e.preventDefault();

                  onToggle(value);
                }}
                selected={activeType && activeType.value === value}
              >
                {label}
              </MenuItem>
            ))}
          </Box>
        ))}
      </Menu>
    </>
  );
};

export default BlocType;
