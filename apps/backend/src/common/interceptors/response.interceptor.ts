import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  StreamableFile,
} from "@nestjs/common";
import type { Request } from "express";
import { map, type Observable } from "rxjs";
import type { ApiSuccessResponse } from "../types/api-response.types";
import { decimalsToNumbers } from "../utils/money";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T> | StreamableFile
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T> | StreamableFile> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) =>
        data instanceof StreamableFile
          ? data
          : {
              success: true as const,
              data: decimalsToNumbers(data) as T,
              meta: {
                timestamp: new Date().toISOString(),
                path: request.originalUrl || request.url,
              },
            },
      ),
    );
  }
}
