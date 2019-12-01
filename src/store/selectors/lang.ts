import { createSelector } from 'reselect';
import { State } from '../reducer';

export const selectLangState = (state: State) => state.lang;

export const selectLang = createSelector(
  selectLangState,
  ({ lang }) => lang,
);

export const selectDictionary = createSelector(
  selectLangState,
  ({ langs, lang }) => langs[lang],
);
