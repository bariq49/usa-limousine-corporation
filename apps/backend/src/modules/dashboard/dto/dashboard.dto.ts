import { IsIn, IsOptional } from "class-validator";
import { STATS_PERIODS, type StatsPeriod } from "../../../common/utils/period-buckets";

export class OverviewQueryDto {
  @IsOptional()
  @IsIn(STATS_PERIODS)
  period: StatsPeriod = "monthly";
}
