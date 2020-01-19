import { Middleware } from 'redux';
import { attachMetaData } from './attachMetaData';

export * from './attachMetaData';

export const middleware: Middleware[] = [...attachMetaData];
