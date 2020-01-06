import { InputAdornment, TextField } from '@material-ui/core';
import { Button } from 'components';
import { convertFromRaw } from 'draft-js';
import { Form, Formik } from 'formik';
import { lowerCase } from 'lodash';
import { equals } from 'ramda';
import React from 'react';
import { Flex } from 'rebass';
import { Action } from './store';
import { UpdateAction } from './store/blockStates';
import {
  initialState as initialTransformState,
  TransformState,
} from './store/transform';
import {
  formatCoordinate,
  formatScale,
  isPositionAction,
  isScaleAction,
  isSetTransformAction,
  isUpdateEditAction,
  isUpdateMoveAction,
} from './utils';

type UpdateActionPayload = UpdateAction['payload'];

const textFieldProps = {
  variant: 'outlined',
  margin: 'dense',
} as const;

type Timestamps = Record<number, number>;

interface InitialValues
  extends Omit<UpdateActionPayload, 'id' | 'editorState'>,
    Partial<TransformState> {
  timeDiff: number;
  editorState?: string;
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
  const formatedInitialValues = {
    ...initialValues,
    left: isUpdateMoveAction(action) ? action.payload.left : 0,
    top: isUpdateMoveAction(action) ? action.payload.top : 0,
    editorState: isUpdateEditAction(action)
      ? convertFromRaw(action.payload.editorState).getPlainText()
      : '',
    scale:
      isScaleAction(action) || isSetTransformAction(action)
        ? formatScale(action.payload.scale)
        : initialTransformState.scale,
    x:
      isPositionAction(action) ||
      isSetTransformAction(action) ||
      isScaleAction(action)
        ? formatCoordinate(action.payload.x)
        : initialTransformState.x,
    y:
      isPositionAction(action) ||
      isSetTransformAction(action) ||
      isScaleAction(action)
        ? formatCoordinate(action.payload.y)
        : initialTransformState.y,
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
        const formattedActionType = lowerCase(action.type);

        return (
          <Flex flexDirection="column" px={2} flex={1}>
            <Flex>
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
              {(isScaleAction(action) || isSetTransformAction(action)) && (
                <TextField
                  {...textFieldProps}
                  type="number"
                  name="scale"
                  label="Zoom"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.scale}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              )}
              {isUpdateEditAction(action) && (
                <TextField
                  {...textFieldProps}
                  type="text"
                  name="editorState"
                  label="Editor State"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.editorState}
                  multiline
                  rows={3}
                  rowsMax={3}
                  disabled
                />
              )}
              {isUpdateMoveAction(action) && (
                <Flex>
                  <TextField
                    {...textFieldProps}
                    type="number"
                    name="left"
                    label="Left"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.left}
                    style={{ marginRight: 5 }}
                  />
                  <TextField
                    {...textFieldProps}
                    type="number"
                    name="top"
                    label="Top"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.top}
                  />
                </Flex>
              )}
              {(isPositionAction(action) ||
                isSetTransformAction(action) ||
                isScaleAction(action)) && (
                <Flex>
                  <TextField
                    {...textFieldProps}
                    type="number"
                    name="x"
                    label="X Coordinate"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.x}
                    style={{ marginRight: 5 }}
                  />
                  <TextField
                    {...textFieldProps}
                    type="number"
                    name="y"
                    label="Y Coordinate"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.y}
                  />
                </Flex>
              )}
              <Flex mt="auto">
                <Button
                  size="small"
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
