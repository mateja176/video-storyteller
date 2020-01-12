import { EditorState } from 'draft-js';

export interface EditorProps {
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => void;
  onFocus?: React.FocusEventHandler;
  onBlur?: React.FocusEventHandler;
}
