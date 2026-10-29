export type CommentCreated = {
  commentId: string;
  blog: { title: string; slug: string };
  comment: { fullName: string; email: string; content: string };
};

export type CommentReplied = {
  commentId: string;
  blog: { title: string; slug: string };
  comment: { fullName: string; email: string; content: string };
  reply: string;
};
