export type StorageResourceType = "image" | "raw" | "video" | "auto";

export type StorageUploadInput = {
  file: Buffer | string;
  folder?: string | undefined;
  publicId?: string | undefined;
  resourceType?: StorageResourceType | undefined;
  filename?: string | undefined;
  mimeType?: string | undefined;
};

export type StorageUploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  format?: string | undefined;
  bytes?: number | undefined;
  width?: number | undefined;
  height?: number | undefined;
};

export type StorageDeleteInput = {
  publicId: string;
  resourceType?: StorageResourceType | undefined;
};

export type StorageReplaceInput = StorageUploadInput & {
  publicId: string;
};

export type GetUrl = {
  publicId: string;
  options?: Record<string, string | number | boolean> | undefined;
};
