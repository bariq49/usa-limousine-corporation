export type Review = {
  authorName: string;
  authorUrl: string | null;
  photoUrl: string | null;
  rating: number;
  relativeTime: string;
  text: string;
  time: number;
};

export type ReviewSummary = {
  rating: number;
  totalRatings: number;
  reviewsUrl: string | null;
  reviews: Review[];
};

export type TestimonialsSectionProps = {
  title?: string;
  description?: string;
  className?: string;
};
