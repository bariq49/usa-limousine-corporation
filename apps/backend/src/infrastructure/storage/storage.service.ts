import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, type UploadApiOptions } from "cloudinary";
import { getStorageConfig } from "./storage.config";
import type {
  GetUrl,
  StorageDeleteInput,
  StorageReplaceInput,
  StorageUploadInput,
} from "./types/storage.types";

@Injectable()
export class StorageService implements OnModuleInit {
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const config = getStorageConfig(this.configService);
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
  }

  isConfigured(): boolean {
    return true;
  }

  async upload(params: StorageUploadInput) {
    const { file, folder, publicId, resourceType, filename, mimeType } = params;
    const options: UploadApiOptions = {
      resource_type: resourceType ?? "auto",
    };

    if (folder) {
      options.folder = folder;
    }
    if (publicId) {
      options.public_id = publicId;
    }
    if (filename) {
      options.filename_override = filename;
    }

    const source =
      typeof file === "string"
        ? file
        : `data:${mimeType || "application/octet-stream"};base64,${file.toString("base64")}`;
    const result = await cloudinary.uploader.upload(source, options);

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    };
  }

  delete(params: StorageDeleteInput) {
    return cloudinary.uploader.destroy(params.publicId, {
      resource_type: params.resourceType ?? "image",
    });
  }

  replace(params: StorageReplaceInput) {
    return this.upload(params);
  }

  getUrl(params: GetUrl) {
    return cloudinary.url(params.publicId, {
      secure: true,
      ...params.options,
    });
  }

  async ping() {
    await cloudinary.api.ping();
    return true;
  }
}
