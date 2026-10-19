import {
  Controller,
  Inject,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, AnyFilesInterceptor } from "@nestjs/platform-express";
import { ThrottlerGuard } from "@nestjs/throttler";
import { QueryDto } from "../dto/query.dto";
import { UploadsService } from "../services/uploads.service";
import type { File } from "../types/upload";

const FILE_LIMITS = {
  fileSize: 10 * 1024 * 1024,
};

@Controller("uploads")
@UseGuards(ThrottlerGuard)
export class UploadsController {
  constructor(@Inject(UploadsService) private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: FILE_LIMITS }))
  upload(@UploadedFile() file: File, @Query() query: QueryDto) {
    return this.uploadsService.uploadOne(file, query.folder);
  }

  @Post("multiple")
  @UseInterceptors(AnyFilesInterceptor({ limits: FILE_LIMITS }))
  uploadMultiple(@UploadedFiles() files: File[], @Query() query: QueryDto) {
    return this.uploadsService.uploadMany(files, query.folder);
  }
}
