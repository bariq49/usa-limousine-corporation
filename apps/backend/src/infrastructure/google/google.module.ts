import { Global, Module } from "@nestjs/common";
import { PlacesService } from "./places.service";

@Global()
@Module({
  providers: [PlacesService],
  exports: [PlacesService],
})
export class GoogleModule {}
