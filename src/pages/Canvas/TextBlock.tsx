import { Card, CardContent } from '@material-ui/core';
import { Editor } from 'components';
import { isEqual } from 'lodash';
import {
  createDropText,
  DropTextPayload,
  EditorProps,
  WithDropResult,
} from 'models';
import React from 'react';
import { useDrag } from 'react-dnd';
import { v4 } from 'uuid';

interface TextBlockBaseProps extends DropTextPayload, WithDropResult {}

const TextBlockBase: React.FC<TextBlockBaseProps & {
  position: React.CSSProperties['position'];
}> = ({ position, top, left, ...props }) => {
  const [stateProps, setStateProps] = React.useState(props);

  React.useEffect(() => {
    if (!isEqual(props, stateProps)) {
      setStateProps(props);
    }
  }, [props]); // eslint-disable-line react-hooks/exhaustive-deps

  const [, dragRef] = useDrag({
    item: createDropText({ ...stateProps }),
  });

  const { initialContent } = props;

  return (
    <Card
      ref={dragRef}
      style={{
        cursor: 'grab',
        display: 'inline-block',
        position,
        top,
        left,
      }}
    >
      <CardContent>
        <Editor initialContent={initialContent} />
      </CardContent>
    </Card>
  );
};

const TextBlock: React.FC<TextBlockBaseProps> = props => (
  <TextBlockBase {...props} position="absolute" />
);

export default TextBlock;

export const TextBlockTemplate: React.FC<Pick<
  EditorProps,
  'initialContent'
>> = props => (
  <TextBlockBase {...props} position="static" top={0} left={0} id={v4()} />
);
