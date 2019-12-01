import { EnhancedTheme } from 'models';

export const createToolbarStyles = (theme: EnhancedTheme) => ({
  ...theme.mixins.toolbar,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});
