import { useState, useCallback, useEffect, useMemo } from 'react'
import { Box, Typography, Button, Modal, CircularProgress, Alert } from '@mui/material'
import { useDropzone } from 'react-dropzone'
import Cropper, { Area } from 'react-easy-crop'

import { getCroppedImg } from '../utils/cropImage'


interface ImageUploaderProps {
  maxFiles?: number
  cropAspect?: number
  fileSizeLimitKb: number
  onSelectComplete: (files: File[]) => void
}

const ImageUploader = (props: ImageUploaderProps) => {
  const { maxFiles = 1, cropAspect, fileSizeLimitKb, onSelectComplete } = props

  const basePreviewWidth = 120

  const [ error, setError] = useState<string | null>(null)
  const [ previewUrls, setPreviewUrls ] = useState<string[]>([])
  const [ cropModalOpen, setCropModalOpen ] = useState(false)
  const [ selectedFile, setSelectedFile ] = useState<File | null>(null)
  const [ cropPosition, setCropPosition ] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [ zoom, setZoom ] = useState<number>(1)
  const [ cropData, setCropData ] = useState<Area | null>(null)
  const [ croppedFiles, setCroppedFiles ] = useState<File[]>([])
  const [ isLoading, setIsLoading ] = useState<boolean>(false)

  const selectedFileUrl = useMemo(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      return url
    }
    return ""
  }, [selectedFile])
  
  // clean up the memoized URL when it changes/unmounts
  useEffect(() => {
    return () => {
      if (selectedFileUrl) {
        URL.revokeObjectURL(selectedFileUrl)
      }
    }
  }, [selectedFileUrl])

  useEffect(() => {
    onSelectComplete(croppedFiles)
  }, [croppedFiles, onSelectComplete])

  const validateFile = useCallback((file: File): boolean => {
    if (file.size > fileSizeLimitKb * 1024) {
      setError(`File size exceeds ${fileSizeLimitKb} KB`)
      return false
    }
    if (!file.name.includes('.')) {
      setError('File must have an extension')
      return false
    }
    return true
  }, [fileSizeLimitKb])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)
    const validFiles = acceptedFiles.filter(validateFile)

    if (validFiles.length === 0) {
      return
    }

    setSelectedFile(validFiles[0])
    setCropModalOpen(true)
  }, [validateFile])

  const handleCrop = useCallback(async () => {
    if (!selectedFile || !cropData) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const croppedImg = await getCroppedImg(selectedFile, cropData)

      setPreviewUrls(prev => {
        const updatedUrls = [...prev, URL.createObjectURL(croppedImg)]
        const newUrls = updatedUrls.slice(-maxFiles)
        // revoke URLs that were removed
        const removedUrls = prev.filter(url => !newUrls.includes(url))
        removedUrls.forEach(url => URL.revokeObjectURL(url))
        return newUrls
      })

      setCroppedFiles(prev => {
        const updatedFiles = [...prev, croppedImg]
        return updatedFiles.slice(-maxFiles)
      })

      setCropModalOpen(false)
    } catch (err) {
      console.error('Crop error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to crop image'
      setError(`Image cropping failed: ${errorMessage}. Please try again with a different image.`)
    } finally {
      setIsLoading(false)
    }
  }, [selectedFile, cropData, maxFiles])

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCropData(croppedAreaPixels)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    multiple: false,
    noClick: isLoading,
  })

  const handleClose = useCallback(() => {
    setCropModalOpen(false)
    setCropData(null)
  }, [])

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '1px dashed #ccc',
          padding: 2,
          textAlign: 'center',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
          position: 'relative'
        }}
      >
        <input {...getInputProps()} disabled={isLoading} />
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <CircularProgress size={24} sx={{ mb: 1 }} />
            <Typography>Processing images...</Typography>
          </Box>
        ) : (
          <Typography>Drag & drop files here, or click to select files</Typography>
        )}
      </Box>
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${basePreviewWidth}px, 1fr))`,
        gap: '6px',
        marginTop: '16px',
        maxWidth: '100%',
      }}>
        {previewUrls.map((url, index) => {
          let width, height = basePreviewWidth
          if (cropAspect && cropAspect > 0) {
            height = basePreviewWidth / cropAspect
          }
          return (
            <img
              key={index}
              src={url}
              alt={`Preview ${index}`}
              style={{ width: `${width}px`, height: `${height}px`, objectFit: 'cover', borderRadius: 6, background: '#eee', display: 'block', margin: '0 auto' }}
            />
          )
        })}
      </Box>

      <Modal 
        open={cropModalOpen}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ 
          position: 'relative',
          width: '95%',
          height: '80vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
        }}>
          <Box sx={{ position: 'relative', width: '100%', height: 'calc(100% - 50px)' }}>
            {selectedFile && selectedFileUrl && (
              <Cropper
                image={selectedFileUrl}
                crop={cropPosition}
                zoom={zoom}
                aspect={cropAspect}
                onCropChange={setCropPosition}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
            {isLoading && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1000
              }}>
                <CircularProgress color="primary" />
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            {error && <Alert severity="error" sx={{ flexGrow: 1 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
              <Button variant="outlined" onClick={handleClose} disabled={isLoading}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleCrop}
                disabled={isLoading || !cropData}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Processing...' : 'Crop'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default ImageUploader