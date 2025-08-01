import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material'


export interface IModalProps {
  fullScreen?: boolean,
  matchesMd?: boolean,
  isOpen: boolean,
  closeDialog: () => void,
  title: string,
  dialogText: string,
  dialogErrorText: string,
  submitActionName: string,
  submitDisabled?: boolean,
  handleSubmit: () => void,
  children: JSX.Element
}

const Modal = (props: IModalProps) => {
  const { fullScreen, matchesMd, isOpen, closeDialog, title, dialogText, dialogErrorText,
    submitActionName, submitDisabled = false, handleSubmit, children } = props

  return (
    <Dialog open={isOpen} onClose={closeDialog} fullScreen={fullScreen}>
      <DialogTitle sx={{textAlign: 'center'}}>{title}</DialogTitle>
      <DialogContent>
        {dialogText ||
          <Grid container direction="column" sx={{ alignItems: "center" }}>
            {children}
            {dialogErrorText && 
              <Grid sx={{ minWidth: matchesMd ? '400px' : '210px', pt: 2 }}>
                <Alert severity="error" icon={false}>
                  <Typography>
                    {dialogErrorText}
                  </Typography>
                </Alert>
              </Grid>
            }
          </Grid>
        }
      </DialogContent>
      {!dialogText &&
        <DialogActions>
          <Button
            size="large"
            variant="contained"
            onClick={closeDialog}
          >
            Cancel
          </Button>
          <Button
            size="large"
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={submitDisabled}
          >
            {submitActionName}
          </Button>
        </DialogActions>
      }
    </Dialog>
  )
}

export default Modal