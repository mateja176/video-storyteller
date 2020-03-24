import { kebabCase, startCase } from 'lodash';
import { pipe } from 'ramda';
import { Tuple } from 'ts-toolbelt';
import urlJoin from 'url-join';
import { objectMap, toObject } from './utils';

export const makeAbsolute = (path: string) => urlJoin('/', path);

export const toAbsolutePath = pipe(kebabCase, makeAbsolute);

export const rootPathnames = [
  'signin',
  'dashboard',
  // 'count',
  'images',
  // 'store',
  // 'checkoutForm',
  // 'list',
  'canvas',
  'profile',
] as const;

export const absoluteRootPathnames = rootPathnames.map(toAbsolutePath);

export const textRootPathnames = rootPathnames.map(s =>
  s
    .charAt(0)
    .toUpperCase()
    .concat(s.slice(1)),
);

type RootPathnames = typeof rootPathnames;
export type RootPathname = RootPathnames[number];

const secondaryPathnames = ['increment', 'decrement', 'upload'] as const;
export const secondaryPaths = toObject(secondaryPathnames);

type SecondaryPathnames = typeof secondaryPathnames;
export type SecondaryPathname = SecondaryPathnames[number];

type Pathnames = Tuple.Concat<RootPathnames, SecondaryPathnames>;
export type Pathname = Pathnames[number];

export const pathnames = [...rootPathnames, ...secondaryPathnames] as Pathnames;

const toAbsolutePathObject = objectMap(toAbsolutePath);

export const rootPaths = toObject(rootPathnames);

export const absoluteRootPaths: Record<keyof typeof rootPaths, string> = {
  ...toAbsolutePathObject(rootPaths),
  dashboard: '/',
};

export const paths = toObject(pathnames);

export const textPaths = objectMap(startCase)(paths);

export const absolutePaths = toAbsolutePathObject(paths);
