import { InputAdornment, TextField } from '@material-ui/core';
import { Button } from 'components';
import { Form, Formik } from 'formik';
import { startCase } from 'lodash';
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

      const newTimestamps = editableActions
        .slice(i + 1)
        .reduce((currentTimestamps, editableAction) => {
          const newTimestamp = delta + timestamps[editableAction.id];

          const updatedTimestamps = {
            ...currentTimestamps,
            [editableAction.id]: newTimestamp,
          };

          return updatedTimestamps;
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
    {({ isValid, handleChange, handleBlur, values, errors }) => {
      const formattedActionType = startCase(action.type);

      return (
        <Flex flexDirection="column" px={2} pb={1} flex={1}>
          <Flex mb={3}>
            <TextField
              label="Action Id"
              value={id}
              variant="outlined"
              disabled
              style={{ marginRight: 5, width: 90 }}
              margin="dense"
              type="number"
              title={id.toString()}
            />
            <TextField
              label="Action Type"
              value={formattedActionType}
              variant="outlined"
              disabled
              margin="dense"
              title={formattedActionType}
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
                endAdornment: (
                  <InputAdornment position="end">ms</InputAdornment>
                ),
              }}
              error={Boolean(errors.timeDiff)}
              helperText={errors.timeDiff}
              margin="dense"
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
      );
    }}
  </Formik>
);

export default ActionCardForm;
