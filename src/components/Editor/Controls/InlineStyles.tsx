import { useTheme } from '@material-ui/core';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import {
  FormatBold,
  FormatItalic,
  FormatQuote,
  FormatUnderlined,
} from '@material-ui/icons';
import { DraftInlineStyleType, EditorState } from 'draft-js';
import React from 'react';
import IconButton from '../../IconButton';
import Tooltip from '../../Tooltip';

export interface InlineStyle {
  label: string;
  style: DraftInlineStyleType;
  Icon: React.ComponentType<SvgIconProps>;
}

export type InlineStyles = InlineStyle[];

const INLINE_STYLES: InlineStyles = [
  { label: 'Bold', style: 'BOLD', Icon: FormatBold },
  { label: 'Italic', style: 'ITALIC', Icon: FormatItalic },
  { label: 'Underline', style: 'UNDERLINE', Icon: FormatUnderlined },
  { label: 'Monospace', style: 'CODE', Icon: FormatQuote },
];

export interface InlineStylesControlsProps {
  editorState: EditorState;
  onToggle: (style: DraftInlineStyleType) => void;
}

const InlineStyles: React.FC<InlineStylesControlsProps> = ({
  editorState,
  onToggle,
}) => {
  const theme = useTheme();

  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div>
      {INLINE_STYLES.map(({ Icon, label, style }) => {
        const active = currentStyle.has(style);

        return (
          <Tooltip
            key={label}
            title={label}
            onMouseDown={e => {
              e.preventDefault();
              onToggle(style);
            }}
          >
            <IconButton>
              <Icon
                style={{
                  color: active ? theme.palette.primary.light : 'inherit',
                }}
              />
            </IconButton>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default InlineStyles;
