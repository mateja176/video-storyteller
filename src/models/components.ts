import { EditorState } from 'draft-js';

export interface EditorProps {
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => void;
  onFocus: (e: React.SyntheticEvent) => void;
  onBlur: (e: React.SyntheticEvent) => void;
}
