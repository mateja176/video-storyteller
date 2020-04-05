import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { SvgIconComponent } from '@material-ui/icons';
import { Button } from 'components';
import React from 'react';

export interface OptionWithPopoverProps {
  title: string;
  disabled: boolean;
  onSubmit: (value: string) => void;
  placeholder: string;
  initialValue: string;
  Icon: SvgIconComponent;
  text: string;
  submitText: string;
  initiallyOpen?: boolean;
}

const OptionWithPopover: React.FC<OptionWithPopoverProps> = ({
  title,
  disabled,
  onSubmit,
  initialValue,
  placeholder,
  Icon,
  text,
  submitText,
  initiallyOpen = false,
}) => {
  const [open, setOpen] = React.useState(initiallyOpen);
  const [value, setValue] = React.useState(initialValue);
  const listItemRef = React.useRef<HTMLDivElement | null>(null);

  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title={title}>
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
      </Tooltip>

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
            style={{
              marginRight: 5,
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
