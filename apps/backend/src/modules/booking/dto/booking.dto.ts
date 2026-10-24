import { Transform, Type } from "class-transformer";
import {
  Matches,
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { BookingStatus, BookingType } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}

export class AddressDto {
  @ValidateNested()
  @Type(() => LocationDto)
  pickup!: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  dropoff?: LocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  @ArrayMaxSize(10)
  stops?: LocationDto[];

  /** Trip distance in miles. */
  @IsNumber()
  @Min(0)
  distance!: number;

  @IsNumber()
  @Min(0)
  duration!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  travelDuration?: number;
}

export class PassengerDto {
  @IsInt()
  @Min(1)
  @Max(50)
  passengerCount!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phone!: string;

  @IsEmail()
  @MaxLength(320)
  email!: string;

  /** Extra address that receives a copy of booking emails. */
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  ccEmail?: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class TimeDto {
  @Matches(DATE_PATTERN, { message: "pickupDate must be YYYY-MM-DD" })
  pickupDate!: string;

  @Matches(TIME_PATTERN, { message: "pickupTime must be HH:mm" })
  pickupTime!: string;

  @IsOptional()
  @Matches(DATE_PATTERN, { message: "returnDate must be YYYY-MM-DD" })
  returnDate?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: "returnTime must be HH:mm" })
  returnTime?: string;
}

/** Client totals; customer bookings are re-priced on the server and only keep the breakdown it builds. */
export class PricingDto {
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total!: number;
}

export class FlightDetailsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  flightName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  flightNumber?: string;
}

export class MeetAndGreetDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  /** Meet & greet on the return leg as well. */
  @IsOptional()
  @IsBoolean()
  returnEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  signName?: string;
}

export class ExtraServiceItemDto {
  @IsString()
  @IsNotEmpty()
  extraServiceId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;
}

export class LuggageItemDto {
  @IsString()
  @IsNotEmpty()
  luggageTypeId!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  quantity!: number;
}

export class CreateDto {
  @IsString()
  @IsNotEmpty()
  vehicleCategoryId!: string;

  @IsOptional()
  @IsEnum(BookingType)
  bookingType?: BookingType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  vehicleCount?: number;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @ValidateNested()
  @Type(() => PassengerDto)
  passenger!: PassengerDto;

  @ValidateNested()
  @Type(() => TimeDto)
  bookingTime!: TimeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlightDetailsDto)
  flightDetails?: FlightDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MeetAndGreetDto)
  meetAndGreet?: MeetAndGreetDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraServiceItemDto)
  @ArrayMaxSize(10)
  extraServices?: ExtraServiceItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ValidateNested()
  @Type(() => PricingDto)
  pricing!: PricingDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LuggageItemDto)
  @ArrayMaxSize(20)
  luggage?: LuggageItemDto[];
}

export class UpdateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  vehicleCategoryId?: string;

  @IsOptional()
  @IsEnum(BookingType)
  bookingType?: BookingType;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PassengerDto)
  passenger?: PassengerDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimeDto)
  bookingTime?: TimeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FlightDetailsDto)
  flightDetails?: FlightDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MeetAndGreetDto)
  meetAndGreet?: MeetAndGreetDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraServiceItemDto)
  @ArrayMaxSize(10)
  extraServices?: ExtraServiceItemDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PricingDto)
  pricing?: PricingDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LuggageItemDto)
  @ArrayMaxSize(20)
  luggage?: LuggageItemDto[];
}

export class CancelDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cancellationReason?: string;
}

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsEnum(BookingType)
  bookingType?: BookingType;

  /** Admin only: one customer's bookings (by user id). Ignored on the customer endpoint. */
  @IsOptional()
  @IsString()
  userId?: string;
}

export class AnalyticsQueryDto {
  /** Calendar year to report on; defaults to the current year. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  /** Admin only: stats for one customer (by user id). Ignored on the customer endpoint. */
  @IsOptional()
  @IsString()
  userId?: string;
}

/** Accepts `a,b`, `?x=a&x=b` or a single value and returns an array. */
function toList({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null || value === "") return undefined;
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export class CalendarQueryDto {
  /** First day shown (YYYY-MM-DD), inclusive. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "start must be YYYY-MM-DD" })
  start!: string;

  /** Last day shown (YYYY-MM-DD), inclusive. */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "end must be YYYY-MM-DD" })
  end!: string;

  @IsOptional()
  @Transform(toList)
  @IsArray()
  @IsEnum(BookingType, { each: true })
  bookingType?: BookingType[];

  /** Defaults to pending, confirmed and completed bookings. */
  @IsOptional()
  @Transform(toList)
  @IsArray()
  @IsEnum(BookingStatus, { each: true })
  status?: BookingStatus[];
}
