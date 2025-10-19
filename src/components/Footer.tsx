import { Box, Typography, Link } from "@mui/material"

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, textAlign: "center" }}>
      <Typography variant="body2" color="secondary">
        <Link
          href="/privacy-policy.html"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mx: 1 }}
        >
          Privacy Policy
        </Link>
        {" | "}
        <Link
          href="/terms-of-service.html"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mx: 1 }}
        >
          Terms of Service
        </Link>
      </Typography>
    </Box>
  )
}

export default Footer
