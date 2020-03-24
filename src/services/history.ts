import 'firebase/analytics';
import { createBrowserHistory } from 'history';
import { analytics } from './analytics';

export const history = createBrowserHistory();

history.listen(({ pathname, search, hash }) =>
  analytics.logEvent({
    type: 'navigation',
    payload: { pathname, search, hash },
  }),
);
