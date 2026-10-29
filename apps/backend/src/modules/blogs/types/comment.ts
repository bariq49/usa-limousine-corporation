import type { BlogCommentStatus } from "@prisma/client";

export type CommentCreate = {
  blogId: string;
  fullName: string;
  email: string;
  content: string;
};

export type CommentUpdate = {
  status: BlogCommentStatus;
};
