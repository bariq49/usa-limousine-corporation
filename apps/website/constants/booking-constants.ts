import type { TripType } from '@/types/booking.types'

export const TRIP_TYPES = {
  ONE_WAY: 'one-way',
  RETURN: 'return',
  HOURLY: 'hourly',
} as const satisfies Record<string, TripType>

export const HOURLY_DURATIONS = [2, 3, 4, 5, 6, 8, 10, 12]

export const PASSENGER_TITLES = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Dr.', label: 'Dr.' },
]

export const MAX_VEHICLES = 10

export const PICKUP_TIME_ERRORS = ["PICKUP_PASSED", "PICKUP_TOO_SOON"];
