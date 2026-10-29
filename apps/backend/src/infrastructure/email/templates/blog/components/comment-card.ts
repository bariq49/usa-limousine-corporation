import { EMAIL_BRAND } from "../../shared/brand";
import { emailParagraph } from "../../shared/components/paragraph";
import { escapeHtml } from "../../shared/html";


export function commentIntro(props: { fullName: string; articleTitle: string; articleUrl: string }) {
  const { fullName, articleTitle, articleUrl } = props;
  return `
    ${emailParagraph(`${escapeHtml(fullName)} left a new comment.`, { strong: true })}
    ${emailParagraph(
      `It is on <a href="${escapeHtml(articleUrl)}" style="color:${EMAIL_BRAND.text};font-weight:600;">${escapeHtml(articleTitle)}</a> and stays hidden until it is approved.`,
    )}
  `;
}

export function commentCard(props: { fullName: string; email: string; content: string }) {
  const { fullName, email, content } = props;
  return `
    <div style="padding:20px;background:${EMAIL_BRAND.soft};border-radius:4px;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;line-height:1.5;color:${EMAIL_BRAND.muted};">
        ${escapeHtml(fullName)} &nbsp;•&nbsp; <a href="mailto:${escapeHtml(email)}" style="color:${EMAIL_BRAND.muted};">${escapeHtml(email)}</a>
      </p>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.text};white-space:pre-wrap;">${escapeHtml(content)}</p>
    </div>
  `;
}

export function reviewCommentButton(props: { reviewUrl: string }) {
  const { reviewUrl } = props;
  return `
    <p style="margin:0 0 8px;text-align:center;">
      <a href="${escapeHtml(reviewUrl)}" style="display:inline-block;padding:12px 28px;background:${EMAIL_BRAND.dark};border-radius:4px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Review comment</a>
    </p>
  `;
}

export function replyIntro(props: { fullName: string; articleTitle: string; articleUrl: string }) {
  const { fullName, articleTitle, articleUrl } = props;
  return `
    ${emailParagraph(`Hi ${escapeHtml(fullName)},`, { strong: true })}
    ${emailParagraph(
      `Our team replied to your comment on <a href="${escapeHtml(articleUrl)}" style="color:${EMAIL_BRAND.text};font-weight:600;">${escapeHtml(articleTitle)}</a>.`,
    )}
  `;
}

export function replyCard(props: { label: string; content: string }) {
  const { label, content } = props;
  return `
    <div style="padding:20px;background:${EMAIL_BRAND.soft};border-radius:4px;margin:0 0 20px;">
      <p style="margin:0;font-size:12px;line-height:1.5;letter-spacing:0.04em;text-transform:uppercase;color:${EMAIL_BRAND.muted};font-weight:600;">
        ${escapeHtml(label)}
      </p>
      <p style="margin:12px 0 0;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.text};white-space:pre-wrap;">${escapeHtml(content)}</p>
    </div>
  `;
}

export function viewArticleButton(props: { articleUrl: string }) {
  const { articleUrl } = props;
  return `
    <p style="margin:0 0 8px;text-align:center;">
      <a href="${escapeHtml(articleUrl)}" style="display:inline-block;padding:12px 28px;background:${EMAIL_BRAND.dark};border-radius:4px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">View article</a>
    </p>
  `;
}
