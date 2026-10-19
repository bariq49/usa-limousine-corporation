import { ArrayMaxSize, ArrayMinSize, IsArray, IsString } from "class-validator";

export class BulkDeleteDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids!: string[];
}

export { BulkDeleteDto as BulkDeleteVehiclesDto };
