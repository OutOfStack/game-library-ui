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