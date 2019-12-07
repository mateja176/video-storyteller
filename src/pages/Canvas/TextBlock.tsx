import { Card, CardContent, CardHeader } from '@material-ui/core';
import { Editor } from 'components';
import { WithInitialContent } from 'models';
import React from 'react';

const TextCard = React.forwardRef<HTMLDivElement, WithInitialContent>(
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
      <CardHeader />
      <CardContent style={{ paddingTop: 0 }}>
        <Editor initialContent={initialContent} />
      </CardContent>
    </Card>
  ),
);

export default TextCard;
