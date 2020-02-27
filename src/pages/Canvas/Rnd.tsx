/* eslint-disable indent */

import rndDragPreview from 'assets/img/rnd-drag-preview.png';
import { SimpleAction } from 'models';
import { Resizable, ResizableProps } from 're-resizable';
import React from 'react';
import { DragPreviewImage, DragSourceHookSpec, useDrag } from 'react-dnd';
import { UpdateAction } from './store/blockStates';

export type DragSourceSpec = DragSourceHookSpec<
  SimpleAction,
  UpdateAction,
  void
>;

const initialClientCoords: Pick<React.MouseEvent, 'clientX' | 'clientY'> = {
  clientX: 0,
  clientY: 0,
};

const resizeDisabler: ResizableProps['enable'] = {
  left: false,
  right: false,
  top: false,
  bottom: false,
  topLeft: false,
  topRight: false,
  bottomLeft: false,
  bottomRight: false,
};

export interface RndProps
  extends Omit<
      React.HTMLProps<HTMLDivElement>,
      'onDragStart' | 'onDrag' | 'onDragEnd'
    >,
    Pick<DragSourceSpec, 'begin' | 'end' | 'canDrag'>,
    Required<
      Pick<ResizableProps, 'onResizeStart' | 'onResizeStop' | 'lockAspectRatio'>
    > {
  style: React.CSSProperties & {
    left: number;
    top: number;
    width?: number;
    height?: number;
  };
  scale: number;
  enableResizing: boolean;
}

const Rnd: React.FC<RndProps> = ({
  scale,
  onResizeStart,
  onResizeStop,
  lockAspectRatio,
  enableResizing,
  begin,
  end,
  canDrag,
  style: { width, height, ...style },
  children,
  ...props
}) => {
  const [resizing, setResizing] = React.useState(false);

  const [, dragRef, previewRef] = useDrag({
    item: {
      type: 'updateMove',
    },
    begin,
    end,
    canDrag: canDrag && !resizing,
  });

  const [startClientCoords, setStartClientCoords] = React.useState(
    initialClientCoords,
  );
  const [deltaClientCoords, setDeltaClientCoords] = React.useState(
    initialClientCoords,
  );

  const left = style.left + deltaClientCoords.clientX / scale;
  const top = style.top + deltaClientCoords.clientY / scale;

  const [deltaSize, setDeltaSize] = React.useState({ width: 0, height: 0 });

  const widthWithDefault = width || 0;
  const heightWithDefault = height || 0;
  const widthWithDelta = widthWithDefault + deltaSize.width;
  const heightWithDelta = heightWithDefault + deltaSize.height;

  return (
    <>
      <DragPreviewImage connect={previewRef} src={rndDragPreview} />
      <div
        ref={dragRef}
        {...props}
        style={{
          ...style,
          top,
          left,
          ...(width && height
            ? { width: widthWithDelta, height: heightWithDelta }
            : {}),
        }}
        onDragStart={({ clientX, clientY }) => {
          setStartClientCoords({
            clientX,
            clientY,
          });
        }}
        onDrag={({ clientX, clientY }) => {
          setDeltaClientCoords({
            clientX: clientX - startClientCoords.clientX,
            clientY: clientY - startClientCoords.clientY,
          });
        }}
        onDragEnd={() => {
          setStartClientCoords(initialClientCoords);
          setDeltaClientCoords(initialClientCoords);
        }}
      >
        <Resizable
          scale={scale}
          size={
            width && height
              ? {
                  height,
                  width,
                }
              : undefined
          }
          onResizeStart={(...args) => {
            setResizing(true);

            onResizeStart(...args);
          }}
          onResize={(e, dir, elementRef, delta) => {
            setDeltaSize(delta);
          }}
          onResizeStop={(...args) => {
            setResizing(true);

            onResizeStop(...args);
          }}
          lockAspectRatio={lockAspectRatio}
          enable={enableResizing ? undefined : resizeDisabler}
        >
          {children}
        </Resizable>
      </div>
    </>
  );
};

export default Rnd;
