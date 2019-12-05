import { Card, CardContent, CardHeader } from '@material-ui/core';
import { Editor } from 'components';
import { isEqual } from 'lodash';
import { createDropText, WithId, WithInitialContent } from 'models';
import React from 'react';
import { useDrag } from 'react-dnd';
import { v4 } from 'uuid';

export const TextCard = React.forwardRef<HTMLDivElement, WithInitialContent>(
  ({ initialContent }, ref) => (
    <Card
      ref={ref}
      style={{
        cursor: 'grab',
        display: 'inline-block',
        boxShadow: 'none',
        width: '100%',
        height: '100%',
      }}
    >
      <CardHeader style={{ height: 30 }} />
      <CardContent style={{ paddingTop: 0 }}>
        <Editor initialContent={initialContent} />
      </CardContent>
    </Card>
  ),
);

interface TextBlockBaseProps extends WithInitialContent, WithId {}

const TextBlockBase: React.FC<TextBlockBaseProps> = props => {
  const [stateProps, setStateProps] = React.useState(props);

  React.useEffect(() => {
    if (!isEqual(props, stateProps)) {
      setStateProps(props);
    }
  }, [props]); // eslint-disable-line react-hooks/exhaustive-deps

  const [, dragRef] = useDrag({
    item: createDropText({ ...stateProps }),
  });

  const { id: _, ...textCardProps } = props;

  return <TextCard {...textCardProps} ref={dragRef} />;
};

export const TextBlockTemplate: React.FC<WithInitialContent> = props => (
  <TextBlockBase {...props} id={v4()} />
);
