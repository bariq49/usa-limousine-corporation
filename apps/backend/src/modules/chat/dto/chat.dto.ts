import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import {
  CHAT_HISTORY_DEFAULT_LIMIT,
  CHAT_HISTORY_MAX_LIMIT,
  CHAT_MESSAGE_MAX_LENGTH,
} from "../constants/chat.constants";

export class SendDto {
  @IsString()
  @MinLength(1)
  @MaxLength(CHAT_MESSAGE_MAX_LENGTH)
  body!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  clientMessageId?: string;

  @IsOptional()
  @IsString()
  replyToMessageId?: string;
}

export class QueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CHAT_HISTORY_MAX_LIMIT)
  limit?: number = CHAT_HISTORY_DEFAULT_LIMIT;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  before?: string;

  /** Reconnect/sync: messages strictly after this message id (ascending). */
  @IsOptional()
  @IsString()
  after?: string;
}
