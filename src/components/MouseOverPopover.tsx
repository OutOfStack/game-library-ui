import Popover from '@mui/material/Popover'


interface IPopoverProps {
  open: boolean,
  anchorEl: HTMLElement | null,
  children: JSX.Element,
  handlePopoverClose: () => void
}

const MouseOverPopover = (props: IPopoverProps): JSX.Element => {
  const { open, anchorEl, children, handlePopoverClose } = props

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      onClose={handlePopoverClose}
      disableRestoreFocus
    >
      {children}
    </Popover>
  )
}

export default MouseOverPopover