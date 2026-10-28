export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
};

export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorBody;
};
