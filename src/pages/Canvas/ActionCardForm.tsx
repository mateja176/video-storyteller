import { InputAdornment, TextField } from '@material-ui/core';
import { Button } from 'components';
import { Form, Formik } from 'formik';
import { startCase } from 'lodash';
import { equals } from 'ramda';
import React from 'react';
import { Flex } from 'rebass';
import { Action } from './store';
import {
  initialState as initialTransformState,
  TransformState,
} from './store/transform';
import {
  formatPosition,
  formatZoom,
  isPositionAction,
  isZoomAction,
} from './utils';

const textFieldProps = {
  variant: 'outlined',
  margin: 'dense',
} as const;

interface InitialValues extends Partial<TransformState> {
  timeDiff: number;
}
type Values = Required<InitialValues>;

export interface ActionCardFormProps {
  handleSubmit: (values: Values) => void;
  id: number;
  initialValues: InitialValues;
  setIsEditing: (editing: boolean) => void;
  action: Action;
}

const ActionCardForm: React.FC<ActionCardFormProps> = ({
  handleSubmit,
  initialValues,
  setIsEditing,
  id,
  action,
}) => {
  const formatedInitialValues: Required<typeof initialValues> = {
    ...initialValues,
    zoom: isZoomAction(action)
      ? formatZoom(action.payload)
      : initialTransformState.zoom,
    position: isPositionAction(action)
      ? formatPosition(action.payload)
      : initialTransformState.position,
  };

  return (
    <Formik
      initialValues={formatedInitialValues}
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
              style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <TextField
                {...textFieldProps}
                name="timeDiff"
                value={values.timeDiff}
                onBlur={handleBlur}
                onChange={handleChange}
                label="Time diff"
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">ms</InputAdornment>
                  ),
                }}
                error={Boolean(errors.timeDiff)}
                helperText={errors.timeDiff}
              />
              {isZoomAction(action) && (
                <TextField
                  {...textFieldProps}
                  type="number"
                  name="zoom.scale"
                  label="Zoom"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.zoom.scale}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              )}
              {isZoomAction(action) && (
                <Flex>
                  <TextField
                    {...textFieldProps}
                    type="number"
                    name="zoom.clientX"
                    label="Mouse X"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.zoom.clientX}
                    style={{ marginRight: 5 }}
                  />
                  <TextField
                    {...textFieldProps}
                    type="number"
                    name="zoom.clientY"
                    label="Mouse Y"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.zoom.clientY}
                  />
                </Flex>
              )}
              {isPositionAction(action) && (
                <Flex>
                  <TextField
                    {...textFieldProps}
                    type="number"
                    name="position.x"
                    label="X Coordinate"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.position.x}
                    style={{ marginRight: 5 }}
                  />
                  <TextField
                    {...textFieldProps}
                    type="number"
                    name="position.y"
                    label="Y Coordinate"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.position.y}
                  />
                </Flex>
              )}
              <Flex mt="auto">
                <Button
                  type="submit"
                  disabled={!isValid || equals(formatedInitialValues, values)}
                >
                  Save edit
                </Button>
                {/* <Button style={{ marginLeft: 'auto' }}>See more</Button> */}
              </Flex>
            </Form>
          </Flex>
        );
      }}
    </Formik>
  );
};

export default ActionCardForm;
