import { InputAdornment, TextField } from '@material-ui/core';
import { Button } from 'components';
import { Form, Formik } from 'formik';
import { capitalize } from 'lodash';
import React from 'react';
import { Flex } from 'rebass';
import { ActionWithId, EditableAction } from './utils';

type Timestamps = Record<number, number>;

export interface ActionCardFormProps {
  id: number;
  initialValues: {
    timeDiff: number;
  };
  timeDiff: number;
  setTimestamps: (timestamps: Timestamps) => void;
  timestamps: Timestamps;
  editableActions: ActionWithId[];
  setIsEditing: (editing: boolean) => void;
  i: number;
  action: EditableAction;
}

const ActionCardForm: React.FC<ActionCardFormProps> = ({
  initialValues,
  timeDiff,
  setTimestamps,
  timestamps,
  editableActions,
  setIsEditing,
  id,
  i,
  action,
}) => (
  <Formik
    initialValues={initialValues}
    onSubmit={values => {
      const delta = values.timeDiff - timeDiff;

      console.log('delta', delta);

      const newTimestamps = editableActions
        .slice(i + 1)
        .reduce((currentTimestamps, editableAction) => {
          const newTimestamp = delta + editableAction.timestamp;

          console.log('editableAction.timestamp', editableAction.timestamp);
          console.log('newTimestamp', newTimestamp);

          return {
            ...currentTimestamps,
            [editableAction.id]: newTimestamp,
          };
        }, timestamps);

      setTimestamps(newTimestamps);
    }}
    validate={values => {
      if (values.timeDiff < 0) {
        return {
          timeDiff: 'Difference must be greater than 0',
        };
      } else {
        return undefined;
      }
    }}
    enableReinitialize
    isInitialValid
  >
    {({ isValid, handleChange, handleBlur, values, errors }) => (
      <Flex flexDirection="column" p={10} pt={3} height="100%">
        <Flex mb={3}>
          <TextField
            label="Action Id"
            value={id}
            variant="outlined"
            disabled
            style={{ marginRight: 5 }}
            margin="dense"
            type="number"
          />
          <TextField
            label="Action Type"
            value={capitalize(action.type)}
            variant="outlined"
            disabled
            margin="dense"
          />
        </Flex>
        <Form
          onMouseEnter={() => {
            setIsEditing(true);
          }}
          onMouseLeave={() => {
            setIsEditing(false);
          }}
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            name="timeDiff"
            onBlur={handleBlur}
            onChange={handleChange}
            label="Time diff"
            type="number"
            variant="outlined"
            value={values.timeDiff}
            InputProps={{
              endAdornment: <InputAdornment position="end">ms</InputAdornment>,
            }}
            error={Boolean(errors.timeDiff)}
            helperText={errors.timeDiff}
          />
          {/* {isCfudAction(action as EditableAction) && (
          <Typography>
            Id: {(action as CfudAction).payload.id}
          </Typography>
        )} */}
          <Flex mt="auto">
            <Button type="submit" disabled={!isValid}>
              Save edit
            </Button>
            <Button style={{ marginLeft: 'auto' }}>See more</Button>
          </Flex>
        </Form>
      </Flex>
    )}
  </Formik>
);

export default ActionCardForm;
