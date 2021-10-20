import { useHistory } from 'react-router-dom'
import { AppBar, Box, Toolbar, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { makeStyles } from '@mui/styles'

import { Search, SearchIconWrapper, StyledInputBase } from './SearchField'


const useStyles = makeStyles(() => ({
  title: {
    cursor: 'pointer'
  }
}))

export interface ISearchFieldProps {
  text: string,
  changeText: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void
}

export interface IHeaderProps {
  searchFieldProps: ISearchFieldProps
} 

const Header = (props: IHeaderProps) => {

  const classes = useStyles()
  const history = useHistory()

  const { searchFieldProps } = props;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" >
        <Toolbar>
          <Typography variant="h5" sx={{ mr: 2, ml: '5vw' }}>
            <span
              onClick={() => { history.push("/"); history.go(0); }}
              className={classes.title}
            >
              Game Library
            </span>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Search sx={{ mr: '5vw', ml: 2 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Enter game name"
              value={searchFieldProps.text}
              onChange={searchFieldProps.changeText}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header