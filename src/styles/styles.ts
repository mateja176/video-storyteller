import { Theme } from '@material-ui/core';
import { EnhancedTheme } from 'models';

export const createToolbarStyles = (theme: EnhancedTheme) => ({
  ...theme.mixins.toolbar,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

export const dividingBorder = '1px solid #ddd';

export const scrollTrackWidth = 10;

const listItemPaddingX = 6;
export const listItemStyle: React.CSSProperties = {
  width: 'auto',
  paddingLeft: listItemPaddingX,
  paddingRight: listItemPaddingX,
};

export const createListItemIconStyle = (theme: Theme): React.CSSProperties => ({
  marginRight: 4,
  color: theme.palette.grey.A700,
  width: 'auto',
  minWidth: 30,
  display: 'flex',
  justifyContent: 'center',
  margin: 0,
});
