/**
 * CompareContext — global shared state for the compare list.
 * Wrap the app once; any component can useCompareContext() to
 * add / remove / read cars without prop-drilling.
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Car } from '../types/car.types'

const MAX = 4

interface CompareCtx {
  compareList:       Car[]
  addToCompare:      (car: Car)    => void
  removeFromCompare: (carId: string) => void
  clearCompare:      ()            => void
  isInCompare:       (carId: string) => boolean
  canAddMore:        boolean
  count:             number
}

const CompareContext = createContext<CompareCtx | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Car[]>([])

  const addToCompare = useCallback((car: Car) => {
    setCompareList(prev => {
      if (prev.find(c => c.id === car.id)) return prev
      if (prev.length >= MAX) return prev
      return [...prev, car]
    })
  }, [])

  const removeFromCompare = useCallback((carId: string) => {
    setCompareList(prev => prev.filter(c => c.id !== carId))
  }, [])

  const clearCompare = useCallback(() => setCompareList([]), [])

  const isInCompare = useCallback((carId: string) =>
    compareList.some(c => c.id === carId), [compareList])

  return (
    <CompareContext.Provider value={{
      compareList,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      canAddMore: compareList.length < MAX,
      count: compareList.length,
    }}>
      {children}
    </CompareContext.Provider>
  )
}

/** Hook — throws if used outside <CompareProvider> */
export function useCompareContext() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompareContext must be used inside <CompareProvider>')
  return ctx
}
