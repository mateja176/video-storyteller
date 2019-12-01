import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import { Button } from 'components';
import React from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'rebass';
import {
  createSignout,
  selectDictionary,
  selectDisplayName,
  selectEmail,
  selectPhotoURL,
} from 'store';
import { useActions } from 'utils';

const avatarWidth = 140;

export interface ProfileProps {}

const Profile: React.FC<ProfileProps> = () => {
  const dict = useSelector(selectDictionary);

  const { signOut } = useActions({ signOut: createSignout });

  const displayName = useSelector(selectDisplayName);
  const email = useSelector(selectEmail);
  const photoURL = useSelector(selectPhotoURL);

  return (
    <Box style={{ display: 'grid', justifyContent: 'center' }}>
      <Card style={{ padding: '30px 10px' }}>
        <Box
          mb={4}
          style={{ display: 'grid', justifyItems: 'center', minWidth: 300 }}
        >
          <CardMedia
            image={photoURL}
            title={displayName}
            style={{
              height: avatarWidth,
              width: avatarWidth,
              borderRadius: '50%',
            }}
          />
        </Box>
        <CardContent>
          <Typography gutterBottom variant="h5">
            {displayName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {email}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            onClick={() => {
              signOut();
            }}
          >
            {dict.signOut}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Profile;
