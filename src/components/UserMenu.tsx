import { useState } from 'react'
import { Menu, MenuItem, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import LogoutIcon from '@mui/icons-material/LogoutRounded'
import DeleteIcon from '@mui/icons-material/Delete'
import VerifiedIcon from '@mui/icons-material/Verified'

import Modal from './Modal'
import useAuth from '../hooks/useAuth'

export interface IUserMenuProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  vrf_required: boolean
  onVerifyEmailClick: () => void
  onLogout: () => void
  onDeleteSuccess: () => void
  onDeleteError: (error: string) => void
}

const UserMenu = (props: IUserMenuProps) => {
  const { anchorEl, onClose, vrf_required, onVerifyEmailClick, onLogout, onDeleteSuccess, onDeleteError } = props

  const { deleteAccount } = useAuth()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleDeleteAccountOpen = () => {
    setDeleteConfirmOpen(true)
    onClose()
  }

  const handleDeleteAccountClose = () => {
    setDeleteConfirmOpen(false)
  }

  const handleDeleteAccount = async () => {
    const err = await deleteAccount()
    if (err) {
      onDeleteError(typeof err === 'string' ? err : 'Failed to delete account')
    } else {
      onDeleteSuccess()
    }
    setDeleteConfirmOpen(false)
  }

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {vrf_required && (
          <MenuItem
            onClick={() => {
              onVerifyEmailClick()
              onClose()
            }}
            sx={{ color: 'warning.main' }}
          >
            <VerifiedIcon sx={{ mr: 1 }} />
            Verify Email
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onLogout()
            onClose()
          }}
        >
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
        </MenuItem>
        <MenuItem
          onClick={handleDeleteAccountOpen}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Account
        </MenuItem>
      </Menu>

      <Modal
        fullScreen={false}
        matchesMd={matchesMd}
        isOpen={deleteConfirmOpen}
        closeDialog={handleDeleteAccountClose}
        title='Delete Account'
        dialogText=''
        dialogErrorText=''
        submitActionName='Delete Account'
        handleSubmit={handleDeleteAccount}
      >
        <Typography variant="body2" color="error" sx={{ textAlign: 'center', mb: 2 }}>
          Are you sure you want to delete your account?
        </Typography>
        <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
          This action cannot be undone and will permanently delete your account.
        </Typography>
      </Modal>
    </>
  )
}

export default UserMenu
