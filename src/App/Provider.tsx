import { fontsWithWeights } from 'components';
import env from 'env';
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';
import { Stripe } from 'models';
import React, { FC } from 'react';
import GoogleFontLoader from 'react-google-font-loader';
import { Provider as StoreProvider } from 'react-redux';
import { Router } from 'react-router-dom';
// import 'react-stripe-elements'; // * fixes tests but does not fix build
import { StripeProvider } from 'react-stripe-elements';
import { history } from 'services';
import configureStore from 'store';
import { Context, IContext, initialContext } from './Context';

const store = configureStore();

export interface ProviderProps {}

const Provider: FC<ProviderProps> = ({ children }) => {
  const [stripe, setStripe] = React.useState<Stripe>(null);

  React.useEffect(() => {
    if ('Stripe' in window) {
      setStripe((window as any).Stripe(env.stripePub));
    }
  }, []);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      LogRocket.init(env.logRocketId);

      setupLogRocketReact(LogRocket);
    }
  }, []);

  const [deleteAll, _setDeleteAll] = React.useState(
    () => initialContext.deleteAll,
  );
  const setDeleteAll: IContext['setDeleteAll'] = newDeleteAll => {
    _setDeleteAll(() => newDeleteAll);
  };

  return (
    // <StrictMode>
    <StripeProvider stripe={stripe}>
      <Router history={history}>
        <StoreProvider store={store}>
          <Context.Provider
            value={{
              deleteAll,
              setDeleteAll,
            }}
          >
            <GoogleFontLoader fonts={fontsWithWeights} />
            {children}
          </Context.Provider>
        </StoreProvider>
      </Router>
    </StripeProvider>
    // </StrictMode>
  );
};

export default Provider;
