import { SimpleAction } from 'models';
import React from 'react';
import { DragSourceHookSpec, useDrag } from 'react-dnd';
import { UpdateAction } from './store/blockStates';

export type DragSourceSpec = DragSourceHookSpec<
  SimpleAction,
  UpdateAction,
  void
>;

export interface RndProps
  extends React.HTMLProps<HTMLDivElement>,
    Pick<DragSourceSpec, 'begin' | 'end' | 'canDrag'> {}

const Rnd: React.FC<RndProps> = ({ begin, end, canDrag, ...props }) => {
  const [, dragRef] = useDrag({
    item: {
      type: 'updateMove',
    },
    begin,
    end,
    canDrag,
  });

  return <div ref={dragRef} {...props} />;
};

export default Rnd;
