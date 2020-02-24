import rndDragPreview from 'assets/img/rnd-drag-preview.png';
import { SimpleAction } from 'models';
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

export interface RndProps
  extends React.HTMLProps<HTMLDivElement>,
    Pick<DragSourceSpec, 'begin' | 'end' | 'canDrag'> {
  style: React.CSSProperties & {
    left: number;
    top: number;
  };
}

const Rnd: React.FC<RndProps> = ({ begin, end, canDrag, style, ...props }) => {
  const [, dragRef, previewRef] = useDrag({
    item: {
      type: 'updateMove',
    },
    begin,
    end,
    canDrag,
  });

  const [startClientCoords, setStartClientCoords] = React.useState(
    initialClientCoords,
  );
  const [deltaClientCoords, setDeltaClientCoords] = React.useState(
    initialClientCoords,
  );

  const left = style.left + deltaClientCoords.clientX;
  const top = style.top + deltaClientCoords.clientY;

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
      />
    </>
  );
};

export default Rnd;
