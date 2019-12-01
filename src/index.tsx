import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener';
import React from 'react';
// // @ts-ignore
// import { render } from 'react-snapshot';
import { hydrate, render } from 'react-dom';
import App from './App';
import './index.scss';
import * as serviceWorker from './serviceWorker';

const root = document.getElementById('root');

const renderOrHydrate = root && root.children.length ? hydrate : render;

renderOrHydrate(<App />, root);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
if (process.env.NODE_ENV === 'production') {
  serviceWorker.register();
} else {
  serviceWorker.unregister();
}
