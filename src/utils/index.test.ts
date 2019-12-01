import { initialState, selectIsSignedIn } from 'store';
import { mapStateToProps } from '.';

const mappedState = mapStateToProps({ isSignedIn: selectIsSignedIn })(
  initialState,
);

describe('Utilities', () => {
  test(mapStateToProps.name, () => {
    expect(mappedState).toEqual({ isSignedIn: false });
  });
});
