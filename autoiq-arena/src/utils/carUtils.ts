import { formatPrice, formatMileage } from './formatters'
import type { Car, FilterState } from '../types/car.types'

/** Filter a car array by the provided FilterState */
export function filterCars(cars: Car[], filters: FilterState): Car[] {
  return cars.filter(car => {
    if (filters.segment.length > 0 && !filters.segment.includes(car.segment)) return false
    if (filters.fuelType.length > 0 && !filters.fuelType.includes(car.fuelType)) return false
    if (filters.transmission.length > 0 && !filters.transmission.includes(car.transmission)) return false
    if (car.price < filters.priceMin || car.price > filters.priceMax) return false
    if (filters.seating.length > 0 && !filters.seating.includes(car.seating)) return false
    if (filters.brands.length > 0 && !filters.brands.includes(car.brand)) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const hit = `${car.brand} ${car.model} ${car.variant}`.toLowerCase().includes(q)
      if (!hit) return false
    }
    return true
  })
}

/** Sort a car array by the provided sort key */
export function sortCars(cars: Car[], sortBy: FilterState['sortBy']): Car[] {
  const sorted = [...cars]
  switch (sortBy) {
    case 'price-asc':   return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':  return sorted.sort((a, b) => b.price - a.price)
    case 'rating':      return sorted.sort((a, b) => b.rating - a.rating)
    case 'mileage':     return sorted.sort((a, b) => parseFloat(b.mileage) - parseFloat(a.mileage))
    case 'power':       return sorted.sort((a, b) => parseInt(b.engine.power) - parseInt(a.engine.power))
    case 'newest':      return sorted.sort((a, b) => b.year - a.year || b.reviewCount - a.reviewCount)
    default:            return sorted
  }
}

/** Generate comparison highlights between two cars */
export function compareCarsHighlight(a: Car, b: Car): Record<string, { winner: string; details: string }> {
  const result: Record<string, { winner: string; details: string }> = {}

  // Price
  result.price = {
    winner: a.price < b.price ? a.id : b.id,
    details: `${formatPrice(a.price)} vs ${formatPrice(b.price)}`,
  }

  // Mileage — compare number parts
  const mA = parseFloat(a.mileage), mB = parseFloat(b.mileage)
  result.mileage = { winner: mA >= mB ? a.id : b.id, details: `${formatMileage(a.mileage)} vs ${formatMileage(b.mileage)}` }

  // Power
  const pwA = parseInt(a.engine.power), pwB = parseInt(b.engine.power)
  result.power = { winner: pwA >= pwB ? a.id : b.id, details: `${a.engine.power} vs ${b.engine.power}` }

  // Safety
  result.safety = {
    winner: a.safety.globalNcap >= b.safety.globalNcap ? a.id : b.id,
    details: `${a.safety.globalNcap}★ vs ${b.safety.globalNcap}★`,
  }

  // Boot space
  result.boot = {
    winner: a.dimensions.bootSpace >= b.dimensions.bootSpace ? a.id : b.id,
    details: `${a.dimensions.bootSpace}L vs ${b.dimensions.bootSpace}L`,
  }

  return result
}

/** Return a fuel type badge color class */
export function fuelBadgeColor(fuel: Car['fuelType']): string {
  switch (fuel) {
    case 'Electric': return 'bg-success/15 text-success border-success/30'
    case 'Diesel':   return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
    case 'Hybrid':   return 'bg-teal-500/15 text-teal-400 border-teal-500/30'
    case 'CNG':      return 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    default:         return 'bg-accent/15 text-accent border-accent/30'
  }
}

/** Return segment icon emoji */
export function segmentIcon(segment: Car['segment']): string {
  switch (segment) {
    case 'Hatchback':  return '🚗'
    case 'Sedan':      return '🚘'
    case 'SUV':        return '🚙'
    case 'Luxury SUV': return '🏎️'
    case 'MUV':        return '🚌'
    case 'Coupe':      return '🏎️'
    default:           return '🚗'
  }
}
