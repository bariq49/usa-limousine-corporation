import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  HelpTicketCategory,
  HelpTicketOwnerType,
  HelpTicketPriority,
  HelpTicketStatus,
} from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids!: string[];
}

export class CreateDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(2048)
  attachment?: string;

  @IsOptional()
  @IsEnum(HelpTicketCategory)
  category?: HelpTicketCategory;

  @IsOptional()
  @IsEnum(HelpTicketPriority)
  priority?: HelpTicketPriority;
}

export class ReplyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body!: string;
}

export class StatusDto {
  @IsEnum(HelpTicketStatus)
  status!: HelpTicketStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class PriorityDto {
  @IsEnum(HelpTicketPriority)
  priority!: HelpTicketPriority;
}

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(HelpTicketStatus)
  status?: HelpTicketStatus;

  @IsOptional()
  @IsEnum(HelpTicketCategory)
  category?: HelpTicketCategory;

  @IsOptional()
  @IsEnum(HelpTicketPriority)
  priority?: HelpTicketPriority;

  @IsOptional()
  @IsEnum(HelpTicketOwnerType)
  ownerType?: HelpTicketOwnerType;

  @IsOptional()
  @IsString()
  ownerId?: string;
}
