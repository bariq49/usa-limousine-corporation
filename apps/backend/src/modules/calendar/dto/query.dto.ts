import { IsEnum, IsOptional } from "class-validator";
import { CalendarEventStatus, CalendarEventType, CalendarOwnerType } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature";

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(CalendarOwnerType)
  ownerType?: CalendarOwnerType;

  @IsOptional()
  @IsEnum(CalendarEventType)
  type?: CalendarEventType;

  @IsOptional()
  @IsEnum(CalendarEventStatus)
  status?: CalendarEventStatus;
}
