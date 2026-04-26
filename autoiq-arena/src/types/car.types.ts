export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG'
export type Transmission = 'Manual' | 'Automatic' | 'CVT' | 'AMT' | 'DCT'
export type Segment = 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury SUV' | 'Coupe' | 'MUV'

export interface Engine {
  cc: number
  power: string   // e.g. "120 bhp"
  torque: string  // e.g. "200 Nm"
  cylinders: number
  type: string    // e.g. "1.2L Naturally Aspirated"
}

export interface Dimensions {
  length: number  // mm
  width: number   // mm
  height: number  // mm
  wheelbase: number // mm
  bootSpace: number // litres
  groundClearance: number // mm
}

export interface Safety {
  globalNcap: number // stars (0-5)
  airbagsCount: number
  abs: boolean
  esp: boolean
  hillAssist: boolean
}

export interface Car {
  id: string
  brand: string
  model: string
  variant: string
  year: number
  segment: Segment
  fuelType: FuelType
  transmission: Transmission
  price: number         // ex-showroom in lakhs
  priceRange: string    // e.g. "₹6-9L"
  engine: Engine
  mileage: string       // e.g. "22 kmpl" or "350 km range"
  seating: number
  dimensions: Dimensions
  safety: Safety
  features: string[]
  colors: string[]
  pros: string[]
  cons: string[]
  rating: number        // out of 5
  reviewCount: number
  images: string[]      // URLs / colour slugs
  tags: string[]
  isPopular?: boolean
  isEV?: boolean
  isFeatured?: boolean
}

export interface CompareState {
  cars: Car[]
  maxCars: number
}

export interface FilterState {
  segment: Segment[] 
  fuelType: FuelType[]
  transmission: Transmission[]
  priceMin: number
  priceMax: number
  seating: number[]
  brands: string[]
  search: string
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'mileage' | 'power' | 'newest'
}
