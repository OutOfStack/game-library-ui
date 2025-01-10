import { useState } from 'react'
import { Box, Card, CardMedia, IconButton, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import BlurOnIcon from '@mui/icons-material/BlurOn'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined'
import Slider, { CustomArrowProps } from 'react-slick'

interface ICarousel {
  imgUrls: string[],
  scrDimensions: {
    width: number, 
    height: number
  },
  maxImgHeight: number,
  maxImgWidth: number
}

function NextArrow(props: CustomArrowProps) {
  const { onClick } = props

  const theme = useTheme()
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'))

  return (
    <IconButton 
      color="secondary" 
      size="medium"
      className="slick-arrow" 
      onClick={onClick}
      style={{
        position: "absolute",
        top: "50%",
        display: "block",
        transform: "translate(0, -50%)",
        right: matchesXs ? -15 : -25,
        height: 40,
        width: 40
      }}
    >
      <ArrowForwardIosOutlinedIcon fontSize="medium" />
    </IconButton>
  )
}

function PrevArrow(props: CustomArrowProps) {
  const { onClick } = props

  const theme = useTheme()
  const matchesXs = useMediaQuery(theme.breakpoints.down('xs'))

  return (
    <IconButton 
      color="secondary" 
      size="medium"
      className="slick-arrow" 
      onClick={onClick}
      style={{
        position: "absolute",
        top: "50%",
        display: "block",
        transform: "translate(0, -50%)",
        left:  matchesXs ? -15 : -25,
        height: 40,
        width: 40,
        zIndex: 1
      }}
    >
      <ArrowBackIosOutlinedIcon fontSize="medium" />
    </IconButton>
  )
}

const Carousel = (props: ICarousel) => {
  const { imgUrls, scrDimensions, maxImgHeight, maxImgWidth } = props

  const [currentSlide, setCurrentSlide] = useState(0)

  const settings = {
    customPaging: function(index: number) {
      return (
        <BlurOnIcon fontSize="small" color={currentSlide === index ? "primary" : "secondary"} />
      )
    },
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    dots: true,
    infinite: true, 
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    swipe: true, 
    arrows: true,
    autoplay: false,
    adaptiveHeight: true,
    fade: true,
  }

  return (
    <Box
      sx={{
        maxWidth: scrDimensions.width,
        margin: 'auto',
      }}
    >
      <Slider {...settings}
        beforeChange={(oldIndex, newIndex) => setCurrentSlide(newIndex)}>
        {imgUrls.map((s, i) => (
          <Card key={i} variant="outlined">
            <CardMedia
              sx={{
                textAlign: "center",
                height: scrDimensions.height,
                width: scrDimensions.width,
                maxHeight: maxImgHeight,
                maxWidth: maxImgWidth,
              }}
              component="img"
              image={s}
            />
          </Card>
        ))}
      </Slider>
    </Box>
  )
}

export default Carousel
