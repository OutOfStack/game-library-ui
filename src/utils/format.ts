export const ToCurrency = (number: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  })

  return formatter.format(number)
}

export const To1Precision = (number: number): string => {
  return number.toFixed(1).toString()
}

export const ToHostname = (url: string): string => {
  url = url.replace("www.", "")
  try {
    const u = new URL(url)
    return u.hostname
  } catch (error) {
    console.log(error)
    return ""
  }
}