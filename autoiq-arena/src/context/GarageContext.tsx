/**
 * GarageContext — localStorage-backed personal garage.
 *
 * Stores saved cars + per-car mileage log, service reminders, and notes.
 * Automatically persists to localStorage on every mutation.
 */
import {
  createContext, useContext, useState, useCallback,
  useEffect, type ReactNode,
} from 'react'
import type { Car } from '../types/car.types'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MileageEntry {
  id: string          // unique entry id
  date: string        // ISO date
  km: number          // odometer reading or trip km
  note?: string
}

export interface ServiceReminder {
  id: string
  title: string       // e.g. "Oil Change", "Brake Pad", "Tyre Rotation"
  dueDate: string     // ISO date
  dueMileage?: number // optional: km at which due
  done: boolean
  category: 'oil' | 'tyre' | 'brake' | 'battery' | 'general' | 'insurance' | 'puc'
}

export interface GarageCar {
  carId: string
  brand: string
  model: string
  variant: string
  year: number
  segment: string
  fuelType: string
  price: number
  priceRange: string
  mileage: string
  image: string
  rating: number
  addedAt: string     // ISO date
  notes: string
  mileageLog: MileageEntry[]
  serviceReminders: ServiceReminder[]
}

interface GarageCtx {
  cars: GarageCar[]
  addToGarage: (car: Car) => void
  removeFromGarage: (carId: string) => void
  isInGarage: (carId: string) => boolean
  updateNotes: (carId: string, notes: string) => void
  addMileageEntry: (carId: string, entry: Omit<MileageEntry, 'id'>) => void
  removeMileageEntry: (carId: string, entryId: string) => void
  addServiceReminder: (carId: string, reminder: Omit<ServiceReminder, 'id'>) => void
  removeServiceReminder: (carId: string, reminderId: string) => void
  toggleServiceDone: (carId: string, reminderId: string) => void
  count: number
}

const STORAGE_KEY = 'autoiq-garage'

function loadGarage(): GarageCar[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGarage(cars: GarageCar[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars))
}

const GarageContext = createContext<GarageCtx | null>(null)

export function GarageProvider({ children }: { children: ReactNode }) {
  const [cars, setCars] = useState<GarageCar[]>(loadGarage)

  // Persist on every change
  useEffect(() => { saveGarage(cars) }, [cars])

  const addToGarage = useCallback((car: Car) => {
    setCars(prev => {
      if (prev.find(c => c.carId === car.id)) return prev
      const gc: GarageCar = {
        carId: car.id,
        brand: car.brand,
        model: car.model,
        variant: car.variant,
        year: car.year,
        segment: car.segment,
        fuelType: car.fuelType,
        price: car.price,
        priceRange: car.priceRange,
        mileage: car.mileage,
        image: car.images[0] || '',
        rating: car.rating,
        addedAt: new Date().toISOString(),
        notes: '',
        mileageLog: [],
        serviceReminders: [],
      }
      return [...prev, gc]
    })
  }, [])

  const removeFromGarage = useCallback((carId: string) => {
    setCars(prev => prev.filter(c => c.carId !== carId))
  }, [])

  const isInGarage = useCallback((carId: string) =>
    cars.some(c => c.carId === carId), [cars])

  const updateNotes = useCallback((carId: string, notes: string) => {
    setCars(prev => prev.map(c =>
      c.carId === carId ? { ...c, notes } : c
    ))
  }, [])

  const addMileageEntry = useCallback((carId: string, entry: Omit<MileageEntry, 'id'>) => {
    setCars(prev => prev.map(c =>
      c.carId === carId ? {
        ...c,
        mileageLog: [...c.mileageLog, { ...entry, id: `ml-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]
      } : c
    ))
  }, [])

  const removeMileageEntry = useCallback((carId: string, entryId: string) => {
    setCars(prev => prev.map(c =>
      c.carId === carId ? {
        ...c,
        mileageLog: c.mileageLog.filter(e => e.id !== entryId)
      } : c
    ))
  }, [])

  const addServiceReminder = useCallback((carId: string, reminder: Omit<ServiceReminder, 'id'>) => {
    setCars(prev => prev.map(c =>
      c.carId === carId ? {
        ...c,
        serviceReminders: [...c.serviceReminders, { ...reminder, id: `sr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }]
      } : c
    ))
  }, [])

  const removeServiceReminder = useCallback((carId: string, reminderId: string) => {
    setCars(prev => prev.map(c =>
      c.carId === carId ? {
        ...c,
        serviceReminders: c.serviceReminders.filter(r => r.id !== reminderId)
      } : c
    ))
  }, [])

  const toggleServiceDone = useCallback((carId: string, reminderId: string) => {
    setCars(prev => prev.map(c =>
      c.carId === carId ? {
        ...c,
        serviceReminders: c.serviceReminders.map(r =>
          r.id === reminderId ? { ...r, done: !r.done } : r
        )
      } : c
    ))
  }, [])

  return (
    <GarageContext.Provider value={{
      cars,
      addToGarage,
      removeFromGarage,
      isInGarage,
      updateNotes,
      addMileageEntry,
      removeMileageEntry,
      addServiceReminder,
      removeServiceReminder,
      toggleServiceDone,
      count: cars.length,
    }}>
      {children}
    </GarageContext.Provider>
  )
}

/** Hook — throws if used outside <GarageProvider> */
export function useGarageContext() {
  const ctx = useContext(GarageContext)
  if (!ctx) throw new Error('useGarageContext must be inside <GarageProvider>')
  return ctx
}
