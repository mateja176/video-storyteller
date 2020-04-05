import { workspaceSelector } from 'models';
import React from 'react';
import JoyRide, { CallBackProps, Step } from 'react-joyride';

const steps: Step[] = [
  {
    title: 'Welcome',
    content: 'Would you like take a tour of the workspace?',
    target: 'body',
    placement: 'center',
  },
  {
    title: 'Main menu',
    content:
      'Visit the main menu when you want to perform an action on the story. As you will see, the menu is also home to the text editor controls and audio upload dropzone.',
    target: workspaceSelector.mainMenu,
  },
  {
    title: 'Sidebar',
    content:
      "Here you'll find actions you can perform in a story, like creating and deleting blocks.",
    target: workspaceSelector.sidebar,
    placement: 'right',
  },
  {
    title: 'Right Drawer',
    content:
      'The drawer contains blocks you can drop into the canvas. Importantly, you can also edit the blocks before you drag and drop them.',
    target: workspaceSelector.rightDrawer,
    placement: 'left',
  },
  {
    title: 'Canvas',
    content:
      'The state of the canvas depends entirely on the actions you performed up until that moment. For example, once you drop a block, it will be visible on the canvas.',
    target: workspaceSelector.canvasWrapper,
  },
  {
    title: 'Actions Timeline',
    content:
      "All actions you perform, like creating blocks and moving them, are recorded chronologically so that you can replay them from any point! You can also reorder the actions, just make sure not to place a block's create action after the same block's update action and vice versa.",
    target: workspaceSelector.actionsTimeline,
  },
  {
    title: 'Story Controls',
    content:
      'Play, pause, resume, stop, all of which you can do using story controls. Excluding sweeping and deleting, the controls are also going to be available to your audience.',
    target: workspaceSelector.storyControls,
  },
];

export interface TourProps {}

export const Tour: React.FC<TourProps> = () => {
  const [shouldRunTour, setShouldRunTour] = React.useState(false);

  React.useEffect(() => {
    const shouldRunString = localStorage.getItem('shouldRunTour');
    const shouldRun = shouldRunString ? JSON.parse(shouldRunString) : true;

    if (shouldRun) {
      setShouldRunTour(shouldRun);
    }
  }, []);

  const handleTourRan = React.useCallback(({ action }: CallBackProps) => {
    if (action === 'skip' || action === 'stop') {
      setShouldRunTour(false);
      localStorage.setItem('shouldRunTour', false.toString());
    }
  }, []);

  return (
    <JoyRide
      run={shouldRunTour}
      steps={steps}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      spotlightPadding={0}
      styles={{
        options: {
          zIndex: 1101,
        },
      }}
      callback={handleTourRan}
    />
  );
};
