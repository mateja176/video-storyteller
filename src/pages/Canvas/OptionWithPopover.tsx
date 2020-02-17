import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  TextField,
} from '@material-ui/core';
import { SvgIconComponent } from '@material-ui/icons';
import { Button } from 'components';
import React from 'react';

export interface OptionWithPopoverProps {
  disabled: boolean;
  onSubmit: (value: string) => void;
  placeholder: string;
  initialValue: string;
  Icon: SvgIconComponent;
  text: string;
  submitText: string;
}

const OptionWithPopover: React.FC<OptionWithPopoverProps> = ({
  disabled,
  onSubmit,
  initialValue,
  placeholder,
  Icon,
  text,
  submitText,
}) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const listItemRef = React.useRef<HTMLDivElement | null>(null);

  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <ListItem
        disabled={disabled}
        ref={listItemRef}
        button
        onClick={() => {
          setOpen(true);
        }}
      >
        <ListItemIcon style={{ minWidth: 'auto', marginRight: 10 }}>
          <Icon color={open ? 'secondary' : 'action'} />
        </ListItemIcon>
        <ListItemText style={{ whiteSpace: 'nowrap' }}>{text}</ListItemText>
      </ListItem>
      <Popover open={open} anchorEl={listItemRef.current} onClose={close}>
        <form
          style={{ margin: 10 }}
          onSubmit={e => {
            e.preventDefault();

            if (value) {
              onSubmit(value);

              setValue(initialValue);

              close();
            }
          }}
        >
          <TextField
            InputProps={{
              autoFocus: true,
            }}
            placeholder={placeholder}
            value={value}
            onChange={({ target: { value: newValue } }) => {
              setValue(newValue);
            }}
            onMouseDown={e => {
              e.stopPropagation();
            }}
          />
          <Button type="submit" disabled={!value || value === initialValue}>
            {submitText}
          </Button>
        </form>
      </Popover>
    </>
  );
};

export default OptionWithPopover;
