import React from 'react';
import ContentLoader from 'react-content-loader';

export interface LoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ children, isLoading }) =>
  isLoading ? (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      {children}
      <ContentLoader
        style={{
          width: '100%',
          height: '100%',
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
