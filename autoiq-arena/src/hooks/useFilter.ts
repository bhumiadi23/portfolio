import { useState, useCallback } from 'react'
import type { FilterState, Segment, FuelType, Transmission } from '../types/car.types'

const DEFAULT_FILTERS: FilterState = {
  segment: [],
  fuelType: [],
  transmission: [],
  priceMin: 0,
  priceMax: 100,
  seating: [],
  brands: [],
  search: '',
  sortBy: 'rating',
}

export function useFilter() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const toggleSegment = useCallback((seg: Segment) => {
    setFilters(f => ({
      ...f,
      segment: f.segment.includes(seg) ? f.segment.filter(s => s !== seg) : [...f.segment, seg],
    }))
  }, [])

  const toggleFuel = useCallback((fuel: FuelType) => {
    setFilters(f => ({
      ...f,
      fuelType: f.fuelType.includes(fuel) ? f.fuelType.filter(x => x !== fuel) : [...f.fuelType, fuel],
    }))
  }, [])

  const toggleTransmission = useCallback((t: Transmission) => {
    setFilters(f => ({
      ...f,
      transmission: f.transmission.includes(t) ? f.transmission.filter(x => x !== t) : [...f.transmission, t],
    }))
  }, [])

  const setPriceRange = useCallback((min: number, max: number) => {
    setFilters(f => ({ ...f, priceMin: min, priceMax: max }))
  }, [])

  const toggleBrand = useCallback((brand: string) => {
    setFilters(f => ({
      ...f,
      brands: f.brands.includes(brand) ? f.brands.filter(b => b !== brand) : [...f.brands, brand],
    }))
  }, [])

  const setSearch = useCallback((search: string) => {
    setFilters(f => ({ ...f, search }))
  }, [])

  const toggleSeating = useCallback((seats: number) => {
    setFilters(f => ({
      ...f,
      seating: f.seating.includes(seats) ? f.seating.filter(s => s !== seats) : [...f.seating, seats],
    }))
  }, [])

  const setSortBy = useCallback((sortBy: FilterState['sortBy']) => {
    setFilters(f => ({ ...f, sortBy }))
  }, [])

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const activeFilterCount =
    filters.segment.length +
    filters.fuelType.length +
    filters.transmission.length +
    filters.brands.length +
    (filters.priceMin > 0 || filters.priceMax < 100 ? 1 : 0)

  return { filters, setFilters, toggleSegment, toggleFuel, toggleTransmission, toggleSeating, setPriceRange, toggleBrand, setSearch, setSortBy, resetFilters, activeFilterCount }
}
