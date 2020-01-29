import { InputAdornment, TextField } from '@material-ui/core';
import { Button } from 'components';
import { convertFromRaw } from 'draft-js';
import { Form, Formik } from 'formik';
import { startCase } from 'lodash';
import { ImageBlockState, WithDropResult } from 'models';
import { equals } from 'ramda';
import React from 'react';
import { Flex } from 'rebass';
import { Action } from './store';
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
  isUpdateRenameImageAction,
  isUpdateResizeAction,
} from './utils';
import { ICanvasContext } from './CanvasContext';

const constantTextFieldProps = {
  margin: 'dense',
  onMouseDown: (e: React.MouseEvent) => {
    e.stopPropagation();
  },
} as const;

interface InitialValues {
  duration: number;
}
type ImageBlock = ImageBlockState['payload']['block'];
interface Values
  extends InitialValues,
    WithDropResult,
    TransformState,
    Pick<ImageBlock, 'name'> {
  editorState: string;
}

export interface ActionCardFormProps extends Pick<ICanvasContext, 'isAuthor'> {
  handleSubmit: (values: Values) => void;
  id: number;
  initialValues: InitialValues;
  action: Action;
}

const ActionCardForm: React.FC<ActionCardFormProps> = ({
  isAuthor,
  handleSubmit,
  initialValues,
  id,
  action,
}) => {
  const textFieldProps = { ...constantTextFieldProps, disabled: !isAuthor };

  const formatedInitialValues: Values = {
    ...initialValues,
    width: isUpdateResizeAction(action) ? action.payload.payload.width : 0,
    height: isUpdateResizeAction(action) ? action.payload.payload.height : 0,
    left: isUpdateMoveAction(action) ? action.payload.payload.left : 0,
    top: isUpdateMoveAction(action) ? action.payload.payload.top : 0,
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
    editorState: isUpdateEditAction(action)
      ? convertFromRaw(action.payload.payload.block.editorState).getPlainText()
      : '',
    name: isUpdateRenameImageAction(action)
      ? action.payload.payload.block.name
      : '',
  };

  return (
    <Formik
      initialValues={formatedInitialValues}
      onSubmit={handleSubmit}
      validate={values => {
        if (values.duration < -1) {
          return {
            duration: 'Difference must be a positive number',
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
              style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <TextField
                {...textFieldProps}
                name="duration"
                value={values.duration}
                onBlur={handleBlur}
                onChange={handleChange}
                label="Duration"
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">ms</InputAdornment>
                  ),
                }}
                error={Boolean(errors.duration)}
                helperText={errors.duration}
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
                  rows={2}
                  rowsMax={2}
                  disabled
                />
              )}
              {isUpdateRenameImageAction(action) && (
                <TextField
                  {...textFieldProps}
                  type="text"
                  name="name"
                  label="Image Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
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
                // isScaleAction(action) ||
                isSetTransformAction(action)) && (
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
              {isAuthor && (
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
              )}
            </Form>
          </Flex>
        );
      }}
    </Formik>
  );
};

export default ActionCardForm;
