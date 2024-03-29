import { Theme } from '@material-ui/core';
import { CSSProperties } from 'react';
import { ReactStripeElements } from 'react-stripe-elements';
import { NonUndefined } from 'utility-types';

export interface WithId {
  id: string;
}

export type ToObject<A extends readonly any[]> = { [a in A[number]]: a };

export type Module = NodeModule & {
  hot: {
    accept(path: string, callback: () => void): void;
  };
};

export type Maybe<A> = null | A;

export type GetStyle = (theme: Theme) => React.CSSProperties;

export interface WithColors {
  colors: {
    success: { light: CSSProperties['color']; dark: CSSProperties['color'] };
  };
}

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

export type Stripe = NonUndefined<
  ReactStripeElements.StripeProviderProps['stripe']
>;
