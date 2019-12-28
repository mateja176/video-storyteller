import { InputAdornment, TextField } from '@material-ui/core';
import { Button } from 'components';
import { Form, Formik } from 'formik';
import { startCase } from 'lodash';
import React from 'react';
import { Flex } from 'rebass';
import { TransformState } from './store/transform';
import { EditableAction, isPositionAction, isScaleAction } from './utils';

const textFieldProps = {
  variant: 'outlined',
  margin: 'dense',
} as const;

type Timestamps = Record<number, number>;

interface InitialValues {
  timeDiff: number;
  scale?: TransformState['scale'];
  x?: TransformState['x'];
  y?: TransformState['y'];
}
type Values = Required<InitialValues>;

export interface ActionCardFormProps {
  handleSubmit: (values: Values) => void;
  id: number;
  initialValues: InitialValues;
  setIsEditing: (editing: boolean) => void;
  action: EditableAction;
}

const ActionCardForm: React.FC<ActionCardFormProps> = ({
  handleSubmit,
  initialValues,
  setIsEditing,
  id,
  action,
}) => (
  <Formik
    initialValues={{ ...initialValues, scale: 1, x: 0, y: 0 }}
    onSubmit={handleSubmit}
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
          <Flex mb={2}>
            <TextField
              {...textFieldProps}
              label="Action Id"
              value={id}
              disabled
              style={{ marginRight: 5, width: 90 }}
              type="number"
              title={id.toString()}
            />
            <TextField
              {...textFieldProps}
              label="Action Type"
              style={{
                textOverflow: 'ellipsis',
              }}
              inputProps={{
                style: {
                  textOverflow: 'ellipsis',
                },
              }}
              value={formattedActionType}
              disabled
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
              {...textFieldProps}
              name="timeDiff"
              onBlur={handleBlur}
              onChange={handleChange}
              label="Time diff"
              type="number"
              value={values.timeDiff}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">ms</InputAdornment>
                ),
              }}
              error={Boolean(errors.timeDiff)}
              helperText={errors.timeDiff}
            />
            {isScaleAction(action) && (
              <TextField
                {...textFieldProps}
                name="scale"
                label="Zoom"
                value={(action.payload * 100).toFixed(0)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            )}
            {isPositionAction(action) && (
              <Flex>
                <TextField
                  {...textFieldProps}
                  name="positionX"
                  label="X Coordinate"
                  value={action.payload.x.toFixed(0)}
                  style={{ marginRight: 5 }}
                />
                <TextField
                  {...textFieldProps}
                  name="positionY"
                  label="Y Coordinate"
                  value={action.payload.y.toFixed(0)}
                />
              </Flex>
            )}
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
