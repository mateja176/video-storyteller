import { EditorState } from 'draft-js';

export const getCurrentColor = (state: EditorState) =>
  state
    .getCurrentInlineStyle()
    .find(style => !!style && /^#([\d\w]{3}){1,2}$/.test(style)) || '#000';
