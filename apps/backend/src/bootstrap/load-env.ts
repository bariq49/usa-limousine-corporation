import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "dotenv";
import { NodeEnvironment } from "../config/env.validation";

export function loadEnvFilesEarly(): void {
  const packageRoot = join(__dirname, "..", "..");
  const nodeEnv = process.env["NODE_ENV"];
  const paths: string[] = [];
  const runtimeKeys = new Set(Object.keys(process.env));

  paths.push(join(packageRoot, ".env"));

  if (
    nodeEnv === NodeEnvironment.Development ||
    nodeEnv === NodeEnvironment.Production ||
    nodeEnv === NodeEnvironment.Test
  ) {
    paths.push(join(packageRoot, `.env.${nodeEnv}`));
    paths.push(join(packageRoot, `.env.${nodeEnv}.local`));
  }

  for (const envPath of paths) {
    if (existsSync(envPath)) {
      const parsed = parse(readFileSync(envPath));

      for (const [key, value] of Object.entries(parsed)) {
        if (runtimeKeys.has(key)) {
          continue;
        }

        process.env[key] = value;
      }
    }
  }
}

loadEnvFilesEarly();
