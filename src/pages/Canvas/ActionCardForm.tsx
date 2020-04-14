/* eslint-disable indent */

import {
  Box,
  ClickAwayListener,
  InputAdornment,
  TextField,
} from '@material-ui/core';
import clsx from 'clsx';
import { Button } from 'components';
import { convertFromRaw } from 'draft-js';
import { useFormik } from 'formik';
import { useFlicker } from 'hooks';
import { equals } from 'ramda';
import React from 'react';
import { ImageBlockState, WithDropResult } from 'utils';
import { ICanvasContext } from './CanvasContext';
import { Action, initialTransformState, TransformState } from './store';
import {
  formatCoordinate,
  formatScaleToPercentage,
  isPositionAction,
  isScaleAction,
  isSetTransformAction,
  isSetZoomAction,
  isUpdateEditAction,
  isUpdateMoveAction,
  isUpdateRenameImageAction,
  isUpdateResizeAction,
} from './utils';

const constantTextFieldProps = {
  margin: 'dense',
  onMouseDown: (e: React.MouseEvent) => {
    e.stopPropagation();
  },
} as const;

const px = <InputAdornment position="end">px</InputAdornment>;

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
  onSubmit: (values: Values) => void;
  initialValues: InitialValues;
  action: Action;
}

const ActionCardForm: React.FC<ActionCardFormProps> = ({
  isAuthor,
  onSubmit,
  initialValues,
  action,
}) => {
  const textFieldProps = { ...constantTextFieldProps, disabled: !isAuthor };

  const formattedInitialValues: Values = {
    ...initialValues,
    width: isUpdateResizeAction(action) ? action.payload.payload.width : 0,
    height: isUpdateResizeAction(action) ? action.payload.payload.height : 0,
    left: isUpdateMoveAction(action)
      ? formatCoordinate(action.payload.payload.left)
      : 0,
    top: isUpdateMoveAction(action)
      ? formatCoordinate(action.payload.payload.top)
      : 0,
    scale:
      isScaleAction(action) || isSetTransformAction(action)
        ? formatScaleToPercentage(action.payload.scale)
        : initialTransformState.scale,
    clientX: isScaleAction(action)
      ? action.payload.clientX
      : initialTransformState.clientX,
    clientY: isScaleAction(action)
      ? action.payload.clientY
      : initialTransformState.clientY,
    x:
      isPositionAction(action) ||
      isSetZoomAction(action) ||
      isSetTransformAction(action)
        ? formatCoordinate(action.payload.x)
        : initialTransformState.x,
    y:
      isPositionAction(action) ||
      isSetZoomAction(action) ||
      isSetTransformAction(action)
        ? formatCoordinate(action.payload.y)
        : initialTransformState.y,
    editorState: isUpdateEditAction(action)
      ? convertFromRaw(action.payload.payload.block.editorState).getPlainText()
      : '',
    name: isUpdateRenameImageAction(action)
      ? action.payload.payload.block.name
      : '',
  };

  const {
    handleSubmit,
    isValid,
    handleChange,
    handleBlur,
    values,
    errors,
    resetForm,
    submitForm,
  } = useFormik({
    initialValues: formattedInitialValues,
    onSubmit,
    enableReinitialize: true,
    validate: formValues => {
      if (formValues.duration < -1) {
        return {
          duration: 'Difference must be a positive number',
        };
      } else {
        return undefined;
      }
    },
  });

  const areValuesEqual = equals(formattedInitialValues, values);

  const saveDisabled = !isValid || areValuesEqual;

  const flickerClasses = useFlicker({ disabled: saveDisabled });

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (!areValuesEqual) {
          submitForm();
        }
      }}
    >
      <Box display="flex" flexDirection="column" px={2} flex={1}>
        <form
          onSubmit={handleSubmit}
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
              endAdornment: <InputAdornment position="end">ms</InputAdornment>,
            }}
            error={Boolean(errors.duration)}
            helperText={errors.duration}
          />
          {isUpdateResizeAction(action) && (
            <Box display="flex">
              <TextField
                name="width"
                label="Width"
                value={values.width}
                onBlur={handleBlur}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">px</InputAdornment>
                  ),
                }}
                style={{ marginRight: 5 }}
              />
              <TextField
                name="height"
                label="Height"
                value={values.height}
                onBlur={handleBlur}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">px</InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
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
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
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
            <Box display="flex">
              <TextField
                {...textFieldProps}
                type="number"
                name="left"
                label="Left"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.left}
                style={{ marginRight: 5 }}
                InputProps={{
                  endAdornment: px,
                }}
              />
              <TextField
                {...textFieldProps}
                type="number"
                name="top"
                label="Top"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.top}
                InputProps={{
                  endAdornment: px,
                }}
              />
            </Box>
          )}
          {(isPositionAction(action) || isSetTransformAction(action)) && (
            <Box display="flex">
              <TextField
                {...textFieldProps}
                type="number"
                name="x"
                label="X Coordinate"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.x}
                style={{ marginRight: 5 }}
                InputProps={{
                  endAdornment: px,
                }}
              />
              <TextField
                {...textFieldProps}
                type="number"
                name="y"
                label="Y Coordinate"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.y}
                InputProps={{
                  endAdornment: px,
                }}
              />
            </Box>
          )}
          {isAuthor && (
            <Box display="flex" mt="auto">
              <Button
                className={clsx(Object.values(flickerClasses))}
                size="small"
                type="submit"
                disabled={saveDisabled}
              >
                Save edit
              </Button>
              <Button
                disabled={areValuesEqual}
                size="small"
                onClick={() => {
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </Box>
          )}
        </form>
      </Box>
    </ClickAwayListener>
  );
};

export default ActionCardForm;
