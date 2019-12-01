/* eslint-disable indent */

import { isEqual } from 'lodash';
import React, { memo as reactMemo } from 'react';
import { useSelector } from 'react-redux';
import { Dictionary, selectDictionary } from 'store';

export * from './withSpinner';
export { default } from './withSpinner';

export const memo = (Component: Parameters<typeof reactMemo>[0]) =>
  reactMemo(Component, isEqual);

export interface WithDictionary {
  dictionary: Dictionary;
}
export const withDictionary = <Props extends {}>(
  Component: React.ComponentType<Props & WithDictionary>,
) => (props: Props) => {
  const dictionary = useSelector(selectDictionary);

  return <Component {...props} dictionary={dictionary} />;
};
