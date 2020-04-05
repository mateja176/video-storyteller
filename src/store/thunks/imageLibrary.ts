import { EpicReturnType } from 'models';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { ThunkAction } from 'redux-thunk';
import { of, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { createFetchLibraryImages, CreateFetchLibraryImages } from 'store';
import { epicDependencies, fetchImages, FetchImagesEpic } from '../epic';
import { Action, State } from '../reducer';

export const fetchLibraryImagesThunk = (
  fetchParams: Parameters<CreateFetchLibraryImages['request']>[0],
): ThunkAction<
  Promise<EpicReturnType<FetchImagesEpic>>,
  State,
  void,
  Action
> => (dispatch, getState) => {
  const requestLibraryImagesAction = createFetchLibraryImages.request(
    fetchParams,
  );

  dispatch(requestLibraryImagesAction);

  return fetchImages(
    new ActionsObservable(of(requestLibraryImagesAction)),
    new StateObservable(new Subject<State>(), getState()),
    epicDependencies,
  )
    .pipe(tap(action => dispatch(action)))
    .toPromise();
};
