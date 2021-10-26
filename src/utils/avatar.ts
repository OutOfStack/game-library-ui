// src: https://mui.com/components/avatars/#main-content

const stringToColor = (string: string) => {
  let hash = 0
  let i

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.substr(-2)
  }
  /* eslint-enable no-bitwise */
  return color
}

export const stringAvatar = (name: string) => {
  name = name.trim()
  const splitted = name.split(' ')
  const shortName = `${splitted[0] ? splitted[0][0] : ''}${splitted[1] ? splitted[1][0] : ''}`
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: shortName
  }
}

