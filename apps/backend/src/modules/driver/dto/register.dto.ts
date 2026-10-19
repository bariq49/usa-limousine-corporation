import { DriverShift } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { DRIVER_LANGUAGES_MAX, DRIVER_LANGUAGES_MIN } from "../constants/languages.constants";
import { LanguageItemDto } from "./language.dto";

export { LanguageItemDto } from "./language.dto";

export class CreateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  lastName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  phone!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;
}

export class VerifyEmailDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Transform(({ value }) => (value == null ? value : String(value).trim()))
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  token!: string;
}

export class ResendOtpDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsIn(["email", "sms"])
  channel?: "email" | "sms";
}

export class StatusDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;
}

export class DetailsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  houseNo!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  streetName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  postalCode!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  province!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  country!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(8)
  countryCode!: string;

  @IsEnum(DriverShift)
  shift!: DriverShift;

  @ValidateIf((body: DetailsDto) => body.shift !== DriverShift.FLEXIBLE)
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "startTime must be HH:mm" })
  startTime?: string;

  @ValidateIf((body: DetailsDto) => body.shift !== DriverShift.FLEXIBLE)
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "endTime must be HH:mm" })
  endTime?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  operatingCountry!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  operatingCity!: string;

  @IsArray()
  @ArrayMinSize(DRIVER_LANGUAGES_MIN)
  @ArrayMaxSize(DRIVER_LANGUAGES_MAX)
  @ValidateNested({ each: true })
  @Type(() => LanguageItemDto)
  languages!: LanguageItemDto[];

  @IsBoolean()
  dressesInSuit!: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];
}
