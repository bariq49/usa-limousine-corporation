export interface SendMailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: SendMailAttachment[];
}

export interface SendMailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}
