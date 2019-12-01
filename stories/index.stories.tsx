import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { linkTo } from '@storybook/addon-links';
import { storiesOf } from '@storybook/react';
import { Button, Welcome } from '@storybook/react/demo';
import React from 'react';

storiesOf('Welcome', module).add('to Storybook', () => (
  <Welcome showApp={linkTo('Button')} />
));

storiesOf('Button', module)
  .add('with text', () => (
    <Button onClick={action('clicked')}>{text('Text', 'Hello Button')}</Button>
  ))
  .add(
    'with some emoji',
    () => (
      <Button onClick={action('clicked')}>
        <span role="img" aria-label="so cool">
          {text('Text', '😀 😎 👍 💯')}
        </span>
      </Button>
    ),
    {
      notes: 'A very simple example of addon notes',
    },
  );
