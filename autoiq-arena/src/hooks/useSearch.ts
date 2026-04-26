import { useState, useCallback, useMemo } from 'react'
import { cars } from '../data/cars'
import type { Car } from '../types/car.types'

export function useSearch() {
  const [query, setQuery] = useState('')

  const results = useMemo<Car[]>(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return cars.filter(car => {
      const haystack = `${car.brand} ${car.model} ${car.variant} ${car.segment} ${car.fuelType} ${car.tags.join(' ')}`.toLowerCase()
      return haystack.includes(q)
    }).slice(0, 8)
  }, [query])

  const clearSearch = useCallback(() => setQuery(''), [])

  return { query, setQuery, results, clearSearch, hasResults: results.length > 0 }
}
