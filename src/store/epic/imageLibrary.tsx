/* eslint-disable camelcase */

import {
  createIconFinderSearchUrl,
  IconfinderResponse,
  iconFinderTokenUrl,
} from 'models';
import React from 'react';
import { Dispatch } from 'redux';
import { Epic, ofType } from 'redux-observable';
import { of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { getType } from 'typesafe-actions';
import { Action, State } from '../reducer';
import { selectIconFinderToken, selectImageLibrary } from '../selectors';
import {
  createFetchImageLibraryToken,
  createFetchLibraryImages,
  createSetErrorSnackbar,
  FetchImageLibraryTokenFailure,
  FetchImageLibraryTokenRequest,
  FetchImageLibraryTokenSuccess,
  FetchLibraryImagesFailure,
  FetchLibraryImagesRequest,
  FetchLibraryImagesSuccess,
  SnackbarAction,
} from '../slices';

export const fetchToken: Epic<
  Action,
  | FetchImageLibraryTokenSuccess
  | FetchImageLibraryTokenFailure
  | SnackbarAction,
  State
> = action$ =>
  action$.pipe(
    ofType<Action, FetchImageLibraryTokenRequest>(
      getType(createFetchImageLibraryToken.request),
    ),
    exhaustMap(({ payload: { query } }) =>
      ajax({ url: iconFinderTokenUrl }).pipe(
        map(({ response }) => response),
        map(({ access_token }: { access_token: string }) => access_token),
        map(token => createFetchImageLibraryToken.success({ token, query })),
        catchError(error => {
          const restart = (dispatch: Dispatch) =>
            dispatch(createFetchImageLibraryToken.request({}));

          return of(
            createFetchImageLibraryToken.failure(error),
            createSetErrorSnackbar({
              message: dispatch => (
                <>
                  Could not load images, retry{' '}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      restart(dispatch);
                    }}
                    onKeyUp={({ key }) => {
                      if (key === 'Enter') {
                        restart(dispatch);
                      }
                    }}
                  >
                    here
                  </span>
                </>
              ),
            }),
          );
        }),
      ),
    ),
  );

export const fetchMissingImages: Epic<Action, any, State> = (action$, state$) =>
  action$.pipe(
    ofType<Action, FetchImageLibraryTokenSuccess>(
      getType(createFetchImageLibraryToken.success),
    ),
    filter(({ payload: { query } }) => !!query),
    withLatestFrom(state$.pipe(map(selectImageLibrary))),
    map(
      ([
        {
          payload: { query = '' },
        },
        { images },
      ]) => {
        const libraryImages = Object.values(images);
        const startIndex = libraryImages.indexOf('loading');
        const stopIndex = libraryImages.lastIndexOf('loading');

        return {
          query,
          startIndex,
          stopIndex,
        };
      },
    ),
    map(createFetchLibraryImages.request),
  );

export type FetchImagesEpic = Epic<
  Action,
  | FetchLibraryImagesSuccess
  | FetchLibraryImagesFailure
  | FetchImageLibraryTokenRequest,
  State
>;
export const fetchImages: FetchImagesEpic = (action$, state$) =>
  action$.pipe(
    ofType<Action, FetchLibraryImagesRequest>(
      getType(createFetchLibraryImages.request),
    ),
    withLatestFrom(state$),
    map(([{ payload }, state]) => ({
      ...payload,
      token: selectIconFinderToken(state),
    })),
    filter(({ token }) => Boolean(token)),
    switchMap(({ token, query, startIndex, stopIndex }) =>
      ajax({
        url: createIconFinderSearchUrl({
          query,
          offset: startIndex,
          count: stopIndex - startIndex + 1,
        }),
        headers: {
          authorization: `jwt ${token}`,
        },
      }).pipe(
        map(({ response }) => response as IconfinderResponse),
        mergeMap(({ icons, total_count }) => [
          createFetchLibraryImages.success({ icons, total_count, startIndex }),
        ]),
        catchError(error => {
          const { code, message } = error;

          return of(
            code === 'unauthorized' && message === 'Token could not be verified'
              ? createFetchImageLibraryToken.request({ query })
              : createFetchLibraryImages.failure(error),
          );
        }),
      ),
    ),
  );

export const imageLibrary = [fetchToken];
