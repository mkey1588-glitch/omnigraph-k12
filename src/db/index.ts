import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) {
    return configured;
  }
  // On Vercel Serverless (/var/task is read-only), default zero-config demo DB to writable /tmp
  if (process.env.VERCEL) {
    return "file:/tmp/omnigraph.db";
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return `file:${path.join(dataDir, "omnigraph.db")}`;
}

const dbUrl = resolveDatabaseUrl();
if (dbUrl.startsWith("file:") && !process.env.VERCEL) {
  const filePath = dbUrl.slice("file:".length);
  const parentDir = path.dirname(path.resolve(process.cwd(), filePath));
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
}

const globalForDb = globalThis as unknown as {
  libsqlClient?: Client;
  drizzleDb?: LibSQLDatabase<typeof schema>;
  schemaInitialized?: boolean;
};

export const libsqlClient =
  globalForDb.libsqlClient ??
  createClient({
    url: dbUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });

export const db = globalForDb.drizzleDb ?? drizzle(libsqlClient, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.libsqlClient = libsqlClient;
  globalForDb.drizzleDb = db;
}

function makeDdlStatementIdempotent(rawStmt: string): string {
  return rawStmt
    .trim()
    .replace(/^CREATE TABLE\s+(?!IF NOT EXISTS)/i, "CREATE TABLE IF NOT EXISTS ")
    .replace(
      /^CREATE UNIQUE INDEX\s+(?!IF NOT EXISTS)/i,
      "CREATE UNIQUE INDEX IF NOT EXISTS "
    )
    .replace(/^CREATE INDEX\s+(?!IF NOT EXISTS)/i, "CREATE INDEX IF NOT EXISTS ");
}

function loadVersionedMigrationStatements(): string[] {
  const candidateDirs = [
    path.join(process.cwd(), "drizzle"),
    path.resolve(__dirname, "../../drizzle"),
  ];
  const migrationDir = candidateDirs.find((d) => fs.existsSync(d));
  if (!migrationDir) {
    throw new Error("Drizzle migration directory `./drizzle` not found.");
  }

  const sqlFiles = fs
    .readdirSync(migrationDir)
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  const statements: string[] = [];
  for (const file of sqlFiles) {
    const raw = fs.readFileSync(path.join(migrationDir, file), "utf8");
    const chunks = raw
      .split("--> statement-breakpoint")
      .map(makeDdlStatementIdempotent)
      .filter((s) => s.length > 0);
    statements.push(...chunks);
  }
  return statements;
}

/**
 * Applies versioned Drizzle SQL migrations (`drizzle/*.sql`) idempotently
 * across both persistent Turso Cloud (`libsql://`) and local/ephemeral SQLite (`file:`).
 */
export async function ensureSchema(): Promise<void> {
  if (globalForDb.schemaInitialized) return;
  const statements = loadVersionedMigrationStatements();
  for (const sql of statements) {
    await libsqlClient.execute(sql);
  }
  globalForDb.schemaInitialized = true;
}
