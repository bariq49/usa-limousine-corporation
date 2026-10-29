import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { HelpTicketCategory } from "@prisma/client";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

export class ContactDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(32)
  phone?: string;

  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  subject!: string;

  @Transform(trim)
  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsEnum(HelpTicketCategory)
  category?: HelpTicketCategory;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
