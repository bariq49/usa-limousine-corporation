export type ApiError = {
  message: string;
  status?: number | undefined;
  code?: string | undefined;
  details?: Record<string, unknown> | undefined;
};
