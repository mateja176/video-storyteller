import { Epic } from 'redux-observable';
import { Observable } from 'rxjs';

export type EpicReturnType<E extends Epic> = ReturnType<E> extends Observable<
  infer R
>
  ? R
  : never;
