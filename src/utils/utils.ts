/* eslint-disable indent */
import { isEqual } from 'lodash';
import {
  either,
  equals,
  filter,
  identity,
  ifElse,
  is,
  isNil,
  map,
  not,
  pipe,
} from 'ramda';
import { createSelectorCreator, defaultMemoize } from 'reselect';

/**
 * @example
 * type RemoveNilsFromMe = { a: { c?: 0; d: 1 }; b?: 0 };
 * type WithoutNils = RemoveNils<RemoveNilsFromMe>;
 * const withoutNils: WithoutNils = {
 *   a: {
 *     d: 1,
 *   },
 * };
 */
type RemoveNils<A extends object> = {
  [key in keyof A]: A[key] extends object
    ? RemoveNils<A[key]>
    : NonNullable<A[key]>;
};

export const removeNils: <A extends object>(a: A) => RemoveNils<A> = ifElse(
  either(is(Array), is(Object)),
  pipe(
    filter(pipe(isNil, not)) as any,
    map(a => removeNils(a as any)),
  ),
  identity,
);

export const cache = <I, O>(f: (i: I) => O) => {
  let previousInput: I | null = null; // eslint-disable-line

  return (i: I): O | null => {
    if (equals(i, previousInput)) {
      return null;
    } else {
      previousInput = i; // eslint-disable-line
      return f(i);
    }
  };
};
export const createDeepSelector = createSelectorCreator(
  defaultMemoize,
  isEqual,
);

const prefixActionTypeWithSeparator = (separator: string) => (
  prefix: string,
) => (actionType: string) => prefix.concat(separator).concat(actionType);

export const prefixActionType = prefixActionTypeWithSeparator('/');

export const toObject = <A extends readonly any[]>(array: A) =>
  array.reduce((as, a) => ({ ...as, [a]: a }), {}) as { [a in A[number]]: a };

export const objectMap = <V, R>(f: (v: V) => R) => <K extends string | number>(
  o: Record<K, V>,
) =>
  Object.entries<V>(o).reduce(
    (object, [key, value]) => ({ ...object, [key]: f(value) }),
    {},
  ) as Record<K, R>;

export const getPathFromComponent = <Component extends React.FC<any>>(
  component: Component,
) => {
  const { name, displayName } = component;
  return (name || displayName!).toLowerCase();
};
