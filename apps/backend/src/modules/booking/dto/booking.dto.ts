import { Type } from "class-transformer";
import {
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

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  flightNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  trainNumber?: string;
}

export class TimeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  pickupDate!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  pickupTime!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  returnDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5)
  returnTime?: string;
}

export class PricingDto {
  @IsNumber()
  @Min(0)
  basePrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stopsPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  airportPickupPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  extraServicesPrice?: number;

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

  @IsOptional()
  @IsString()
  @MaxLength(500)
  instructions?: string;

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
  @IsEnum(BookingStatus)
  status?: BookingStatus;

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
