import rndDragPreview from 'assets/img/rnd-drag-preview.png';
import { SimpleAction } from 'models';
import React from 'react';
import { DragPreviewImage, DragSourceHookSpec, useDrag } from 'react-dnd';
import { Box, Flex } from 'rebass';
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

const cornerBoxSize = 10;

export interface RndProps
  extends React.HTMLProps<HTMLDivElement>,
    Pick<DragSourceSpec, 'begin' | 'end' | 'canDrag'> {
  style: React.CSSProperties & {
    left: number;
    top: number;
  };
  scale: number;
}

const Rnd: React.FC<RndProps> = ({
  children,
  scale,
  begin,
  end,
  canDrag,
  onMouseEnter,
  onMouseLeave,
  style: { position, left, top, ...style },
  ...props
}) => {
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

  const leftWithDelta = left + deltaClientCoords.clientX / scale;
  const topWithDelta = top + deltaClientCoords.clientY / scale;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position,
        top: topWithDelta,
        left: leftWithDelta,
      }}
    >
      <Flex flexDirection="column">
        <Flex height={cornerBoxSize}>
          <Box width={cornerBoxSize} style={{ cursor: 'nwse-resize' }} />
          <Box
            height={cornerBoxSize}
            style={{ cursor: 'ns-resize' }}
            flex={1}
          />
          <Box width={cornerBoxSize} style={{ cursor: 'nesw-resize' }} />
        </Flex>
        <DragPreviewImage connect={previewRef} src={rndDragPreview} />
        <Flex>
          <Box width={cornerBoxSize} style={{ cursor: 'ew-resize' }} />
          <div
            ref={dragRef}
            {...props}
            style={style}
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
            {children}
          </div>
          <Box width={cornerBoxSize} style={{ cursor: 'ew-resize' }} />
        </Flex>
        <Flex height={cornerBoxSize}>
          <Box width={cornerBoxSize} style={{ cursor: 'nesw-resize' }} />
          <Box
            height={cornerBoxSize}
            flex={1}
            style={{ cursor: 'ns-resize' }}
          />
          <Box width={cornerBoxSize} style={{ cursor: 'nwse-resize' }} />
        </Flex>
      </Flex>
    </div>
  );
};

export default Rnd;
