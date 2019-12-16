/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable indent */

import { makeStyles } from '@material-ui/core';
import {
  ContentBlock,
  DraftEditorCommand,
  DraftHandleValue,
  DraftStyleMap,
  Editor as DraftEditor,
  EditorState,
  getDefaultKeyBinding,
  Modifier,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { EditorProps, Maybe } from 'models';
import React, { KeyboardEvent } from 'react';

const useStyles = makeStyles({
  editor: {
    '& .RichEditor-blockquote': {
      borderLeft: '5px solid #eee',
      color: 'grey',
      fontFamily: '"Montserrat", "Georgia", serif',
      fontStyle: 'italic',
      margin: '15px 0',
      padding: '10px 20px',
    },

    '& .public-DraftStyleDefault-pre': {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: '1.2em',
      padding: '10px 20px',
    },
  },
});

const tabCharacter = '  ';

const styleMap: DraftStyleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2,
  },
};

const getBlockStyle = (block: ContentBlock) => {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return '';
  }
};

export type EditorCommand = DraftEditorCommand | 'tab-indent';

const Editor: React.FC<EditorProps &
  Pick<React.HTMLProps<HTMLDivElement>, 'onMouseEnter' | 'onMouseLeave'>> = ({
  editorState,
  setEditorState,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
}) => {
  const editor = React.useRef<DraftEditor>(null);

  const focus = () => {
    const { current } = editor;

    if (current) {
      current.focus();
    }
  };

  const handleKeyCommand = (command: EditorCommand): DraftHandleValue => {
    if (command === 'tab-indent') {
      const newContentState = Modifier.replaceText(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        tabCharacter,
      );

      setEditorState(
        EditorState.push(editorState, newContentState, 'insert-characters'),
      );
      return 'handled';
    } else {
      return 'not-handled';
    }
  };

  const mapKeyToEditorCommand = (e: KeyboardEvent): Maybe<EditorCommand> =>
    e.key === 'Tab' ? 'tab-indent' : getDefaultKeyBinding(e);

  // If the user changes block type before entering any text, we can
  // either style the placeholder or hide it. Let's just hide it now.
  const contentState = editorState.getCurrentContent();

  const hasText = contentState.isEmpty();

  const isUnstyled =
    contentState
      .getBlockMap()
      .first()
      .getType() === 'unstyled';

  const classes = useStyles();

  return (
    <div
      style={{
        background: 'transparent',
        cursor: 'text',
      }}
      className={classes.editor}
      onClick={focus}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <DraftEditor
        ref={editor}
        editorState={editorState}
        onChange={setEditorState}
        spellCheck
        placeholder={!hasText && isUnstyled ? 'Tell a story...' : ''}
        blockStyleFn={getBlockStyle}
        customStyleMap={styleMap}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={mapKeyToEditorCommand}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
};

export default Editor;
