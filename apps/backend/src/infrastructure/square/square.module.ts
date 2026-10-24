import { Global, Module } from "@nestjs/common";
import { SquareService } from "./square.service";

@Global()
@Module({
  providers: [SquareService],
  exports: [SquareService],
})
export class SquareModule {}
