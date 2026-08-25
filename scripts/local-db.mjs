// Local dev database: PGlite (WASM Postgres) exposed on tcp://127.0.0.1:5433
// Usage: npx tsx scripts/local-db.mjs
//        DATABASE_URL=postgres://postgres:pglite@127.0.0.1:5433/main
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const pg = new PGlite("/tmp/localpglite");
const server = new PGLiteSocketServer({ db: pg, host: "127.0.0.1", port: 5433 });
await server.start();
console.log("PGlite READY on tcp://127.0.0.1:5433");
setInterval(() => {}, 1 << 30);
