import { Module } from "@nestjs/common";
import { PublicReviewsController } from "./controllers/public.controller";
import { ReviewsService } from "./services/reviews.service";

@Module({
  controllers: [PublicReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
