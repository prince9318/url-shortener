// lib/db.ts

// Import Neon serverless client
import { neon } from "@neondatabase/serverless";

// Get database URL from environment variables
const url = process.env.DATABASE_URL;

if (!url) {
  // Warn developers if DB URL is missing (helps during development)
  console.warn(
    "DATABASE_URL is not set. API endpoints will fail until configured."
  );
}

// Define general row type returned from DB queries
type Row = Record<string, any>;

// Define template tag type for SQL queries
type TemplateTag = (
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<Row[]>;

// Export `db` function which runs SQL queries
export const db: TemplateTag = url
  ? async (strings, ...values): Promise<Row[]> => {
      // Create Neon SQL executor using the URL
      const sql = neon(url) as any;

      // Execute SQL query
      const res = await sql(strings, ...values);

      // Normalize Neon results (sometimes array, sometimes object)
      if (Array.isArray(res)) return res;
      if (res && typeof res === "object" && "rows" in res)
        return res.rows ?? [];

      return [];
    }
  : ((): TemplateTag => {
      // If DATABASE_URL is missing and not in development, throw error
      if (process.env.NODE_ENV !== "development") {
        return (async () => {
          throw new Error(
            "DATABASE_URL is missing. Set it in .env to use the API."
          );
        }) as TemplateTag;
      }

      // In-memory database fallback (only for development without DB)
      const store: Row[] = [];

      // Mock SQL tag for development
      const tag: TemplateTag = async (strings, ...values) => {
        const sql = strings.join("${}").trim().toUpperCase();

        // SELECT all links
        if (sql.startsWith("SELECT * FROM LINKS") && !/WHERE/.test(sql)) {
          return store
            .slice()
            .sort((a, b) =>
              (b.created_at || "") > (a.created_at || "") ? 1 : -1
            );
        }

        // SELECT by target_url
        if (/SELECT \* FROM LINKS WHERE TARGET_URL/.test(sql)) {
          const target = values[0];
          return store.filter((r) => r.target_url === target);
        }

        // SELECT by code
        if (/SELECT \* FROM LINKS WHERE CODE/.test(sql)) {
          const code = values[0];
          return store.filter((r) => r.code === code);
        }

        // INSERT link
        if (sql.startsWith("INSERT INTO LINKS")) {
          const code = values[0];
          const target_url = values[1];

          // Check duplicate code
          const existing = store.find((r) => r.code === code);
          if (existing) {
            const err: any = new Error(
              "duplicate key value violates unique constraint"
            );
            err.code = "23505";
            throw err;
          }

          // Create new link object
          const row: Row = {
            code,
            target_url,
            clicks: 0,
            created_at: new Date().toISOString(),
            last_clicked: null,
          };

          // Save in in-memory store
          store.push(row);
          return [row];
        }

        // DELETE link
        if (/DELETE FROM LINKS WHERE CODE/.test(sql)) {
          const code = values[0];
          const index = store.findIndex((r) => r.code === code);
          if (index !== -1) store.splice(index, 1);
          return [];
        }

        // Default empty fallback
        return [];
      };

      return tag;
    })();

// Holds schema initialization promise to prevent duplicate creation
let schemaReady: Promise<void> | null = null;

// Ensure the DB schema exists
export async function ensureSchema(): Promise<void> {
  if (!url)
    throw new Error("DATABASE_URL is missing. Set it in .env to use the API.");

  if (!schemaReady) {
    schemaReady = (async () => {
      try {
        // Create links table if not exists
        await db`
          CREATE TABLE IF NOT EXISTS links (
            code TEXT PRIMARY KEY,
            target_url TEXT NOT NULL,
            clicks INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            last_clicked TIMESTAMPTZ
          )
        `;
      } catch (err: any) {
        const msg = err?.message || String(err);

        // Handle DB authentication issues with clearer error message
        if (
          msg.toLowerCase().includes("password authentication failed") ||
          msg.toLowerCase().includes("authentication failed")
        ) {
          throw new Error(
            `Database authentication failed: ${msg}. Check your DATABASE_URL in .env (username/password).`
          );
        }

        // Re-throw other errors
        throw err;
      }
    })();
  }

  return schemaReady;
}
