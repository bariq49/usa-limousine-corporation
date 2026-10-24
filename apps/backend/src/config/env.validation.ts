import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateIf,
  validateSync,
} from "class-validator";
import { plainToInstance, Transform, type TransformFnParams } from "class-transformer";

export enum NodeEnvironment {
  Development = "development",
  Production = "production",
  Test = "test",
}

function toOptionalBoolean({ value }: TransformFnParams): boolean | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }

  return Boolean(value);
}

function toOptionalInt({ value }: TransformFnParams): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return Number(value);
}

export class EnvironmentVariables {
  @IsEnum(NodeEnvironment)
  NODE_ENV!: NodeEnvironment;

  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  CORS_ORIGIN!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(0)
  TRUST_PROXY!: number;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsOptional()
  @IsString()
  REDIS_KEY_PREFIX?: string;

  /** `all` = API+workers (local default). `api` = enqueue only. `worker` = process jobs only. */
  @IsOptional()
  @IsIn(["all", "api", "worker"])
  QUEUE_MODE?: string;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  QUEUE_BOARD_ENABLED?: boolean;

  @IsOptional()
  @IsString()
  QUEUE_BOARD_PATH?: string;

  @ValidateIf((env: EnvironmentVariables) => env.QUEUE_BOARD_ENABLED === true)
  @IsString()
  @IsNotEmpty()
  QUEUE_BOARD_USERNAME?: string;

  @ValidateIf((env: EnvironmentVariables) => env.QUEUE_BOARD_ENABLED === true)
  @IsString()
  @IsNotEmpty()
  QUEUE_BOARD_PASSWORD?: string;

  @IsOptional()
  @IsString()
  REDIS_SENTINELS?: string;

  @IsOptional()
  @IsString()
  REDIS_SENTINEL_NAME?: string;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  REDIS_TLS_REJECT_UNAUTHORIZED?: boolean;

  @IsOptional()
  @IsString()
  FIREBASE_PROJECT_ID?: string;

  @IsOptional()
  @IsString()
  FIREBASE_CLIENT_EMAIL?: string;

  @IsOptional()
  @IsString()
  FIREBASE_PRIVATE_KEY?: string;

  @IsOptional()
  @IsString()
  TWILIO_ACCOUNT_SID?: string;

  @IsOptional()
  @IsString()
  TWILIO_AUTH_TOKEN?: string;

  /**
   * SMS sender name instead of a phone number. Twilio allows up to 11 letters, digits and
   * spaces with at least one letter. Not delivered to US/Canada (+1) numbers.
   */
  @IsOptional()
  @Matches(/^(?=.*[A-Za-z])[A-Za-z0-9 ]{1,11}$/, {
    message: "TWILIO_SENDER_ID must be 1-11 letters, digits or spaces with at least one letter",
  })
  TWILIO_SENDER_ID?: string;

  @IsString()
  @IsNotEmpty()
  EMAIL_HOST!: string;

  @Transform(toOptionalInt)
  @IsInt()
  @Min(1)
  @Max(65535)
  EMAIL_PORT!: number;

  @IsString()
  @IsNotEmpty()
  EMAIL_USER!: string;

  @IsString()
  @IsNotEmpty()
  EMAIL_PASS!: string;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  EMAIL_SECURE?: boolean;

  @IsString()
  @IsNotEmpty()
  EMAIL_FROM!: string;

  @IsOptional()
  @IsEmail()
  DEFAULT_ADMIN_EMAIL?: string;

  /** Public website; booking emails load the logo and icons from it. */
  @IsOptional()
  @IsUrl({ require_tld: false })
  WEBSITE_URL?: string;

  @IsOptional()
  @IsString()
  SQUARE_ACCESS_TOKEN_TEST?: string;

  @IsOptional()
  @IsString()
  SQUARE_LOCATION_ID_TEST?: string;

  @IsOptional()
  @IsString()
  SQUARE_WEBHOOK_SIGNATURE_KEY_TEST?: string;

  @IsOptional()
  @IsString()
  SQUARE_ACCESS_TOKEN_LIVE?: string;

  @IsOptional()
  @IsString()
  SQUARE_LOCATION_ID_LIVE?: string;

  @IsOptional()
  @IsString()
  SQUARE_WEBHOOK_SIGNATURE_KEY_LIVE?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  SQUARE_WEBHOOK_URL?: string;

  /** Google review link shown in the ride completed email. */
  @IsOptional()
  @IsUrl()
  GOOGLE_REVIEW_URL?: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_CLOUD_NAME!: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  WS_CORS_ORIGIN!: string;

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  @Min(1)
  @Max(65535)
  WS_PORT?: number;

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  @Min(1)
  @Max(50)
  WS_MAX_CONNECTIONS_PER_USER?: number;

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  @Min(1)
  @Max(1_000)
  WS_CONNECT_RATE_LIMIT_PER_MINUTE?: number;

  @IsOptional()
  @Transform(toOptionalInt)
  @IsInt()
  @Min(0)
  @Max(3_600)
  WS_SESSION_REVALIDATE_SECONDS?: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(32)
  JWT_REFRESH_SECRET!: string;

  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(60)
  JWT_ACCESS_TTL_SECONDS!: number;

  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(300)
  JWT_REFRESH_TTL_SECONDS!: number;

  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(300)
  JWT_REMEMBER_ME_TTL_SECONDS!: number;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  AUTH_COOKIE_SECURE?: boolean;

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return typeof value === "string" ? value.trim().toLowerCase() : value;
  })
  @IsIn(["lax", "strict", "none"])
  AUTH_COOKIE_SAME_SITE?: string;

  @IsOptional()
  @IsString()
  AUTH_COOKIE_NAME?: string;

  @IsOptional()
  @IsString()
  AUTH_COOKIE_PATH?: string;

  @IsOptional()
  @IsString()
  AUTH_COOKIE_DOMAIN?: string;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  AUTH_COOKIE_HTTP_ONLY?: boolean;

  @IsOptional()
  @IsString()
  AUTH_CSRF_COOKIE_NAME?: string;

  @IsOptional()
  @IsString()
  AUTH_CSRF_HEADER_NAME?: string;

  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(1)
  AUTH_LOGIN_MAX_ATTEMPTS!: number;

  @Transform(({ value }: TransformFnParams) => Number(value))
  @IsInt()
  @Min(1)
  AUTH_LOCKOUT_MINUTES!: number;
}

export function validateEnvironment(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((error) => Object.values(error.constraints ?? {}).join(", "))
      .filter(Boolean)
      .join("; ");

    throw new Error(`Environment validation failed: ${messages}`);
  }

  if (validated.NODE_ENV === NodeEnvironment.Production) {
    const corsValues = [validated.CORS_ORIGIN, validated.WS_CORS_ORIGIN];
    for (const value of corsValues) {
      const origins = value.split(",").map((origin) => origin.trim());
      if (origins.includes("*")) {
        throw new Error(
          "CORS_ORIGIN and WS_CORS_ORIGIN cannot use wildcards in production when credentials are enabled",
        );
      }
    }

    if (validated.AUTH_COOKIE_SECURE === false) {
      throw new Error("AUTH_COOKIE_SECURE cannot be false in production");
    }

    if (validated.AUTH_COOKIE_HTTP_ONLY === false) {
      throw new Error("AUTH_COOKIE_HTTP_ONLY cannot be false in production");
    }
  }

  return validated;
}
