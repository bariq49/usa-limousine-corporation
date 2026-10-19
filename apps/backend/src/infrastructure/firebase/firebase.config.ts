import type { ConfigService } from "@nestjs/config";
import type { Config } from "./types/firebase";

function normalizePrivateKey(value: string): string {
  let key = value.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\n/g, "\n").trim();
}

export function getFirebaseConfig(configService: ConfigService): Config {
  const config: Config = {};

  const projectId = configService.get<string>("FIREBASE_PROJECT_ID")?.trim();
  if (projectId) {
    config.projectId = projectId;
  }

  const clientEmail = configService.get<string>("FIREBASE_CLIENT_EMAIL")?.trim();
  if (clientEmail) {
    config.clientEmail = clientEmail;
  }

  const privateKeyRaw = configService.get<string>("FIREBASE_PRIVATE_KEY")?.trim();
  if (privateKeyRaw) {
    config.privateKey = normalizePrivateKey(privateKeyRaw);
  }

  return config;
}

export function isFirebaseConfigComplete(
  config: Config,
): config is Required<Pick<Config, "projectId" | "clientEmail" | "privateKey">> {
  return Boolean(config.projectId && config.clientEmail && config.privateKey);
}
