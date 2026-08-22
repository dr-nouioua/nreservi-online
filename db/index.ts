import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

// Self-hosted Postgres (e.g. on your Hostinger VPS or any managed provider).
// Point DATABASE_URL at it, e.g.:
//   postgres://nreservi:secret@127.0.0.1:5432/nreservi
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and point it at your Postgres instance.",
  );
}

// Lazy connections; max 10 suits a small VPS next to Postgres.
export const sqlClient = postgres(url, { max: 10 });

export const db = drizzle({ client: sqlClient, schema });
