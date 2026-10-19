export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    path: string;
  };
};

export type MessageResponse = {
  message: string;
};
