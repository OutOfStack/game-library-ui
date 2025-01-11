import React, { useEffect, useState } from 'react'
import {
  Autocomplete, AutocompleteChangeReason, AutocompleteChangeDetails, Grid, TextField, TextFieldProps, Typography, 
  useMediaQuery, useTheme
} from '@mui/material'
import { MobileDatePicker, DesktopDatePicker } from '@mui/x-date-pickers'
import moment from 'moment'
import { FileInfo, FileUpload, FilesUpload, Widget as UploadWidget } from '@uploadcare/react-widget'

import Modal from '../components/Modal'
import Notification from '../components/Notification'
import { ICreateGame, IGameResponse } from '../types/Game'
import { IPlatform } from '../types/Platform'
import { IGenre } from '../types/Genre'
import useGames from '../hooks/useGames'
import useGenres from '../hooks/useGenres'
import usePlatforms from '../hooks/usePlatforms'
import { IValidationResponse } from '../types/Validation'
import { isTouchDevice } from '../utils/devices'
import { IsValidUrl } from '../utils/validators'
import '../styles/UploadWidget.css'


const fieldWidthLarge = '400px'
const fieldWidthSmall = '210px'
const dateFormat="YYYY-MM-DD"

interface IAddGameModal {
  handleAddGameDialogClose: () => void,
  addGameDialogOpen: boolean
}

const AddGameModal = (props: IAddGameModal) => {
  const { handleAddGameDialogClose, addGameDialogOpen } = props

  const { create: createGame } = useGames()
  const { fetchGenres } = useGenres()
  const { fetchPlatforms } = usePlatforms()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))

  const [genres, setGenres] = useState<IGenre[]>([])
  const [platforms, setPlatforms] = useState<IPlatform[]>([])

  const [alert, setAlert] = useState<string | IValidationResponse | null>(null)

  // fetch genres
  useEffect(() => {
    const getGenres = async () => {
      const [resp, err] = await fetchGenres()
      if (err) {
        setAlert(err)
        return
      }
      const genres = resp as IGenre[]
      setGenres(genres)
    }
    getGenres()
  }, [])

  // fetch platforms
  useEffect(() => {
    const getPlatforms = async () => {
      const [resp, err] = await fetchPlatforms()
      if (err) {
        setAlert(err)
        return
      }
      const platforms = resp as IPlatform[]
      setPlatforms(platforms)
    }
    getPlatforms()
  }, [])

  //#region add game

  interface IAddGameValidation {
    name: string,
    developer: string,
    releaseDate: string,
    summary: string,
    genres: string,
    platforms: string,
    logo: string,
    screenshots: string,
    websites: string,
    [index: string]: string
  }

  const [addGame, setAddGame] = useState<ICreateGame>({} as ICreateGame)
  const [addGameDialogText, setAddGameDialogText] = useState("")
  const [addGameErrorText, setAddGameErrorText] = useState("")
  const [addGameValidation, setAddGameValidation] = useState<IAddGameValidation>({
    name: "",
    developer: "",
    releaseDate: "",
    summary: "",
    genres: "",
    platforms: "",
    logo: "",
    screenshots: "",
    websites: ""
  })

  const handleAddGameFieldChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, field: string) => {
    const value = e.target.value?.trimStart()
    setAddGame(g => ({ ...g, [field]: value }))
    // remove error if there is a value now
    if (addGameValidation[field]?.length > 0 && value?.length > 0) {
      setAddGameValidation(v => ({ ...v, [field]: '' }))
    }
  }

  const handleAddGameWebsitesChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const websites = e.target.value?.trimStart().split(",").map(g => g.trim())
    setAddGame(g => ({ ...g, websites: websites }))
    // remove error if there is a value now
    if (addGameValidation.websites?.length > 0) {
      setAddGameValidation(v => ({ ...v, websites: '' }))
    }
  }

  const validateAddGameForm = (): boolean => {
    let valid = true
    if (!addGame.name) {
      setAddGameValidation(v => ({ ...v, name: 'Name is required' }))
      valid = false
    }

    if (!addGame.developer) {
      setAddGameValidation(v => ({ ...v, developer: 'Developer is required' }))
      valid = false
    }

    if (!addGame.releaseDate) {
      setAddGameValidation(v => ({ ...v, releaseDate: 'Release date is required' }))
      valid = false
    } else if (!moment(addGame.releaseDate).isValid()) {
      setAddGameValidation(v => ({ ...v, releaseDate: `Invalid date or format. Should be ${dateFormat}` }))
      valid = false
    }

    if (!addGame.summary) {
      setAddGameValidation(v => ({ ...v, summary: 'Summary is required' }))
      valid = false
    }

    if (!addGame.genresIds?.length) {
      setAddGameValidation(v => ({ ...v, genres: 'At least one genre is required' }))
      valid = false
    }

    if (!addGame.platformsIds?.length) {
      setAddGameValidation(v => ({ ...v, platforms: 'At least one platform is required' }))
      valid = false
    }

    if (!addGame.logoUrl) {
      setAddGameValidation(v => ({ ...v, logo: 'Cover is required' }))
      valid = false
    }

    if (!addGame.screenshots?.length) {
      setAddGameValidation(v => ({ ...v, screenshots: 'Screenshots are required' }))
      valid = false
    }

    if (addGame.websites?.length > 0) {
      let msg = "" 
      addGame.websites.forEach(url => {
        if (!IsValidUrl(url)) {
          msg += `Website ${url} is not valid. `
        }
      })

      if (msg.length > 0) {
        setAddGameValidation(v => ({ ...v, websites: msg }))
        valid = false
      }
    }

    return valid
  }

  const handleAddGame = async () => {
    setAddGameErrorText("")
    if (!validateAddGameForm()) {
      return
    }

    const newGame: ICreateGame = {
      ...addGame,
      releaseDate: moment(addGame.releaseDate).format(dateFormat)
    }

    const [resp, err] = await createGame(newGame)
    if (err) {
      if (typeof err === 'string') {
        setAddGameErrorText(err)
        return
      }
      const error = err as IValidationResponse
      setAddGameErrorText(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error)
      return
    }
    const game = resp as IGameResponse
    if (game.id) {
      setAddGameDialogText("Game has been successfully added")
      setAddGame({} as ICreateGame)
      setTimeout(() => {
        handleAddGameDialogClose()
        setAddGameDialogText("")
      }, 300)
    } else {
      setAddGameErrorText("An error occured. Try again later")
    }
  }

  //#endregion

  //#region upload widget

  const handleLogoChanged = (fileInfo: FileInfo) => {
    if (fileInfo.isStored) {
      setAddGame(g => ({ ...g, logoUrl: fileInfo.cdnUrl || undefined }))
    }

    if (addGameValidation.logo.length > 0 && fileInfo.cdnUrl) {
      setAddGameValidation(v => ({ ...v, logo: '' }))
    }
  }

  const handleScreenshotsChanged = async (fileInfo: FileUpload | FilesUpload | null) => {
    if (!fileInfo) {
      return
    }
    let group = fileInfo as FilesUpload
    const files = await Promise.all(group.files())
    const urls = files.map((file) => file?.cdnUrl || '')
    
    setAddGame(g => ({ ...g, screenshots: urls }))

    if (addGameValidation.screenshots.length > 0 && urls?.length > 0) {
      setAddGameValidation(v => ({ ...v, screenshots: '' }))
    }
  }

  const fileSizeLimit = (sizeInKb: number) => {
    return (fileInfo: FileInfo) => {
      if (fileInfo.name === null || fileInfo.size === null) {
        return
      }

      if (fileInfo.size > sizeInKb * 1024) {
        throw new Error('size')
      }
    }
  }

  const hasExtension = () => {
    return (fileInfo: FileInfo) => {
      if (fileInfo.name === null) {
        return
      }

      if (!fileInfo.name.includes(".")) {
        throw new Error('image')
      }
    }
  }

  const uploadValidators = [fileSizeLimit(150), hasExtension()]

  //#endregion

  const uwpk = '8869032692db5708aebb'

  return (
  <>
    <Notification 
      message={alert} 
      resetMessage={() => setAlert(null)}
    />
    <Modal
      fullwidth={matchesMd}
      matchesMd={matchesMd}
      isOpen={addGameDialogOpen}
      closeDialog={handleAddGameDialogClose}
      title='Add new game'
      dialogText={addGameDialogText}
      dialogErrorText={addGameErrorText}
      submitActionName='Add game'
      handleSubmit={handleAddGame}
    >
      <>
        <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <TextField
            required
            error={!!addGameValidation.name}
            helperText={addGameValidation.name}
            fullWidth
            label="Name"
            margin="normal"
            value={addGame?.name || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameFieldChange(e, 'name')}
          />
        </Grid>
        <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <TextField
            required
            error={!!addGameValidation.developer}
            helperText={addGameValidation.developer}
            fullWidth
            label="Developer"
            margin="normal"
            value={addGame?.developer || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameFieldChange(e, 'developer')}
          />
        </Grid>
        <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          {isTouchDevice()
            ? <MobileDatePicker
              label="Release date"
              format={dateFormat}
              value={addGame?.releaseDate ? moment(addGame.releaseDate) : null}
              onChange={(d: moment.Moment | null) => {
                setAddGameValidation(v => ({ ...v, releaseDate: "" }))
                setAddGame(g => ({ ...g, releaseDate: d?.format(dateFormat) || "" }))
              }}
              slotProps={{ 
                textField: { 
                  fullWidth: true, 
                  margin: "normal",
                  required: true, 
                  error: !!addGameValidation.releaseDate,
                  helperText: addGameValidation.releaseDate
                } 
              }}
            />
            : <DesktopDatePicker
              label="Release date"
              format={dateFormat}
              value={addGame?.releaseDate ? moment(addGame.releaseDate) : null}
              onChange={(d: moment.Moment | null) => {
                setAddGameValidation(v => ({ ...v, releaseDate: "" }))
                setAddGame(g => ({ ...g, releaseDate: d?.format(dateFormat) || "" }))
              }}
              slotProps={{ 
                textField: { 
                  fullWidth: true, 
                  margin: "normal",
                  required: true, 
                  error: !!addGameValidation.releaseDate,
                  helperText: addGameValidation.releaseDate
                } 
              }}
            />
          }
        </Grid>
        <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <TextField
            required
            error={!!addGameValidation.summary}
            helperText={addGameValidation.summary}
            fullWidth
            multiline
            margin="normal"
            label="Summary"
            value={addGame?.summary || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameFieldChange(e, "summary")}
          />
        </Grid>
        <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <TextField
            error={!!addGameValidation.websites}
            helperText={addGameValidation.websites}
            fullWidth
            margin="normal"
            label="Websites"
            placeholder="mygame.com,twitch.com/mygame"
            value={addGame?.websites?.join(",") || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameWebsitesChange(e)}
          />
        </Grid>
        <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          filterSelectedOptions
          id="genres"
          options={genres}
          getOptionLabel={(option: IGenre) => option.name}
          onChange={(e: React.SyntheticEvent, value: IGenre[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<IGenre> | undefined) => {
            setAddGame(g => ({
              ...g,
              genresIds: value?.map(g => g.id)
            }))

            if (addGameValidation.genres?.length !== 0 && value?.length > 0) {
              setAddGameValidation(v => ({ ...v, genres: '' }))
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              fullWidth
              error={!!addGameValidation.genres}
              helperText={addGameValidation.genres}
              margin="normal"
              label="Genres"
            />
          )}
        />
        <Autocomplete
          multiple
          disableCloseOnSelect
          filterSelectedOptions
          id="platforms"
          options={platforms}
          getOptionLabel={(option: IPlatform) => option.name}
          onChange={(e: React.SyntheticEvent, value: IPlatform[], reason: AutocompleteChangeReason, details?: AutocompleteChangeDetails<IPlatform> | undefined) => {
            setAddGame(g => ({
              ...g,
              platformsIds: value?.map(p => p.id)
            }))

            if (addGameValidation.platforms?.length !== 0 && value?.length > 0) {
              setAddGameValidation(v => ({ ...v, platforms: '' }))
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              fullWidth
              error={!!addGameValidation.platforms}
              helperText={addGameValidation.platforms}
              margin="normal"
              label="Platforms"
            />
          )}
        />
        </Grid>
        <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <label htmlFor={'coverUploadWidget'}>Cover </label>
          <Typography variant="caption" color={"rgba(200, 150, 100, 0.8)"}> (max size 150 kb, ratio 3:4)</Typography>
          <div id={'coverUploadWidget'}>
            <UploadWidget
              imagesOnly
              previewStep
              clearable
              crop='3:4'
              tabs='file'
              publicKey={uwpk}
              validators={uploadValidators}
              onChange={(fileInfo: FileInfo) => handleLogoChanged(fileInfo)}
            />
          </div>
          <Typography variant="caption" color="#f44336">  {addGameValidation.logo}</Typography>
        </Grid>
        <Grid item sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <label htmlFor={'screenshotsUploadWidget'}>Screenshots </label>
          <Typography variant="caption" color={"rgba(200, 150, 100, 0.8)"}> (max size 150 kb, ratio 9:5, max 7 images)</Typography>
          <div id={'screenshotsUploadWidget'}>
            <UploadWidget
              imagesOnly
              multiple
              previewStep
              clearable
              crop='9:5'
              multipleMax={7}
              tabs='file'
              publicKey={uwpk}
              validators={uploadValidators}
              onFileSelect={(fileInfo: FileUpload | FilesUpload | null) => handleScreenshotsChanged(fileInfo)}
            />
          </div>
          <Typography variant="caption" color="#f44336">  {addGameValidation.screenshots}</Typography>
        </Grid>
      </>
    </Modal>
  </>
  )
}

export default AddGameModal