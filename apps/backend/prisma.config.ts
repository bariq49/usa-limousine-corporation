import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "dotenv";
import { defineConfig } from "prisma/config";

const packageRoot = __dirname;

function loadEnvFiles(): void {
  const nodeEnv = process.env.NODE_ENV;
  const paths: string[] = [path.join(packageRoot, ".env")];

  if (nodeEnv === "development" || nodeEnv === "production" || nodeEnv === "test") {
    paths.push(path.join(packageRoot, `.env.${nodeEnv}`));
    paths.push(path.join(packageRoot, `.env.${nodeEnv}.local`));
  }

  for (const envPath of paths) {
    if (!existsSync(envPath)) {
      continue;
    }

    const parsed = parse(readFileSync(envPath));
    for (const [key, value] of Object.entries(parsed)) {
      process.env[key] = value;
    }
  }
}

loadEnvFiles();

const prismaDir = "prisma";

export default defineConfig({
  schema: prismaDir,
  migrations: {
    path: path.join(prismaDir, "migrations"),
    seed: `node --experimental-strip-types ${path.join(prismaDir, "seed.ts")}`,
  },
});
