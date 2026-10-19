import { DriverLanguageFluency } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsIn, IsString } from "class-validator";
import { DRIVER_LANGUAGE_CODES } from "../constants/languages.constants";

export class LanguageItemDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsString()
  @IsIn(DRIVER_LANGUAGE_CODES)
  code!: string;

  @IsEnum(DriverLanguageFluency)
  fluency!: DriverLanguageFluency;
}
