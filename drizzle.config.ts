import { defineConfig } from "drizzle-kit";
import { readFileSync } from "node:fs";

// Minimal .env loader so `pnpm db:migrate` works on the VPS without extra
// dependencies. Real environment variables always win over .env values.
try {
  for (const raw of readFileSync(".env", "utf8").split("\n")) {
    const match = raw.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // no .env file — rely on the environment
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  ...(process.env.DATABASE_URL
    ? { dbCredentials: { url: process.env.DATABASE_URL } }
    : {}),
});
