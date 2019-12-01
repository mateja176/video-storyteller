/* eslint-disable indent */

import { PayloadAction } from 'typesafe-actions';

export const setIsLoading = <State extends { isLoading: boolean }>(
  state: State,
): State => ({ ...state, isLoading: true });

export const setError = <
  State extends { isLoading: boolean; error: string },
  A extends PayloadAction<string, string>
>(
  state: State,
  action: A,
): State => ({ ...state, isLoading: false, error: action.payload });

export const setValue = <
  State extends { isLoading: boolean; value: any },
  A extends PayloadAction<string, State['value']>
>(
  state: State,
  action: A,
): State => ({ ...state, isLoading: false, value: action.payload });
