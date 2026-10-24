export type StorageResourceType = "image" | "raw" | "video" | "auto";

export type StorageUploadInput = {
  file: Buffer | string;
  folder?: string | undefined;
  publicId?: string | undefined;
  resourceType?: StorageResourceType | undefined;
  filename?: string | undefined;
  mimeType?: string | undefined;
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
