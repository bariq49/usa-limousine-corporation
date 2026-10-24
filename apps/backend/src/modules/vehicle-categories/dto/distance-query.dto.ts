import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, Min } from "class-validator";

export class DistanceQueryDto {
  /** Trip distance in miles. */
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distance!: number;

  /** Adds the airport pickup fee to each leg. */
  @IsOptional()
  @Transform(({ obj, value }) => {
    const raw = obj?.isAirport ?? value;
    return raw === true || raw === "true";
  })
  @IsBoolean()
  isAirport?: boolean;
}
