import { defineConfig } from "drizzle-kit";

// `dotenv-cli` loads .env.local before drizzle-kit runs — see the db:* scripts
// in package.json. If DATABASE_URL is still missing here, the CLI errors out
// with a clear message, which is what we want (fail loud, not silent).
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Skip the "you sure?" prompt — required for CI and non-interactive shells.
  strict: true,
  verbose: true,
});
