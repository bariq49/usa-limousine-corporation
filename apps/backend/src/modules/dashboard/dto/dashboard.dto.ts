import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, Max, Min, ValidateIf } from "class-validator";
import {
  ANALYTICS_RANGES,
  type AnalyticsRange,
} from "../../../common/utils/analytics-range";
import { STATS_PERIODS, type StatsPeriod } from "../../../common/utils/period-buckets";

export class OverviewQueryDto {
  @IsOptional()
  @IsIn(STATS_PERIODS)
  period: StatsPeriod = "monthly";
}

export class AnalyticsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year?: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== "")
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number | null;

  @IsOptional()
  @IsIn(ANALYTICS_RANGES)
  range?: AnalyticsRange;
}
