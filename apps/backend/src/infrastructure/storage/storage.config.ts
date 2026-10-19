import type { ConfigService } from "@nestjs/config";

export type StorageConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getStorageConfig(configService: ConfigService): StorageConfig {
  const cloudName = configService.getOrThrow<string>("CLOUDINARY_CLOUD_NAME").trim();
  const apiKey = configService.getOrThrow<string>("CLOUDINARY_API_KEY").trim();
  const apiSecret = configService.getOrThrow<string>("CLOUDINARY_API_SECRET").trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required",
    );
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  };
}
