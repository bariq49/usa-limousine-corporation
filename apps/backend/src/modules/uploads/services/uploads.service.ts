import { Inject, Injectable } from "@nestjs/common";
import { StorageService } from "../../../infrastructure/storage/storage.service";
import type { File } from "../types/upload";

@Injectable()
export class UploadsService {
  constructor(@Inject(StorageService) private readonly storageService: StorageService) {}

  uploadOne(file: File, folder?: string) {
    return this.storageService.upload({
      file: file.buffer,
      folder: folder?.trim() || "uploads",
      filename: file.originalname,
      mimeType: file.mimetype,
      resourceType: "auto",
    });
  }

  async uploadMany(files: File[], folder?: string) {
    const uploaded = await Promise.all(
      files.map((file) =>
        this.storageService.upload({
          file: file.buffer,
          folder: folder?.trim() || "uploads",
          filename: file.originalname,
          mimeType: file.mimetype,
          resourceType: "auto",
        }),
      ),
    );

    return { files: uploaded };
  }
}
