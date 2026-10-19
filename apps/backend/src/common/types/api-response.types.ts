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
  timestamp: string;
  path: string;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorBody;
};
