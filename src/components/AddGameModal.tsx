import React, { useEffect, useState } from 'react'
import {
  Autocomplete, AutocompleteChangeReason, AutocompleteChangeDetails, Grid, TextField, Typography, useMediaQuery, useTheme
} from '@mui/material'
import { MobileDatePicker, DesktopDatePicker } from '@mui/x-date-pickers'
import moment from 'moment'

import Modal from './Modal'
import Notification from './Notification'
import ImageUploader from './ImageUploader'
import { ICreateGame, IGameResponse, IUploadImagesResponse, IUploadedImage, isCoverImage, isScreenshotImage } from '../types/Game'
import { IPlatform } from '../types/Platform'
import { IGenre } from '../types/Genre'
import { IValidationResponse } from '../types/Validation'
import useGames from '../hooks/useGames'
import useGenres from '../hooks/useGenres'
import usePlatforms from '../hooks/usePlatforms'
import { isTouchDevice } from '../utils/devices'
import { IsValidUrl } from '../utils/validators'


const fieldWidthLarge = '520px'
const fieldWidthSmall = '210px'
const dateFormat="YYYY-MM-DD"

interface IAddGameModal {
  handleAddGameDialogClose: () => void,
  addGameDialogOpen: boolean
}

const AddGameModal = (props: IAddGameModal) => {
  const { handleAddGameDialogClose, addGameDialogOpen } = props

  const { create: createGame, uploadGameImages } = useGames()
  const { fetchGenres } = useGenres()
  const { fetchPlatforms } = usePlatforms()
  const theme = useTheme()
  const matchesMd = useMediaQuery(theme.breakpoints.up('md'))

  const [genres, setGenres] = useState<IGenre[]>([])
  const [platforms, setPlatforms] = useState<IPlatform[]>([])
  const [cover, setCover] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<File[]>([])

  const [isUploading, setIsUploading] = useState<boolean>(false)
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

    if (!cover) {
      setAddGameValidation(v => ({ ...v, logo: 'Cover is required' }))
      valid = false
    }

    if (screenshots.length === 0) {
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

    // validate
    if (!validateAddGameForm()) {
      return
    }

    // upload image
    const images = await uploadImages(cover!, screenshots)
    if (images.length === 0) {
      // Error is already set in uploadImages
      return
    }

    const logoUrl = images.filter(i => isCoverImage(i))[0]?.fileUrl
    const screenshotsUrls = images.filter(i => isScreenshotImage(i)).map(i => i.fileUrl)

    // create game
    const newGame: ICreateGame = {
      ...addGame,
      releaseDate: moment(addGame.releaseDate).format(dateFormat),
      logoUrl,
      screenshots: screenshotsUrls,
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
      setAddGameErrorText("An error occurred. Try again later")
    }
  }

  const uploadImages = async (cover: File, screenshots: File[]): Promise<IUploadedImage[]> => {
    if (!cover || screenshots.length === 0) {
      setAddGameErrorText("Cover and at least one screenshot are required")
      return []
    }

    try {
      setIsUploading(true)
      setAddGameErrorText("")

      const [resp, err] = await uploadGameImages(cover, screenshots)
      if (err) {
        if (typeof err === 'string') {
          setAddGameErrorText(err)
          return []
        }
        const error = err as IValidationResponse
        setAddGameErrorText(error.fields?.map(f => `${f.field}: ${f.error}`).join("; ") || error.error)
        return []
      }

      const images = resp as IUploadImagesResponse

      if (images!.files!.length === 0) {
        setAddGameErrorText("An error occured on image upload. Try again later")
        return []
      }

      return images.files
    } catch (error) {
      console.error("Image upload error:", error)
      setAddGameErrorText(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      return []
    } finally {
      setIsUploading(false)
    }
  }

  //#endregion

  //#region upload images

  const handleCoverUpdate = (file: File | null) => {
    setCover(file)
    // remove error if there is a value now
    if (addGameValidation.logo?.length > 0 && file) {
      setAddGameValidation(v => ({ ...v, logo: '' }))
    }
  }

  const handleScreenshotsUpdate = (files: File[]) => {
    setScreenshots(files)
    // remove error if there is a value now
    if (addGameValidation.screenshots?.length > 0 && files.length) {
      setAddGameValidation(v => ({ ...v, screenshots: '' }))
    }
  }

  //#endregion

  return (
  <>
    <Notification 
      message={alert} 
      resetMessage={() => setAlert(null)}
    />
    <Modal
      fullScreen
      matchesMd={matchesMd}
      isOpen={addGameDialogOpen}
      closeDialog={handleAddGameDialogClose}
      title='Add new game'
      dialogText={addGameDialogText}
      dialogErrorText={addGameErrorText}
      submitActionName={isUploading ? 'Uploading...' : 'Add game'}
      submitDisabled={isUploading}
      handleSubmit={handleAddGame}
    >
      <>
        <Grid sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <TextField
            required
            error={!!addGameValidation.name}
            helperText={addGameValidation.name}
            fullWidth
            label="Title"
            margin="normal"
            value={addGame?.name || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameFieldChange(e, 'name')}
          />
        </Grid>
        <Grid sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
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
        <Grid sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
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
        <Grid sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
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
        <Grid sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <TextField
            error={!!addGameValidation.websites}
            helperText={addGameValidation.websites}
            fullWidth
            margin="normal"
            label="Websites"
            placeholder="https://mygame.com,https://twitch.com/mygame"
            value={addGame?.websites?.join(",") || ""}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => handleAddGameWebsitesChange(e)}
          />
        </Grid>
        <Grid sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
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
        <Grid sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall, pb: 2 }}>
          <Typography variant="subtitle1">Cover</Typography>
          <Typography variant="subtitle2" color="secondary"> (max size 500 KB, ratio 3:4)</Typography>
          <ImageUploader
            fileSizeLimitKb={500}
            cropAspect={3 / 4}
            onSelectComplete={(files: File[]) => handleCoverUpdate(files[0]!)}
          />
          <Typography variant="caption" color="#f44336">
            {addGameValidation.logo}
          </Typography>
        </Grid>
        <Grid sx={{ minWidth: matchesMd ? fieldWidthLarge : fieldWidthSmall }}>
          <Typography variant="subtitle1">Screenshots</Typography>
          <Typography variant="subtitle2" color="secondary"> (max size 500 KB, max 8 files, ratio 9:5)</Typography>
          <ImageUploader
            maxFiles={8}
            fileSizeLimitKb={500}
            cropAspect={9 / 5}
            onSelectComplete={handleScreenshotsUpdate}
          />
          <Typography variant="caption" color="#f44336">
            {addGameValidation.screenshots}
          </Typography>
        </Grid>
      </>
    </Modal>
  </>
  )
}

export default AddGameModal