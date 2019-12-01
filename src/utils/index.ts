/* eslint-disable indent */
import { isEqual, kebabCase } from 'lodash';
import { equals, pipe } from 'ramda';
import { Selector } from 'react-redux';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import { State } from 'store';
import urlJoin from 'url-join';

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

export const makeAbsolute = (path: string) => urlJoin('/', path);

export const toAbsolutePath = pipe(kebabCase, makeAbsolute);

export const toObject = <A extends readonly any[]>(array: A) =>
  ({
    ...array.reduce((as, a) => ({ ...as, [a]: a }), {}),
  } as { [a in A[number]]: a });

export const objectMap = <V, R>(f: (v: V) => R) => <K extends string>(
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

export const mapStateToProps = <
  Map extends Record<string, Selector<State, any>>
>(
  map: Map,
) => (state: State) => {
  const entries = Object.entries(map).map(([prop, selector]) => [
    prop,
    selector(state),
  ]);

  const fromEntries: {
    [prop in keyof Map]: ReturnType<Map[prop]>;
  } = Object.fromEntries(entries);

  return fromEntries;
};

export * from './hooks';
export * from './operators';
export * from './store';
export * from './files';
