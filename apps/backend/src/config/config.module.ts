import { join } from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { NodeEnvironment, validateEnvironment } from "./env.validation";

function resolveEnvFilePaths(): string[] {
  const packageRoot = join(__dirname, "..", "..");
  const nodeEnv = process.env["NODE_ENV"];
  const paths: string[] = [];

  if (
    nodeEnv === NodeEnvironment.Development ||
    nodeEnv === NodeEnvironment.Production ||
    nodeEnv === NodeEnvironment.Test
  ) {
    paths.push(join(packageRoot, `.env.${nodeEnv}.local`));
    paths.push(join(packageRoot, `.env.${nodeEnv}`));
  }

  paths.push(join(packageRoot, ".env"));
  return paths;
}

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: resolveEnvFilePaths(),
      validate: validateEnvironment,
    }),
  ],
})
export class AppConfigModule {}
