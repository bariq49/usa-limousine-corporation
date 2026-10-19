import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { getAppEnv } from "../../config/env";
import { NodeEnvironment } from "../../config/env.validation";
import type { ApiErrorResponse } from "../types/api-response.types";
import { AppLogger } from "../logger/app.logger";
import type {
  NormalizeExceptionParams,
  NormalizeHttpExceptionParams,
  NormalizedException,
  WriteErrorResponseParams,
} from "../types/filter.types";

const UNIQUE_VIOLATION_CODES = new Set(["P2002", "23505"]);

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const env = getAppEnv(this.configService);
    const isProduction = env.NODE_ENV === NodeEnvironment.Production;

    const normalized = this.normalizeException({ exception, isProduction });

    if (normalized.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        exception instanceof Error ? exception.message : "Unhandled exception",
        exception instanceof Error ? exception.stack : undefined,
        GlobalExceptionFilter.name,
      );
    }

    this.writeErrorResponse({
      response,
      path: request.originalUrl || request.url,
      normalized,
    });
  }

  private normalizeException(params: NormalizeExceptionParams): NormalizedException {
    const { exception, isProduction } = params;

    if (exception instanceof HttpException) {
      return this.normalizeHttpException({ exception, isProduction });
    }

    const prismaNormalized = this.normalizePrismaException(exception);
    if (prismaNormalized) {
      return prismaNormalized;
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isProduction
        ? "Internal server error"
        : exception instanceof Error
          ? exception.message
          : "Internal server error",
      error: "Internal Server Error",
    };
  }

  private normalizePrismaException(exception: unknown): NormalizedException | null {
    const code = this.getPrismaErrorCode(exception);
    if (!code) {
      return null;
    }

    if (UNIQUE_VIOLATION_CODES.has(code)) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: "Resource already exists",
        error: "Conflict",
      };
    }

    if (code === "P2025") {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: "Resource not found",
        error: "Not Found",
      };
    }

    if (code === "P2003") {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Related resource is invalid",
        error: "Bad Request",
      };
    }

    return null;
  }

  private getPrismaErrorCode(exception: unknown): string | null {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return exception.code;
    }

    if (typeof exception !== "object" || exception === null) {
      return null;
    }

    if ("code" in exception && typeof exception.code === "string") {
      return exception.code;
    }

    if ("cause" in exception) {
      return this.getPrismaErrorCode(exception.cause);
    }

    return null;
  }

  private normalizeHttpException(params: NormalizeHttpExceptionParams): NormalizedException {
    const { exception, isProduction } = params;
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const hideDetails = isProduction && statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;

    if (typeof exceptionResponse === "string") {
      return {
        statusCode,
        message: hideDetails ? "Internal server error" : exceptionResponse,
        error: HttpStatus[statusCode] ?? "Error",
      };
    }

    const responseObject = exceptionResponse as Record<string, unknown>;
    const rawMessage = responseObject["message"];
    const rawError = responseObject["error"];

    const message = hideDetails
      ? "Internal server error"
      : typeof rawMessage === "string" || Array.isArray(rawMessage)
        ? rawMessage
        : exception.message;

    const error = typeof rawError === "string" ? rawError : (HttpStatus[statusCode] ?? "Error");

    return { statusCode, message, error };
  }

  private writeErrorResponse(params: WriteErrorResponseParams): void {
    const { response, path, normalized } = params;
    const { statusCode, message, error } = normalized;

    const body: ApiErrorResponse = {
      success: false,
      error: {
        statusCode,
        message,
        error,
        timestamp: new Date().toISOString(),
        path,
      },
    };

    response.status(statusCode).json(body);
  }
}
