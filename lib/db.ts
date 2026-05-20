import path from "node:path";
import fs from "node:fs";
import { createClient, type Client } from "@libsql/client";

/**
 * DB layer — libsql client.
 *
 * - In production set TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN.
 * - In development we fall back to a local SQLite file at db/writecomics.db
 *   so contributors don't need a Turso account to work on the site.
 */

const DB_DIR = path.join(process.cwd(), "db");
const LOCAL_DB_PATH = path.join(DB_DIR, "writecomics.db");

let _client: Client | null = null;
let _schemaPromise: Promise<void> | null = null;

export function getDb(): Client {
  if (_client) return _client;

  const remoteUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (remoteUrl) {
    _client = createClient({ url: remoteUrl, authToken });
  } else {
    // Local development — create the file if missing.
    fs.mkdirSync(DB_DIR, { recursive: true });
    _client = createClient({ url: `file:${LOCAL_DB_PATH}` });
  }
  return _client;
}

/**
 * Bootstrap schema once per process. Idempotent + cached so subsequent reads
 * pay only a single in-memory promise check.
 */
async function ready(): Promise<void> {
  if (!_schemaPromise) _schemaPromise = ensureSchema();
  return _schemaPromise;
}

/**
 * Idempotent schema bootstrap. Safe to call multiple times.
 * Run from ETL scripts, route handlers, or a one-shot migration.
 */
export async function ensureSchema(): Promise<void> {
  const db = getDb();
  // libsql supports IF NOT EXISTS; one statement per execute() call.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS comics (
      id TEXT PRIMARY KEY,
      panel_count INTEGER NOT NULL,
      metadata_json TEXT NOT NULL,
      panel_urls_json TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS comics_created_at_idx ON comics (created_at DESC)`,
  );
  // Add the panel_urls_json column to pre-existing DBs that were created
  // before this migration. libsql doesn't support IF NOT EXISTS on ALTER,
  // so we swallow the "duplicate column" error.
  try {
    await db.execute(
      `ALTER TABLE comics ADD COLUMN panel_urls_json TEXT NOT NULL DEFAULT '[]'`,
    );
  } catch {
    /* column already exists */
  }
}

export type ComicRow = {
  id: string;
  panel_count: number;
  metadata_json: string;
  panel_urls_json: string;
  created_at: number;
};

function rowToComic(r: Record<string, unknown>): ComicRow {
  return {
    id: String(r.id),
    panel_count: Number(r.panel_count),
    metadata_json: String(r.metadata_json),
    panel_urls_json: String(r.panel_urls_json ?? "[]"),
    created_at: Number(r.created_at),
  };
}

export async function getComic(id: string): Promise<ComicRow | undefined> {
  await ready();
  const rs = await getDb().execute({
    sql: "SELECT id, panel_count, metadata_json, panel_urls_json, created_at FROM comics WHERE id = ?",
    args: [id],
  });
  const r = rs.rows[0];
  return r ? rowToComic(r as unknown as Record<string, unknown>) : undefined;
}

export async function insertComic(row: ComicRow): Promise<void> {
  await ready();
  await getDb().execute({
    sql: "INSERT INTO comics (id, panel_count, metadata_json, panel_urls_json, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [row.id, row.panel_count, row.metadata_json, row.panel_urls_json, row.created_at],
  });
}

export async function recentComics(limit = 12): Promise<ComicRow[]> {
  await ready();
  const rs = await getDb().execute({
    sql: "SELECT id, panel_count, metadata_json, panel_urls_json, created_at FROM comics ORDER BY created_at DESC LIMIT ?",
    args: [limit],
  });
  return rs.rows.map((r) => rowToComic(r as unknown as Record<string, unknown>));
}
