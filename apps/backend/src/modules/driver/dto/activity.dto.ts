import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from "class-validator";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class QueryDto extends ApiFeatureQueryDto {
  /** Calendar year filter, e.g. `2026`. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  /** Calendar month 1–12 (requires `year`, or uses current year). */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  /** Single calendar day `YYYY-MM-DD`. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  day?: string;

  /** Chart bucket size. Auto-inferred from the window when omitted. */
  @IsOptional()
  @IsIn(["day", "month", "year"])
  groupBy?: "day" | "month" | "year";
}
