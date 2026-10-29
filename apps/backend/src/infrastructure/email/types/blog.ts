export type BlogCommentMailProps = {
  siteUrl: string;
  reviewUrl: string | null;
  article: { title: string; url: string };
  comment: { fullName: string; email: string; content: string };
};

export type BlogCommentReplyMailProps = {
  siteUrl: string;
  article: { title: string; url: string };
  comment: { fullName: string; content: string };
  reply: string;
};
