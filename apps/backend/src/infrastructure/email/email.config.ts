import type { ConfigService } from "@nestjs/config";

export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  defaultAdminEmail?: string | undefined;
};

export function getEmailConfig(configService: ConfigService): EmailConfig {
  const host = configService.getOrThrow<string>("EMAIL_HOST").trim();
  const port = configService.getOrThrow<number>("EMAIL_PORT");
  const from = configService.getOrThrow<string>("EMAIL_FROM").trim();
  const user = configService.getOrThrow<string>("EMAIL_USER").trim();
  const password = configService.getOrThrow<string>("EMAIL_PASS");

  if (!host || !from || !user || !password) {
    throw new Error("EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM are required");
  }

  const config: EmailConfig = {
    host,
    port,
    secure: Boolean(configService.get<boolean>("EMAIL_SECURE")),
    user,
    password,
    from,
  };

  const defaultAdminEmail = configService.get<string>("DEFAULT_ADMIN_EMAIL")?.trim();
  if (defaultAdminEmail) {
    config.defaultAdminEmail = defaultAdminEmail;
  }

  return config;
}
