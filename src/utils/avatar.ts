const generateColor = (string: string) => {
  let hash = 0
  let i

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }

  const elegantPalette = [
    ['#667eea', '#764ba2'], // Purple gradient
    ['#f093fb', '#f5576c'], // Pink gradient
    ['#4facfe', '#00f2fe'], // Blue gradient
    ['#43e97b', '#38f9d7'], // Green gradient
    ['#fa709a', '#fee140'], // Warm gradient
    ['#a8edea', '#fed6e3'], // Soft gradient
    ['#ff9a9e', '#fecfef'], // Rose gradient
    ['#a18cd1', '#fbc2eb'], // Lavender gradient
    ['#ffecd2', '#fcb69f'], // Peach gradient
    ['#ff8a80', '#ea80fc'], // Coral gradient
    ['#81c784', '#aed581'], // Nature gradient
    ['#90caf9', '#b39ddb'], // Sky gradient
  ]

  const paletteIndex = Math.abs(hash) % elegantPalette.length
  return elegantPalette[paletteIndex]
}

const extractPersonalizedInitials = (name: string): string => {
  name = name.trim()
  
  if (!name) return '?'
  
  // Handle special characters and unicode
  const cleanName = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim()
  
  const words = cleanName.split(/\s+/).filter(word => word.length > 0)
  
  if (words.length === 0) return name.charAt(0).toUpperCase()
  
  if (words.length === 1) {
    const word = words[0]
    // For single word, try to get first char and a meaningful second char
    if (word.length === 1) return word.toUpperCase()
    if (word.length === 2) return word.toUpperCase()
    
    // Look for capital letters in the middle (camelCase, PascalCase)
    const capitalMatch = word.slice(1).match(/[A-Z]/)
    if (capitalMatch) {
      return (word[0] + capitalMatch[0]).toUpperCase()
    }
    
    // Look for numbers
    const numberMatch = word.match(/\d/)
    if (numberMatch) {
      return (word[0] + numberMatch[0]).toUpperCase()
    }
    
    // Fall back to first and last character
    return (word[0] + word[word.length - 1]).toUpperCase()
  }
  
  // Multiple words: prioritize meaningful words (longer than 2 chars)
  const meaningfulWords = words.filter(word => word.length > 2)
  if (meaningfulWords.length >= 2) {
    return (meaningfulWords[0][0] + meaningfulWords[1][0]).toUpperCase()
  }
  
  // Default: first character of first two words
  return (words[0][0] + (words[1] ? words[1][0] : words[0][1] || '')).toUpperCase()
}

export const stringAvatar = (name: string) => {
  const initials = extractPersonalizedInitials(name)
  const [primaryColor, secondaryColor] = generateColor(name)
  
  return {
    sx: {
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      color: '#ffffff',
      fontWeight: 600,
      fontSize: '1.1rem',
      letterSpacing: '0.5px',
      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      border: '2px solid rgba(255,255,255,0.2)',
      backdropFilter: 'blur(10px)',
    },
    children: initials
  }
}

