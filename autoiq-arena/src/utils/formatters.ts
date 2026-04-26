/** Format price in lakhs to display string */
export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(2)} Cr`
  return `₹${lakhs.toFixed(2)} L`
}

/** Format mileage string for display */
export function formatMileage(mileage: string): string {
  if (mileage.includes('km range')) return mileage  // EV
  return mileage
}

/** Format a number with Indian comma notation */
export function formatIndianNumber(n: number): string {
  return n.toLocaleString('en-IN')
}

/** Format engine displacement */
export function formatCC(cc: number): string {
  if (cc === 0) return 'Electric'
  return `${(cc / 1000).toFixed(1)}L (${cc}cc)`
}

/** Format dimensions mm to readable */
export function formatMM(mm: number): string {
  return `${mm} mm`
}

/** Format a star rating as ★ symbols */
export function formatStars(rating: number, max = 5): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(max - Math.round(rating))
}

/** Calculate EMI */
export function calculateEMI(principal: number, annualRatePct: number, tenureMonths: number): number {
  const r = annualRatePct / 12 / 100
  if (r === 0) return principal / tenureMonths
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1)
}

/** Calculate total fuel cost per year */
export function annualFuelCost(kmPerDay: number, mileage: number, fuelPricePerLitre: number): number {
  const litresPerYear = (kmPerDay * 365) / mileage
  return litresPerYear * fuelPricePerLitre
}

/** Estimate 3-year depreciation */
export function estimatedDepreciation(priceInLakhs: number, years = 3): { value: number; percent: number } {
  const depRate = 0.15 // ~15% per year (simple)
  const remaining = priceInLakhs * Math.pow(1 - depRate, years)
  return {
    value: parseFloat(remaining.toFixed(2)),
    percent: parseFloat((((priceInLakhs - remaining) / priceInLakhs) * 100).toFixed(1)),
  }
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
