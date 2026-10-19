import { IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class QueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9/_-]+$/i, {
    message: "folder may contain letters, numbers, hyphens, underscores, and slashes only",
  })
  folder?: string;
}
