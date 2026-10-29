import type { BlogCommentMailProps, BlogCommentReplyMailProps } from "../../types/blog";
import { emailLayout } from "../shared/layout";
import {
  commentCard,
  commentIntro,
  replyCard,
  replyIntro,
  reviewCommentButton,
  viewArticleButton,
} from "./components/comment-card";

export function newBlogCommentAdmin(props: BlogCommentMailProps) {
  const { siteUrl, reviewUrl, article, comment } = props;

  return emailLayout({
    siteUrl,
    title: "New Blog Comment",
    subtitle: "Awaiting approval",
    preheader: `${comment.fullName} commented on "${article.title}"`,
    body: `
      ${commentIntro({
        fullName: comment.fullName,
        articleTitle: article.title,
        articleUrl: article.url,
      })}
      ${commentCard(comment)}
      ${reviewUrl ? reviewCommentButton({ reviewUrl }) : ""}
    `,
  });
}

export function blogCommentReplyUser(props: BlogCommentReplyMailProps) {
  const { siteUrl, article, comment, reply } = props;

  return emailLayout({
    siteUrl,
    title: "We Replied to Your Comment",
    subtitle: article.title,
    preheader: `A reply on "${article.title}"`,
    body: `
      ${replyIntro({
        fullName: comment.fullName,
        articleTitle: article.title,
        articleUrl: article.url,
      })}
      ${replyCard({ label: "Your comment", content: comment.content })}
      ${replyCard({ label: "Our reply", content: reply })}
      ${viewArticleButton({ articleUrl: article.url })}
    `,
  });
}
