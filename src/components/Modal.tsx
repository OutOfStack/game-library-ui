import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material'


export interface IModalProps {
  fullwidth?: boolean,
  matchesMd?: boolean,
  isOpen: boolean,
  closeDialog: () => void,
  title: string,
  dialogText: string,
  dialogErrorText: string,
  submitActionName: string,
  handleSubmit: () => void,
  children: JSX.Element
}

const Modal = (props: IModalProps) => {
  const { fullwidth, matchesMd, isOpen, closeDialog, title, dialogText, dialogErrorText,
    submitActionName, handleSubmit, children } = props

  return (
    <Dialog open={isOpen} onClose={closeDialog} fullWidth={fullwidth || true}>
      <DialogTitle sx={{textAlign: 'center'}}>{title}</DialogTitle>
      <DialogContent>
        {dialogText ||
          <Grid container direction="column" alignItems="center">
            {children}
            {dialogErrorText && 
              <Grid item sx={{ minWidth: matchesMd ? '400px' : '210px' }}>
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
          <Button size="large" variant="contained" onClick={closeDialog}>Cancel</Button>
          <Button size="large" variant="contained" color="success" onClick={handleSubmit}>{submitActionName}</Button>
        </DialogActions>
      }
    </Dialog>
  )
}

export default Modal