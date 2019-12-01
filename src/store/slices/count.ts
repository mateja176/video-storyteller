import { Reducer } from 'redux';
import { ActionType, createAsyncAction } from 'typesafe-actions';
import { createReducer, setError, setIsLoading, setValue } from 'utils';

export const initialCountState = {
  value: 0,
  isLoading: false,
  error: '',
};

export type CountState = typeof initialCountState;

export enum CountGetType {
  request = 'count/get/request',
  success = 'count/get/success',
  failure = 'count/get/failure',
}
export const getCountAsync = createAsyncAction(
  CountGetType.request,
  CountGetType.success,
  CountGetType.failure,
)<void, CountState['value'], CountState['error']>();
export type CountGetAsync = ActionType<typeof getCountAsync>;

export enum CountSetType {
  request = 'count/set/request',
  success = 'count/set/success',
  failure = 'count/set/failure',
}
export const setCountAsync = createAsyncAction(
  CountSetType.request,
  CountSetType.success,
  CountSetType.failure,
)<CountState['value'], CountState['value'], CountState['error']>();
export type CountSetAsync = ActionType<typeof setCountAsync>;

export enum CountIncrementType {
  request = 'count/increment/request',
  success = 'count/increment/success',
  failure = 'count/increment/failure',
}
export const incrementCountAsync = createAsyncAction(
  CountIncrementType.request,
  CountIncrementType.success,
  CountIncrementType.failure,
)<void, CountState['value'], CountState['error']>();
export type CountIncrementAsync = ActionType<typeof incrementCountAsync>;

export type CountAction = CountGetAsync | CountSetAsync | CountIncrementAsync;

export const count: Reducer<CountState, CountAction> = createReducer(
  initialCountState,
)<CountAction>({
  [CountGetType.request]: setIsLoading,
  [CountSetType.request]: setIsLoading,
  [CountIncrementType.request]: setIsLoading,
  [CountGetType.failure]: setError,
  [CountSetType.failure]: setError,
  [CountIncrementType.failure]: setError,
  [CountGetType.success]: setValue,
  [CountSetType.success]: setValue,
  [CountIncrementType.success]: setValue,
});
