import { Controller, Get, Inject } from "@nestjs/common";
import { ReviewsService } from "../services/reviews.service";

@Controller("public/reviews")
export class PublicReviewsController {
  constructor(@Inject(ReviewsService) private readonly reviews: ReviewsService) {}

  @Get()
  summary() {
    return this.reviews.summary();
  }
}
