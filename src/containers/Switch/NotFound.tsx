import { Box, Typography } from '@material-ui/core';
import { Link } from 'components';
import React, { useEffect } from 'react';
import { Ghost } from 'react-kawaii';
import { createTogglePageFound } from 'store';
import { useActions } from 'utils';

export interface NotFoundProps {}

const NotFound: React.FC<NotFoundProps> = () => {
  const { togglePageFound } = useActions({
    togglePageFound: createTogglePageFound,
  });

  useEffect(() => {
    togglePageFound();

    return () => {
      togglePageFound();
    };
  }, [togglePageFound]);

  return (
    <Box
      mt={4}
      style={{
        display: 'grid',
        alignContent: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'grid', justifyItems: 'center' }}>
        <Ghost mood="shocked" />
        <br />
        <br />
        <Typography variant="h4">Page not found</Typography>
        <br />
        <br />
        <Link to="/">
          <Typography variant="h5">Go back to Dashboard</Typography>
        </Link>
      </div>
    </Box>
  );
};
export default NotFound;
