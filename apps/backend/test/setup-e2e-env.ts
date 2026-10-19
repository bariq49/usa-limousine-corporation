import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "dotenv";

process.env["NODE_ENV"] = "test";

// Ensure Nest Config / Prisma see the test DB even if a shell DATABASE_URL points at another DB.
const testEnvPath = join(__dirname, "..", ".env.test");
if (existsSync(testEnvPath)) {
  const parsed = parse(readFileSync(testEnvPath));
  for (const [key, value] of Object.entries(parsed)) {
    if (key === "NODE_ENV") {
      continue;
    }
    process.env[key] = value;
  }
}
