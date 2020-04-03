import * as mobilenet from '@tensorflow-models/mobilenet';
import { from } from 'rxjs';
import { history } from 'services';

export const epicDependencies = {
  mobilenet$: from(mobilenet.load()),
  history,
};

export type EpicDependencies = typeof epicDependencies;
