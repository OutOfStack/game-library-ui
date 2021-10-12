import Popover from '@mui/material/Popover'


interface PopoverProps {
  open: boolean,
  anchorEl: HTMLElement | null,
  children: JSX.Element,
  handlePopoverClose: () => void
}

const MouseOverPopover = (props: PopoverProps): JSX.Element => {
  const { open, anchorEl, children, handlePopoverClose } = props

  return (
    <div>
      <Popover
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        {children}
      </Popover>
    </div>
  )
}

export default MouseOverPopover