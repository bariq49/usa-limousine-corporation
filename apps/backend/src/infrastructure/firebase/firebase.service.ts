import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type AppOptions,
} from "firebase-admin/app";
import { getFirebaseConfig, isFirebaseConfigComplete } from "./firebase.config";

const FIREBASE_APP_NAME = "usa-limousine-corporation";

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private readonly app: App | null;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    const config = getFirebaseConfig(configService);

    if (!isFirebaseConfigComplete(config)) {
      this.logger.warn(
        "Firebase disabled: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY",
      );
      this.app = null;
      return;
    }

    try {
      const projectId = config.projectId;
      const clientEmail = config.clientEmail;
      const privateKey = config.privateKey;

      const options: AppOptions = {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      };

      this.app = getApps().some((app) => app.name === FIREBASE_APP_NAME)
        ? getApp(FIREBASE_APP_NAME)
        : initializeApp(options, FIREBASE_APP_NAME);
      this.logger.log(`Firebase configured (project=${projectId})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Firebase initialization failed: ${message}`);
      this.app = null;
    }
  }

  isConfigured(): boolean {
    return this.app !== null;
  }

  async healthCheck(): Promise<boolean> {
    if (!this.app) {
      return false;
    }

    try {
      return Boolean(this.app.options.projectId);
    } catch {
      return false;
    }
  }
}
