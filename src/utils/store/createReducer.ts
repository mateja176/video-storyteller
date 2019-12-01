/* eslint-disable indent */

import { FilterActionByType, SimpleAction } from 'models';

/**
 *
 * @example
 * const getCountType = 'count/get';
 * const createGetCount = createAction(getCountType);
 * type CreateGetCount = typeof createGetCount;
 * type GetCountAction = ReturnType<CreateGetCount>;
 *
 * const setCountType = 'count/set';
 * const createSetCount = createAction(setCountType, action => (payload: number) =>
 *   action(payload),
 * );
 * type CreateSetCount = typeof createSetCount;
 * type SetCountAction = ReturnType<CreateSetCount>;
 *
 * type CountAction = GetCountAction | SetCountAction;
 *
 * const countReducer = createReducer(0)<CountAction>({
 *   [getCountType]: state => state,
 *   [setCountType]: (_, { payload }) => payload,
 * });
 */
export const createReducer = <State>(initialState: State) => <
  ReducerAction extends SimpleAction
>(
  actionReducerMap: {
    [key in ReducerAction['type']]: <A extends ReducerAction>(
      state: State,
      action: FilterActionByType<A, key>,
    ) => State
  },
) => <A extends SimpleAction>(
  state: State | undefined = initialState,
  action: A,
): State =>
  Object.keys(actionReducerMap).includes(action.type)
    ? actionReducerMap[action.type as keyof typeof actionReducerMap](
        state,
        action as any,
      )
    : state;
