import { withA11y } from '@storybook/addon-a11y';
import { withInfo } from '@storybook/addon-info';
import { withKnobs } from '@storybook/addon-knobs';
import { addDecorator, addParameters, configure } from '@storybook/react';

addDecorator(withInfo);
addDecorator(withKnobs);
addDecorator(withA11y);

addParameters({
  backgrounds: [
    { name: 'twitter', value: '#00aced' },
    { name: 'facebook', value: '#3b5998' },
  ],
});

const req = require.context('../stories', true, /\.stories\.tsx$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
