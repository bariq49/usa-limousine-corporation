import type { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import { getEmailConfig } from "../email.config";
import { NodemailerEmailProvider } from "./nodemailer.provider";

export const emailProviderRegistration: Provider = {
  provide: NodemailerEmailProvider,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): NodemailerEmailProvider => {
    const config = getEmailConfig(configService);

    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    return new NodemailerEmailProvider(transport);
  },
};
