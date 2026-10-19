import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";
import { DriverShiftEndedReason } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class UpdateDto {
  @Transform(({ value }: { value: unknown }) => {
    if (value === true || value === "true" || value === 1 || value === "1") {
      return true;
    }
    if (value === false || value === "false" || value === 0 || value === "0") {
      return false;
    }
    return value;
  })
  @IsBoolean()
  online!: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  deviceId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(4096)
  fcmToken?: string;

  @ValidateIf((o: UpdateDto) => o.online === true)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ValidateIf((o: UpdateDto) => o.online === true)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;
}

export class BeatDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  deviceId!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class HistoryQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(DriverShiftEndedReason)
  endedReason?: DriverShiftEndedReason;
}
