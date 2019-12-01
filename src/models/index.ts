import { Theme } from '@material-ui/core';
import { CSSProperties } from 'react';
import { ReactStripeElements } from 'react-stripe-elements';
import { NonUndefined } from 'utility-types';

export * from './actions';
export * from './components';
export * from './dnd';

export type Module = NodeModule & {
  hot: {
    accept(path: string, callback: () => void): void;
  };
};

export type Maybe<A> = null | A;

export interface WithColors {
  colors: {
    success: { light: CSSProperties['color']; dark: CSSProperties['color'] };
  };
}

export interface EnhancedTheme extends Theme, WithColors {}

export interface SelectOption<Value> {
  label: React.ReactNode;
  value: Value;
}

export type SelectOptions<Value> = SelectOption<Value>[];

export const loadingStatuses = [
  'not started',
  'in progress',
  'completed',
] as const;
export type LoadingStatus = typeof loadingStatuses[number];

export type ExtendedLoadingStatus = LoadingStatus | 'failed';
export const extendedLoadingStatuses: ExtendedLoadingStatus[] = [
  ...loadingStatuses,
  'failed',
];

export interface Drift {
  track: (name: string, config: { sessionURL: string }) => void;
}
export interface WithDrift {
  drift: Drift;
}

export type Stripe = NonUndefined<
  ReactStripeElements.StripeProviderProps['stripe']
>;
