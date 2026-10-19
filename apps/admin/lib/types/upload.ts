export type UploadResponse = {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
};

export type UploadFileOptions = {
  file: File;
  folder?: string;
};
