import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import { Stripe } from 'models';
import React, { FC } from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
// import 'react-stripe-elements'; // * fixes tests but does not fix build
import { StripeProvider } from 'react-stripe-elements';
import configureStore from 'store';

const store = configureStore();

export interface ProviderProps {}

const Provider: FC<ProviderProps> = ({ children }) => {
  const [stripe, setStripe] = React.useState<Stripe>(null);

  React.useEffect(() => {
    if ('Stripe' in window) {
      setStripe((window as any).Stripe(process.env.REACT_APP_STRIPE_PUB || ''));
    }
  }, []);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      LogRocket.init(process.env.REACT_APP_LOG_ROCKET_ID || '');

      setupLogRocketReact(LogRocket);

      LogRocket.getSessionURL(sessionURL => {
        // * in contrary to the second condition the first one is runtime safe but not typesafe
        // if (window.drift && typeof window.drift.track === 'function') {
        if ('drift' in window) {
          // * although the following is more accurate than any, it causes build to fail
          // (window as typeof window & WithDrift).drift.track('LogRocket', {
          (window as any).drift.track('LogRocket', {
            sessionURL,
          });
        }
      });
    }
  }, []);

  return (
    // <StrictMode>
    <StripeProvider stripe={stripe}>
      <Router>
        <StoreProvider store={store}>{children}</StoreProvider>
      </Router>
    </StripeProvider>
    // </StrictMode>
  );
};

export default Provider;
