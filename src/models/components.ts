import { EditorState } from 'draft-js';

export type WithEditorState = { editorState: EditorState };

export interface EditorProps extends WithEditorState {
  setEditorState: (editorState: EditorState) => void;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
}
