import {
  type INestApplication,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { ResponseInterceptor } from "../common/interceptors/response.interceptor";
import { AppLogger } from "../common/logger/app.logger";
import { API_PREFIX, API_VERSION } from "../config/api.constants";
import { type AppEnv, getAppEnv } from "../config/env";
import { setupSwagger } from "./swagger";

export function configureApp(app: INestApplication): AppEnv {
  const env = getAppEnv(app.get(ConfigService));
  const logger = app.get(AppLogger);

  app.useLogger(logger);
  app.enableShutdownHooks();

  app.getHttpAdapter().getInstance().set("trust proxy", env.TRUST_PROXY);

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX, {
    exclude: [{ path: "/", method: RequestMethod.GET }],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  if (env.SWAGGER_ENABLED) {
    setupSwagger(app);
  }

  return env;
}
