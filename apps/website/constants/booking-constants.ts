import type { TripType } from '@/types/booking.types'

export const TRIP_TYPES = {
  ONE_WAY: 'one-way',
  RETURN: 'return',
  HOURLY: 'hourly',
} as const satisfies Record<string, TripType>

/** Hourly hire packages offered in the booking form, in hours. */
export const HOURLY_DURATIONS = [2, 3, 4, 5, 6, 8, 10, 12]
