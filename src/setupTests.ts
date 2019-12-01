import '@testing-library/jest-dom/extend-expect';
import '@testing-library/react/cleanup-after-each';
// @ts-ignore
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
import dotenv from 'dotenv';
import 'jest-canvas-mock';
import 'polyfill-object.fromentries';
import 'react-stripe-elements';

dotenv.config({ path: '../.env.test.local' });

registerRequireContextHook();
