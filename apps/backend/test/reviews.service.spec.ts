import { ServiceUnavailableException } from "@nestjs/common";
import { ReviewsService } from "../src/modules/reviews/services/reviews.service";

function setup(placeDetails: jest.Mock) {
  const service = new ReviewsService({ placeDetails } as never, { error: jest.fn() } as never);
  return { service };
}

const place = {
  rating: 5,
  user_ratings_total: 118,
  url: "https://maps.google.com/?cid=2665044994959244414",
  reviews: [
    {
      author_name: "Older Rider",
      rating: 5,
      text: "Great ride",
      time: 100,
      relative_time_description: "a month ago",
    },
    { author_name: "Silent Rider", rating: 4, text: "   ", time: 300 },
    {
      author_name: "Newer Rider",
      rating: 5,
      text: "On time",
      time: 200,
      profile_photo_url: "https://lh3.googleusercontent.com/a",
    },
  ],
};

describe("ReviewsService", () => {
  afterEach(() => jest.useRealTimers());

  it("merges newest and most relevant reviews without duplicates", async () => {
    const placeDetails = jest.fn(async (sort: string) =>
      sort === "newest"
        ? place
        : Object.assign({}, place, {
            reviews: [
              place.reviews[0],
              { author_name: "Relevant Rider", rating: 5, text: "Spotless car", time: 50 },
            ],
          }),
    );
    const { service } = setup(placeDetails);

    const summary = await service.summary();

    expect(placeDetails).toHaveBeenCalledWith("newest");
    expect(placeDetails).toHaveBeenCalledWith("most_relevant");
    expect(summary.reviews.map((review) => review.authorName)).toEqual([
      "Newer Rider",
      "Older Rider",
      "Relevant Rider",
    ]);
  });

  it("maps Google reviews, drops empty ones and sorts newest first", async () => {
    const { service } = setup(jest.fn(async () => place));

    const summary = await service.summary();

    expect(summary).toEqual(
      expect.objectContaining({
        rating: 5,
        totalRatings: 118,
        reviewsUrl: "https://maps.google.com/?cid=2665044994959244414",
      }),
    );
    expect(summary.reviews.map((review) => review.authorName)).toEqual([
      "Newer Rider",
      "Older Rider",
    ]);
    expect(summary.reviews[0]?.photoUrl).toBe("https://lh3.googleusercontent.com/a");
  });

  it("caches for an hour and serves the last copy when Google fails", async () => {
    jest.useFakeTimers({ now: new Date("2026-10-30T10:00:00Z") });
    const placeDetails = jest.fn(async () => place);
    const { service } = setup(placeDetails);

    await service.summary();
    await service.summary();
    expect(placeDetails).toHaveBeenCalledTimes(2);

    jest.setSystemTime(new Date("2026-10-30T11:30:00Z"));
    placeDetails.mockRejectedValueOnce(new ServiceUnavailableException("Google down"));
    const stale = await service.summary();

    expect(placeDetails).toHaveBeenCalledTimes(4);
    expect(stale.totalRatings).toBe(118);
  });

  it("fails clearly when Google is unavailable and nothing is cached", async () => {
    const { service } = setup(
      jest.fn(async () => {
        throw new ServiceUnavailableException("Google reviews are not configured");
      }),
    );

    await expect(service.summary()).rejects.toThrow("Google reviews are not configured");
  });
});
