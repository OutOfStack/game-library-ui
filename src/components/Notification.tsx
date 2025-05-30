import { useEffect, useState } from "react"
import { Alert, AlertColor, Snackbar, SnackbarCloseReason } from "@mui/material"

import { IValidationResponse } from "../types/Validation"


interface INotification {
  message: string | IValidationResponse | null,
  resetMessage: () => void
}

const Notification = (props: INotification) => {

  const { message, resetMessage } = props

  const defaultAlert = {
    open: false,
    message: "",
    severity: "success" as AlertColor
  }
  const [alert, setAlert] = useState(defaultAlert)

  const handleCloseAlert = (event?: Event | React.SyntheticEvent<any, Event>, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return
    }
    setAlert(a => ({ ...defaultAlert, severity: a.severity }))
  }

  const showNotification = (message: string, severity: AlertColor = "success") => {
    setAlert({
      message: message,
      severity: severity,
      open: true
    })
  }
  
  useEffect(() => {
    if (message) {
      notifyError(message)
    } else {
      resetMessage()
    }
  }, [message])

  const notifyError = (err: string | IValidationResponse | null) => {
    if (typeof err === 'string') {
      showNotification(err, "error")
    } else {
      const error = err as IValidationResponse
      showNotification(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error, "error")
    }
  }
  
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={alert.open}
      autoHideDuration={5000}
      onClose={handleCloseAlert}
    >
      <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }} >
        {alert.message}
      </Alert>
    </Snackbar>
  )
}

export default Notification