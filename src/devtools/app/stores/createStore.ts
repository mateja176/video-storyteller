/* eslint-disable */
// @ts-nocheck

import { createStore } from 'redux';

export default function configureStore(reducer, initialState, enhance) {
  return createStore(reducer, initialState, enhance());
}
