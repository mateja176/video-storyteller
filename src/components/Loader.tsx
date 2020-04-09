import { Skeleton } from '@material-ui/lab';
import React from 'react';

export interface LoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ children, isLoading }) =>
  isLoading ? (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <div style={{ visibility: 'hidden' }}>{children}</div>
      <Skeleton
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  ) : (
    <>{children}</>
  );

export default Loader;
