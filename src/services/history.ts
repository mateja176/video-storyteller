import 'firebase/analytics';
import { createBrowserHistory } from 'history';
import { firebase } from './firebase';

export const history = createBrowserHistory();

history.listen(location =>
  firebase.analytics().logEvent('page_view', location),
);
