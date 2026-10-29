import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsJSON,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";
import { BlogCommentStatus, BlogStatus } from "@prisma/client";
import { ApiFeatureQueryDto } from "../../../common/api-feature/api-feature-query.dto";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return value;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateTaxonomyDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @IsOptional()
  @Transform(trim)
  @Matches(SLUG_PATTERN, { message: "Slug may only contain lowercase letters, numbers and dashes" })
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  image?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTaxonomyDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @Transform(trim)
  @Matches(SLUG_PATTERN, { message: "Slug may only contain lowercase letters, numbers and dashes" })
  @MaxLength(80)
  slug?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  image?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TaxonomyQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;
}

export class CreateDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @Transform(trim)
  @Matches(SLUG_PATTERN, { message: "Slug may only contain lowercase letters, numbers and dashes" })
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  excerpt?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(200_000)
  content!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImage?: string | null;

  @IsString()
  @MinLength(1)
  categoryId!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Schedule date must be YYYY-MM-DD" })
  scheduledDate?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: "Schedule time must be HH:mm" })
  scheduledTime?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(70)
  seoTitle?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  seoDescription?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  seoKeywords?: string | null;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsUrl({ require_protocol: true }, { message: "Canonical URL must be a valid absolute URL" })
  @MaxLength(2048)
  canonicalUrl?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(70)
  ogTitle?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  ogDescription?: string | null;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsUrl({ require_protocol: true }, { message: "OG image must be a valid absolute URL" })
  @MaxLength(2048)
  ogImage?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  robots?: string | null;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsJSON({ message: "JSON-LD must be valid JSON" })
  @MaxLength(50_000)
  jsonLd?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder?: number;
}

export class UpdateDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @Transform(trim)
  @Matches(SLUG_PATTERN, { message: "Slug may only contain lowercase letters, numbers and dashes" })
  @MaxLength(120)
  slug?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(500)
  excerpt?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200_000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImage?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: "Schedule date must be YYYY-MM-DD" })
  scheduledDate?: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: "Schedule time must be HH:mm" })
  scheduledTime?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(70)
  seoTitle?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  seoDescription?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300)
  seoKeywords?: string | null;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsUrl({ require_protocol: true }, { message: "Canonical URL must be a valid absolute URL" })
  @MaxLength(2048)
  canonicalUrl?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(70)
  ogTitle?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  ogDescription?: string | null;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsUrl({ require_protocol: true }, { message: "OG image must be a valid absolute URL" })
  @MaxLength(2048)
  ogImage?: string | null;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  robots?: string | null;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((_, value) => value !== null && value !== "")
  @IsJSON({ message: "JSON-LD must be valid JSON" })
  @MaxLength(50_000)
  jsonLd?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder?: number;
}

export class QueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isFeatured?: boolean;
}

export class PublicQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  tag?: string;
}

export class FeaturedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 6;
}

export class CreateCommentDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  content!: string;
}

export class CommentQueryDto extends ApiFeatureQueryDto {
  @IsOptional()
  @IsEnum(BlogCommentStatus)
  status?: BlogCommentStatus;

  @IsOptional()
  @IsString()
  blogId?: string;
}

export class UpdateCommentDto {
  @IsEnum(BlogCommentStatus)
  status!: BlogCommentStatus;
}

export class ReplyCommentDto {
  @Transform(trim)
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  content!: string;
}
