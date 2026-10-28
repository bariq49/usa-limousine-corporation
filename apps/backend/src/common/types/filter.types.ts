import type { HttpException } from "@nestjs/common";
import type { Response } from "express";

export type NormalizeExceptionParams = {
  exception: unknown;
  isProduction: boolean;
};

export type NormalizeHttpExceptionParams = {
  exception: HttpException;
  isProduction: boolean;
};

export type NormalizedException = {
  statusCode: number;
  message: string | string[];
  error: string;
  details?: Record<string, unknown>;
};

export type WriteErrorResponseParams = {
  response: Response;
  path: string;
  normalized: NormalizedException;
};
