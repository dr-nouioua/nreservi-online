// Minimal migration runner — applies drizzle/*.sql in name order, once each.
// Usage: DATABASE_URL=... node scripts/db-migrate.mjs
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const dir = path.resolve("drizzle");
const folders = fs
  .readdirSync(dir)
  .filter((f) => fs.existsSync(path.join(dir, f, "migration.sql")))
  .sort();

const sql = postgres(url, { max: 1 });
await sql`CREATE TABLE IF NOT EXISTS __drizzle_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
const applied = new Set((await sql`SELECT name FROM __drizzle_migrations`).map((r) => r.name));

let ran = 0;
for (const folder of folders) {
  if (applied.has(folder)) continue;
  const content = fs.readFileSync(path.join(dir, folder, "migration.sql"), "utf8");
  console.log(`applying ${folder} …`);
  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
      await tx`INSERT INTO __drizzle_migrations (name) VALUES (${folder})`;
    });
    ran++;
  } catch (e) {
    // "Already exists" errors mean the database was migrated manually before —
    // record the migration and keep going so any starting state converges.
    const code = e.code ?? e.originalError?.code;
    const msg = String(e.message ?? "");
    if (["42P07", "42701", "42710", "42P16", "23505"].includes(code) || /already exists/i.test(msg)) {
      console.log(`  ${folder}: already applied (skipped)`);
      await sql`INSERT INTO __drizzle_migrations (name) VALUES (${folder})`.catch(() => {});
      continue;
    }
    console.error(`✗ ${folder} failed:`, msg);
    process.exit(1);
  }
}
console.log(ran === 0 ? "Database already up to date." : `Applied ${ran} migration(s).`);
await sql.end();
