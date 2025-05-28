import { Area } from 'react-easy-crop'

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    // create a new image element and set its source to the provided URL
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // prevent CORS issues
    image.src = url
  })
}

export const getCroppedImg = async (file: File, cropArea: Area): Promise<File> => {
  const imageUrl = URL.createObjectURL(file)

  try {
    // Validate inputs
    if (!file || !cropArea) {
      throw new Error('Invalid file or crop area')
    }

    if (cropArea.width <= 0 || cropArea.height <= 0) {
      throw new Error('Invalid crop dimensions')
    }

    // Create image from URL
    const image = await createImage(imageUrl)

    // Validate image loaded correctly
    if (!image.complete || !image.naturalWidth || !image.naturalHeight) {
      throw new Error('Image failed to load correctly')
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // calculate scaling based on natural dimensions
    const pixelRatio = window.devicePixelRatio || 1
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // set canvas size to desired output size
    canvas.width = cropArea.width * pixelRatio
    canvas.height = cropArea.height * pixelRatio

    // scale context for retina/high DPI displays
    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    try {
      ctx.drawImage(
        image,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        cropArea.width,
        cropArea.height
      )
    } catch (err) {
      console.error('Canvas drawing error:', err)
      throw new Error('Failed to render the cropped image')
    }

    return new Promise((resolve, reject) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'))
              return
            }

            try {
              const croppedFile = new File([blob], file.name, { type: file.type })

              // Validate the created file
              if (croppedFile.size === 0) {
                reject(new Error('Created file has zero size'))
                return
              }

              resolve(croppedFile)
            } catch (err) {
              reject(new Error('Failed to create file from blob: ' + (err instanceof Error ? err.message : String(err))))
            }
          },
          file.type,
          1
        )
      } catch (err) {
        reject(new Error('Canvas to blob conversion failed: ' + (err instanceof Error ? err.message : String(err))))
      }
    })
  } catch (err) {
    console.error('Crop error:', err)
    throw err
  } finally {
    // clean up the object URL
    URL.revokeObjectURL(imageUrl)
  }
}
