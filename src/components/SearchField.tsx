import { styled, alpha } from '@mui/material/styles'
import { InputBase } from '@mui/material'


export const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.08)
      : alpha(theme.palette.text.primary, 0.04),
  border: `1px solid ${alpha(theme.palette.text.primary, 0.18)}`,
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? alpha(theme.palette.common.white, 0.12)
        : alpha(theme.palette.text.primary, 0.06),
    borderColor: alpha(theme.palette.text.primary, 0.28)
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto'
  }
}))
  
export const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))
  
export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(2.5)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '18ch',
      '&:focus': {
        width: '24ch'
      }
    }
  }
}))
